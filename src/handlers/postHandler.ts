import { Devvit } from '@devvit/public-api';

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

        const post = await context.reddit.getPostById(event.post.id);
        const subreddit = await context.reddit.getCurrentSubreddit();
        
        const embed = {
          title: '📝 New Post',
          description: post.title,
          url: `https://reddit.com${post.permalink}`,
          color: 0x4f46e5, // Indigo color
          fields: [
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