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

// Setup all event handlers
setupAllHandlers();

// Test menu action for manual testing
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
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `🧪 **Test Notification**\n\nReddit Moderator Bot is working correctly!\nSubreddit: r/${context.subredditName}\n\nThis test uses the primary webhook. Other events may use dedicated webhooks if configured.`,
          username: 'Reddit Mod Bot',
        }),
      });

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
      }
      
      context.ui.showToast('Test notification sent to Discord!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      context.ui.showToast('Error sending test notification');
    }
  },
});

export default Devvit;