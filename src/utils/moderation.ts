/**
 * Helper function to format Discord role mentions
 */
export function formatDiscordMention(roleIdOrName: string): string {
  // Check if it's a numeric role ID (Discord snowflake)
  if (/^\d{17,19}$/.test(roleIdOrName)) {
    return `<@&${roleIdOrName}>`;
  }
  
  // If it's a role name, format as @RoleName
  return `@${roleIdOrName}`;
}

/**
 * Helper function to detect Reddit automated actions
 */
export function isRedditAutomatedAction(event: any): boolean {
  const moderatorName = event.moderator?.name?.toLowerCase();
  
  // Check for common Reddit automated moderators/systems
  const redditSystemNames = [
    'reddit',
    'automoderator', 
    'anti-evil operations',
    'reddit-anti-evil-operations',
    'reddit-safety',
    'reddit-legal',
    'reddit-admin',
    'reddit-spam-filter',
    'reddit-trust-and-safety'
  ];
  
  // No moderator usually means system action
  if (!moderatorName) {
    return true;
  }
  
  // Check if moderator name matches Reddit system accounts
  return redditSystemNames.some(systemName => 
    moderatorName.includes(systemName)
  );
}

/**
 * Helper functions for moderator actions
 */
export function getModActionEmoji(action: string): string {
  const emojiMap: { [key: string]: string } = {
    'banuser': '🔨',
    'unbanuser': '🔓',
    'muteuser': '🔇',
    'unmuteuser': '🔊',
    'lock': '🔒',
    'unlock': '🔓',
    'sticky': '📌',
    'unsticky': '📌',
    'distinguish': '🏷️',
    'undistinguish': '🏷️',
    'marknsfw': '🔞',
    'unmarknsfw': '🔞',
    'approvelink': '✅',
    'approvecomment': '✅',
    'removelink': '🗑️',
    'removecomment': '🗑️',
    'spamlink': '🚫',
    'spamcomment': '🚫',
  };
  return emojiMap[action] || '⚙️';
}

export function getModActionName(action: string): string {
  const nameMap: { [key: string]: string } = {
    'banuser': 'User Banned',
    'unbanuser': 'User Unbanned',
    'muteuser': 'User Muted',
    'unmuteuser': 'User Unmuted',
    'lock': 'Post/Comment Locked',
    'unlock': 'Post/Comment Unlocked',
    'sticky': 'Post Stickied',
    'unsticky': 'Post Unstickied',
    'distinguish': 'Distinguished',
    'undistinguish': 'Undistinguished',
    'marknsfw': 'Marked NSFW',
    'unmarknsfw': 'Unmarked NSFW',
    'approvelink': 'Approved Post',
    'approvecomment': 'Approved Comment',
    'removelink': 'Removed Post',
    'removecomment': 'Removed Comment',
    'spamlink': 'Marked Post as Spam',
    'spamcomment': 'Marked Comment as Spam',
  };
  return nameMap[action] || action;
}

export function getModActionColor(action: string): number {
  const colorMap: { [key: string]: number } = {
    'banuser': 0xef4444, // Red
    'unbanuser': 0x10b981, // Green
    'muteuser': 0xf59e0b, // Orange
    'unmuteuser': 0x10b981, // Green
    'lock': 0xf59e0b, // Orange
    'unlock': 0x10b981, // Green
    'sticky': 0x3b82f6, // Blue
    'unsticky': 0x6b7280, // Gray
    'distinguish': 0x8b5cf6, // Purple
    'undistinguish': 0x6b7280, // Gray
    'marknsfw': 0xef4444, // Red
    'unmarknsfw': 0x6b7280, // Gray
    'approvelink': 0x10b981, // Green
    'approvecomment': 0x10b981, // Green
    'removelink': 0xef4444, // Red
    'removecomment': 0xef4444, // Red
    'spamlink': 0xf59e0b, // Orange
    'spamcomment': 0xf59e0b, // Orange
  };
  return colorMap[action] || 0x6b7280; // Gray
}