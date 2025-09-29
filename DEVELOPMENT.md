# Development Guide

## Project Structure

```
reddit-devvit-bot/
├── src/
│   ├── main.ts              # Main application with all event handlers
│   ├── types/               # TypeScript type definitions (optional)
│   └── utils/              # Utility functions (optional) 
├── devvit.yaml             # Devvit configuration
├── package.json            # Node.js dependencies
├── tsconfig.json           # TypeScript configuration
├── README.md               # Project overview
├── INSTALLATION.md         # Installation instructions
├── CONFIGURATION.md        # Configuration guide
└── DEVELOPMENT.md          # This file
```

## Development Workflow

### Prerequisites

1. **Install Devvit CLI**:
   ```cmd
   npm install -g devvit
   ```

2. **Login to Reddit**:
   ```cmd
   devvit login
   ```

3. **Install dependencies**:
   ```cmd
   npm install
   ```

### Development Commands

```cmd
# Build and watch for changes
npm run dev

# Build for production
npm run build

# Upload to Reddit's servers
npm run upload

# Install on a subreddit
npm run install
```

### Testing

1. **Local Development**:
   ```cmd
   npm run dev
   ```

2. **Test Upload**:
   ```cmd
   npm run upload
   ```

3. **Test Installation**:
   Create a test subreddit and install the bot to test functionality.

### Code Architecture

#### Event Flow
1. **Trigger**: Reddit event occurs (new post, comment, etc.)
2. **Handler**: Appropriate handler processes the event
3. **Format**: Event data is formatted for Discord
4. **Send**: Message sent to Discord via webhook
5. **Log**: Result logged for debugging

#### Error Handling
- All operations wrapped in try-catch blocks
- Comprehensive logging at debug, info, warn, and error levels
- Automatic retries for webhook failures
- Graceful degradation when Discord is unavailable

#### Rate Limiting
- Built-in rate limiting for Discord webhooks (30 requests/minute)
- Automatic queueing and retry logic
- Prevents bot from being blocked by Discord

### Key Components

#### Main Application (`src/main.ts`)
- Configures Devvit app with required permissions
- Defines settings interface for moderators including multiple webhook support
- Sets up event triggers and handlers for all Reddit events
- Provides webhook routing logic for different event types
- Includes test functionality and helper functions

#### Multiple Webhook Support
- **Primary Webhook**: Fallback for all events
- **Event-Specific Webhooks**: Optional dedicated channels
- **Automatic Routing**: Events use specific webhooks or fallback to primary
- **Flexible Configuration**: Mix and match channels as needed

### Current Event Handlers (All in main.ts)

- **PostHandler**: Processes new post submissions (inline in main.ts)
- **CommentHandler**: Processes new comment submissions (inline in main.ts)
- **ModMailHandler**: Processes modmail messages (inline in main.ts)
- **ModActionHandler**: Processes moderator actions (inline in main.ts)
- **ReportHandlers**: Processes post and comment reports (inline in main.ts)

### Adding New Features

#### Adding a New Event Type

1. **Add Webhook Setting** (if you want dedicated webhook support):
   ```typescript
   // src/main.ts - Add to Devvit.addSettings
   {
     type: 'string',
     name: 'newEventWebhookUrl',
     label: 'New Event Webhook URL (optional)',
     helpText: 'Dedicated webhook for new event notifications.',
   }
   ```

2. **Update Webhook Router**:
   ```typescript
   // Add case to getWebhookUrl function
   case 'newEvent':
     return (settings.newEventWebhookUrl as string) || primaryWebhook;
   ```

3. **Add Trigger**:
   ```typescript
   // src/main.ts
   Devvit.addTrigger({
     event: 'NewEventType',
     onEvent: async (event, context) => {
       const settings = await context.settings.getAll();
       const webhookUrl = getWebhookUrl(settings, 'newEvent');
       const monitoredEvents = settings.monitoredEvents as string[];
       
       if (webhookUrl && monitoredEvents?.includes('newEvent')) {
         // Handle event inline
       }
     },
   });
   ```

4. **Update Settings**:
   ```typescript
   // Add to monitoredEvents options
   { label: 'New Events', value: 'newEvent' }
   ```

#### Adding New Configuration Options

1. **Add Setting**:
   ```typescript
   // src/main.ts
   Devvit.addSettings([
     {
       type: 'string', // or 'boolean', 'number', 'select'
       name: 'newSetting',
       label: 'New Setting Label',
       helpText: 'Description of what this setting does',
       defaultValue: 'default',
     },
   ]);
   ```

2. **Use Setting**:
   ```typescript
   // In handler functions
   const newValue = settings.newSetting as string;
   ```

### Debugging

#### Enable Debug Logging
Debug logs are automatically output to the console. View them in:
- Devvit CLI output during development
- Reddit's developer tools in production

#### Common Debug Scenarios

1. **Webhook Not Working**:
   - Check webhook URL format
   - Test webhook manually with curl/Postman
   - Verify Discord channel permissions

2. **Events Not Triggering**:
   - Check event configuration in settings
   - Verify bot is installed with correct permissions
   - Check subreddit activity matches configured events

3. **Rate Limiting Issues**:
   - Monitor debug logs for rate limit warnings
   - Consider using different webhooks for different event types
   - Distribute load across multiple Discord channels
   - Use event-specific webhooks for high-volume subreddits

### Best Practices

#### Code Style
- Use TypeScript strict mode
- Comprehensive error handling
- Descriptive variable and function names
- Document complex logic with comments

#### Performance
- Minimize API calls to Reddit
- Use efficient data structures
- Implement proper rate limiting
- Cache frequently accessed data when possible

#### Security
- Validate all inputs from Reddit API
- Sanitize content before sending to Discord
- Never log sensitive information (webhook URLs, tokens)
- Use proper error messages that don't expose internals

#### Testing
- Test with various subreddit sizes
- Verify behavior with high-volume events
- Test error scenarios (network failures, invalid webhooks)
- Validate Discord message formatting

### Deployment

#### Pre-deployment Checklist
- [ ] All tests pass locally
- [ ] Error handling tested
- [ ] Rate limiting verified
- [ ] Discord formatting validated
- [ ] Documentation updated

#### Deployment Process
1. Build the application: `npm run build`
2. Upload to Reddit: `npm run upload`
3. Test on a small subreddit first
4. Monitor logs for errors
5. Deploy to production subreddits

#### Post-deployment Monitoring
- Monitor error logs for issues
- Check Discord webhooks are receiving messages
- Verify rate limiting is working correctly
- Gather feedback from moderators

### Troubleshooting

#### Common Issues

**Build Errors**:
- Check TypeScript configuration
- Verify all imports are correct
- Ensure all dependencies are installed

**Upload Failures**:
- Check Devvit CLI login status
- Verify internet connection
- Check devvit.yaml configuration

**Runtime Errors**:
- Check Reddit API permissions
- Verify webhook URLs are valid
- Monitor rate limiting logs