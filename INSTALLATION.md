# Installation Guide

## Prerequisites

1. **Install Devvit CLI** (if not already installed):
   ```cmd
   npm install -g devvit
   ```

2. **Login to Reddit** via Devvit:
   ```cmd
   devvit login
   ```

3. **Create a Discord Webhook** in your moderation channel:
   - Go to your Discord server
   - Right-click on the channel where you want notifications
   - Select "Edit Channel" → "Integrations" → "Webhooks" → "New Webhook"
   - Copy the webhook URL

## Installation Steps

1. **Clone and Setup**:
   ```cmd
   git clone <your-repo-url>
   cd reddit-moderator-bot
   npm run install-deps
   ```

2. **Upload to Reddit**:
   ```cmd
   npm run upload
   ```

3. **Install on Your Subreddit**:
   ```cmd
   npm run install-to-subreddit your-subreddit-name
   ```
   - Replace `your-subreddit-name` with your actual subreddit name
   - You must be a moderator of the subreddit
   - The "r/" prefix is optional

## Configuration

After installation, configure the bot through Reddit:

1. Go to your subreddit's "Mod Tools"
2. Navigate to "Apps" or "Community Apps"
3. Find "Reddit Moderator Bot" and click "Settings"
4. Configure the following:

### Required Settings:
- **Discord Webhook URL**: Paste your Discord webhook URL
- **Events to Monitor**: Select which events you want notifications for:
  - ✅ New Posts
  - ✅ New Comments  
  - ✅ Modqueue Items
  - ✅ Moderator Actions
  - ✅ Modmail Messages
  - ✅ Reported Content

### Optional Settings:
- **Enable @everyone mentions**: For urgent moderation items
- **Minimum Score Threshold**: Only notify about posts above this score

## Testing

After configuration, test the bot:

1. Go to your subreddit
2. Click the "..." menu and select "Apps"
3. Find "Test Discord Notification" and click it
4. Check your Discord channel for the test message

## Troubleshooting

### Common Issues:

**"Discord webhook URL not configured"**
- Ensure you've properly set the webhook URL in the bot settings
- Verify the webhook URL is valid and accessible

**"Failed to send test notification"**
- Check that the Discord webhook URL is correct
- Verify the webhook hasn't been deleted in Discord
- Ensure the bot has permissions in your subreddit

**"No notifications appearing"**
- Check that you've selected the events you want to monitor
- Verify the bot is properly installed on your subreddit
- Make sure there's activity matching your configured events

### Getting Help:

If you encounter issues:
1. Check the bot's error logs in Reddit's developer tools
2. Verify your Discord webhook is working by testing it manually
3. Ensure you have proper moderator permissions on the subreddit

## Updating the Bot

To update the bot with new features:

1. Pull the latest changes:
   ```cmd
   git pull origin main
   ```

2. Rebuild and upload:
   ```cmd
   npm run build
   npm run upload
   ```

The bot will automatically update on all installed subreddits.

## Uninstalling

To remove the bot from a subreddit:

1. Go to your subreddit's "Mod Tools" → "Apps"
2. Find "Reddit Moderator Bot"
3. Click "Uninstall" or "Remove"

This will stop all notifications and remove the bot's access to your subreddit.