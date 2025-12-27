import { TriggerContext } from '@devvit/public-api';

/**
 * Check if a post is visible in the subreddit's recent posts
 * This helps prevent duplicate notifications for posts filtered by AutoModerator
 * 
 * Uses getNewPosts() to get chronologically recent posts.
 * Posts filtered by AutoMod typically won't appear in this listing.
 */
export async function isPostVisibleOnFrontPage(
  postId: string,
  context: TriggerContext,
  limit: number = 25
): Promise<boolean> {
  try {
    // Get the current subreddit
    const subreddit = await context.reddit.getCurrentSubreddit();
    
    // Fetch the most recent posts from the subreddit using the Reddit API client
    // Use getNewPosts to get chronologically recent posts (perfect for our use case!)
    const posts = await context.reddit.getNewPosts({ 
      subredditName: subreddit.name,
      limit
    }).all();
    
    // Extract post IDs for comparison (normalize both to handle t3_ prefix)
    const visiblePostIds = new Set(posts.map(post => post.id));
    
    // Check if our post ID is in the visible posts
    // Both should have the same format (with t3_ prefix from the API)
    const isVisible = visiblePostIds.has(postId as any);
    
    // console.log(`[Visibility Check] Post ${postId} is ${isVisible ? 'VISIBLE' : 'NOT VISIBLE'} in recent new posts`);
    // console.log(`[Visibility Check] Checked against ${visiblePostIds.size} recent new posts`);
    
    return isVisible;
  } catch (error) {
    console.error(`[Visibility Check] Error checking post visibility for ${postId}:`, error);
    // If we can't check visibility (API error, permissions, etc.), 
    // default to true to avoid missing legitimate posts
    return true;
  }
}

/**
 * Check if a post should be notified based on visibility settings
 * Returns true if the post should trigger a notification
 */
export async function shouldNotifyPost(
  postId: string,
  settings: any,
  context: TriggerContext
): Promise<boolean> {
  const onlyNotifyVisible = settings.onlyNotifyVisibleNewPosts as boolean;
  
  // If the setting is disabled, always notify
  if (!onlyNotifyVisible) {
    // console.log(`[Post Notification] Visibility check disabled, notifying for post ${postId}`);
    return true;
  }
  
  // Wait a few seconds for Reddit's API to fully index the new post
//   console.log(`[Post Notification] Waiting 10 seconds for Reddit API to index new post ${postId}...`);
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Check if post is visible on front page
  const isVisible = await isPostVisibleOnFrontPage(postId, context);
  
  if (!isVisible) {
    // console.log(`[Post Notification] Post ${postId} not visible in recent new posts, skipping notification (likely filtered)`);
    return false;
  }
  
//   console.log(`[Post Notification] Post ${postId} is visible in recent new posts, proceeding with notification`);
  return true;
}

/**
 * Check if a comment is visible in its parent post's comments
 * This helps prevent duplicate notifications for comments filtered by AutoModerator
 * 
 * Uses getComments() to get recent comments from the parent post.
 * Comments filtered by AutoMod typically won't appear in this listing.
 * 
 * Example usage:
 * - Comment gets posted → CommentSubmit event fires
 * - Check parent post's recent comments via reddit.getComments()
 * - If comment ID found → Comment is visible, send notification
 * - If comment ID not found → Comment was filtered, skip notification
 */
export async function isCommentVisibleInPost(
  commentId: string,
  postId: string,
  context: TriggerContext,
  limit: number = 50
): Promise<boolean> {
  try {
    // Fetch recent comments from the parent post
    const comments = await context.reddit.getComments({ 
      postId,
      limit,
      sort: 'new' // Get chronologically recent comments
    }).all();
    
    // Extract comment IDs for comparison
    const visibleCommentIds = new Set(comments.map(comment => comment.id));
    
    // Check if our comment ID is in the visible comments
    const isVisible = visibleCommentIds.has(commentId as any);
    
    // console.log(`[Comment Visibility Check] Comment ${commentId} is ${isVisible ? 'VISIBLE' : 'NOT VISIBLE'} in post ${postId}`);
    // console.log(`[Comment Visibility Check] Checked against ${visibleCommentIds.size} comments from post`);
    
    return isVisible;
  } catch (error) {
    console.error(`[Comment Visibility Check] Error checking comment visibility for ${commentId} in post ${postId}:`, error);
    // If we can't check visibility (API error, permissions, etc.), 
    // default to true to avoid missing legitimate comments
    return true;
  }
}

/**
 * Check if a comment should be notified based on visibility settings
 * Returns true if the comment should trigger a notification
 */
export async function shouldNotifyComment(
  commentId: string,
  postId: string,
  settings: any,
  context: TriggerContext
): Promise<boolean> {
  const onlyNotifyVisible = settings.onlyNotifyVisibleNewComments as boolean;
  
  // If the setting is disabled, always notify
  if (!onlyNotifyVisible) {
    // console.log(`[Comment Notification] Visibility check disabled, notifying for comment ${commentId}`);
    return true;
  }
  
  // Wait a few seconds for Reddit's API to fully index the new comment
//   console.log(`[Comment Notification] Waiting 3 seconds for Reddit API to index new comment ${commentId}...`);
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Check if comment is visible in parent post
  const isVisible = await isCommentVisibleInPost(commentId, postId, context);
  
  if (!isVisible) {
    // console.log(`[Comment Notification] Comment ${commentId} not visible in post ${postId}, skipping notification (likely filtered)`);
    return false;
  }
  
//   console.log(`[Comment Notification] Comment ${commentId} is visible in post ${postId}, proceeding with notification`);
  return true;
}