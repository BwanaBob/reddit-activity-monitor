import { Logger, WebhookError, withRetry, isValidWebhookUrl, sanitizeContent } from './errors';

/**
 * Discord webhook utilities for sending formatted messages
 */

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  timestamp?: string;
  footer?: {
    text: string;
    icon_url?: string;
  };
  image?: {
    url: string;
  };
  thumbnail?: {
    url: string;
  };
}

export interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

/**
 * Send a message to Discord via webhook using Devvit's fetch with retry logic
 * @param webhookUrl The Discord webhook URL
 * @param message The message payload
 * @param contextFetch The Devvit context fetch function
 */
export async function sendDiscordMessage(
  webhookUrl: string, 
  message: DiscordMessage, 
  contextFetch: (url: string, options?: any) => Promise<any>
): Promise<void> {
  if (!webhookUrl) {
    throw new WebhookError('Discord webhook URL is not configured');
  }

  if (!isValidWebhookUrl(webhookUrl)) {
    throw new WebhookError('Invalid Discord webhook URL format', webhookUrl);
  }

  // Sanitize message content
  const sanitizedMessage = sanitizeDiscordMessage(message);

  try {
    await withRetry(async () => {
      Logger.debug('Sending Discord message', { webhookUrl: `${webhookUrl.substring(0, 50)}...` });
      
      const response = await contextFetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedMessage),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new WebhookError(
          `Discord webhook failed: ${response.status} ${response.statusText} - ${errorText}`,
          webhookUrl,
          { status: response.status, statusText: response.statusText }
        );
      }

      Logger.debug('Discord message sent successfully');
    }, 3, 1000);
  } catch (error) {
    Logger.error('Failed to send Discord message', error as Error, { webhookUrl: webhookUrl.substring(0, 50) + '...' });
    throw error;
  }
}

/**
 * Sanitize a Discord message to prevent exploits and ensure proper formatting
 */
function sanitizeDiscordMessage(message: DiscordMessage): DiscordMessage {
  const sanitized: DiscordMessage = {
    ...message,
  };

  // Sanitize content
  if (sanitized.content) {
    sanitized.content = sanitizeContent(sanitized.content);
  }

  // Sanitize embeds
  if (sanitized.embeds) {
    sanitized.embeds = sanitized.embeds.map(embed => ({
      ...embed,
      title: embed.title ? sanitizeContent(embed.title).substring(0, 256) : undefined,
      description: embed.description ? sanitizeContent(embed.description).substring(0, 4096) : undefined,
      fields: embed.fields?.map(field => ({
        ...field,
        name: sanitizeContent(field.name).substring(0, 256),
        value: sanitizeContent(field.value).substring(0, 1024),
      })) || [],
    }));
  }

  return sanitized;
}

/**
 * Create a formatted Discord embed for Reddit content
 * @param title The embed title
 * @param description The embed description
 * @param color The embed color (hex number)
 * @param fields Array of fields to include
 * @returns A Discord embed object
 */
export function createEmbed(
  title: string,
  description: string,
  color: number,
  fields: Array<{ name: string; value: string; inline?: boolean }> = []
): DiscordEmbed {
  return {
    title,
    description,
    color,
    fields,
    timestamp: new Date().toISOString(),
    footer: {
      text: 'Reddit Moderator Bot',
    },
  };
}

/**
 * Truncate text to fit Discord's limits
 * @param text The text to truncate
 * @param maxLength The maximum length allowed
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format Reddit username with proper prefix
 * @param username The username (with or without u/ prefix)
 * @returns Formatted username with u/ prefix
 */
export function formatUsername(username: string): string {
  if (!username || username === '[deleted]') {
    return '[deleted]';
  }
  return username.startsWith('u/') ? username : `u/${username}`;
}

/**
 * Format subreddit name with proper prefix
 * @param subredditName The subreddit name (with or without r/ prefix)
 * @returns Formatted subreddit name with r/ prefix
 */
export function formatSubredditName(subredditName: string): string {
  if (!subredditName) {
    return '';
  }
  return subredditName.startsWith('r/') ? subredditName : `r/${subredditName}`;
}