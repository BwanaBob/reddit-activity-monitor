# Activity Monitor

A comprehensive Discord notification system for Reddit moderators. Get real-time alerts for posts, comments, reports, modmail, and moderator actions delivered directly to your Discord server.

## 🔥 Key Features

### **📊 Complete Moderation Coverage**
- **New Posts & Comments** - Monitor all community activity
- **AutoModerator Queue** - Get notified when content needs review
- **User Reports** - Immediate alerts for reported content
- **Moderator Actions** - Track all mod team activities
- **Modmail Messages** - Never miss important communications

### **🎯 Advanced Discord Integration**
- **Rich Embeds** - Beautiful, informative Discord messages
- **User Avatars** - See Reddit user profile pictures in notifications
- **Thread Support** - Deliver notifications to specific Discord threads
- **Role Mentions** - Alert your mod team for urgent items
- **Multiple Webhooks** - Route different events to different channels

### **⚙️ Flexible Configuration**
- **Event Selection** - Choose exactly which events to monitor
- **Webhook Routing** - Send different notifications to different Discord channels
- **Thread Targeting** - Organize notifications using Discord threads
- **Custom Mentions** - Configure role pings for important alerts

## 📦 Installation

1. **Install the App**
   - Visit your subreddit's "Mod Tools"
   - Go to "Apps" → "App Directory"
   - Search for "Activity Monitor"
   - Click "Install"

2. **Create Discord Webhook**
   - In Discord: Right-click your channel → "Edit Channel" → "Integrations" → "Webhooks"
   - Create webhook and copy the URL

3. **Configure Settings**
   - Return to your subreddit's "Mod Tools" → "Apps"
   - Find "Reddit Moderator Bot" → "Settings"
   - Paste your Discord webhook URL
   - Select which events to monitor
   - Save configuration

4. **Test the Connection**
   - In your subreddit, click "..." → "Apps" → "Test Discord Notification"
   - Check Discord for the test message

## 🎛️ Configuration Examples

### **Basic Setup - Single Channel**
```
Primary Webhook: https://discord.com/api/webhooks/123/abc
Monitored Events: ✅ New Posts, ✅ Modqueue, ✅ Reports
```

### **Advanced Setup - Multiple Channels**
```
Posts Webhook: https://discord.com/api/webhooks/111/posts-channel
Modqueue Webhook: https://discord.com/api/webhooks/222/urgent-moderation  
Reports Webhook: https://discord.com/api/webhooks/333/reports-channel
Mod Actions Webhook: https://discord.com/api/webhooks/444/mod-log
```

### **Thread Organization**
```
Primary Webhook: https://discord.com/api/webhooks/123/general
Posts Thread ID: 987654321098765432
Comments Thread ID: 876543210987654321
```

## 🚀 Benefits

- **Never Miss Important Activity** - Real-time notifications for all moderation needs
- **Reduce Response Time** - Instant alerts mean faster community management
- **Team Coordination** - Keep your entire mod team informed with role mentions
- **Organized Workflow** - Route different events to appropriate Discord channels
- **Professional Presentation** - Rich embeds with user avatars and formatted content

## ❓ Getting Help

- **Configuration Issues**: Check your Discord webhook URL and permissions
- **Missing Notifications**: Verify you've selected the correct events to monitor
- **Technical Support**: Visit the [GitHub repository](https://github.com/BwanaBob/reddit-activity-monitor) for detailed documentation
- **Feature Requests**: Submit suggestions through Reddit's feedback system

## 📋 Requirements

- Moderator permissions on your subreddit
- Discord server with webhook creation permissions
- Reddit account in good standing

---

**Ready to streamline your moderation workflow?** Install the Activity Monitor today and keep your community safe with instant Discord notifications!