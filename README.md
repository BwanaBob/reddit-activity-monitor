## Project Structure

```
reddit-devvit-bot/
├── src/
│   ├── main.ts              # Main application with all event handlers
│   ├── types/               # TypeScript type definitions (optional)
│   └── utils/              # Utility functions (optional)
├── devvit.yaml             # Devvit configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Features

- **Post Monitoring**: Track new posts in specified subreddits
- **Comment Monitoring**: Monitor new comments for moderation review  
- **Discord Integration**: Rich embed notifications via webhooks
- **Configurable**: Choose which events to monitor through Reddit settings
- **Test Function**: Built-in test button to verify Discord integration

## Installation

1. Clone this repository
2. Install dependencies: `npm run install-deps`
3. Upload to Reddit: `npm run upload`
4. Install on your subreddit: `npm run install-to-subreddit <subreddit-name>`

## Configuration

After installation, configure the bot through Reddit's app settings:

1. **Discord Webhook URL**: The webhook URL for your Discord channel
2. **Monitored Events**: Choose which events to monitor
3. **Notification Settings**: Customize the format and frequency of notifications

## Development

- `npm run dev` - Start development with live reloading (playtest mode)
- `npm run upload` - Upload new version to Reddit's servers
- `npm run install-to-subreddit <subreddit>` - Install on a specific subreddit
- `npm run logs <subreddit>` - View logs for your app installation

## Requirements

- Devvit CLI installed globally: `npm install -g @devvit/cli`
- Logged in to Reddit: `devvit login`
- Moderator permissions on target subreddit
- Discord webhook configured

## License

MIT