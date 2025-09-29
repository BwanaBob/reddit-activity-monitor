/**
 * Type definitions for Devvit events and contexts
 */

// Event types
export interface PostSubmitEvent {
  postId: string;
  subreddit: {
    name: string;
    id: string;
  };
  author: {
    name: string;
    id: string;
  };
}

export interface CommentSubmitEvent {
  commentId: string;
  postId: string;
  subreddit: {
    name: string;
    id: string;
  };
  author: {
    name: string;
    id: string;
  };
}

export interface ModActionEvent {
  action: string;
  moderator: string;
  targetId: string;
  targetType: 'submission' | 'comment' | 'user';
  targetAuthor?: string;
  details?: string;
  subreddit: {
    name: string;
    id: string;
  };
}

export interface ReportEvent {
  postId?: string;
  commentId?: string;
  reason?: string;
  reportCount?: number;
  subreddit: {
    name: string;
    id: string;
  };
}

// Menu action event
export interface MenuActionEvent {
  location: string;
  targetId?: string;
  subredditName?: string;
}