import { Devvit } from '@devvit/public-api';

/**
 * App settings configuration for the Reddit Moderator Bot
 */
export const setupSettings = () => {
  Devvit.addSettings([
    {
      type: 'string',
      name: 'discordWebhookUrl',
      label: 'Primary Discord Webhook URL',
      helpText: 'Main webhook URL - used as fallback if specific webhooks are not configured',
    },
    {
      type: 'string',
      name: 'postsWebhookUrl',
      label: 'Posts Webhook URL (optional)',
      helpText: 'Dedicated webhook for new post notifications. Leave empty to use primary webhook.',
    },
    {
      type: 'string',
      name: 'commentsWebhookUrl',
      label: 'Comments Webhook URL (optional)',
      helpText: 'Dedicated webhook for new comment notifications. Leave empty to use primary webhook.',
    },
    {
      type: 'string',
      name: 'modmailWebhookUrl',
      label: 'Modmail Webhook URL (optional)',
      helpText: 'Dedicated webhook for modmail notifications. Leave empty to use primary webhook.',
    },
    {
      type: 'string',
      name: 'modlogWebhookUrl',
      label: 'Mod Actions Webhook URL (optional)',
      helpText: 'Dedicated webhook for moderator action notifications. Leave empty to use primary webhook.',
    },
    {
      type: 'string',
      name: 'reportsWebhookUrl',
      label: 'Reports Webhook URL (optional)',
      helpText: 'Dedicated webhook for report notifications. Leave empty to use primary webhook.',
    },
    {
      type: 'string',
      name: 'modqueueWebhookUrl',
      label: 'Modqueue Webhook URL (optional)',
      helpText: 'Dedicated webhook for modqueue notifications (AutoMod filtered content). Leave empty to use primary webhook.',
    },
    // Thread ID settings for delivering to specific threads
    {
      type: 'string',
      name: 'postsThreadId',
      label: 'Posts Thread ID (optional)',
      helpText: 'Discord thread ID to send post notifications to. Format: just the numeric thread ID (e.g., "1234567890123456789").',
    },
    {
      type: 'string',
      name: 'commentsThreadId',
      label: 'Comments Thread ID (optional)',
      helpText: 'Discord thread ID to send comment notifications to. Format: just the numeric thread ID.',
    },
    {
      type: 'string',
      name: 'modmailThreadId',
      label: 'Modmail Thread ID (optional)',
      helpText: 'Discord thread ID to send modmail notifications to. Format: just the numeric thread ID.',
    },
    {
      type: 'string',
      name: 'modlogThreadId',
      label: 'Mod Actions Thread ID (optional)',
      helpText: 'Discord thread ID to send mod action notifications to. Format: just the numeric thread ID.',
    },
    {
      type: 'string',
      name: 'reportsThreadId',
      label: 'Reports Thread ID (optional)',
      helpText: 'Discord thread ID to send report notifications to. Format: just the numeric thread ID.',
    },
    {
      type: 'string',
      name: 'modqueueThreadId',
      label: 'Modqueue Thread ID (optional)',
      helpText: 'Discord thread ID to send modqueue notifications to. Format: just the numeric thread ID.',
    },
    {
      type: 'select',
      name: 'monitoredEvents',
      label: 'Events to Monitor',
      helpText: 'Select which events you want to receive Discord notifications for',
      options: [
        { label: 'New Posts', value: 'posts' },
        { label: 'New Comments', value: 'comments' },
        { label: 'Modqueue Items', value: 'modqueue' },
        { label: 'Moderator Actions', value: 'modlog' },
        { label: 'Modmail Messages', value: 'modmail' },
        { label: 'Reported Content', value: 'reports' },
      ],
      multiSelect: true,
      defaultValue: ['posts', 'modqueue', 'reports'],
    },
    {
      type: 'string',
      name: 'discordMentionRole',
      label: 'Discord Role to Mention (optional)',
      helpText: 'Discord role ID or name to mention for urgent notifications (e.g., "Moderators" or "123456789"). Leave empty for no mentions.',
    },
  ]);
};