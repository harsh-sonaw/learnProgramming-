import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  appData: defineTable({
    key: v.union(
      v.literal('profile'),
      v.literal('forumPosts'),
      v.literal('sandboxCode'),
      v.literal('sandboxLanguage')
    ),
    value: v.any(),
  }).index('by_key', ['key']),
});
