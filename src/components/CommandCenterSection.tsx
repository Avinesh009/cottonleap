// src/components/CommandCenterSection.tsx

import { useState, useEffect, useRef } from "react";
import { RefreshCw, LogOut } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import ExcelDataService from "../services/ExcelDataService";
import type { User, Order } from "../services/ExcelDataService";
import ProductionCalendarMatrixView from "./ProductionCalendarMatrixView";
import ChatWidget from "./ChatWidget";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

const CommandCenterSection = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [chatUnread, setChatUnread] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const dataService = ExcelDataService.getInstance();

  // Listen for data changes from admin (both orders AND users)
  useEffect(() => {
    const handleDataChange = (data: { orders: Order[], users: User[] }) => {
      console.log('📢 Production view received data update:', {
        orders: data.orders.length,
        users: data.users.length
      });
      
      // Check if current user still exists
      if (currentUser) {
        const userStillExists = data.users.some(u => u.id === currentUser.id);
        if (!userStillExists) {
          // User was deleted, logout
          console.log('User deleted, logging out');
          localStorage.removeItem('cottonleap_user');
          setCurrentUser(null);
          window.location.reload();
          return;
        }
        
        // Update user data if changed
        const updatedUser = data.users.find(u => u.id === currentUser.id);
        if (updatedUser) {
          // Update orders if they changed
          const userOrders = data.orders.filter(order => 
            updatedUser.orders.includes(order.orderId)
          );
          console.log('📢 User orders updated:', userOrders.length, 'orders for user', updatedUser.name);
          setOrders(userOrders);
          setLastUpdate(new Date());
          setRefreshKey(prev => prev + 1);
        }
      }
    };

    dataService.addListener(handleDataChange);
    return () => dataService.removeListener(handleDataChange);
  }, [currentUser]);

  // Load saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('cottonleap_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        loadUserOrders(user.id);
      } catch (e) {
        localStorage.removeItem('cottonleap_user');
      }
    }
    setLoading(false);
  }, []);

  // Load chat messages and subscribe to real-time updates
  useEffect(() => {
    if (!currentUser) return;
    loadChatMessages();

    // Subscribe to new chat messages
    const channel = supabase.channel('chat-room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const newMsg: ChatMessage = {
          id: payload.new.id,
          userId: payload.new.user_id,
          userName: payload.new.user_name,
          message: payload.new.message,
          timestamp: payload.new.timestamp,
        };
        setChatMessages((prev) => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        
        if (!showChat) {
          setChatUnread(u => u + 1);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, showChat]);

  const loadUserOrders = async (userId: string) => {
    setLoading(true);
    try {
      const userOrders = await dataService.getUserOrders(userId);
      console.log('📥 Loaded user orders:', userOrders.length);
      setOrders(userOrders);
      setRefreshKey(prev => prev + 1);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) throw error;

      const msgs = (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        userName: row.user_name,
        message: row.message,
        timestamp: row.timestamp
      }));
      setChatMessages(msgs);
    } catch (error) {
      console.error('Failed to load chat from Supabase:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    const newId = `msg_${Date.now()}`;
    const newMsgObj = {
      id: newId,
      user_id: currentUser.id,
      user_name: currentUser.name,
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    // Optimistically add to UI
    const clientMsg: ChatMessage = {
      id: newId,
      userId: currentUser.id,
      userName: currentUser.name,
      message: newMessage.trim(),
      timestamp: newMsgObj.timestamp
    };
    setChatMessages(prev => [...prev, clientMsg]);
    setNewMessage("");
    setChatUnread(0);

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([newMsgObj]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to send chat message:', error);
    }

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleRefresh = () => {
    if (currentUser) {
      loadUserOrders(currentUser.id);
      setLastUpdate(new Date());
      loadChatMessages();
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cottonleap_user');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sage flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'production_manager' || currentUser?.role === 'quality_control';

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
            <p className="text-sm text-muted-foreground mt-1">
              {currentUser?.company} · {currentUser?.role.replace('_', ' ').toUpperCase()}
              {isAdmin ? (
                <span className="ml-2 text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded animate-pulse">
                  Admin · Can Edit
                </span>
              ) : (
                <span className="ml-2 text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">
                  View Only
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground/50 mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleRefresh} 
              className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-muted-foreground hover:text-foreground border border-border hover:border-border/80 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-muted-foreground hover:text-foreground border border-border hover:border-border/80 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">No production orders assigned.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.orderId} className="relative">
                {/* Progress Indicator with Blinking Effect */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>{order.name}</span>
                      <span className="font-mono font-bold text-primary">{order.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 relative ${
                          order.progress < 100 ? 'animate-pulse' : ''
                        }`}
                        style={{ 
                          width: `${order.progress}%`,
                          background: order.progress < 100 
                            ? 'linear-gradient(90deg, #2D7A5A, #5CB87A, #2D7A5A)' 
                            : '#2D7A5A'
                        }}
                      >
                        {order.progress < 100 && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg animate-ping" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <ProductionCalendarMatrixView 
                  key={order.orderId + refreshKey}
                  order={order} 
                  onUpdate={handleRefresh}
                  isAdmin={isAdmin}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Widget */}
      <ChatWidget 
        currentUser={currentUser}
        messages={chatMessages}
        onSendMessage={sendChatMessage}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        showChat={showChat}
        setShowChat={setShowChat}
        unreadCount={chatUnread}
        chatContainerRef={chatContainerRef}
      />
    </div>
  );
};

export default CommandCenterSection;