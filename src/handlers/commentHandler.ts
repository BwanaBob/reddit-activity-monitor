import { Devvit } from '@devvit/public-api';
import { shouldNotifyComment } from '../utils/visibility.js';

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

        // Get comment details first to get the postId
        const comment = await context.reddit.getCommentById(event.comment.id);

        // Check if we should notify based on visibility settings
        const shouldNotify = await shouldNotifyComment(event.comment.id, comment.postId, settings, context);
        if (!shouldNotify) {
          console.log(`[CommentSubmit] Skipping notification for comment ${event.comment.id} - not visible in parent post`);
          return;
        }

        console.log('Processing comment event');
        const subreddit = await context.reddit.getCurrentSubreddit();
        
        // Get user avatar (comments don't have rich author data like modmail)
        let userAvatarUrl;
        let subredditIconUrl;
        
        // Get subreddit icon as fallback
        try {
          subredditIconUrl = `https://styles.redditmedia.com/t5_${subreddit.id.replace('t5_', '')}/styles/communityIcon_${subreddit.id.replace('t5_', '')}.png`;
        } catch (error) {
          subredditIconUrl = 'https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png';
        }
        
        // Use constructed avatar URL since comment objects don't have avatar data
        if (comment.authorName && comment.authorName !== '[deleted]') {
          userAvatarUrl = `https://www.reddit.com/user/${comment.authorName}/avatar.png`;
        }
        
        const finalIconUrl = userAvatarUrl || subredditIconUrl;
        
        const embed = {
          title: '💬 New Comment',
          description: comment.body?.length > 300 
            ? comment.body.substring(0, 300) + '...' 
            : comment.body || '[deleted]',
          url: `https://reddit.com${comment.permalink}`,
          color: 0x10b981, // Green color
          author: comment.authorName && comment.authorName !== '[deleted]' ? {
            name: comment.authorName,
            url: `https://reddit.com/user/${comment.authorName}`,
            icon_url: finalIconUrl,
          } : undefined,
          fields: [
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