import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, User, ArrowLeft, Share2, Bookmark, MessageCircle, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { blogStorage } from "../services/blogStorage";

interface BlogPost {
  id: string | number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
  authorBio: string;
  authorImage: string;
  image: string;
  tags: string[];
  comments: number;
  likes: number;
}

const BlogViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setLoading(true);
      try {
        let data = await blogStorage.getPostById(id);
        if (!data) {
          data = await blogStorage.getPostBySlug(id);
        }

        if (data) {
          setPost({
            id: data.id,
            title: data.title,
            excerpt: data.excerpt || "",
            content: data.content,
            date: new Date(data.publishedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            }),
            readTime: '6 min read',
            category: data.category || 'Uncategorized',
            author: data.author,
            authorBio: 'Author at Cottonleap',
            authorImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.author)}&background=2D8F6F&color=fff&size=100`,
            image: data.featuredImage || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
            tags: data.tags || [],
            comments: data.comments || 0,
            likes: data.likes || 0
          });
          setLikesCount(data.likes || 0);

          // Fetch related posts
          const allPublished = await blogStorage.getPublishedPosts();
          const related = allPublished
            .filter(p => p.id !== data.id && p.slug !== data.slug)
            .slice(0, 2)
            .map(p => ({
              id: p.id,
              title: p.title,
              category: p.category
            }));
          setRelatedPosts(related);
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error("Failed to load blog post from Supabase:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sage flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <section className="min-h-screen py-32 bg-sage grid-bg-sage relative">
        <div className="container max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif font-medium text-foreground mb-4">Post Not Found</h2>
          <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </section>
    );
  }

  const handleLike = async () => {
    setLiked(!liked);
    const newLikesCount = liked ? likesCount - 1 : likesCount + 1;
    setLikesCount(newLikesCount);

    try {
      // Opt-in: save updated like count to Supabase
      await blogStorage.updatePost(String(post.id), {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.image,
        author: post.author,
        category: post.category,
        tags: post.tags.join(', '),
        status: 'published', // assuming it's published since it's viewed
        likes: newLikesCount
      });
    } catch (e) {
      console.error('Failed to update likes count in Supabase:', e);
    }
  };

  return (
    <section className="min-h-screen py-32 bg-sage grid-bg-sage relative">
      <div className="container max-w-4xl mx-auto px-6 relative z-10">
        {/* Back Button */}
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Hero Image */}
        <div className="rounded-2xl overflow-hidden mb-8 bg-forest/10">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-[400px] object-cover"
          />
        </div>

        {/* Post Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
            <span className="font-mono uppercase tracking-widest text-accent">{post.category}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-foreground mb-4">
            {post.title}
          </h1>
          <p className="text-lg font-sans text-muted-foreground">
            {post.excerpt}
          </p>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-4 p-6 bg-background/50 rounded-xl mb-8">
          <img 
            src={post.authorImage} 
            alt={post.author}
            className="w-14 h-14 rounded-full"
          />
          <div>
            <p className="text-sm font-medium text-foreground">{post.author}</p>
            <p className="text-xs font-sans text-muted-foreground">{post.authorBio}</p>
          </div>
        </div>

        {/* Post Content */}
        <div 
          className="prose prose-lg prose-sage max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-background/50 rounded-full text-xs font-mono text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>

        {/* Engagement Bar */}
        <div className="flex items-center gap-6 py-6 border-t border-b border-border mb-12">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm transition-colors ${
              liked ? "text-accent" : "text-muted-foreground hover:text-accent"
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-accent" : ""}`} />
            <span>{likesCount}</span>
          </button>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments} Comments</span>
          </button>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors ml-auto">
            <Bookmark className="w-5 h-5" />
            Save
          </button>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors">
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>

        {/* Comments Section */}
        <div className="mb-12">
          <h3 className="text-xl font-serif font-medium text-foreground mb-6">
            Comments ({post.comments})
          </h3>
          
          {/* Comment Form */}
          <div className="glass p-6 rounded-xl mb-6">
            <h4 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
              Leave a Comment
            </h4>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground"
                />
              </div>
              <textarea
                placeholder="Write your comment..."
                rows={4}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground resize-none"
              />
              <button className="px-6 py-3 bg-forest text-forest-foreground text-xs font-mono uppercase tracking-widest font-semibold hover:bg-forest/90 transition-all rounded-lg">
                Post Comment
              </button>
            </div>
          </div>

          {/* Sample Comments */}
          <div className="space-y-4">
            {[1, 2].map((_, index) => (
              <div key={index} className="flex gap-4 p-4 bg-background/50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-foreground">User {index + 1}</span>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                  </div>
                  <p className="text-sm font-sans text-muted-foreground">
                    Great article! Really insightful information about AI in textile manufacturing.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Posts */}
        <div>
          <h3 className="text-xl font-serif font-medium text-foreground mb-6">
            Related Posts
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {relatedPosts.map((related) => (
              <Link 
                key={related.id}
                to={`/blog/${related.id}`}
                className="glass p-4 rounded-xl hover:border-accent/20 transition-all group"
              >
                <span className="text-[10px] font-mono uppercase tracking-widest text-accent">{related.category}</span>
                <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors mt-1">
                  {related.title}
                </p>
                <span className="text-xs text-muted-foreground mt-2 inline-block">Read More →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogViewPage;