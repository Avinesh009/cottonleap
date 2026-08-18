import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Loader2,
  X
} from "lucide-react";
import { blogStorage } from "../services/blogStorage";
import type { BlogFormData } from "../types/blog";

interface BlogPost {
  id?: string | number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorBio: string;
  authorImage: string;
  image: string;
  tags: string[];
  status: "published" | "draft" | "scheduled";
  date: string;
}

const BlogEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  
  const [post, setPost] = useState<BlogPost>({
    title: "",
    excerpt: "",
    content: "",
    category: "AI",
    author: "",
    authorBio: "",
    authorImage: "https://ui-avatars.com/api/?name=Author&background=2D8F6F&color=fff&size=100",
    image: "",
    tags: [],
    status: "draft",
    date: new Date().toISOString().split('T')[0],
  });

  // Load post data if editing
  useEffect(() => {
    if (id) {
      const loadPost = async () => {
        setLoading(true);
        try {
          const existingPost = await blogStorage.getPostById(id);
          if (existingPost) {
            setPost({
              id: existingPost.id,
              title: existingPost.title,
              excerpt: existingPost.excerpt || "",
              content: existingPost.content,
              category: existingPost.category,
              author: existingPost.author,
              authorBio: "",
              authorImage: "https://ui-avatars.com/api/?name=Author&background=2D8F6F&color=fff&size=100",
              image: existingPost.featuredImage || "",
              tags: existingPost.tags || [],
              status: existingPost.status,
              date: existingPost.publishedAt.split('T')[0],
            });
          }
        } catch (error) {
          console.error("Failed to load blog post for editing:", error);
        } finally {
          setLoading(false);
        }
      };
      loadPost();
    }
  }, [id]);

  const categories = ["AI", "Sustainability", "IoT", "Manufacturing", "Industry 4.0"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setPost({
      ...post,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost({
        ...post,
        tags: [...post.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setPost({
      ...post,
      tags: post.tags.filter(t => t !== tag),
    });
  };

  const handleSave = async (status: "published" | "draft" | "scheduled") => {
    setSaving(true);
    
    const formData: BlogFormData = {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.image,
      author: post.author,
      category: post.category,
      tags: post.tags.join(', '),
      status: status,
    };

    try {
      if (id) {
        await blogStorage.updatePost(id, formData);
      } else {
        await blogStorage.createPost(formData);
      }
      setSaving(false);
      // Navigate back to admin dashboard
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Failed to save blog post:", error);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage grid-bg-sage">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-serif font-medium text-foreground">
              {id ? "Edit Post" : "Create New Post"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 border border-border rounded-lg text-sm font-mono uppercase tracking-widest text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <Eye className="w-4 h-4 inline mr-2" />
              {previewMode ? "Edit" : "Preview"}
            </button>
            <button
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="px-4 py-2 border border-border rounded-lg text-sm font-mono uppercase tracking-widest text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave("published")}
              disabled={saving}
              className="px-4 py-2 bg-forest text-forest-foreground text-sm font-mono uppercase tracking-widest font-semibold hover:bg-forest/90 transition-colors rounded-lg flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Publish
            </button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <div className="max-w-6xl mx-auto p-6">
        {!previewMode ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={post.title}
                  onChange={handleChange}
                  placeholder="Enter post title..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground text-xl font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Excerpt
                </label>
                <textarea
                  name="excerpt"
                  value={post.excerpt}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Brief summary of the post..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Content
                </label>
                <textarea
                  name="content"
                  value={post.content}
                  onChange={handleChange}
                  rows={15}
                  placeholder="Write your post content here... (supports HTML)"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground font-mono text-sm resize-none"
                />
              </div>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-6">
              <div className="glass p-6 rounded-xl">
                <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
                  Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={post.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground text-sm"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={post.author}
                      onChange={handleChange}
                      placeholder="Author name"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                      Author Bio
                    </label>
                    <input
                      type="text"
                      name="authorBio"
                      value={post.authorBio}
                      onChange={handleChange}
                      placeholder="Author biography"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                      Featured Image URL
                    </label>
                    <input
                      type="text"
                      name="image"
                      value={post.image}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground text-sm"
                    />
                    {post.image && (
                      <img 
                        src={post.image} 
                        alt="Preview" 
                        className="mt-2 w-full h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                      Publication Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={post.date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                      Tags
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        placeholder="Add tag..."
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground text-sm"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-3 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 rounded-full text-xs"
                        >
                          #{tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-xl">
                <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
                  Status
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={post.status === "draft"}
                      onChange={handleChange}
                      className="text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-foreground">Draft</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={post.status === "published"}
                      onChange={handleChange}
                      className="text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-foreground">Published</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="status"
                      value="scheduled"
                      checked={post.status === "scheduled"}
                      onChange={handleChange}
                      className="text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-foreground">Scheduled</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Preview Mode
          <div className="max-w-3xl mx-auto">
            <div className="bg-background/50 rounded-xl p-8">
              {post.image && (
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-80 object-cover rounded-xl mb-8"
                />
              )}
              <h1 className="text-4xl font-serif font-medium text-foreground mb-4">
                {post.title || "Untitled Post"}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span>{post.author || "Author"}</span>
                <span>•</span>
                <span>{post.date || "Date"}</span>
                <span>•</span>
                <span className="px-2 py-1 bg-accent/10 rounded-full text-xs">
                  {post.category}
                </span>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                {post.excerpt}
              </p>
              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: post.content || "No content yet..." }} />
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-accent/10 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogEditorPage;