// src/services/blogStorage.ts
import { supabase } from '../lib/supabaseClient';
import type { BlogPost, BlogFormData } from '../types/blog';

// Map database row to frontend BlogPost interface
const mapRowToPost = (row: any): BlogPost => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  excerpt: row.excerpt,
  content: row.content,
  featuredImage: row.featured_image || '',
  author: row.author,
  category: row.category || 'Uncategorized',
  tags: row.tags || [],
  status: row.status,
  publishedAt: row.published_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
  likes: row.likes || 0,
  views: row.views || 0,
  comments: row.comments || 0,
});

export const blogStorage = {
  getAllPosts: async (): Promise<BlogPost[]> => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapRowToPost);
    } catch (error) {
      console.error('Failed to get all blog posts from Supabase, returning empty array:', error);
      return [];
    }
  },

  getPublishedPosts: async (): Promise<BlogPost[]> => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapRowToPost);
    } catch (error) {
      console.error('Failed to get published blog posts from Supabase:', error);
      return [];
    }
  },

  getAdminPosts: async (): Promise<BlogPost[]> => {
    return blogStorage.getAllPosts();
  },

  getPostBySlug: async (slug: string): Promise<BlogPost | null> => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data ? mapRowToPost(data) : null;
    } catch (error) {
      console.error(`Failed to get blog post by slug (${slug}) from Supabase:`, error);
      return null;
    }
  },

  getPostById: async (id: string): Promise<BlogPost | null> => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? mapRowToPost(data) : null;
    } catch (error) {
      console.error(`Failed to get blog post by ID (${id}) from Supabase:`, error);
      return null;
    }
  },

  createPost: async (data: BlogFormData): Promise<BlogPost> => {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const tagsArray = data.tags
      ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    const newPostId = `post_${Date.now()}`;
    const insertData = {
      id: newPostId,
      slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      featured_image: data.featuredImage,
      author: data.author,
      category: data.category || 'Uncategorized',
      tags: tagsArray,
      status: data.status,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes: 0,
      views: 0,
      comments: 0
    };

    try {
      const { data: insertedRow, error } = await supabase
        .from('blog_posts')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return mapRowToPost(insertedRow);
    } catch (error) {
      console.error('Failed to create blog post in Supabase:', error);
      throw error;
    }
  },

  updatePost: async (id: string, data: BlogFormData & { likes?: number }): Promise<BlogPost> => {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const tagsArray = data.tags
      ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    const updateData: any = {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      featured_image: data.featuredImage,
      author: data.author,
      category: data.category || 'Uncategorized',
      tags: tagsArray,
      status: data.status,
      updated_at: new Date().toISOString()
    };

    if (data.likes !== undefined) {
      updateData.likes = data.likes;
    }

    try {
      const { data: updatedRow, error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapRowToPost(updatedRow);
    } catch (error) {
      console.error(`Failed to update blog post (${id}) in Supabase:`, error);
      throw error;
    }
  },

  deletePost: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Failed to delete blog post (${id}) from Supabase:`, error);
      throw error;
    }
  },
};