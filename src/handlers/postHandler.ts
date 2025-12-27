import { Devvit } from '@devvit/public-api';
import { shouldNotifyPost } from '../utils/visibility.js';

/**
 * Handler for new post submissions
 */
export const setupPostHandler = (
  getWebhookUrl: (settings: any, eventType: string) => string,
  sendDiscordMessage: (webhookUrl: string, message: any, context: any) => Promise<void>
) => {
  Devvit.addTrigger({
    event: 'PostSubmit',
    onEvent: async (event, context) => {
      try {
        console.log(`[PostSubmit] `, event.post?.id);
        const settings = await context.settings.getAll();
        const webhookUrl = getWebhookUrl(settings, 'posts');
        const monitoredEvents = settings.monitoredEvents as string[];
        
        if (!webhookUrl || !monitoredEvents?.includes('posts') || !event.post?.id) {
          return;
        }

        // Check if we should notify based on visibility settings
        const shouldNotify = await shouldNotifyPost(event.post.id, settings, context);
        if (!shouldNotify) {
          console.log(`[PostSubmit] Skipping notification for post ${event.post.id} - not visible on front page`);
          return;
        }

        const post = await context.reddit.getPostById(event.post.id);
        const subreddit = await context.reddit.getCurrentSubreddit();
        
        // Get user avatar (posts don't have rich author data like modmail)
        let userAvatarUrl;
        let subredditIconUrl;
        
        // Get subreddit icon as fallback
        try {
          subredditIconUrl = `https://styles.redditmedia.com/t5_${subreddit.id.replace('t5_', '')}/styles/communityIcon_${subreddit.id.replace('t5_', '')}.png`;
        } catch (error) {
          subredditIconUrl = 'https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png';
        }
        
        // Use constructed avatar URL since post objects don't have avatar data
        if (post.authorName && post.authorName !== '[deleted]') {
          userAvatarUrl = `https://www.reddit.com/user/${post.authorName}/avatar.png`;
        }
        
        const finalIconUrl = userAvatarUrl || subredditIconUrl;
        
        const embed = {
          title: '📝 New Post',
          description: post.title,
          url: `https://reddit.com${post.permalink}`,
          color: 0x4f46e5, // Indigo color
          author: post.authorName && post.authorName !== '[deleted]' ? {
            name: post.authorName,
            url: `https://reddit.com/user/${post.authorName}`,
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
              value: post.score.toString(),
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
        console.error('Error in PostSubmit handler:', error);
      }
    },
  });
};