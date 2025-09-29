import { Devvit } from '@devvit/public-api';
import { formatDiscordMention } from '../utils/moderation.js';

/**
 * Handler for post and comment report events
 */
export const setupReportHandlers = (
  getWebhookUrl: (settings: any, eventType: string) => string,
  sendDiscordMessage: (webhookUrl: string, message: any, context: any) => Promise<void>
) => {
  // Post Report Handler
  Devvit.addTrigger({
    event: 'PostReport',
    onEvent: async (event, context) => {
      try {
        console.log('[PostReport] ', event.post?.id);
        const settings = await context.settings.getAll();
        const webhookUrl = getWebhookUrl(settings, 'reports');
        const monitoredEvents = settings.monitoredEvents as string[];
        
        if (!webhookUrl || !monitoredEvents?.includes('reports')) {
          return;
        }

        if (!event.post?.id) {
          return;
        }

        const post = await context.reddit.getPostById(event.post.id);
        const subreddit = await context.reddit.getCurrentSubreddit();
        const mentionRole = settings.discordMentionRole as string;
        
        const embed = {
          title: '🚨 Post Reported',
          description: `Post has been reported by users`,
          url: `https://reddit.com${post.permalink}`,
          color: 0xef4444, // Red color for reports
          fields: [
            {
              name: 'Post Title',
              value: post.title?.length > 100 ? post.title.substring(0, 100) + '...' : post.title || '[deleted]',
              inline: false,
            },
            {
              name: 'Author',
              value: post.authorName || '[deleted]',
              inline: true,
            },
            {
              name: 'Subreddit',
              value: `r/${subreddit.name}`,
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Reddit Moderator Bot - Reports',
          },
        };

        const mentionText = mentionRole ? `${formatDiscordMention(mentionRole)} Post reported and needs moderation` : undefined;

        await sendDiscordMessage(webhookUrl, {
          content: mentionText,
          embeds: [embed],
          username: 'Reddit Mod Bot',
        }, context);
        
      } catch (error) {
        console.error('Error in PostReport handler:', error);
      }
    },
  });

  // Comment Report Handler
  Devvit.addTrigger({
    event: 'CommentReport',
    onEvent: async (event, context) => {
      try {
        console.log('CommentReport event triggered');
        const settings = await context.settings.getAll();
        const webhookUrl = getWebhookUrl(settings, 'reports');
        const monitoredEvents = settings.monitoredEvents as string[];
        
        if (!webhookUrl || !monitoredEvents?.includes('reports')) {
          return;
        }

        if (!event.comment?.id) {
          return;
        }

        const comment = await context.reddit.getCommentById(event.comment.id);
        const subreddit = await context.reddit.getCurrentSubreddit();
        const mentionRole = settings.discordMentionRole as string;
        
        const embed = {
          title: '🚨 Comment Reported',
          description: `Comment has been reported by users`,
          url: `https://reddit.com${comment.permalink}`,
          color: 0xef4444, // Red color for reports
          fields: [
            {
              name: 'Comment',
              value: comment.body?.length > 200 ? comment.body.substring(0, 200) + '...' : comment.body || '[deleted]',
              inline: false,
            },
            {
              name: 'Author',
              value: comment.authorName || '[deleted]',
              inline: true,
            },
            {
              name: 'Subreddit',
              value: `r/${subreddit.name}`,
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Reddit Moderator Bot - Reports',
          },
        };

        const mentionText = mentionRole ? `${formatDiscordMention(mentionRole)} Comment reported and needs moderation` : undefined;

        await sendDiscordMessage(webhookUrl, {
          content: mentionText,
          embeds: [embed],
          username: 'Reddit Mod Bot',
        }, context);
        
      } catch (error) {
        console.error('Error in CommentReport handler:', error);
      }
    },
  });
};