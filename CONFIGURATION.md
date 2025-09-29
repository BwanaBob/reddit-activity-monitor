# Conf## Core Settings

### Primary Discord Webhook URL
- **Type**: String (Required)
- **Description**: Main webhook URL used as fallback for all events
- **Format**: `https://discord.com/api/webhooks/{webhook.id}/{webhook.token}`
- **Usage**: Used when specific event webhooks are not configured

### Event-Specific Webhook URLs (Optional)
Configure dedicated webhooks for different event types:

#### Posts Webhook URL
- **Type**: String (Optional)
- **Description**: Dedicated webhook for new post notifications
- **Use Case**: Send posts to a #reddit-posts channel

#### Comments Webhook URL  
- **Type**: String (Optional)
- **Description**: Dedicated webhook for new comment notifications
- **Use Case**: Send comments to a #reddit-comments channel

#### Modmail Webhook URL
- **Type**: String (Optional)
- **Description**: Dedicated webhook for modmail notifications
- **Use Case**: Send modmail to a private #modmail channel

#### Mod Actions Webhook URL
- **Type**: String (Optional)
- **Description**: Dedicated webhook for moderator action notifications
- **Use Case**: Send mod actions to a #mod-log channel

#### Reports Webhook URL
- **Type**: String (Optional)
- **Description**: Dedicated webhook for report notifications
- **Use Case**: Send reports to an urgent #reports channel

### Discord Role to Mentionde

## Bot Settings

The Reddit Moderator Bot can be configured through Reddit's app settings interface. Here's a detailed explanation of each setting:

## Core Settings

### Discord Webhook URL
- **Type**: String (Required)
- **Description**: The webhook URL for your Discord channel where notifications will be sent
- **Format**: `https://discord.com/api/webhooks/{webhook.id}/{webhook.token}`
- **How to get**: 
  1. Go to your Discord server
  2. Right-click on the target channel
  3. Select "Edit Channel" → "Integrations" → "Webhooks"
  4. Create a new webhook or copy existing one

### Events to Monitor
- **Type**: Multi-select dropdown
- **Description**: Choose which Reddit events trigger Discord notifications
- **Options**:
  - **New Posts**: Notifications when users submit new posts
  - **New Comments**: Notifications when users submit new comments
  - **Modqueue Items**: Notifications for content requiring moderation
  - **Moderator Actions**: Notifications for moderator actions (bans, locks, etc.)
  - **Modmail Messages**: Notifications for new modmail (when available)
  - **Reported Content**: Notifications when content gets reported

### Discord Role to Mention
- **Type**: String (Optional)
- **Description**: Discord role ID or name to mention for urgent notifications
- **Format**: 
  - **Role ID**: `123456789012345678` (numeric ID from Discord)
  - **Role Name**: `Moderators` (role name as it appears in Discord)
- **How to get Role ID**:
  1. In Discord, go to Server Settings → Roles
  2. Right-click on the role → "Copy ID" (requires Developer Mode enabled)
  3. Or just use the role name like "Moderators"
- **Result**: Role mentions like `<@&123456789>` or `@Moderators`
- **Use Case**: Notify specific moderation team instead of @everyone

### Events to Monitor

### New Posts Configuration
```
Triggers: When users submit new posts to your subreddit
Includes: Post title, author, score, comments count, content preview
Best for: Active monitoring of new content
```

### New Comments Configuration  
```
Triggers: When users submit new comments
Includes: Comment content, author, post title, score
Best for: Monitoring comment activity
```

### Modqueue Items Configuration
```
Triggers: When content appears in modqueue (reported, flagged by AutoMod, etc.)
Includes: Content type, author, action taken, moderator
Best for: Critical moderation workflow
```

### Moderator Actions Configuration
```
Triggers: User bans, post locks, comment removals, etc.
Includes: Action type, moderator, target content, reason
Best for: Transparency and moderation logging
```

### Reported Content Configuration
```
Triggers: When users report posts or comments
Includes: Report reason, content preview, report count
Best for: Immediate response to community reports
```

## Discord Message Format

### Standard Notification Format:
```
🔸 Event Title
Description of the event
┌─ Field Name: Field Value
├─ Author: u/username
├─ Subreddit: r/subredditname
└─ Timestamp: DateTime

Link to Reddit content (if applicable)
```

### Urgent Notification Format (with @everyone):
```
@everyone 🚨 Urgent Event Title
[Same format as above]
```

## Webhook Configuration Examples

### Multi-Channel Setup (Recommended):
```yaml
Primary Webhook URL: "https://discord.com/api/webhooks/123/primary-fallback"
Posts Webhook URL: "https://discord.com/api/webhooks/123/reddit-posts"
Comments Webhook URL: "" # Uses primary webhook
Modmail Webhook URL: "https://discord.com/api/webhooks/456/private-modmail"  
Mod Actions Webhook URL: "https://discord.com/api/webhooks/789/mod-log"
Reports Webhook URL: "https://discord.com/api/webhooks/999/urgent-reports"

Events to Monitor: ✅ All Events Selected
Discord Role to Mention: "Moderators"
```

### Single Channel Setup:
```yaml
Primary Webhook URL: "https://discord.com/api/webhooks/123/general-moderation"
All other webhooks: "" # Empty - uses primary webhook

Events to Monitor: ✅ Selected Events
Discord Role to Mention: "Staff"
```

### Basic Monitoring Setup:
```yaml
Events to Monitor:
  - ✅ New Posts
  - ✅ Modqueue Items  
  - ✅ Reported Content
  - ❌ New Comments
  - ❌ Moderator Actions
  - ❌ Modmail Messages

Discord Role to Mention: "Moderators"
```

### Comprehensive Monitoring Setup:
```yaml
Events to Monitor:
  - ✅ All Events Selected

Discord Role to Mention: "123456789012345678"
```

### Light Monitoring Setup:
```yaml
Events to Monitor:
  - ✅ Modqueue Items
  - ✅ Reported Content
  - ❌ All Others

Discord Role to Mention: "Staff"
```

## Rate Limiting

The bot implements Discord webhook rate limiting:
- Maximum 30 messages per minute
- Built-in retry logic for failed webhook calls
- Automatic queueing for high-volume subreddits

## Security Considerations

### Webhook URL Security:
- Never share your webhook URL publicly
- Regenerate webhook if compromised
- Use a dedicated channel for bot notifications
- Consider webhook permissions in Discord

### Reddit Permissions:
- Bot only accesses data you explicitly configure
- Respects Reddit's API rate limits  
- Only moderators can configure bot settings
- Automatic uninstall removes all access

## Testing Configuration

### Test Your Setup:
1. Configure webhook URL and desired events
2. Use the "Test Discord Notification" menu action
3. Verify message appears in Discord
4. Generate test events (make a test post, etc.)
5. Confirm notifications work as expected

### Common Test Scenarios:
- Submit a test post (should trigger New Posts notification)
- Report your own content (should trigger Reported Content notification)  
- Use moderator actions (should trigger appropriate notifications)

## Advanced Configuration

### Custom Notification Channels:
You can set up different webhooks for different event types by:
1. Installing the bot multiple times with different configurations
2. Using Discord's webhook filtering features
3. Creating separate channels for different notification types

### Integration with Other Bots:
The bot works alongside other Discord and Reddit bots:
- Unique username prevents conflicts
- Respects Discord channel permissions
- Compatible with other moderation tools