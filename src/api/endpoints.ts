/** Every backend route in one place. Paths are relative to VITE_API_BASE_URL. */
export const ENDPOINTS = {
  currentUser: '/users/me',
  sandbox: '/users/me/sandbox',
  forumPosts: '/forum/posts',
} as const;
