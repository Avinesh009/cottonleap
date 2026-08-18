// src/components/ProductionCalendarMatrixView.tsx

import { useState, useEffect } from "react";
import { 
  CheckCircle2, Clock, Circle, Save, X, RefreshCw
} from "lucide-react";
import ExcelDataService from "../services/ExcelDataService";
import type { Order, ProductionStep } from "../services/ExcelDataService";

interface ProductionCalendarMatrixViewProps {
  order: Order;
  onUpdate: () => void;
  isAdmin?: boolean;
}

const ProductionCalendarMatrixView = ({ order, onUpdate, isAdmin = false }: ProductionCalendarMatrixViewProps) => {
  const [steps, setSteps] = useState<ProductionStep[]>(order.steps);
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [editingCell, setEditingCell] = useState<{ stepId: number; weekIndex: number } | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>("");
  const [editingDetail, setEditingDetail] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const dataService = ExcelDataService.getInstance();

  // Update local state when order prop changes
  useEffect(() => {
    setSteps(order.steps);
    setCurrentOrder(order);
  }, [order]);

  // Listen for data changes from other components
  useEffect(() => {
    const handleDataChange = (data: { orders: Order[] }) => {
      const updatedOrder = data.orders.find(o => o.orderId === order.orderId);
      if (updatedOrder) {
        setSteps(updatedOrder.steps);
        setCurrentOrder(updatedOrder);
        setEditingCell(null);
        setIsSaving(false);
      }
    };
    
    dataService.addListener(handleDataChange);
    return () => dataService.removeListener(handleDataChange);
  }, [order.orderId, dataService]);

  const handleCellClick = (step: ProductionStep, weekIndex: number) => {
    if (!isAdmin) return;
    setEditingCell({ stepId: step.id, weekIndex });
    setEditingStatus(step.status);
    setEditingDetail(step.detail || '');
  };

  const handleSave = async () => {
    if (!editingCell) return;
    const { stepId, weekIndex } = editingCell;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Update status
      await dataService.updateStepStatusDirect(
        currentOrder.orderId, 
        stepId, 
        editingStatus as "completed" | "in-progress" | "pending"
      );
      
      // Update week data
      await dataService.updateStepWeekData(
        currentOrder.orderId, 
        stepId, 
        weekIndex, 
        editingStatus !== 'pending'
      );
      
      // Update detail
      await dataService.updateStepDetail(currentOrder.orderId, stepId, editingDetail);
      
      // Update local state immediately
      const updatedSteps = steps.map(step => {
        if (step.id === stepId) {
          const newWeekData = { ...step.weekData };
          if (editingStatus === 'pending') {
            delete newWeekData[weekIndex];
          } else {
            newWeekData[weekIndex] = true;
          }
          return {
            ...step,
            status: editingStatus as "completed" | "in-progress" | "pending",
            weekData: newWeekData,
            week: editingStatus !== 'pending' ? currentOrder.weeks[weekIndex] : '',
            detail: editingDetail
          };
        }
        return step;
      });
      
      setSteps(updatedSteps);
      
      // Update progress
      const completed = updatedSteps.filter(s => s.status === 'completed').length;
      const progress = updatedSteps.length > 0 ? Math.round((completed / updatedSteps.length) * 100) : 0;
      const updatedOrder = { ...currentOrder, progress };
      setCurrentOrder(updatedOrder);
      
      setSaveMessage({ type: 'success', text: '✅ Updated successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
      setEditingCell(null);
      
      // Notify parent to refresh
      onUpdate();
      
      // Force refresh data service to notify other components
      await dataService.refreshData();
      
    } catch (error) {
      console.error('Failed to update:', error);
      setSaveMessage({ type: 'error', text: '❌ Failed to update' });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingCell(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-white" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-white animate-pulse" />;
      default: return <Circle className="w-4 h-4 text-white" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  // Get week label for display
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

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/10 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-serif font-medium text-foreground">{currentOrder.name}</h3>
          <p className="text-sm text-muted-foreground">{currentOrder.style} · {currentOrder.quantity}</p>
          {/* Display schedule info */}
          {currentOrder.steps.some(s => s.schedule) && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">Schedule:</span>
              <span className="text-xs font-mono text-accent">
                {currentOrder.steps.filter(s => s.schedule).map(s => s.schedule).join(', ')}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isSaving && (
            <span className="flex items-center text-sm text-blue-500">
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              Saving...
            </span>
          )}
          {saveMessage && (
            <span className={`text-sm ${saveMessage.type === 'success' ? 'text-green-500' : saveMessage.type === 'error' ? 'text-red-500' : 'text-blue-500'}`}>
              {saveMessage.text}
            </span>
          )}
          <div className="text-right">
            <span className="text-xl font-mono font-bold text-primary">{currentOrder.progress}%</span>
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700" 
                style={{ width: `${currentOrder.progress}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-border bg-muted/20 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground min-w-[150px] sticky left-0 bg-muted/20 z-10">
                Production Steps
              </th>
              {currentOrder.weeks.map((week, idx) => {
                const { label, date } = getWeekLabel(week);
                return (
                  <th key={idx} className="p-2 border border-border bg-muted/20 text-center text-xs font-mono text-muted-foreground min-w-[100px]">
                    <div className="font-bold">{label}</div>
                    {date && <div className="text-[8px] text-muted-foreground/60">{date}</div>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {steps.map((step) => (
              <tr key={step.id} className="hover:bg-muted/5 transition-colors">
                <td className="p-2 border border-border sticky left-0 bg-background z-10">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-sans text-foreground">{step.label}</span>
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${getStatusColor(step.status)} text-white`}>
                        {getStatusLabel(step.status)}
                      </span>
                    </div>
                    {/* Display schedule if exists */}
                    {step.schedule && (
                      <span className="text-[10px] text-accent font-mono">
                        📅 {step.schedule}
                      </span>
                    )}
                  </div>
                </td>
                {currentOrder.weeks.map((week, weekIndex) => {
                  const hasData = step.weekData && step.weekData[weekIndex] || false;
                  const isEditing = editingCell?.stepId === step.id && editingCell?.weekIndex === weekIndex;
                  
                  return (
                    <td 
                      key={weekIndex} 
                      className={`p-1 border border-border text-center transition-all duration-200 ${
                        hasData ? 'bg-accent/10' : ''
                      } ${isAdmin ? 'cursor-pointer hover:bg-muted/20' : ''}`}
                      onClick={() => handleCellClick(step, weekIndex)}
                    >
                      {isEditing ? (
                        <div className="flex flex-col gap-1 p-1 min-w-[100px]">
                          <select
                            value={editingStatus}
                            onChange={(e) => setEditingStatus(e.target.value)}
                            className="w-full px-1 py-0.5 text-xs bg-background border border-border rounded focus:outline-none focus:border-accent"
                            autoFocus
                            disabled={isSaving}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          <input
                            type="text"
                            value={editingDetail}
                            onChange={(e) => setEditingDetail(e.target.value)}
                            className="w-full px-1 py-0.5 text-xs bg-background border border-border rounded focus:outline-none focus:border-accent"
                            placeholder="Details..."
                            disabled={isSaving}
                          />
                          <div className="flex gap-1 justify-center mt-1">
                            <button 
                              onClick={handleSave} 
                              disabled={isSaving}
                              className="px-2 py-0.5 text-[10px] bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Save className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={handleCancel} 
                              disabled={isSaving}
                              className="px-2 py-0.5 text-[10px] bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center min-h-[40px] gap-1">
                          {hasData ? (
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}>
                                {getStatusIcon(step.status)}
                              </div>
                              {step.detail && (
                                <span className="text-[8px] text-muted-foreground mt-0.5 truncate max-w-[80px]">
                                  {step.detail.length > 15 ? step.detail.substring(0, 15) + '...' : step.detail}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/30">—</span>
                          )}
                          {isAdmin && !hasData && (
                            <span className="text-[8px] text-muted-foreground/50">Click</span>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-border bg-muted/5 flex flex-wrap items-center gap-4">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Status:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-300" />
          <span className="text-xs text-muted-foreground">Pending</span>
        </div>
        {isAdmin && <span className="ml-auto text-xs text-green-500 font-mono">● Click cell to edit</span>}
      </div>
    </div>
  );
};

export default ProductionCalendarMatrixView;