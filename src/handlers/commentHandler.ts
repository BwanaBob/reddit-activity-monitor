import { Devvit } from '@devvit/public-api';

/**
 * Handler for new comment submissions
 */
export const setupCommentHandler = (
  getWebhookUrl: (settings: any, eventType: string) => string,
  sendDiscordMessage: (webhookUrl: string, message: any, context: any) => Promise<void>
) => {
  Devvit.addTrigger({
    event: 'CommentSubmit',
    onEvent: async (event, context) => {
      try {
        console.log('[CommentSubmit] ', event.comment?.id);
        const settings = await context.settings.getAll();
        const webhookUrl = getWebhookUrl(settings, 'comments');
        const monitoredEvents = settings.monitoredEvents as string[];
        
        if (!webhookUrl) {
          console.log('No Discord webhook URL configured');
          return;
        }
        
        if (!monitoredEvents?.includes('comments')) {
          console.log('Comments not enabled in settings');
          return;
        }

        if (!event.comment?.id) {
          console.log('No comment ID in event');
          return;
        }

        console.log('Processing comment event');
        
        // Get comment details
        const comment = await context.reddit.getCommentById(event.comment.id);
        const subreddit = await context.reddit.getCurrentSubreddit();
        
        const embed = {
          title: '💬 New Comment',
          description: comment.body?.length > 300 
            ? comment.body.substring(0, 300) + '...' 
            : comment.body || '[deleted]',
          url: `https://reddit.com${comment.permalink}`,
          color: 0x10b981, // Green color
          fields: [
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
            {
              name: 'Score',
              value: comment.score.toString(),
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Reddit Moderator Bot',
          },
        };
        
        await sendDiscordMessage(webhookUrl, {
          embeds: [embed],
          username: 'Reddit Mod Bot',
        }, context);
        
      } catch (error) {
        console.error('Error in CommentSubmit handler:', error);
      }
    },
  });
};