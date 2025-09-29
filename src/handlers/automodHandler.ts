import { Devvit } from '@devvit/public-api';
import { formatDiscordMention } from '../utils/moderation.js';

/**
 * Handler for AutoModerator filter events
 */
export const setupAutomodHandler = (
  getWebhookUrl: (settings: any, eventType: string) => string,
  sendDiscordMessage: (webhookUrl: string, message: any, context: any) => Promise<void>
) => {
  // AutoModerator Filtered Post Handler
  Devvit.addTrigger({
    event: 'AutomoderatorFilterPost',
    onEvent: async (event, context) => {
      try {
        console.log('[AutomoderatorFilterPost] ', event.post?.id);
        const settings = await context.settings.getAll();
        const webhookUrl = getWebhookUrl(settings, 'modqueue');
        const monitoredEvents = settings.monitoredEvents as string[];
        
        if (!webhookUrl || !monitoredEvents?.includes('modqueue')) {
          return;
        }

        if (!event.post?.id) {
          return;
        }

        const post = await context.reddit.getPostById(event.post.id);
        const subreddit = await context.reddit.getCurrentSubreddit();
        const mentionRole = settings.discordMentionRole as string;
        
        const embed = {
          title: '🤖 AutoModerator Filtered Post',
          description: `Post has been filtered by AutoModerator and needs review`,
          url: `https://reddit.com${post.permalink}`,
          color: 0xf59e0b, // Orange color for filtered content
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
            {
              name: 'Score',
              value: post.score.toString(),
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Reddit Moderator Bot - AutoMod Filter',
          },
        };

        const mentionText = mentionRole ? `${formatDiscordMention(mentionRole)} Post filtered by AutoModerator and needs review` : undefined;

        await sendDiscordMessage(webhookUrl, {
          content: mentionText,
          embeds: [embed],
          username: 'Reddit Mod Bot',
        }, context);
        
      } catch (error) {
        console.error('Error in AutomoderatorFilterPost handler:', error);
      }
    },
  });

  // AutoModerator Filtered Comment Handler
  Devvit.addTrigger({
    event: 'AutomoderatorFilterComment',
    onEvent: async (event, context) => {
      try {
        console.log('[AutomoderatorFilterComment] ', event.comment?.id);
        const settings = await context.settings.getAll();
        const webhookUrl = getWebhookUrl(settings, 'modqueue');
        const monitoredEvents = settings.monitoredEvents as string[];
        
        if (!webhookUrl || !monitoredEvents?.includes('modqueue')) {
          return;
        }

        if (!event.comment?.id) {
          return;
        }

        const comment = await context.reddit.getCommentById(event.comment.id);
        const subreddit = await context.reddit.getCurrentSubreddit();
        const mentionRole = settings.discordMentionRole as string;
        
        // Get parent post title by fetching the post
        let parentPostTitle = 'Unknown Post';
        try {
          if (comment.postId) {
            const parentPost = await context.reddit.getPostById(comment.postId);
            parentPostTitle = parentPost.title ? 
              (parentPost.title.length > 100 ? parentPost.title.substring(0, 100) + '...' : parentPost.title) :
              'Unknown Post';
          }
        } catch (error) {
          console.error('Error fetching parent post:', error);
        }
          
        // Try to get user avatar if available
        let userAvatarUrl;
        try {
          if (comment.authorName && comment.authorName !== '[deleted]') {
            const user = await context.reddit.getUserByUsername(comment.authorName);
            if (user) {
              // Reddit user avatars are typically in these formats
              // Note: We might need to construct the avatar URL or use a default Reddit avatar
              // For now, we'll use Reddit's default avatar API
              userAvatarUrl = `https://www.reddit.com/user/${comment.authorName}/avatar.png`;
            }
          }
        } catch (error) {
          console.log('Could not fetch user avatar:', error);
        }

        const embed = {
          title: '🤖 AutoModerator Filtered Comment',
          description: comment.body?.length > 200 ? comment.body.substring(0, 200) + '...' : comment.body || '[deleted]',
          url: `https://reddit.com${comment.permalink}`,
          color: 0xf59e0b, // Orange color for filtered content
          author: {
            name: comment.authorName || '[deleted]',
            url: comment.authorName ? `https://reddit.com/user/${comment.authorName}` : undefined,
            icon_url: userAvatarUrl,
          },
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
        //   timestamp: new Date().toISOString(),
        //   footer: {
        //     text: `📌 ${parentPostTitle}`,
        //   },
        };

        const mentionText = mentionRole ? `${formatDiscordMention(mentionRole)} Comment filtered by AutoModerator and needs review` : undefined;

        await sendDiscordMessage(webhookUrl, {
          content: mentionText,
          embeds: [embed],
          username: 'Reddit Mod Bot',
        }, context);
        
      } catch (error) {
        console.error('Error in AutomoderatorFilterComment handler:', error);
      }
    },
  });
};