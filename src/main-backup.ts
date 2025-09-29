import { Devvit } from '@devvit/public-api';
import { setupSettings } from './config/settings.js';
import { setupAllHandlers } from './handlers/index.js';

// Configure the Devvit app
Devvit.configure({
  redditAPI: true,
  http: true,
});

// Setup app settings
setupSettings();

// Setup refactored handlers (Comment and Post handlers)
setupAllHandlers();

// Helper function to get the appropriate webhook URL for an event type
function getWebhookUrl(settings: any, eventType: string): string {
  const primaryWebhook = settings.discordWebhookUrl as string;
  
  switch (eventType) {
    case 'posts':
      return (settings.postsWebhookUrl as string) || primaryWebhook;
    case 'comments':
      return (settings.commentsWebhookUrl as string) || primaryWebhook;
    case 'modmail':
      return (settings.modmailWebhookUrl as string) || primaryWebhook;
    case 'modlog':
      return (settings.modlogWebhookUrl as string) || primaryWebhook;
    case 'reports':
      return (settings.reportsWebhookUrl as string) || primaryWebhook;
    case 'modqueue':
      return (settings.modqueueWebhookUrl as string) || primaryWebhook;
    default:
      return primaryWebhook;
  }
}

// Helper function to send Discord messages
async function sendDiscordMessage(webhookUrl: string, message: any, context: any) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error(`Discord webhook failed: ${response.status} ${response.statusText}`);
    } else {
      console.log('Discord message sent successfully');
    }
  } catch (error) {
    console.error('Error sending Discord message:', error);
  }
}

// Monitor new comments
Devvit.addTrigger({
  event: 'CommentSubmit',
  onEvent: async (event, context) => {
    try {
      console.log('CommentSubmit event triggered');
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

// Monitor new posts
Devvit.addTrigger({
  event: 'PostSubmit',
  onEvent: async (event, context) => {
    try {
      console.log('PostSubmit event triggered');
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

// Monitor modmail messages
Devvit.addTrigger({
  event: 'ModMail',
  onEvent: async (event, context) => {
    try {
      console.log('ModMail event triggered');
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

// Monitor moderator actions
Devvit.addTrigger({
  event: 'ModAction',
  onEvent: async (event, context) => {
    try {
      console.log('ModAction event triggered');
      console.log('Action type:', event.action);
      console.log('Event details:', JSON.stringify(event, null, 2));
      
      const settings = await context.settings.getAll();
      const webhookUrl = getWebhookUrl(settings, 'modlog');
      const monitoredEvents = settings.monitoredEvents as string[];
      
      if (!webhookUrl || !monitoredEvents?.includes('modlog') || !event.action) {
        console.log('Skipping mod action - webhook:', !!webhookUrl, 'monitored:', monitoredEvents?.includes('modlog'), 'action:', event.action);
        return;
      }

      const subreddit = await context.reddit.getCurrentSubreddit();
      
      const actionEmoji = getModActionEmoji(event.action);
      const actionName = getModActionName(event.action);
      
      console.log('Action processed:', {
        emoji: actionEmoji,
        name: actionName,
        color: getModActionColor(event.action),
        moderator: event.moderator?.name || '[system]'
      });

      // Detect if this is a Reddit automated action
      const isRedditAutomated = isRedditAutomatedAction(event);
      const moderatorName = event.moderator?.name || '[system]';
      
      const embed = {
        title: `${actionEmoji} ${isRedditAutomated ? 'Reddit Automated Action' : 'Moderator Action'}: ${actionName}`,
        description: isRedditAutomated ? 
          `Action performed automatically by Reddit's systems` : 
          `Action performed by moderator`,
        color: isRedditAutomated ? 0xff6b35 : getModActionColor(event.action), // Orange for Reddit automated
        fields: [
          {
            name: isRedditAutomated ? 'System' : 'Moderator',
            value: moderatorName,
            inline: true,
          },
          {
            name: 'Subreddit',
            value: `r/${subreddit.name}`,
            inline: true,
          },
          {
            name: 'Action',
            value: actionName,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: isRedditAutomated ? 
            'Reddit Moderator Bot - Reddit Automated Action' : 
            'Reddit Moderator Bot - Modlog',
        },
      };

      // Add target information if available
      if (event.targetPost?.id && event.targetPost?.title) {
        embed.fields.push({
          name: 'Target Post',
          value: `[${event.targetPost.title.length > 50 ? event.targetPost.title.substring(0, 50) + '...' : event.targetPost.title}](https://reddit.com/comments/${event.targetPost.id.replace('t3_', '')})`,
          inline: false,
        });
      }

      if (event.targetUser?.name) {
        embed.fields.push({
          name: 'Target User',
          value: `u/${event.targetUser.name}`,
          inline: true,
        });
      }

      await sendDiscordMessage(webhookUrl, {
        embeds: [embed],
        username: 'Reddit Mod Bot',
      }, context);
      
    } catch (error) {
      console.error('Error in ModAction handler:', error);
    }
  },
});

// Monitor post reports
Devvit.addTrigger({
  event: 'PostReport',
  onEvent: async (event, context) => {
    try {
      console.log('PostReport event triggered');
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

// Monitor comment reports
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

// Helper function to format Discord role mention
function formatDiscordMention(roleIdOrName: string): string {
  if (!roleIdOrName) return '';
  
  // If it's a numeric ID, format as role mention
  if (/^\d+$/.test(roleIdOrName)) {
    return `<@&${roleIdOrName}>`;
  }
  
  // If it's a role name, format as @RoleName
  return `@${roleIdOrName}`;
}

// Monitor AutoModerator filtered posts
Devvit.addTrigger({
  event: 'AutomoderatorFilterPost',
  onEvent: async (event, context) => {
    try {
      console.log('AutomoderatorFilterPost event triggered');
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

// Monitor AutoModerator filtered comments
Devvit.addTrigger({
  event: 'AutomoderatorFilterComment',
  onEvent: async (event, context) => {
    try {
      console.log('AutomoderatorFilterComment event triggered');
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
      
      const embed = {
        title: '🤖 AutoModerator Filtered Comment',
        description: `Comment has been filtered by AutoModerator and needs review`,
        url: `https://reddit.com${comment.permalink}`,
        color: 0xf59e0b, // Orange color for filtered content
        fields: [
          {
            name: 'Comment Preview',
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
          {
            name: 'Score',
            value: comment.score.toString(),
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Reddit Moderator Bot - AutoMod Filter',
        },
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

// Helper function to detect Reddit automated actions
function isRedditAutomatedAction(event: any): boolean {
  const moderatorName = event.moderator?.name?.toLowerCase();
  
  // Check for common Reddit automated moderators/systems
  const redditSystemNames = [
    'reddit',
    'automoderator', 
    'anti-evil operations',
    'reddit-anti-evil-operations',
    'reddit-safety',
    'reddit-legal',
    'reddit-admin',
    'reddit-spam-filter',
    'reddit-trust-and-safety'
  ];
  
  // No moderator usually means system action
  if (!moderatorName) {
    return true;
  }
  
  // Check if moderator name matches Reddit system accounts
  return redditSystemNames.some(systemName => 
    moderatorName.includes(systemName)
  );
}

// Helper functions for moderator actions
function getModActionEmoji(action: string): string {
  const emojiMap: { [key: string]: string } = {
    'banuser': '🔨',
    'unbanuser': '🔓',
    'muteuser': '🔇',
    'unmuteuser': '🔊',
    'lock': '🔒',
    'unlock': '🔓',
    'sticky': '📌',
    'unsticky': '📌',
    'distinguish': '🏷️',
    'undistinguish': '🏷️',
    'marknsfw': '🔞',
    'unmarknsfw': '🔞',
    'approvelink': '✅',
    'approvecomment': '✅',
    'removelink': '🗑️',
    'removecomment': '🗑️',
    'spamlink': '🚫',
    'spamcomment': '🚫',
  };
  return emojiMap[action] || '⚙️';
}

function getModActionName(action: string): string {
  const nameMap: { [key: string]: string } = {
    'banuser': 'User Banned',
    'unbanuser': 'User Unbanned',
    'muteuser': 'User Muted',
    'unmuteuser': 'User Unmuted',
    'lock': 'Post/Comment Locked',
    'unlock': 'Post/Comment Unlocked',
    'sticky': 'Post Stickied',
    'unsticky': 'Post Unstickied',
    'distinguish': 'Distinguished',
    'undistinguish': 'Undistinguished',
    'marknsfw': 'Marked NSFW',
    'unmarknsfw': 'Unmarked NSFW',
    'approvelink': 'Approved Post',
    'approvecomment': 'Approved Comment',
    'removelink': 'Removed Post',
    'removecomment': 'Removed Comment',
    'spamlink': 'Marked Post as Spam',
    'spamcomment': 'Marked Comment as Spam',
  };
  return nameMap[action] || action;
}

function getModActionColor(action: string): number {
  const colorMap: { [key: string]: number } = {
    'banuser': 0xef4444, // Red
    'unbanuser': 0x10b981, // Green
    'muteuser': 0xf59e0b, // Orange
    'unmuteuser': 0x10b981, // Green
    'lock': 0xf59e0b, // Orange
    'unlock': 0x10b981, // Green
    'sticky': 0x3b82f6, // Blue
    'unsticky': 0x6b7280, // Gray
    'distinguish': 0x8b5cf6, // Purple
    'undistinguish': 0x6b7280, // Gray
    'marknsfw': 0xef4444, // Red
    'unmarknsfw': 0x6b7280, // Gray
    'approvelink': 0x10b981, // Green
    'approvecomment': 0x10b981, // Green
    'removelink': 0xef4444, // Red
    'removecomment': 0xef4444, // Red
    'spamlink': 0xf59e0b, // Orange
    'spamcomment': 0xf59e0b, // Orange
  };
  return colorMap[action] || 0x6b7280; // Gray
}

// Test menu action
Devvit.addMenuItem({
  label: 'Test Discord Notification',
  location: 'subreddit',
  onPress: async (event, context) => {
    try {
      const settings = await context.settings.getAll();
      const webhookUrl = settings.discordWebhookUrl as string;
      
      if (!webhookUrl) {
        context.ui.showToast('Primary Discord webhook URL not configured');
        return;
      }
      
      await sendDiscordMessage(webhookUrl, {
        content: `🧪 **Test Notification**\n\nReddit Moderator Bot is working correctly!\nSubreddit: r/${context.subredditName}\n\nThis test uses the primary webhook. Other events may use dedicated webhooks if configured.`,
        username: 'Reddit Mod Bot',
      }, context);
      
      context.ui.showToast('Test notification sent to Discord!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      context.ui.showToast('Error sending test notification');
    }
  },
});

export default Devvit;