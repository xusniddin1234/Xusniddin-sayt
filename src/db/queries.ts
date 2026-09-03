import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { categories, posts, postTags, tags } from './schema.ts';

export async function getPosts({
  categorySlug,
  tagSlug,
  search,
  status = 'published',
  limit = 20,
  offset = 0,
}: {
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
  status?: 'published' | 'draft' | 'all';
  limit?: number;
  offset?: number;
}) {
  try {
    const conditions = [];

    if (status !== 'all') {
      conditions.push(eq(posts.status, status));
    }

    if (categorySlug) {
      const cat = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
      if (cat.length > 0) {
        conditions.push(eq(posts.categoryId, cat[0].id));
      } else {
        return [];
      }
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(posts.title, q),
          ilike(posts.excerpt, q),
          ilike(posts.content, q)
        )
      );
    }

    let query = db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        coverImage: posts.coverImage,
        coverImageAlt: posts.coverImageAlt,
        categoryId: posts.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        authorName: posts.authorName,
        status: posts.status,
        featured: posts.featured,
        views: posts.views,
        readingTime: posts.readingTime,
        publishedAt: posts.publishedAt,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }

    const result = await query;

    // Fetch tags for these posts
    if (result.length > 0) {
      const postIds = result.map((p) => p.id);
      const postTagRecords = await db
        .select({
          postId: postTags.postId,
          tagId: tags.id,
          tagName: tags.name,
          tagSlug: tags.slug,
        })
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(sql`${postTags.postId} IN ${postIds}`);

      const tagsByPost = new Map<number, Array<{ id: number; name: string; slug: string }>>();
      for (const pt of postTagRecords) {
        if (!tagsByPost.has(pt.postId)) tagsByPost.set(pt.postId, []);
        tagsByPost.get(pt.postId)!.push({ id: pt.tagId, name: pt.tagName, slug: pt.tagSlug });
      }

      const postsWithTags = result.map((p) => ({
        ...p,
        tags: tagsByPost.get(p.id) || [],
      }));

      if (tagSlug) {
        return postsWithTags.filter((p) => p.tags.some((t) => t.slug === tagSlug));
      }

      return postsWithTags;
    }

    return [];
  } catch (error) {
    console.error('getPosts query failed:', error);
    throw new Error('Maqolalarni yuklashda xatolik yuz berdi.', { cause: error });
  }
}

export async function getPostBySlug(slug: string, incrementViews = false) {
  try {
    const postRes = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        content: posts.content,
        coverImage: posts.coverImage,
        coverImageAlt: posts.coverImageAlt,
        categoryId: posts.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        authorName: posts.authorName,
        status: posts.status,
        featured: posts.featured,
        views: posts.views,
        readingTime: posts.readingTime,
        publishedAt: posts.publishedAt,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(eq(posts.slug, slug))
      .limit(1);

    if (postRes.length === 0) return null;
    const post = postRes[0];

    if (incrementViews) {
      await db
        .update(posts)
        .set({ views: sql`${posts.views} + 1` })
        .where(eq(posts.id, post.id));
      post.views += 1;
    }

    // Get tags
    const tagRecords = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, post.id));

    return {
      ...post,
      tags: tagRecords,
    };
  } catch (error) {
    console.error('getPostBySlug query failed:', error);
    throw new Error('Maqolani yuklashda xatolik yuz berdi.', { cause: error });
  }
}

export async function getRelatedPosts(categoryId: number | null, excludeSlug: string, limit = 3) {
  try {
    if (!categoryId) return [];
    return await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        coverImage: posts.coverImage,
        views: posts.views,
        readingTime: posts.readingTime,
        publishedAt: posts.publishedAt,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(and(eq(posts.categoryId, categoryId), eq(posts.status, 'published'), sql`${posts.slug} != ${excludeSlug}`))
      .orderBy(desc(posts.publishedAt))
      .limit(limit);
  } catch (error) {
    console.error('getRelatedPosts query failed:', error);
    return [];
  }
}

export async function getCategories() {
  try {
    const list = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        postCount: sql<number>`count(${posts.id})::int`,
      })
      .from(categories)
      .leftJoin(posts, and(eq(posts.categoryId, categories.id), eq(posts.status, 'published')))
      .groupBy(categories.id)
      .orderBy(categories.name);
    return list;
  } catch (error) {
    console.error('getCategories query failed:', error);
    throw new Error('Kategoriyalarni yuklashda xatolik yuz berdi.', { cause: error });
  }
}

export async function getTags() {
  try {
    return await db.select().from(tags).orderBy(tags.name);
  } catch (error) {
    console.error('getTags query failed:', error);
    return [];
  }
}

export async function getAdminStats() {
  try {
    const totalPostsRes = await db.select({ count: sql<number>`count(*)::int` }).from(posts);
    const publishedRes = await db.select({ count: sql<number>`count(*)::int` }).from(posts).where(eq(posts.status, 'published'));
    const draftsRes = await db.select({ count: sql<number>`count(*)::int` }).from(posts).where(eq(posts.status, 'draft'));
    const totalCategoriesRes = await db.select({ count: sql<number>`count(*)::int` }).from(categories);
    const totalViewsRes = await db.select({ total: sql<number>`coalesce(sum(${posts.views}), 0)::int` }).from(posts);

    return {
      totalPosts: totalPostsRes[0]?.count || 0,
      publishedPosts: publishedRes[0]?.count || 0,
      drafts: draftsRes[0]?.count || 0,
      categories: totalCategoriesRes[0]?.count || 0,
      totalViews: totalViewsRes[0]?.total || 0,
    };
  } catch (error) {
    console.error('getAdminStats query failed:', error);
    throw new Error('Statistikani olishda xatolik yuz berdi.', { cause: error });
  }
}

export async function createPost(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  coverImageAlt?: string;
  categoryId?: number;
  authorName?: string;
  status: 'draft' | 'published';
  featured?: boolean;
  readingTime?: number;
  tagNames?: string[];
}) {
  try {
    const inserted = await db
      .insert(posts)
      .values({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        coverImageAlt: data.coverImageAlt,
        categoryId: data.categoryId,
        authorName: data.authorName || 'Admin',
        status: data.status,
        featured: data.featured || false,
        readingTime: data.readingTime || Math.max(1, Math.ceil((data.content || '').split(/\s+/).length / 200)),
        publishedAt: data.status === 'published' ? new Date() : null,
      })
      .returning();

    const newPost = inserted[0];

    // Handle tags
    if (data.tagNames && data.tagNames.length > 0) {
      for (const rawTag of data.tagNames) {
        const cleanTag = rawTag.trim().replace(/^#/, '');
        if (!cleanTag) continue;
        const tagSlug = cleanTag.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Upsert tag
        const tagRes = await db
          .insert(tags)
          .values({ name: cleanTag, slug: tagSlug })
          .onConflictDoUpdate({ target: tags.slug, set: { name: cleanTag } })
          .returning();

        if (tagRes[0]) {
          await db
            .insert(postTags)
            .values({ postId: newPost.id, tagId: tagRes[0].id })
            .onConflictDoNothing();
        }
      }
    }

    return newPost;
  } catch (error) {
    console.error('createPost query failed:', error);
    throw new Error('Post yaratishda xatolik yuz berdi.', { cause: error });
  }
}

export async function updatePost(
  id: number,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    coverImageAlt?: string;
    categoryId?: number;
    status?: 'draft' | 'published';
    featured?: boolean;
    readingTime?: number;
    tagNames?: string[];
  }
) {
  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) {
      updateData.content = data.content;
      updateData.readingTime = Math.max(1, Math.ceil(data.content.split(/\s+/).length / 200));
    }
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.coverImageAlt !== undefined) updateData.coverImageAlt = data.coverImageAlt;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'published') {
        updateData.publishedAt = new Date();
      }
    }
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.readingTime !== undefined) updateData.readingTime = data.readingTime;

    const updated = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();

    // Sync tags if provided
    if (data.tagNames !== undefined) {
      await db.delete(postTags).where(eq(postTags.postId, id));
      for (const rawTag of data.tagNames) {
        const cleanTag = rawTag.trim().replace(/^#/, '');
        if (!cleanTag) continue;
        const tagSlug = cleanTag.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        const tagRes = await db
          .insert(tags)
          .values({ name: cleanTag, slug: tagSlug })
          .onConflictDoUpdate({ target: tags.slug, set: { name: cleanTag } })
          .returning();

        if (tagRes[0]) {
          await db
            .insert(postTags)
            .values({ postId: id, tagId: tagRes[0].id })
            .onConflictDoNothing();
        }
      }
    }

    return updated[0];
  } catch (error) {
    console.error('updatePost query failed:', error);
    throw new Error('Postni yangilashda xatolik yuz berdi.', { cause: error });
  }
}

export async function deletePost(id: number) {
  try {
    await db.delete(posts).where(eq(posts.id, id));
    return { success: true };
  } catch (error) {
    console.error('deletePost query failed:', error);
    throw new Error('Postni o‘chirishda xatolik yuz berdi.', { cause: error });
  }
}

export async function createCategory(name: string, slug: string, description?: string) {
  try {
    const res = await db.insert(categories).values({ name, slug, description }).returning();
    return res[0];
  } catch (error) {
    console.error('createCategory query failed:', error);
    throw new Error('Kategoriya yaratishda xatolik yuz berdi.', { cause: error });
  }
}

export async function deleteCategory(id: number) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    return { success: true };
  } catch (error) {
    console.error('deleteCategory query failed:', error);
    throw new Error('Kategoriyani o‘chirishda xatolik yuz berdi.', { cause: error });
  }
}
