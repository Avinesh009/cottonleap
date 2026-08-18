import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import { useState, useEffect } from "react";
import { blogStorage } from "../services/blogStorage";

interface BlogPost {
  id: string | number;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
  image: string;
  tags: string[];
}

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "AI", "Sustainability", "IoT", "Manufacturing", "Industry 4.0"];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const published = await blogStorage.getPublishedPosts();
        const mapped = published.map(post => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || '',
          date: new Date(post.publishedAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
          readTime: '6 min read',
          category: post.category || 'Uncategorized',
          author: post.author,
          image: post.featuredImage || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
          tags: post.tags || [],
        }));
        setPosts(mapped);
      } catch (error) {
        console.error("Failed to load blog posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = activeCategory === "All" 
    ? posts 
    : posts.filter(post => post.category === activeCategory);

  const featuredPost = posts[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-sage flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="min-h-screen py-32 bg-sage grid-bg-sage relative">
        <div className="container max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-4">
            {"// blog.cottonleap"}
          </p>
          <h2 className="text-3xl font-serif font-medium text-foreground mb-4">No articles published yet</h2>
          <p className="text-muted-foreground mb-8">Please check back later or add new articles in the admin panel.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-32 bg-sage grid-bg-sage relative">
      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-4">
            {"// blog.cottonleap"}
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-foreground mb-4">
            Insights from the
            <br />
            <span className="text-accent">Smart Factory</span>
          </h2>
          <p className="text-base font-sans text-muted-foreground max-w-xl mx-auto">
            Stories, insights, and innovations from the forefront of intelligent textile manufacturing.
          </p>
        </div>

        {/* Featured Post */}
        <Link to={`/blog/${featuredPost.id}`} className="block card-elevated overflow-hidden mb-12 hover:border-accent/30 transition-all duration-300 group">
          <div className="grid md:grid-cols-2">
            <div className="h-64 md:h-auto bg-forest/20 relative overflow-hidden">
              <img 
                src={featuredPost.image} 
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="text-[10px] font-mono uppercase tracking-widest bg-accent text-accent-foreground px-3 py-1 rounded">
                  Featured
                </span>
              </div>
            </div>
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="font-mono uppercase tracking-widest">{featuredPost.category}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {featuredPost.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {featuredPost.readTime}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-medium text-foreground mb-3 group-hover:text-accent transition-colors">
                {featuredPost.title}
              </h3>
              <p className="text-sm font-sans text-muted-foreground mb-4">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {featuredPost.author}
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent group-hover:text-accent/80 transition-colors">
                  Read More
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${
                activeCategory === category
                  ? "bg-forest text-forest-foreground"
                  : "bg-background/50 text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Link 
              key={post.id} 
              to={`/blog/${post.id}`}
              className="glass rounded-xl overflow-hidden hover:border-accent/20 transition-all duration-300 group"
            >
              <div className="h-48 bg-forest/20 relative overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[9px] font-mono uppercase tracking-widest bg-background/80 backdrop-blur-sm text-foreground px-2 py-1 rounded">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>
                <h4 className="text-lg font-serif font-medium text-foreground mb-2 group-hover:text-accent transition-colors">
                  {post.title}
                </h4>
                <p className="text-sm font-sans text-muted-foreground mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author}
                  </span>
                  <span className="text-xs font-mono text-accent group-hover:text-accent/80 transition-colors">
                    Read →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 card-elevated p-8 md:p-12 text-center">
          <h3 className="text-2xl font-serif font-medium text-foreground mb-3">
            Stay Updated
          </h3>
          <p className="text-sm font-sans text-muted-foreground max-w-md mx-auto mb-6">
            Subscribe to our newsletter for the latest insights on AI manufacturing and sustainability.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground"
            />
            <button className="px-6 py-3 bg-forest text-forest-foreground text-xs font-mono uppercase tracking-widest font-semibold hover:bg-forest/90 transition-all rounded-lg">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogPage;