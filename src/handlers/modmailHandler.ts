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
        console.log('[ModMail] Event:', JSON.stringify(event, null, 2));

        const settings = await context.settings.getAll();
        const webhookUrl = getWebhookUrl(settings, 'modmail');
        const monitoredEvents = settings.monitoredEvents as string[];
        
        if (!webhookUrl || !monitoredEvents?.includes('modmail')) {
          return;
        }

        const subreddit = await context.reddit.getCurrentSubreddit();
        const mentionRole = settings.discordMentionRole as string;
        
        // Try to get user avatar from event, with fallbacks
        let userAvatarUrl;
        let authorName;
        
        // Get subreddit icon as final fallback
        let subredditIconUrl;
        try {
          // Try to construct subreddit icon URL
          // Reddit's subreddit icons follow this pattern
          subredditIconUrl = `https://styles.redditmedia.com/t5_${subreddit.id.replace('t5_', '')}/styles/communityIcon_${subreddit.id.replace('t5_', '')}.png`;
          
          // Alternative fallback: use Reddit's default subreddit icon
          if (!subredditIconUrl) {
            subredditIconUrl = 'https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png';
          }
        } catch (error) {
          console.log('Could not fetch subreddit icon:', error);
          // Final fallback to Reddit logo
          subredditIconUrl = 'https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png';
        }
        
        // Get author name and avatar from event data
        try {
          if (event.messageAuthor && typeof event.messageAuthor === 'object') {
            // Extract author name
            authorName = event.messageAuthor.name || event.messageAuthor;
            
            // Cast to any to access dynamic properties that may exist
            const author = event.messageAuthor as any;
            
            // Try avatar sources in priority order based on actual event data:
            // 1. iconImage (headshot - preferred)
            // 2. snoovatarImage (snoovatar - fallback)  
            // 3. constructed avatar URL
            if (author.iconImage) {
              userAvatarUrl = author.iconImage;
            } else if (author.snoovatarImage) {
              userAvatarUrl = author.snoovatarImage;
            } else if (authorName) {
              userAvatarUrl = `https://www.reddit.com/user/${authorName}/avatar.png`;
            }
          } else if (typeof event.messageAuthor === 'string') {
            authorName = event.messageAuthor;
            userAvatarUrl = `https://www.reddit.com/user/${authorName}/avatar.png`;
          }
        } catch (error) {
          console.log('Could not fetch user avatar for modmail:', error);
        }
        
        // Use subreddit icon as fallback if no user avatar
        const finalIconUrl = userAvatarUrl || subredditIconUrl;

        // Extract message content (Devvit ModMail events have limited data)
        const messageSubject = 'Mod Mail';
        const messageBody = 'New modmail message received';
        
        const embed = {
          title: messageSubject,
          url: 'https://mod.reddit.com/mail/all', // Match your Discord.js URL
          description: messageBody,
          color: 0x3b82f6, // Blue color
          author: authorName ? {
            name: authorName,
            icon_url: finalIconUrl, // User avatar or subreddit icon fallback
          } : {
            name: `r/${subreddit.name}`,
            icon_url: subredditIconUrl, // Subreddit icon when no author
          },
          timestamp: new Date().toISOString(),
          footer: {
            text: `r/${subreddit.name}`, // Match your Discord.js footer format
          },
        };

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