import { setupCommentHandler } from './commentHandler.js';
import { setupPostHandler } from './postHandler.js';
import { setupModmailHandler } from './modmailHandler.js';
import { setupModActionHandler } from './modActionHandler.js';
import { setupReportHandlers } from './reportHandler.js';
import { setupAutomodHandler } from './automodHandler.js';
import { getWebhookUrl, sendDiscordMessage } from '../utils/webhooks.js';

/**
 * Setup all event handlers for the Reddit Moderator Bot
 */
export const setupAllHandlers = () => {
  // Setup individual handlers with shared utilities
  setupCommentHandler(getWebhookUrl, sendDiscordMessage);
  setupPostHandler(getWebhookUrl, sendDiscordMessage);
  setupModmailHandler(getWebhookUrl, sendDiscordMessage);
  setupModActionHandler(getWebhookUrl, sendDiscordMessage);
  setupReportHandlers(getWebhookUrl, sendDiscordMessage);
  setupAutomodHandler(getWebhookUrl, sendDiscordMessage);
};