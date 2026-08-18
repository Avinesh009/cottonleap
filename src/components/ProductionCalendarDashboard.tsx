// src/components/ProductionCalendarDashboard.tsx

import { useState, useEffect, useRef } from "react";
import { 
  Edit2, Save, X, RefreshCw, LogOut, 
  CheckCircle2, Clock, Circle, FileText,
  AlertCircle, ChevronDown, ChevronRight, 
  Leaf, BarChart3, MessageCircle, Send,
  Calendar, Grid, PieChart as PieChartIcon
} from "lucide-react";
import ExcelDataService from "../services/ExcelDataService";
import type { User, Order, ProductionStep, ESG_Metrics } from "../services/ExcelDataService";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell,
  PieChart as RePieChart, Pie
} from 'recharts';
import ProductionCalendarMatrixView from "./ProductionCalendarMatrixView";

interface ProductionCalendarDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

type ViewMode = 'table' | 'chart' | 'matrix';

const ProductionCalendarDashboard = ({ currentUser, onLogout }: ProductionCalendarDashboardProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStep, setEditingStep] = useState<{ orderId: string; stepId: number } | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>("");
  const [editingDetail, setEditingDetail] = useState<string>("");
  const [editingWeek, setEditingWeek] = useState<string>("");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [esgMetrics, setEsgMetrics] = useState<Record<string, ESG_Metrics>>({});
  const [editingESG, setEditingESG] = useState<string | null>(null);
  const [editingESGData, setEditingESGData] = useState<ESG_Metrics | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'detailed'>('detailed');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [chatUnread, setChatUnread] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const dataService = ExcelDataService.getInstance();

  useEffect(() => {
    setIsAdmin(currentUser.role === 'production_manager' || currentUser.role === 'quality_control');
    loadData();
    loadChatMessages();
  }, [currentUser]);

  // Listen for data changes
  useEffect(() => {
    const handleDataChange = (data: { orders: Order[] }) => {
      const userOrders = data.orders.filter(order => 
        currentUser.orders.includes(order.orderId)
      );
      setOrders(userOrders);
      setRefreshKey(prev => prev + 1);
    };
    
    dataService.addListener(handleDataChange);
    return () => dataService.removeListener(handleDataChange);
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    setSaveSuccess(null);
    setSaveError(null);
    try {
      const userOrders = await dataService.getUserOrders(currentUser.id);
      setOrders(userOrders);
      
      // Load ESG metrics for all orders
      const esgData: Record<string, ESG_Metrics> = {};
      for (const order of userOrders) {
        const esg = await dataService.getESGMetrics(order.orderId);
        if (esg) esgData[order.orderId] = esg;
      }
      setEsgMetrics(esgData);
      
      const allIds = new Set(userOrders.map(o => o.orderId));
      setExpandedOrders(allIds);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setSaveError('Failed to load production data');
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async () => {
    try {
      const stored = localStorage.getItem('chat_messages');
      if (stored) {
        setChatMessages(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const sendChatMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...chatMessages, message];
    setChatMessages(updatedMessages);
    localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));
    setNewMessage("");
    setChatUnread(0);

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (!showChat) {
      setChatUnread(0);
    }
  };

  const handleStatusChange = async (orderId: string, stepId: number, newStatus: "completed" | "in-progress" | "pending") => {
    try {
      await dataService.updateStepStatus(orderId, stepId, newStatus);
      
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.orderId === orderId) {
            return {
              ...order,
              steps: order.steps.map(step => 
                step.id === stepId ? { ...step, status: newStatus } : step
              ),
              progress: calculateProgress(order.steps.map(step => 
                step.id === stepId ? { ...step, status: newStatus } : step
              ))
            };
          }
          return order;
        })
      );
      setSaveSuccess(`Step updated to ${newStatus}`);
      setTimeout(() => setSaveSuccess(null), 3000);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to update status:', error);
      setSaveError('Failed to update status');
      setTimeout(() => setSaveError(null), 3000);
    }
  };

  const handleDetailChange = async (orderId: string, stepId: number, newDetail: string) => {
    try {
      await dataService.updateStepDetail(orderId, stepId, newDetail);
      
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.orderId === orderId) {
            return {
              ...order,
              steps: order.steps.map(step => 
                step.id === stepId ? { ...step, detail: newDetail } : step
              )
            };
          }
          return order;
        })
      );
      setSaveSuccess('Details updated');
      setTimeout(() => setSaveSuccess(null), 3000);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to update detail:', error);
      setSaveError('Failed to update details');
      setTimeout(() => setSaveError(null), 3000);
    }
  };

  const handleWeekChange = async (orderId: string, stepId: number, newWeek: string) => {
    try {
      await dataService.updateStepWeek(orderId, stepId, newWeek);
      
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.orderId === orderId) {
            return {
              ...order,
              steps: order.steps.map(step => 
                step.id === stepId ? { ...step, week: newWeek } : step
              )
            };
          }
          return order;
        })
      );
      setSaveSuccess('Week updated');
      setTimeout(() => setSaveSuccess(null), 3000);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to update week:', error);
      setSaveError('Failed to update week');
      setTimeout(() => setSaveError(null), 3000);
    }
  };

  const handleESGUpdate = async (orderId: string, field: keyof ESG_Metrics, value: number) => {
    try {
      await dataService.updateESGMetrics(orderId, { [field]: value });
      
      setEsgMetrics(prev => ({
        ...prev,
        [orderId]: {
          ...prev[orderId],
          [field]: value
        }
      }));
      setSaveSuccess('ESG metrics updated');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to update ESG:', error);
      setSaveError('Failed to update ESG metrics');
      setTimeout(() => setSaveError(null), 3000);
    }
  };

  const calculateProgress = (steps: ProductionStep[]): number => {
    const completed = steps.filter(s => s.status === 'completed').length;
    return steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 border-green-500/30 text-green-500';
      case 'in-progress':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-500';
    }
  };

  const startEditing = (orderId: string, step: ProductionStep) => {
    setEditingStep({ orderId, stepId: step.id });
    setEditingStatus(step.status);
    setEditingDetail(step.detail);
    setEditingWeek(step.week);
  };

  const saveEditing = async () => {
    if (editingStep) {
      await handleStatusChange(editingStep.orderId, editingStep.stepId, editingStatus as "completed" | "in-progress" | "pending");
      await handleDetailChange(editingStep.orderId, editingStep.stepId, editingDetail);
      await handleWeekChange(editingStep.orderId, editingStep.stepId, editingWeek);
      setEditingStep(null);
    }
  };

  const cancelEditing = () => {
    setEditingStep(null);
  };

  const startESGEditing = (orderId: string) => {
    setEditingESG(orderId);
    setEditingESGData(esgMetrics[orderId] || { organicFiber: 0, carbonOffset: 0, waterRecycling: 0 });
  };

  const saveESGEditing = () => {
    if (editingESG && editingESGData) {
      handleESGUpdate(editingESG, 'organicFiber', editingESGData.organicFiber);
      handleESGUpdate(editingESG, 'carbonOffset', editingESGData.carbonOffset);
      handleESGUpdate(editingESG, 'waterRecycling', editingESGData.waterRecycling);
      setEditingESG(null);
      setEditingESGData(null);
    }
  };

  const cancelESGEditing = () => {
    setEditingESG(null);
    setEditingESGData(null);
  };

  const totalOrders = orders.length;
  const totalSteps = orders.reduce((acc, order) => acc + order.steps.length, 0);
  const completedSteps = orders.reduce((acc, order) => 
    acc + order.steps.filter(s => s.status === 'completed').length, 0
  );
  const inProgressSteps = orders.reduce((acc, order) => 
    acc + order.steps.filter(s => s.status === 'in-progress').length, 0
  );
  const pendingSteps = totalSteps - completedSteps - inProgressSteps;

  // Prepare chart data
  const chartData = orders.map(order => ({
    name: order.name,
    completed: order.steps.filter(s => s.status === 'completed').length,
    inProgress: order.steps.filter(s => s.status === 'in-progress').length,
    pending: order.steps.filter(s => s.status === 'pending').length,
    progress: calculateProgress(order.steps),
    total: order.steps.length
  }));

  // Prepare detailed step data for each product
  const getStepPieData = (steps: ProductionStep[]) => {
    const statusMap: Record<string, number> = {};
    steps.forEach(step => {
      const key = step.status === 'completed' ? 'Completed' : 
                 step.status === 'in-progress' ? 'In Progress' : 'Pending';
      statusMap[key] = (statusMap[key] || 0) + 1;
    });
    return Object.entries(statusMap).map(([name, value]) => {
      const colors: Record<string, string> = {
        'Completed': '#22c55e',
        'In Progress': '#eab308',
        'Pending': '#94a3b8'
      };
      return { name, value, color: colors[name] };
    });
  };

  // Get all unique step names for the bar chart
  const getAllStepNames = () => {
    const stepNames = new Set<string>();
    orders.forEach(order => {
      order.steps.forEach(step => {
        stepNames.add(step.label);
      });
    });
    return Array.from(stepNames);
  };

  // Prepare data for step comparison chart
  const getStepComparisonData = () => {
    const stepNames = getAllStepNames();
    return orders.map(order => {
      const data: any = { name: order.name };
      stepNames.forEach(stepName => {
        const step = order.steps.find(s => s.label === stepName);
        if (step) {
          data[stepName] = step.status === 'completed' ? 100 : 
                          step.status === 'in-progress' ? 50 : 0;
        } else {
          data[stepName] = 0;
        }
      });
      return data;
    });
  };

  // Prepare data for step status chart
  const getStepStatusData = (order: Order) => {
    return order.steps.map(step => ({
      name: step.label,
      status: step.status,
      value: step.status === 'completed' ? 100 : 
             step.status === 'in-progress' ? 50 : 0
    }));
  };

  // Pie chart data for overall status
  const pieData = [
    { name: 'Completed', value: completedSteps, color: '#22c55e' },
    { name: 'In Progress', value: inProgressSteps, color: '#eab308' },
    { name: 'Pending', value: pendingSteps, color: '#94a3b8' }
  ].filter(item => item.value > 0);

  const COLORS = ['#22c55e', '#eab308', '#94a3b8'];

  if (loading) {
    return (
      <div className="min-h-screen bg-sage flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Loading production data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage grid-bg-sage relative">
      <div className="container max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-2">
              {"// production_calendar.dashboard"}
            </p>
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-foreground">
              Production Calendar
            </h1>
            <p className="text-sm font-sans text-muted-foreground mt-1">
              {currentUser.company} · {currentUser.role.replace('_', ' ').toUpperCase()}
              {isAdmin && <span className="ml-2 text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">Admin · Can Edit</span>}
              {!isAdmin && <span className="ml-2 text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">View Only</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {saveSuccess && (
              <span className="flex items-center text-sm text-green-500">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {saveSuccess}
              </span>
            )}
            {saveError && (
              <span className="flex items-center text-sm text-red-500">
                <AlertCircle className="w-4 h-4 mr-1" />
                {saveError}
              </span>
            )}
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-muted-foreground hover:text-foreground border border-border hover:border-border/80 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-muted-foreground hover:text-foreground border border-border hover:border-border/80 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-foreground">{totalOrders}</p>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-foreground">{completedSteps}</p>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-foreground">{inProgressSteps}</p>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-foreground">
                  {totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0}%
                </p>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Overall Progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex bg-muted/20 rounded-lg p-1 border border-border">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm font-mono rounded-lg transition-colors ${
                viewMode === 'table' 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Table View
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-4 py-2 text-sm font-mono rounded-lg transition-colors ${
                viewMode === 'matrix' 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid className="w-4 h-4 inline mr-2" />
              Matrix View
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-4 py-2 text-sm font-mono rounded-lg transition-colors ${
                viewMode === 'chart' 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Chart View
            </button>
          </div>
          
          {viewMode === 'chart' && (
            <div className="flex bg-muted/20 rounded-lg p-1 border border-border">
              <button
                onClick={() => setChartType('detailed')}
                className={`px-3 py-1.5 text-sm font-mono rounded-lg transition-colors ${
                  chartType === 'detailed' 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Detailed View
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 text-sm font-mono rounded-lg transition-colors ${
                  chartType === 'bar' 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Bar Chart
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`px-3 py-1.5 text-sm font-mono rounded-lg transition-colors ${
                  chartType === 'pie' 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <PieChartIcon className="w-4 h-4 inline mr-1" />
                Pie Chart
              </button>
            </div>
          )}
        </div>

        {/* Chart View */}
        {viewMode === 'chart' && (
          <div className="space-y-6">
            {chartType === 'detailed' ? (
              // Detailed View - Each product with all steps shown
              <>
                {orders.map((order) => {
                  const orderSteps = order.steps;
                  
                  return (
                    <div key={order.orderId} className="bg-card rounded-xl border border-border p-6">
                      {/* Product Header */}
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                        <div>
                          <h3 className="text-xl font-serif font-medium text-foreground">{order.name}</h3>
                          <p className="text-sm text-muted-foreground">{order.style} · {order.quantity}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">Overall Progress: {order.progress}%</span>
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                              style={{ width: `${order.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* All Steps for this product - Each step shown as a separate bar */}
                      <div className="space-y-4">
                        {orderSteps.map((step) => {
                          const statusColor = step.status === 'completed' ? '#22c55e' : 
                                             step.status === 'in-progress' ? '#eab308' : '#94a3b8';
                          const statusWidth = step.status === 'completed' ? 100 : 
                                             step.status === 'in-progress' ? 50 : 0;
                          
                          return (
                            <div key={step.id} className="bg-muted/5 rounded-lg p-4 border border-border/50">
                              {/* Step Label and Status */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <span className="font-sans font-medium text-foreground">{step.label}</span>
                                  <span className="text-xs font-mono text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">
                                    {step.week}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`text-xs font-mono px-3 py-1 rounded-full ${
                                    step.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/30' :
                                    step.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' :
                                    'bg-gray-500/10 text-gray-500 border border-gray-500/30'
                                  }`}>
                                    {step.status === 'completed' ? '✓ Completed' : 
                                     step.status === 'in-progress' ? '⟳ In Progress' : '○ Pending'}
                                  </span>
                                  <span className="text-sm font-mono font-bold text-foreground">
                                    {statusWidth}%
                                  </span>
                                </div>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-1000 relative"
                                  style={{ 
                                    width: `${statusWidth}%`,
                                    background: `linear-gradient(90deg, ${statusColor}, ${statusColor}dd)`
                                  }}
                                >
                                  {step.status === 'in-progress' && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg animate-ping" />
                                  )}
                                  {step.status === 'completed' && (
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                      <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Details */}
                              {step.detail && (
                                <p className="text-xs text-muted-foreground mt-2 pl-1 flex items-center gap-1">
                                  <span className="text-accent">📝</span> {step.detail}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Status summary for this product */}
                      <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center gap-6">
                        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Status Summary:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-sm text-muted-foreground">
                            Completed: <span className="font-bold text-green-500">{orderSteps.filter(s => s.status === 'completed').length}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                          <span className="text-sm text-muted-foreground">
                            In Progress: <span className="font-bold text-yellow-500">{orderSteps.filter(s => s.status === 'in-progress').length}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-400" />
                          <span className="text-sm text-muted-foreground">
                            Pending: <span className="font-bold text-gray-500">{orderSteps.filter(s => s.status === 'pending').length}</span>
                          </span>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Total Steps:</span>
                          <span className="text-sm font-mono font-bold text-primary">{orderSteps.length}</span>
                        </div>
                      </div>

                      {/* Pie Chart for this product's steps */}
                      <div className="mt-4 pt-4 border-t border-border">
                        <h4 className="text-sm font-mono font-medium text-muted-foreground mb-3">
                          Step Status Distribution for {order.name}
                        </h4>
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                              <Pie
                                data={getStepPieData(orderSteps)}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {getStepPieData(orderSteps).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RePieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Overall Summary Charts */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-serif font-medium text-foreground mb-6">
                    Overall Production Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bar Chart - Products Comparison */}
                    <div className="h-[300px]">
                      <h4 className="text-sm font-mono text-muted-foreground text-center mb-2">Products Comparison</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255,255,255,0.9)', 
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                          <Bar dataKey="inProgress" fill="#eab308" name="In Progress" />
                          <Bar dataKey="pending" fill="#94a3b8" name="Pending" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Pie Chart - Overall Distribution */}
                    <div className="h-[300px]">
                      <h4 className="text-sm font-mono text-muted-foreground text-center mb-2">Overall Distribution</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            ) : chartType === 'bar' ? (
              // Bar Chart View - Shows all steps for each product
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-serif font-medium text-foreground mb-6">
                  Production Steps by Product
                </h3>
                <div className="space-y-8">
                  {orders.map((order) => {
                    const stepData = getStepStatusData(order);
                    return (
                      <div key={order.orderId}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-serif font-medium text-foreground">{order.name}</h4>
                          <span className="text-sm font-mono text-primary">{order.progress}%</span>
                        </div>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stepData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis type="number" stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255,255,255,0.9)', 
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px'
                                }}
                              />
                              <Bar dataKey="value" fill="#8b5cf6" name="Progress %" radius={[0, 4, 4, 0]}>
                                {stepData.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.status === 'completed' ? '#22c55e' : 
                                          entry.status === 'in-progress' ? '#eab308' : '#94a3b8'} 
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        {/* Show step names */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {order.steps.map((step) => (
                            <span 
                              key={step.id} 
                              className={`text-xs px-2 py-1 rounded-full ${
                                step.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/30' :
                                step.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' :
                                'bg-gray-500/10 text-gray-500 border border-gray-500/30'
                              }`}
                            >
                              {step.label}: {step.status}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Pie Chart View - Shows all steps for each product
              <div className="space-y-6">
                {orders.map((order) => {
                  const stepPieData = getStepPieData(order.steps);
                  return (
                    <div key={order.orderId} className="bg-card rounded-xl border border-border p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-serif font-medium text-foreground">{order.name}</h3>
                          <p className="text-sm text-muted-foreground">{order.style} · {order.quantity}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">Progress: {order.progress}%</span>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                              style={{ width: `${order.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                              <Pie
                                data={stepPieData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={90}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {stepPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </RePieChart>
                          </ResponsiveContainer>
                        </div>
                        <div>
                          <h4 className="text-sm font-mono font-medium text-muted-foreground mb-3">All Steps:</h4>
                          <div className="space-y-2">
                            {order.steps.map((step) => (
                              <div key={step.id} className="flex items-center justify-between p-2 bg-muted/5 rounded-lg border border-border/50">
                                <span className="text-sm font-sans text-foreground">{step.label}</span>
                                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                                  step.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                  step.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-500' :
                                  'bg-gray-500/10 text-gray-500'
                                }`}>
                                  {step.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Matrix View */}
        {viewMode === 'matrix' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No production orders found.</p>
              </div>
            ) : (
              orders.map((order) => (
                <ProductionCalendarMatrixView
                  key={`${order.orderId}-${refreshKey}`}
                  order={order}
                  onUpdate={loadData}
                  isAdmin={isAdmin}
                />
              ))
            )}
          </div>
        )}

        {/* Orders List - Table View */}
        {viewMode === 'table' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No production orders found.</p>
              </div>
            ) : (
              orders.map((order) => {
                const isExpanded = expandedOrders.has(order.orderId);
                const orderProgress = calculateProgress(order.steps);
                const orderESG = esgMetrics[order.orderId];
                const isESGEditing = editingESG === order.orderId;
                
                return (
                  <div key={order.orderId} className="bg-card rounded-xl border border-border overflow-hidden">
                    {/* Order Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-muted/20 transition-colors flex items-center justify-between"
                      onClick={() => toggleOrder(order.orderId)}
                    >
                      <div className="flex items-center gap-4">
                        <button className="p-1 hover:bg-muted rounded transition-colors">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <div>
                          <h3 className="text-lg font-serif font-medium text-foreground">{order.name}</h3>
                          <p className="text-sm text-muted-foreground">{order.style} · {order.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xl font-mono font-bold text-primary">{orderProgress}%</span>
                          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                              style={{ width: `${orderProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Steps Table */}
                    {isExpanded && (
                      <div className="border-t border-border overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/20">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground min-w-[150px]">
                                Step
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground min-w-[120px]">
                                Status
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground min-w-[180px]">
                                Week
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground">
                                Details
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-widest text-muted-foreground min-w-[100px]">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.steps.map((step) => {
                              const isEditing = editingStep?.orderId === order.orderId && editingStep?.stepId === step.id;
                              
                              return (
                                <tr key={step.id} className="border-t border-border hover:bg-muted/10 transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(step.status)}
                                      <span className="text-sm font-sans text-foreground">{step.label}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    {isEditing ? (
                                      <select
                                        value={editingStatus}
                                        onChange={(e) => setEditingStatus(e.target.value)}
                                        className="px-2 py-1 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                      </select>
                                    ) : (
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${getStatusColor(step.status)}`}>
                                        {getStatusIcon(step.status)}
                                        {step.status}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={editingWeek}
                                        onChange={(e) => setEditingWeek(e.target.value)}
                                        className="w-full px-2 py-1 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                                        placeholder="Week..."
                                      />
                                    ) : (
                                      <span className="text-xs font-mono text-muted-foreground">{step.week}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={editingDetail}
                                        onChange={(e) => setEditingDetail(e.target.value)}
                                        className="w-full px-2 py-1 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                                        placeholder="Enter details..."
                                      />
                                    ) : (
                                      <span className="text-sm text-muted-foreground">{step.detail}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    {isEditing ? (
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          onClick={saveEditing}
                                          className="p-1.5 rounded hover:bg-green-500/10 text-green-500 transition-colors"
                                          title="Save"
                                        >
                                          <Save className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={cancelEditing}
                                          className="p-1.5 rounded hover:bg-red-500/10 text-red-500 transition-colors"
                                          title="Cancel"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => startEditing(order.orderId, step)}
                                        className={`p-1.5 rounded transition-colors ${
                                          isAdmin 
                                            ? 'hover:bg-muted/50 text-muted-foreground hover:text-accent' 
                                            : 'opacity-50 cursor-not-allowed'
                                        }`}
                                        title={isAdmin ? "Edit" : "View Only"}
                                        disabled={!isAdmin}
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* ESG Metrics Section */}
                        {orderESG && (
                          <div className="p-4 bg-muted/10 border-t border-border">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Leaf className="w-4 h-4 text-accent" />
                                <h4 className="text-sm font-mono font-bold text-foreground uppercase tracking-wider">
                                  ESG Metrics
                                </h4>
                              </div>
                              {isAdmin && (
                                <button
                                  onClick={() => isESGEditing ? saveESGEditing() : startESGEditing(order.orderId)}
                                  className="px-3 py-1 text-xs font-mono text-accent hover:text-accent/80 transition-colors"
                                >
                                  {isESGEditing ? 'Save' : 'Edit ESG'}
                                </button>
                              )}
                              {isESGEditing && (
                                <button
                                  onClick={cancelESGEditing}
                                  className="px-3 py-1 text-xs font-mono text-red-500 hover:text-red-400 transition-colors"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-sans text-muted-foreground">Organic Fiber</span>
                                  {isESGEditing && editingESGData ? (
                                    <input
                                      type="number"
                                      value={editingESGData.organicFiber}
                                      onChange={(e) => setEditingESGData({
                                        ...editingESGData,
                                        organicFiber: Number(e.target.value)
                                      })}
                                      className="w-16 px-2 py-1 bg-background border border-border rounded text-sm"
                                      min="0"
                                      max="100"
                                    />
                                  ) : (
                                    <span className="text-xs font-mono font-bold text-accent">{orderESG.organicFiber}%</span>
                                  )}
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-accent to-neon-green rounded-full transition-all duration-1000"
                                    style={{ width: `${isESGEditing && editingESGData ? editingESGData.organicFiber : orderESG.organicFiber}%` }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-sans text-muted-foreground">Carbon Offset</span>
                                  {isESGEditing && editingESGData ? (
                                    <input
                                      type="number"
                                      value={editingESGData.carbonOffset}
                                      onChange={(e) => setEditingESGData({
                                        ...editingESGData,
                                        carbonOffset: Number(e.target.value)
                                      })}
                                      className="w-16 px-2 py-1 bg-background border border-border rounded text-sm"
                                      min="0"
                                      max="100"
                                    />
                                  ) : (
                                    <span className="text-xs font-mono font-bold text-accent">{orderESG.carbonOffset}%</span>
                                  )}
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-accent to-neon-green rounded-full transition-all duration-1000"
                                    style={{ width: `${isESGEditing && editingESGData ? editingESGData.carbonOffset : orderESG.carbonOffset}%` }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-sans text-muted-foreground">Water Recycling</span>
                                  {isESGEditing && editingESGData ? (
                                    <input
                                      type="number"
                                      value={editingESGData.waterRecycling}
                                      onChange={(e) => setEditingESGData({
                                        ...editingESGData,
                                        waterRecycling: Number(e.target.value)
                                      })}
                                      className="w-16 px-2 py-1 bg-background border border-border rounded text-sm"
                                      min="0"
                                      max="100"
                                    />
                                  ) : (
                                    <span className="text-xs font-mono font-bold text-accent">{orderESG.waterRecycling}%</span>
                                  )}
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-accent to-neon-green rounded-full transition-all duration-1000"
                                    style={{ width: `${isESGEditing && editingESGData ? editingESGData.waterRecycling : orderESG.waterRecycling}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 p-4 bg-card rounded-xl border border-border">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Status Legend:</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs font-sans text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
              <span className="text-xs font-sans text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-sans text-muted-foreground">Pending</span>
            </div>
            {!isAdmin && (
              <div className="ml-auto text-xs text-muted-foreground">
                <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">View Only</span>
              </div>
            )}
            {isAdmin && (
              <div className="ml-auto text-xs text-muted-foreground">
                <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded">Admin - Can Edit</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Button - Fixed position */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="relative group flex items-center gap-2 px-4 py-3 bg-accent text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-mono hidden sm:inline">Chat</span>
          {chatUnread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              {chatUnread}
            </span>
          )}
        </button>
      </div>

      {/* Chat Widget - Slide-up panel */}
      {showChat && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-card rounded-xl shadow-2xl border border-border z-50 flex flex-col max-h-[500px] animate-slide-up">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/10 rounded-t-xl">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-serif font-medium text-foreground">Team Chat</h3>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="p-1 rounded hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px]"
          >
            {chatMessages.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.userId === currentUser.id ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      msg.userId === currentUser.id
                        ? 'bg-accent text-white'
                        : 'bg-muted/20 text-foreground'
                    }`}
                  >
                    {msg.userId !== currentUser.id && (
                      <p className="text-[10px] font-mono font-bold text-accent/80 mb-0.5">
                        {msg.userName}
                      </p>
                    )}
                    <p className="text-sm break-words">{msg.message}</p>
                  </div>
                  <span className="text-[8px] text-muted-foreground mt-0.5">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-border bg-muted/5 rounded-b-xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={sendChatMessage}
                disabled={!newMessage.trim()}
                className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionCalendarDashboard;