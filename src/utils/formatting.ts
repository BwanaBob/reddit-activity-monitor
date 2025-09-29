/**
 * Additional utility functions for Reddit content formatting and processing
 */

import { Logger } from './errors';

/**
 * Format Reddit score with appropriate suffixes (k, M)
 */
export function formatScore(score: number): string {
  if (Math.abs(score) >= 1000000) {
    return (score / 1000000).toFixed(1) + 'M';
  } else if (Math.abs(score) >= 1000) {
    return (score / 1000).toFixed(1) + 'k';
  }
  return score.toString();
}

/**
 * Format time ago from timestamp
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Extract preview text from Reddit content
 */
export function createPreview(content: string, maxLength: number = 200): string {
  if (!content) return '';
  
  // Remove markdown formatting
  let preview = content
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/[*_`~]/g, '') // Bold, italic, code
    .replace(/^#+\s+/gm, '') // Headers
    .replace(/^\s*[-+*]\s+/gm, '') // Lists
    .replace(/\n+/g, ' ') // Newlines to spaces
    .trim();
  
  if (preview.length > maxLength) {
    preview = preview.substring(0, maxLength - 3) + '...';
  }
  
  return preview;
}

/**
 * Determine content urgency level based on various factors
 */
export function getContentUrgency(event: any): 'low' | 'medium' | 'high' {
  // High urgency: spam actions, user bans, high report counts
  if (event.action && ['spamlink', 'spamcomment', 'banuser'].includes(event.action)) {
    return 'high';
  }
  
  if (event.reportCount && event.reportCount >= 5) {
    return 'high';
  }
  
  // Medium urgency: removes, reports, modqueue items
  if (event.action && ['removelink', 'removecomment'].includes(event.action)) {
    return 'medium';
  }
  
  if (event.reason || event.reportCount) {
    return 'medium';
  }
  
  // Low urgency: approvals, normal posts/comments
  return 'low';
}

/**
 * Get emoji based on content type and urgency
 */
export function getUrgencyEmoji(urgency: 'low' | 'medium' | 'high'): string {
  switch (urgency) {
    case 'high': return '🚨';
    case 'medium': return '⚠️';
    case 'low': return 'ℹ️';
    default: return 'ℹ️';
  }
}

/**
 * Rate limiter for Discord webhooks
 */
export class RateLimiter {
  private static instances = new Map<string, RateLimiter>();
  private requests: number[] = [];
  
  constructor(
    private webhookUrl: string,
    private maxRequests: number = 30,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  static getInstance(webhookUrl: string): RateLimiter {
    if (!this.instances.has(webhookUrl)) {
      this.instances.set(webhookUrl, new RateLimiter(webhookUrl));
    }
    return this.instances.get(webhookUrl)!;
  }
  
  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      Logger.warn('Rate limit exceeded for webhook', { 
        webhookUrl: this.webhookUrl.substring(0, 50) + '...',
        requests: this.requests.length,
        maxRequests: this.maxRequests
      });
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

/**
 * Template for consistent Discord embed formatting
 */
export class EmbedBuilder {
  private embed: any = {
    fields: [],
    timestamp: new Date().toISOString(),
    footer: {
      text: 'Reddit Moderator Bot',
    },
  };
  
  setTitle(title: string): EmbedBuilder {
    this.embed.title = title;
    return this;
  }
  
  setDescription(description: string): EmbedBuilder {
    this.embed.description = createPreview(description, 4096);
    return this;
  }
  
  setColor(color: number): EmbedBuilder {
    this.embed.color = color;
    return this;
  }
  
  setUrl(url: string): EmbedBuilder {
    this.embed.url = url;
    return this;
  }
  
  addField(name: string, value: string, inline: boolean = false): EmbedBuilder {
    this.embed.fields.push({
      name: name.substring(0, 256),
      value: value.substring(0, 1024),
      inline,
    });
    return this;
  }
  
  setAuthor(name: string, iconUrl?: string): EmbedBuilder {
    this.embed.author = {
      name: name.substring(0, 256),
      icon_url: iconUrl,
    };
    return this;
  }
  
  setThumbnail(url: string): EmbedBuilder {
    this.embed.thumbnail = { url };
    return this;
  }
  
  build(): any {
    return { ...this.embed };
  }
}

/**
 * Color constants for different event types
 */
export const EMBED_COLORS = {
  POST: 0x4f46e5,        // Indigo
  COMMENT: 0x10b981,     // Emerald  
  MODQUEUE: 0xf59e0b,    // Amber
  APPROVE: 0x10b981,     // Green
  REMOVE: 0xef4444,      // Red
  SPAM: 0xf59e0b,        // Orange
  BAN: 0xef4444,         // Red
  REPORT: 0xef4444,      // Red
  MODMAIL: 0x3b82f6,     // Blue
  INFO: 0x6b7280,        // Gray
} as const;