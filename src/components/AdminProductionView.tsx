// src/components/AdminProductionView.tsx

import { useState, useEffect } from "react";
import { RefreshCw, LogOut, ChevronLeft, ChevronRight, Save, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import ExcelDataService from "../services/ExcelDataService";
import type { Order, ProductionStep } from "../services/ExcelDataService";

interface AdminProductionViewProps {
  onLogout: () => void;
}

const AdminProductionView = ({ onLogout }: AdminProductionViewProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editStates, setEditStates] = useState<Record<string, { status: string; detail: string; schedule: string; weekIndex: number }>>({});
  const dataService = ExcelDataService.getInstance();

  useEffect(() => {
    loadData();
    
    const handleDataChange = (data: { orders: Order[] }) => {
      console.log('📢 Admin received data update:', data.orders.length, 'orders');
      setOrders(data.orders);
      // Update edit states with new data
      const newEditStates: Record<string, { status: string; detail: string; schedule: string; weekIndex: number }> = {};
      data.orders.forEach(order => {
        order.steps.forEach(step => {
          // Find which week index this step is associated with
          let weekIndex = findWeekIndexForStep(order, step);
          newEditStates[`${order.orderId}-${step.id}`] = {
            status: step.status,
            detail: step.detail || '',
            schedule: step.schedule || '',
            weekIndex: weekIndex
          };
        });
      });
      setEditStates(newEditStates);
    };
    
    dataService.addListener(handleDataChange);
    return () => dataService.removeListener(handleDataChange);
  }, []);

  // Helper function to find the week index for a step
  const findWeekIndexForStep = (order: Order, step: ProductionStep): number => {
    // First check if the step has a week assigned
    if (step.week) {
      for (let i = 0; i < order.weeks.length; i++) {
        if (order.weeks[i] === step.week) {
          return i;
        }
      }
    }
    
    // Then check weekData
    if (step.weekData) {
      for (const weekIndex in step.weekData) {
        if (step.weekData[weekIndex]) {
          return parseInt(weekIndex);
        }
      }
    }
    
    // Default to 0 if not found (but log warning)
    console.warn(`Step ${step.label} has no week assigned, defaulting to Week 0`);
    return 0;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const allOrders = await dataService.getAllOrders();
      console.log('📥 Loaded orders:', allOrders.length);
      setOrders(allOrders);
      // Initialize edit states for all steps
      const newEditStates: Record<string, { status: string; detail: string; schedule: string; weekIndex: number }> = {};
      allOrders.forEach(order => {
        order.steps.forEach(step => {
          // Find which week index this step is associated with
          let weekIndex = findWeekIndexForStep(order, step);
          newEditStates[`${order.orderId}-${step.id}`] = {
            status: step.status,
            detail: step.detail || '',
            schedule: step.schedule || '',
            weekIndex: weekIndex
          };
        });
      });
      setEditStates(newEditStates);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setUpdateMessage({ type: 'error', text: '❌ Failed to load orders' });
      setTimeout(() => setUpdateMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (orderId: string, stepId: number, newStatus: string) => {
    const key = `${orderId}-${stepId}`;
    setEditStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        status: newStatus
      }
    }));
  };

  const handleDetailChange = (orderId: string, stepId: number, newDetail: string) => {
    const key = `${orderId}-${stepId}`;
    setEditStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        detail: newDetail
      }
    }));
  };

  const handleScheduleChange = (orderId: string, stepId: number, newSchedule: string) => {
    const key = `${orderId}-${stepId}`;
    setEditStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        schedule: newSchedule
      }
    }));
  };

  const handleWeekChange = (orderId: string, stepId: number, weekIndex: number) => {
    const key = `${orderId}-${stepId}`;
    setEditStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        weekIndex: weekIndex
      }
    }));
  };

  const handleUpdate = async (orderId: string, stepId: number) => {
    const key = `${orderId}-${stepId}`;
    const editState = editStates[key];
    if (!editState) {
      setUpdateMessage({ type: 'error', text: '❌ No data to update' });
      setTimeout(() => setUpdateMessage(null), 3000);
      return;
    }

    setUpdating(key);
    setUpdateMessage(null);

    try {
      const order = orders.find(o => o.orderId === orderId);
      if (!order) throw new Error('Order not found');

      console.log('🔄 Admin updating step:', { 
        orderId, 
        stepId, 
        status: editState.status,
        weekIndex: editState.weekIndex,
        weekLabel: order.weeks[editState.weekIndex]
      });

      // Update status
      await dataService.updateStepStatusDirect(
        orderId, 
        stepId, 
        editState.status as "completed" | "in-progress" | "pending"
      );
      
      // Update week data - this is crucial for the matrix view
      const weekIndex = editState.weekIndex;
      const hasData = editState.status !== 'pending';
      
      // First, clear all week data for this step
      await dataService.clearStepWeekData(orderId, stepId);
      
      // Then set the new week data
      await dataService.updateStepWeekData(
        orderId,
        stepId,
        weekIndex,
        hasData
      );
      
      // Update detail
      await dataService.updateStepDetail(orderId, stepId, editState.detail);
      
      // Update schedule
      await dataService.updateStepSchedule(orderId, stepId, editState.schedule);
      
      // Update the week field for display
      if (hasData && order.weeks[weekIndex]) {
        await dataService.updateStepWeek(orderId, stepId, order.weeks[weekIndex]);
      } else {
        await dataService.updateStepWeek(orderId, stepId, '');
      }
      
      // Force refresh data to get latest state
      await dataService.refreshData();
      
      // Reload data to ensure consistency
      await loadData();
      
      setUpdateMessage({ 
        type: 'success', 
        text: `✅ ${order.steps.find(s => s.id === stepId)?.label} updated to ${editState.status} in ${order.weeks[weekIndex] || 'Week ' + (weekIndex + 1)}!` 
      });
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update:', error);
      setUpdateMessage({ 
        type: 'error', 
        text: error instanceof Error ? `❌ ${error.message}` : '❌ Failed to update step' 
      });
      setTimeout(() => setUpdateMessage(null), 3000);
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateAll = async (orderId: string) => {
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;

    setUpdating(`all-${orderId}`);
    setUpdateMessage(null);

    try {
      console.log('🔄 Admin updating all steps for order:', orderId);
      
      for (const step of order.steps) {
        const key = `${orderId}-${step.id}`;
        const editState = editStates[key];
        if (!editState) continue;

        await dataService.updateStepStatusDirect(
          orderId, 
          step.id, 
          editState.status as "completed" | "in-progress" | "pending"
        );
        
        // Update week data for each step
        const weekIndex = editState.weekIndex;
        const hasData = editState.status !== 'pending';
        
        // Clear existing week data first
        await dataService.clearStepWeekData(orderId, step.id);
        
        // Set new week data
        await dataService.updateStepWeekData(
          orderId,
          step.id,
          weekIndex,
          hasData
        );
        
        await dataService.updateStepDetail(orderId, step.id, editState.detail);
        await dataService.updateStepSchedule(orderId, step.id, editState.schedule);
        
        if (hasData && order.weeks[weekIndex]) {
          await dataService.updateStepWeek(orderId, step.id, order.weeks[weekIndex]);
        } else {
          await dataService.updateStepWeek(orderId, step.id, '');
        }
      }
      
      // Force refresh data
      await dataService.refreshData();
      
      // Reload data
      await loadData();
      
      setUpdateMessage({ 
        type: 'success', 
        text: `✅ All steps for ${order.name} updated successfully!` 
      });
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update all:', error);
      setUpdateMessage({ 
        type: 'error', 
        text: error instanceof Error ? `❌ ${error.message}` : '❌ Failed to update all steps' 
      });
      setTimeout(() => setUpdateMessage(null), 3000);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-500/10 border-green-500/30 text-green-500';
      case 'in-progress': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';
      default: return 'bg-gray-500/10 border-gray-500/30 text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />;
      default: return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
  };

  const handlePrevOrder = () => {
    setSelectedOrderIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextOrder = () => {
    setSelectedOrderIndex(prev => Math.min(orders.length - 1, prev + 1));
  };

  const getWeekLabel = (week: string) => {
    const parts = week.split('(');
    if (parts.length > 1) {
      return {
        label: parts[0].trim(),
        date: parts[1]?.replace(')', '') || ''
      };
    }
    return { label: week, date: '' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sage flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Loading production orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-sage flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No production orders found.</p>
        </div>
      </div>
    );
  }

  const currentOrder = orders[selectedOrderIndex];

  return (
    <div className="min-h-screen bg-sage grid-bg-sage relative">
      <div className="container max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-2">{"// admin.production_calendars"}</p>
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-foreground">Production Management</h1>
            <p className="text-sm text-muted-foreground">Admin View · {orders.length} orders total</p>
          </div>
          <div className="flex gap-3">
            {updateMessage && (
              <span className={`flex items-center text-sm ${updateMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {updateMessage.text}
              </span>
            )}
            <button 
              onClick={loadData} 
              className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-muted-foreground hover:text-foreground border border-border hover:border-border/80 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button 
              onClick={onLogout} 
              className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-muted-foreground hover:text-foreground border border-border hover:border-border/80 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button 
            onClick={handlePrevOrder} 
            disabled={selectedOrderIndex === 0} 
            className="p-2 rounded-lg border border-border hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <span className="text-sm font-mono text-muted-foreground">{selectedOrderIndex + 1} of {orders.length}</span>
            <h2 className="text-xl font-serif font-medium text-foreground">{currentOrder.name}</h2>
            <p className="text-sm text-muted-foreground">{currentOrder.client} · {currentOrder.quantity}</p>
          </div>
          <button 
            onClick={handleNextOrder} 
            disabled={selectedOrderIndex === orders.length - 1} 
            className="p-2 rounded-lg border border-border hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Update All Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => handleUpdateAll(currentOrder.orderId)}
            disabled={updating === `all-${currentOrder.orderId}`}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating === `all-${currentOrder.orderId}` ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Updating All...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update All Steps
              </>
            )}
          </button>
        </div>

        {/* Order Details with Dropdowns and Free Text */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground min-w-[150px]">
                    Production Step
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground min-w-[140px]">
                    Current Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground min-w-[160px]">
                    Update Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground min-w-[150px]">
                    Select Week
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground min-w-[200px]">
                    Schedule (Free Text)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground min-w-[150px]">
                    Details / Notes
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-widest text-muted-foreground min-w-[120px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentOrder.steps.map((step) => {
                  const key = `${currentOrder.orderId}-${step.id}`;
                  const editState = editStates[key] || { 
                    status: step.status, 
                    detail: step.detail || '',
                    schedule: step.schedule || '',
                    weekIndex: 0
                  };
                  const isUpdating = updating === key;
                  
                  return (
                    <tr key={step.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(step.status)}
                          <span className="text-sm font-sans text-foreground">{step.label}</span>
                          {step.week && (
                            <span className="text-[10px] text-muted-foreground ml-1">
                              ({step.week})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${getStatusColor(step.status)}`}>
                          {getStatusIcon(step.status)}
                          {step.status === 'in-progress' ? 'In Progress' : step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editState.status}
                          onChange={(e) => handleStatusChange(currentOrder.orderId, step.id, e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground text-sm"
                          disabled={isUpdating}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editState.weekIndex}
                          onChange={(e) => handleWeekChange(currentOrder.orderId, step.id, parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground text-sm"
                          disabled={isUpdating}
                        >
                          {currentOrder.weeks.map((week, idx) => {
                            const { label, date } = getWeekLabel(week);
                            return (
                              <option key={idx} value={idx}>
                                Week {idx + 1}: {label} {date && `(${date})`}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editState.schedule}
                          onChange={(e) => handleScheduleChange(currentOrder.orderId, step.id, e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground text-sm"
                          placeholder="e.g., Week 10, March 2024, Q2, etc."
                          disabled={isUpdating}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editState.detail}
                          onChange={(e) => handleDetailChange(currentOrder.orderId, step.id, e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent transition-colors text-foreground text-sm"
                          placeholder="Add notes..."
                          disabled={isUpdating}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleUpdate(currentOrder.orderId, step.id)}
                          disabled={isUpdating}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-mono ${
                            isUpdating
                              ? 'bg-muted text-muted-foreground cursor-not-allowed'
                              : 'bg-accent text-accent-foreground hover:bg-accent/90'
                          }`}
                        >
                          {isUpdating ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Update
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-card rounded-xl border border-border">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Status Legend:</span>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Free text scheduling</span>
            </div>
          </div>
        </div>

        {/* Quick Nav */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {orders.map((order, index) => (
            <button
              key={order.orderId}
              onClick={() => setSelectedOrderIndex(index)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                index === selectedOrderIndex ? 'bg-primary text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {order.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminProductionView;