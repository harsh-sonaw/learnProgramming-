import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const appDataValidator = v.object({
  profile: v.union(v.any(), v.null()),
  forumPosts: v.union(v.any(), v.null()),
  sandboxCode: v.union(v.any(), v.null()),
  sandboxLanguage: v.union(v.any(), v.null()),
});

export const load = query({
  args: {},
  returns: appDataValidator,
  handler: async ctx => {
    const records = await ctx.db.query('appData').collect();
    const values = Object.fromEntries(records.map(record => [record.key, record.value]));
    return {
      profile: values.profile ?? null,
      forumPosts: values.forumPosts ?? null,
      sandboxCode: values.sandboxCode ?? null,
      sandboxLanguage: values.sandboxLanguage ?? null,
    };
  },
});

export const initialize = mutation({
  args: {
    profile: v.any(),
    forumPosts: v.any(),
    sandboxCode: v.any(),
    sandboxLanguage: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, initialData) => {
    const existing = await ctx.db.query('appData').collect();
    const existingKeys = new Set(existing.map(record => record.key));
    const defaults = [
      ['profile', initialData.profile],
      ['forumPosts', initialData.forumPosts],
      ['sandboxCode', initialData.sandboxCode],
      ['sandboxLanguage', initialData.sandboxLanguage],
    ] as const;

    for (const [key, value] of defaults) {
      if (!existingKeys.has(key)) {
        await ctx.db.insert('appData', { key, value });
      }
    }

    return null;
  },
});

export const saveProfile = mutation({
  args: { value: v.any() },
  returns: v.null(),
  handler: async (ctx, { value }) => {
    const existing = await ctx.db
      .query('appData')
      .withIndex('by_key', q => q.eq('key', 'profile'))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert('appData', { key: 'profile', value });
    }

    return null;
  },
});

export const saveForumPosts = mutation({
  args: { value: v.any() },
  returns: v.null(),
  handler: async (ctx, { value }) => {
    const existing = await ctx.db
      .query('appData')
      .withIndex('by_key', q => q.eq('key', 'forumPosts'))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert('appData', { key: 'forumPosts', value });
    }

    return null;
  },
});

export const saveSandboxCode = mutation({
  args: { value: v.any() },
  returns: v.null(),
  handler: async (ctx, { value }) => {
    const existing = await ctx.db
      .query('appData')
      .withIndex('by_key', q => q.eq('key', 'sandboxCode'))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert('appData', { key: 'sandboxCode', value });
    }

    return null;
  },
});

export const saveSandboxLanguage = mutation({
  args: { value: v.any() },
  returns: v.null(),
  handler: async (ctx, { value }) => {
    const existing = await ctx.db
      .query('appData')
      .withIndex('by_key', q => q.eq('key', 'sandboxLanguage'))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert('appData', { key: 'sandboxLanguage', value });
    }

    return null;
  },
});
