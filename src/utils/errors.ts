/**
 * Error handling and logging utilities for the Reddit Moderator Bot
 */

export class BotError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: any
  ) {
    super(message);
    this.name = 'BotError';
  }
}

export class WebhookError extends BotError {
  constructor(message: string, public webhookUrl?: string, context?: any) {
    super(message, 'WEBHOOK_ERROR', context);
    this.name = 'WebhookError';
  }
}

export class RedditApiError extends BotError {
  constructor(message: string, public endpoint?: string, context?: any) {
    super(message, 'REDDIT_API_ERROR', context);
    this.name = 'RedditApiError';
  }
}

/**
 * Safe logger that works in Devvit environment
 */
export class Logger {
  static info(message: string, context?: any): void {
    // In Devvit, we can use console methods
    if (typeof console !== 'undefined' && console.log) {
      console.log(`[INFO] ${message}`, context ? JSON.stringify(context) : '');
    }
  }

  static error(message: string, error?: Error, context?: any): void {
    if (typeof console !== 'undefined' && console.error) {
      console.error(`[ERROR] ${message}`, {
        error: error?.message,
        stack: error?.stack,
        context
      });
    }
  }

  static warn(message: string, context?: any): void {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`[WARN] ${message}`, context ? JSON.stringify(context) : '');
    }
  }

  static debug(message: string, context?: any): void {
    if (typeof console !== 'undefined' && console.debug) {
      console.debug(`[DEBUG] ${message}`, context ? JSON.stringify(context) : '');
    }
  }
}

/**
 * Wrapper for handling async operations with proper error logging
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  context?: any
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    Logger.error(errorMessage, error as Error, context);
    return null;
  }
}

/**
 * Retry wrapper for flaky operations like webhook calls
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      Logger.warn(`Operation failed, attempt ${attempt}/${maxRetries}`, {
        error: lastError.message,
        attempt
      });
      
      if (attempt < maxRetries) {
        // Simple delay without external dependencies
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw new BotError(
    `Operation failed after ${maxRetries} attempts: ${lastError?.message}`,
    'RETRY_EXHAUSTED',
    { maxRetries, lastError: lastError?.message }
  );
}

/**
 * Validate webhook URL format
 */
export function isValidWebhookUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'discord.com' && 
           urlObj.pathname.startsWith('/api/webhooks/');
  } catch {
    return false;
  }
}

/**
 * Sanitize content for Discord (remove potential mentions/markdown exploits)
 */
export function sanitizeContent(content: string): string {
  if (!content) return '';
  
  return content
    // Escape Discord markdown
    .replace(/([*_`~|\\])/g, '\\$1')
    // Remove potential @everyone/@here mentions
    .replace(/@(everyone|here)/gi, '@\u200b$1')
    // Limit length
    .substring(0, 2000);
}