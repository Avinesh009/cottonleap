export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  category?: string; // Add optional category
  tags: string[];
  status: 'draft' | 'published' | 'scheduled'; // Add 'scheduled'
  publishedAt: string;
  updatedAt: string;
  likes?: number;
  views?: number;
  comments?: number;
}

export interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  category?: string;
  tags: string;
  status: 'draft' | 'published' | 'scheduled';
}