export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  postCount?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  coverImageAlt?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  authorName?: string | null;
  status: 'draft' | 'published';
  featured: boolean;
  views: number;
  readingTime?: number | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  tags?: Tag[];
}

export interface AdminStats {
  totalPosts: number;
  publishedPosts: number;
  drafts: number;
  categories: number;
  totalViews: number;
}

export interface AdminUser {
  email: string;
  role: string;
  name: string;
  uid?: string;
}
