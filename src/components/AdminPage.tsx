// src/components/AdminPage.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, Edit, Trash2, Eye, Search, Calendar, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle, Clock, FileText, LayoutDashboard, Settings,
  Users, BookOpen, Menu, X, LogOut, User, UserPlus, Mail, Lock, Building,
  Shield, RefreshCw, Crown
} from "lucide-react";
import { blogStorage } from "../services/blogStorage";
import type { BlogPost } from "../types/blog";
import ExcelDataService from "../services/ExcelDataService";
import type { User as AppUser, Order } from "../services/ExcelDataService";
import AdminProductionView from "./AdminProductionView";

const AdminPage = () => {
  const navigate = useNavigate();
  const dataService = ExcelDataService.getInstance();
  
  // User role state
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isProductionManager, setIsProductionManager] = useState(false);
  
  // Blog states
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  
  // Tab state - restrict based on role
  const [activeTab, setActiveTab] = useState<"blog" | "production" | "users" | "settings">("production");
  
  // User management states
  const [users, setUsers] = useState<AppUser[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [availableOrders, setAvailableOrders] = useState<string[]>([]);
  const [userFormData, setUserFormData] = useState<{
    id: string;
    name: string;
    email: string;
    password: string;
    company: string;
    role: "client" | "vendor" | "production_manager" | "quality_control" | "super_admin";
    orders: string[];
  }>({
    id: "",
    name: "",
    email: "",
    password: "",
    company: "",
    role: "client",
    orders: [],
  });
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");
  
  // Order creation states
  const [showAddOrderForm, setShowAddOrderForm] = useState(false);
  const [newOrderFormData, setNewOrderFormData] = useState<{
    orderId: string;
    name: string;
    client: string;
    style: string;
    quantity: string;
    weeks: string[];
  }>({
    orderId: "",
    name: "",
    client: "",
    style: "",
    quantity: "",
    weeks: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"]
  });
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");
  
  // UI states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  const postsPerPage = 5;

  // Predefined production steps
  const PRODUCTION_STEPS = [
    { id: 1, label: "Yarns", icon: "Package" },
    { id: 2, label: "Knitting", icon: "Scissors" },
    { id: 3, label: "Heat Setting", icon: "Clock" },
    { id: 4, label: "Dyeing", icon: "Circle" },
    { id: 5, label: "Compacting", icon: "Circle" },
    { id: 6, label: "Printing", icon: "Circle" },
    { id: 7, label: "Curing/Finishing", icon: "Circle" },
    { id: 8, label: "Pattern Making", icon: "Circle" },
    { id: 9, label: "Sewing", icon: "Circle" },
    { id: 10, label: "Quality Inspection", icon: "Circle" },
    { id: 11, label: "Shipping", icon: "Circle" },
  ];

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated');
    const email = localStorage.getItem('admin_email');
    const userId = localStorage.getItem('admin_user_id');
    
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    
    if (email) {
      setAdminEmail(email);
    }
    
    if (userId) {
      setCurrentUserId(userId);
      checkUserRole(userId);
    }
    
    loadAllData();
  }, [navigate]);

  const checkUserRole = async (userId: string) => {
    try {
      const user = await dataService.getUserById(userId);
      if (user) {
        const role = user.role;
        setCurrentUserRole(role);
        setIsSuperAdmin(role === 'super_admin');
        setIsProductionManager(role === 'production_manager' || role === 'super_admin' || role === 'quality_control');
        
        // Set default tab based on role
        if (role === 'super_admin') {
          setActiveTab('blog');
        } else if (role === 'production_manager' || role === 'quality_control') {
          setActiveTab('production');
        }
      }
    } catch (error) {
      console.error('Failed to check user role:', error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPosts(),
        loadUsers()
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    const allPosts = await blogStorage.getAdminPosts();
    setPosts(allPosts);
  };

  const loadUsers = async () => {
    try {
      const userList = await dataService.getUsers();
      setUsers(userList as AppUser[]);
      
      const orders = await dataService.getAllOrders();
      setAvailableOrders(orders.map(o => o.orderId));
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  // User management functions - only for Super Admin
  const handleAddUser = () => {
    if (!isSuperAdmin) {
      setUserError("Only Super Admin can add users");
      setTimeout(() => setUserError(""), 3000);
      return;
    }
    setUserFormData({
      id: `user${Date.now()}`,
      name: "",
      email: "",
      password: "password123",
      company: "",
      role: "client",
      orders: [],
    });
    setEditingUserId(null);
    setShowAddUserForm(true);
    setUserError("");
    setUserSuccess("");
  };

  const handleEditUser = (user: AppUser) => {
    if (!isSuperAdmin) {
      setUserError("Only Super Admin can edit users");
      setTimeout(() => setUserError(""), 3000);
      return;
    }
    setUserFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "password123",
      company: user.company,
      role: user.role,
      orders: user.orders || [],
    });
    setEditingUserId(user.id);
    setShowAddUserForm(true);
    setUserError("");
    setUserSuccess("");
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isSuperAdmin) {
      setUserError("Only Super Admin can delete users");
      setTimeout(() => setUserError(""), 3000);
      return;
    }
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await dataService.deleteUser(userId);
      await loadUsers();
      setUserSuccess("User deleted successfully!");
      setTimeout(() => setUserSuccess(""), 3000);
    } catch (error) {
      setUserError("Failed to delete user");
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setUserError("Only Super Admin can manage users");
      setTimeout(() => setUserError(""), 3000);
      return;
    }
    setUserError("");
    setUserSuccess("");

    if (!userFormData.name || !userFormData.email || !userFormData.password) {
      setUserError("Name, email, and password are required.");
      return;
    }

    try {
      if (editingUserId) {
        await dataService.updateUser(userFormData);
        setUserSuccess("User updated successfully!");
      } else {
        await dataService.addUser(userFormData);
        setUserSuccess("User added successfully!");
      }
      await loadUsers();
      setShowAddUserForm(false);
      setEditingUserId(null);
      setTimeout(() => setUserSuccess(""), 3000);
    } catch (error) {
      setUserError(error instanceof Error ? error.message : "Failed to save user");
    }
  };

  const handleOrderToggle = (orderId: string) => {
    setUserFormData(prev => ({
      ...prev,
      orders: prev.orders.includes(orderId)
        ? prev.orders.filter(id => id !== orderId)
        : [...prev.orders, orderId]
    }));
  };

  // Order management functions - only for Super Admin
  const handleAddOrder = () => {
    if (!isSuperAdmin) {
      setOrderError("Only Super Admin can create orders");
      setTimeout(() => setOrderError(""), 3000);
      return;
    }
    setNewOrderFormData({
      orderId: `order-${Date.now()}`,
      name: "",
      client: "",
      style: "",
      quantity: "",
      weeks: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"]
    });
    setShowAddOrderForm(true);
    setOrderError("");
    setOrderSuccess("");
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setOrderError("Only Super Admin can create orders");
      setTimeout(() => setOrderError(""), 3000);
      return;
    }
    setOrderError("");
    setOrderSuccess("");

    if (!newOrderFormData.name || !newOrderFormData.client) {
      setOrderError("Order name and client are required.");
      return;
    }

    try {
      // Create new order with predefined production steps
      const steps = PRODUCTION_STEPS.map((step) => ({
        id: step.id,
        label: step.label,
        status: "pending" as const,
        week: "",
        date: "",
        icon: step.icon,
        detail: "",
        schedule: "",
        weekData: {}
      }));

      const newOrder: Order = {
        orderId: newOrderFormData.orderId,
        name: newOrderFormData.name,
        client: newOrderFormData.client,
        style: newOrderFormData.style || "Standard",
        quantity: newOrderFormData.quantity || "0 units",
        progress: 0,
        weeks: newOrderFormData.weeks,
        steps: steps
      };

      // Add the order to the service
      await dataService.addOrder(newOrder);
      
      // Refresh data
      await loadAllData();
      
      setOrderSuccess(`✅ Order "${newOrderFormData.name}" created successfully with all production steps!`);
      setShowAddOrderForm(false);
      
      // Refresh available orders
      const orders = await dataService.getAllOrders();
      setAvailableOrders(orders.map(o => o.orderId));
      
      setTimeout(() => setOrderSuccess(""), 3000);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Failed to create order");
    }
  };

  const handleAddWeek = () => {
    const weekNum = newOrderFormData.weeks.length + 1;
    setNewOrderFormData(prev => ({
      ...prev,
      weeks: [...prev.weeks, `Week ${weekNum}`]
    }));
  };

  const handleRemoveWeek = (index: number) => {
    setNewOrderFormData(prev => ({
      ...prev,
      weeks: prev.weeks.filter((_, i) => i !== index)
    }));
  };

  const handleWeekChange = (index: number, value: string) => {
    setNewOrderFormData(prev => ({
      ...prev,
      weeks: prev.weeks.map((w, i) => i === index ? value : w)
    }));
  };

  const roleOptions = [
    { value: "client", label: "Client" },
    { value: "vendor", label: "Vendor" },
    { value: "production_manager", label: "Production Manager" },
    { value: "quality_control", label: "Quality Control" },
    { value: "super_admin", label: "Super Admin" },
  ];

  // Blog functions
  const getStatusColor = (status: string) => {
    switch(status) {
      case "published": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "draft": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "scheduled": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "published": return <CheckCircle className="w-3 h-3" />;
      case "draft": return <Clock className="w-3 h-3" />;
      case "scheduled": return <Calendar className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const handleDelete = (id: string) => {
    if (!isSuperAdmin) {
      setUserError("Only Super Admin can delete posts");
      setTimeout(() => setUserError(""), 3000);
      return;
    }
    setPostToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (postToDelete) {
      await blogStorage.deletePost(postToDelete);
      await loadPosts();
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  };

  const handleSelectAll = () => {
    if (!isSuperAdmin) return;
    if (selectedPosts.length === currentPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(currentPosts.map(p => p.id));
    }
  };

  const handleSelectPost = (id: string) => {
    if (!isSuperAdmin) return;
    if (selectedPosts.includes(id)) {
      setSelectedPosts(selectedPosts.filter(p => p !== id));
    } else {
      setSelectedPosts([...selectedPosts, id]);
    }
  };

  const bulkDelete = async () => {
    if (!isSuperAdmin) return;
    if (selectedPosts.length > 0) {
      for (const id of selectedPosts) {
        await blogStorage.deletePost(id);
      }
      await loadPosts();
      setSelectedPosts([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_user_id');
    navigate('/admin/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const categories = ["all", ...new Set(posts.map(p => p.category || "Uncategorized"))];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "all" || post.status === filterStatus;
    const matchesCategory = filterCategory === "all" || (post.category && post.category === filterCategory);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.company.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === "published").length,
    drafts: posts.filter(p => p.status === "draft").length,
    scheduled: posts.filter(p => p.status === "scheduled").length,
  };

  const userStats = {
    total: users.length,
    clients: users.filter(u => u.role === 'client').length,
    vendors: users.filter(u => u.role === 'vendor').length,
    managers: users.filter(u => u.role === 'production_manager' || u.role === 'quality_control').length,
    superAdmins: users.filter(u => u.role === 'super_admin').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative flex">
      {/* Sidebar */}
      <aside 
        className={`fixed md:relative z-40 bg-background/95 backdrop-blur-xl border-r border-border transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-0 md:w-20"
        } ${isMobile ? "h-full" : "h-screen"} overflow-hidden`}
      >
        <div className="p-4">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && "justify-center"}`}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="font-mono text-sm font-bold text-foreground">Admin Panel</span>
                {isSuperAdmin && (
                  <span className="text-[10px] text-accent font-mono flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Super Admin
                  </span>
                )}
                {isProductionManager && !isSuperAdmin && (
                  <span className="text-[10px] text-green-500 font-mono">Production Manager</span>
                )}
              </div>
            )}
          </div>
          
          <nav className="mt-8 space-y-2">
            {/* Super Admin only - Blog Posts */}
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab("blog")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activeTab === "blog" 
                    ? "bg-accent/10 text-accent border border-accent/20" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                } ${!isSidebarOpen && "justify-center"}`}
              >
                <BookOpen className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm font-sans">Blog Posts</span>}
              </button>
            )}
            
            {/* Everyone with production access can see this */}
            {(isProductionManager || isSuperAdmin) && (
              <button
                onClick={() => setActiveTab("production")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activeTab === "production" 
                    ? "bg-accent/10 text-accent border border-accent/20" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                } ${!isSidebarOpen && "justify-center"}`}
              >
                <Calendar className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm font-sans">Production</span>}
              </button>
            )}
            
            {/* Super Admin only - User Management */}
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab("users")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activeTab === "users" 
                    ? "bg-accent/10 text-accent border border-accent/20" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                } ${!isSidebarOpen && "justify-center"}`}
              >
                <Users className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm font-sans">User Management</span>}
              </button>
            )}
            
            {/* Super Admin only - Settings */}
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activeTab === "settings" 
                    ? "bg-accent/10 text-accent border border-accent/20" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                } ${!isSidebarOpen && "justify-center"}`}
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm font-sans">Settings</span>}
              </button>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-lg font-serif font-medium text-foreground">
                  {activeTab === "blog" ? "Blog Management" : 
                   activeTab === "production" ? "Production Management" :
                   activeTab === "users" ? "User Management" : "Settings"}
                </h1>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 opacity-70" />
                  <p className="text-xs opacity-70">{adminEmail}</p>
                  {isSuperAdmin && (
                    <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Super Admin
                    </span>
                  )}
                  {isProductionManager && !isSuperAdmin && (
                    <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                      Production Manager
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === "blog" && isSuperAdmin && (
                <Link
                  to="/admin/blog/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-mono uppercase tracking-widest font-semibold hover:bg-primary/90 transition-all rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  New Post
                </Link>
              )}
              {activeTab === "users" && isSuperAdmin && (
                <button
                  onClick={handleAddUser}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-mono uppercase tracking-widest font-semibold hover:bg-primary/90 transition-all rounded-lg"
                >
                  <UserPlus className="w-4 h-4" />
                  Add User
                </button>
              )}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* BLOG TAB - Only for Super Admin */}
        {activeTab === "blog" && isSuperAdmin && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
              {[
                { label: "Total Posts", value: stats.total, icon: FileText, color: "text-accent" },
                { label: "Published", value: stats.published, icon: CheckCircle, color: "text-green-500" },
                { label: "Drafts", value: stats.drafts, icon: Clock, color: "text-yellow-500" },
                { label: "Scheduled", value: stats.scheduled, icon: Calendar, color: "text-blue-500" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-accent/10 ${stat.color}`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-2xl font-mono font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground text-sm"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(c => c !== "all").map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {selectedPosts.length > 0 && (
                  <button
                    onClick={bulkDelete}
                    className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-mono uppercase tracking-widest"
                  >
                    Delete Selected ({selectedPosts.length})
                  </button>
                )}
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="bg-card rounded-xl overflow-hidden border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedPosts.length === currentPosts.length && currentPosts.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-border bg-background text-accent focus:ring-accent"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground hidden md:table-cell">Author</th>
                        <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground hidden md:table-cell">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-widest text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPosts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                            No blog posts found.
                          </td>
                        </tr>
                      ) : (
                        currentPosts.map((post) => (
                          <tr key={post.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedPosts.includes(post.id)}
                                onChange={() => handleSelectPost(post.id)}
                                className="rounded border-border bg-background text-accent focus:ring-accent"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-foreground line-clamp-1">{post.title}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{post.author}</td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className="px-2 py-1 bg-accent/10 rounded-full text-xs">{post.category || "Uncategorized"}</span>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${getStatusColor(post.status)}`}>
                                {getStatusIcon(post.status)}
                                {post.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{formatDate(post.publishedAt)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <Link to={`/blog/${post.slug}`} target="_blank" className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-accent transition-colors">
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <Link to={`/admin/blog/edit/${post.id}`} className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-accent transition-colors">
                                  <Edit className="w-4 h-4" />
                                </Link>
                                <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-red-500 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredPosts.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Showing {indexOfFirstPost + 1} to {Math.min(indexOfLastPost, filteredPosts.length)} of {filteredPosts.length} posts
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-border hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-2 text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-border hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* PRODUCTION TAB - For both Super Admin and Production Manager */}
        {activeTab === "production" && (isProductionManager || isSuperAdmin) && (
          <AdminProductionView onLogout={handleLogout} />
        )}

        {/* USER MANAGEMENT TAB - Only for Super Admin */}
        {activeTab === "users" && isSuperAdmin && (
          <div className="p-6">
            {/* User Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Users", value: userStats.total, icon: Users, color: "text-accent" },
                { label: "Clients", value: userStats.clients, icon: User, color: "text-blue-500" },
                { label: "Vendors", value: userStats.vendors, icon: Building, color: "text-green-500" },
                { label: "Managers", value: userStats.managers + userStats.superAdmins, icon: Shield, color: "text-purple-500" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-accent/10 ${stat.color}`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-2xl font-mono font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* User Search & Actions */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground text-sm"
                />
              </div>
              <button
                onClick={loadUsers}
                className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-mono"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              {/* Create Order Button */}
              <button
                onClick={handleAddOrder}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm font-mono"
              >
                <Plus className="w-4 h-4" /> Create Order
              </button>
            </div>

            {/* Add Order Form */}
            {showAddOrderForm && (
              <div className="mb-6 p-6 bg-card border border-border rounded-xl">
                <h3 className="text-lg font-serif font-medium text-foreground mb-4">Create New Order</h3>
                {orderSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{orderSuccess}</div>
                )}
                {orderError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{orderError}</div>
                )}
                
                {/* Show predefined steps */}
                <div className="mb-4 p-4 bg-muted/20 rounded-lg border border-border">
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Production Steps (Auto-generated)</p>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCTION_STEPS.map((step) => (
                      <span key={step.id} className="px-2 py-1 bg-accent/10 text-xs rounded-full">
                        {step.label}
                      </span>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleCreateOrder} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Order Name *</label>
                      <input
                        type="text"
                        value={newOrderFormData.name}
                        onChange={(e) => setNewOrderFormData({ ...newOrderFormData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground"
                        placeholder="e.g., Cotton Robin"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Client *</label>
                      <input
                        type="text"
                        value={newOrderFormData.client}
                        onChange={(e) => setNewOrderFormData({ ...newOrderFormData, client: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground"
                        placeholder="e.g., Maison Élevée"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Style</label>
                      <input
                        type="text"
                        value={newOrderFormData.style}
                        onChange={(e) => setNewOrderFormData({ ...newOrderFormData, style: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground"
                        placeholder="e.g., Organic Cotton Collection"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Quantity</label>
                      <input
                        type="text"
                        value={newOrderFormData.quantity}
                        onChange={(e) => setNewOrderFormData({ ...newOrderFormData, quantity: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground"
                        placeholder="e.g., 2,400 units"
                      />
                    </div>
                  </div>

                  {/* Weeks Management */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Weeks</label>
                    <div className="space-y-2">
                      {newOrderFormData.weeks.map((week, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={week}
                            onChange={(e) => handleWeekChange(index, e.target.value)}
                            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground text-sm"
                            placeholder={`Week ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveWeek(index)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            disabled={newOrderFormData.weeks.length <= 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddWeek}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-mono text-accent hover:bg-accent/10 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Week
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-border">
                    <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-mono">
                      Create Order
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddOrderForm(false);
                        setOrderError("");
                        setOrderSuccess("");
                      }}
                      className="px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-mono"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add/Edit User Form */}
            {showAddUserForm && (
              <div className="mb-6 p-6 bg-card border border-border rounded-xl">
                <h3 className="text-lg font-serif font-medium text-foreground mb-4">
                  {editingUserId ? "Edit User" : "Add New User"}
                </h3>
                {userSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{userSuccess}</div>
                )}
                {userError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{userError}</div>
                )}
                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={userFormData.name}
                        onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email"
                          value={userFormData.email}
                          onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="password"
                          value={userFormData.password}
                          onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Company</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={userFormData.company}
                          onChange={(e) => setUserFormData({ ...userFormData, company: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Role</label>
                      <select
                        value={userFormData.role}
                        onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground"
                      >
                        {roleOptions.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Orders</label>
                      <div className="max-h-32 overflow-y-auto p-2 bg-muted/20 rounded-lg border border-border">
                        {availableOrders.length > 0 ? (
                          availableOrders.map(orderId => (
                            <label key={orderId} className="flex items-center gap-2 p-1 hover:bg-muted/30 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={userFormData.orders.includes(orderId)}
                                onChange={() => handleOrderToggle(orderId)}
                                className="rounded border-border"
                              />
                              <span className="text-sm font-sans text-foreground">{orderId}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No orders available. Create an order first.</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-mono">
                      {editingUserId ? "Update User" : "Add User"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddUserForm(false);
                        setEditingUserId(null);
                        setUserError("");
                        setUserSuccess("");
                      }}
                      className="px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-mono"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Users Table */}
            <div className="bg-card rounded-xl overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground">User</th>
                      <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground hidden md:table-cell">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Orders</th>
                      <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-widest text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No users found.</td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm font-sans text-foreground">{user.name}</span>
                              {user.role === 'super_admin' && (
                                <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Crown className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-sm font-sans text-muted-foreground">{user.email}</span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-sm font-sans text-muted-foreground">{user.company}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-mono px-2 py-1 rounded-full ${
                              user.role === 'super_admin' ? 'bg-accent/20 text-accent' :
                              user.role === 'production_manager' ? 'bg-primary/20 text-primary' :
                              user.role === 'quality_control' ? 'bg-accent/20 text-accent' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {user.role === 'super_admin' ? 'Super Admin' : user.role.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="text-sm font-sans text-muted-foreground">{user.orders?.length || 0} orders</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-accent transition-colors"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {user.id !== 'super_admin' && (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-red-500 transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB - Only for Super Admin */}
        {activeTab === "settings" && isSuperAdmin && (
          <div className="p-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-serif font-medium text-foreground mb-4">Settings</h2>
              <p className="text-muted-foreground">Settings panel coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Post Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-serif font-medium text-foreground">Delete Post</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 text-white text-sm font-mono uppercase tracking-widest rounded-lg hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;