/**
 * Helper function to get the appropriate webhook URL for an event type with thread support
 */
export function getWebhookUrl(settings: any, eventType: string): string {
  const primaryWebhook = settings.discordWebhookUrl as string;
  
  // Get base webhook URL for the event type
  let baseWebhookUrl: string;
  switch (eventType) {
    case 'posts':
      baseWebhookUrl = (settings.postsWebhookUrl as string) || primaryWebhook;
      break;
    case 'comments':
      baseWebhookUrl = (settings.commentsWebhookUrl as string) || primaryWebhook;
      break;
    case 'modmail':
      baseWebhookUrl = (settings.modmailWebhookUrl as string) || primaryWebhook;
      break;
    case 'modlog':
      baseWebhookUrl = (settings.modlogWebhookUrl as string) || primaryWebhook;
      break;
    case 'reports':
      baseWebhookUrl = (settings.reportsWebhookUrl as string) || primaryWebhook;
      break;
    case 'modqueue':
      baseWebhookUrl = (settings.modqueueWebhookUrl as string) || primaryWebhook;
      break;
    default:
      baseWebhookUrl = primaryWebhook;
  }

  if (!baseWebhookUrl) {
    return baseWebhookUrl;
  }

  // Check for thread ID setting for this event type
  let threadId: string;
  switch (eventType) {
    case 'posts':
      threadId = settings.postsThreadId as string;
      break;
    case 'comments':
      threadId = settings.commentsThreadId as string;
      break;
    case 'modmail':
      threadId = settings.modmailThreadId as string;
      break;
    case 'modlog':
      threadId = settings.modlogThreadId as string;
      break;
    case 'reports':
      threadId = settings.reportsThreadId as string;
      break;
    case 'modqueue':
      threadId = settings.modqueueThreadId as string;
      break;
    default:
      threadId = '';
  }

  // Append thread_id parameter if specified
  if (threadId && threadId.trim()) {
    const separator = baseWebhookUrl.includes('?') ? '&' : '?';
    return `${baseWebhookUrl}${separator}thread_id=${threadId.trim()}`;
  }

  return baseWebhookUrl;
}

/**
 * Helper function to send Discord messages
 */
export async function sendDiscordMessage(webhookUrl: string, message: any, context: any) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
    }

    console.log('Discord message sent successfully');
  } catch (error) {
    console.error('Error sending Discord message:', error);
    throw error;
  }
}