import { Devvit } from '@devvit/public-api';
import { 
  isRedditAutomatedAction,
  getModActionEmoji,
  getModActionName, 
  getModActionColor
} from '../utils/moderation.js';

/**
 * Handler for moderator actions (including Reddit automated actions)
 */
export const setupModActionHandler = (
  getWebhookUrl: (settings: any, eventType: string) => string,
  sendDiscordMessage: (webhookUrl: string, message: any, context: any) => Promise<void>
) => {
  Devvit.addTrigger({
    event: 'ModAction',
    onEvent: async (event, context) => {
      try {
        console.log('[ModAction] ', event.action);
        // console.log('Event details:', JSON.stringify(event, null, 2));
        
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
};