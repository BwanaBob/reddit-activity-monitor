import { Devvit } from '@devvit/public-api';
import { formatDiscordMention } from '../utils/moderation.js';

/**
 * Handler for modmail message events
 */
export const setupModmailHandler = (
  getWebhookUrl: (settings: any, eventType: string) => string,
  sendDiscordMessage: (webhookUrl: string, message: any, context: any) => Promise<void>
) => {
  Devvit.addTrigger({
    event: 'ModMail',
    onEvent: async (event, context) => {
      try {
        console.log('[ModMail] ', event.type);

        const settings = await context.settings.getAll();
        const webhookUrl = getWebhookUrl(settings, 'modmail');
        const monitoredEvents = settings.monitoredEvents as string[];
        
        if (!webhookUrl || !monitoredEvents?.includes('modmail')) {
          return;
        }

        const subreddit = await context.reddit.getCurrentSubreddit();
        const mentionRole = settings.discordMentionRole as string;
        
        const embed = {
          title: '📨 New Modmail Message',
          description: 'A new modmail message has been received',
          color: 0x3b82f6, // Blue color
          fields: [
            {
              name: 'Subreddit',
              value: `r/${subreddit.name}`,
              inline: true,
            },
            {
              name: 'Status',
              value: 'New Message',
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Reddit Moderator Bot - Modmail',
          },
        };

        // Add author info if available
        if (event.messageAuthor) {
          embed.fields.push({
            name: 'From',
            value: `u/${event.messageAuthor}`,
            inline: true,
          });
        }

        const mentionText = mentionRole ? `${formatDiscordMention(mentionRole)} New modmail message` : undefined;

        await sendDiscordMessage(webhookUrl, {
          content: mentionText,
          embeds: [embed],
          username: 'Reddit Mod Bot',
        }, context);
        
      } catch (error) {
        console.error('Error in ModMail handler:', error);
      }
    },
  });
};