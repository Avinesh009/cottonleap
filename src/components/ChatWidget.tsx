// src/components/ChatWidget.tsx
import { MessageCircle, X, Send } from "lucide-react";
import type { RefObject } from "react";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface ChatWidgetProps {
  currentUser: any;
  messages: ChatMessage[];
  onSendMessage: () => void;
  newMessage: string;
  setNewMessage: (msg: string) => void;
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  unreadCount: number;
  chatContainerRef: RefObject<HTMLDivElement>;
}

const ChatWidget = ({
  currentUser,
  messages,
  onSendMessage,
  newMessage,
  setNewMessage,
  showChat,
  setShowChat,
  unreadCount,
  chatContainerRef
}: ChatWidgetProps) => {
  if (!currentUser) return null;

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all transform hover:scale-105"
      >
        {showChat ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Chat Window */}
      {showChat && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-card rounded-xl border border-border shadow-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 bg-primary/5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-mono font-bold text-foreground">Production Chat</h3>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="p-1 hover:bg-muted/50 rounded transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="h-80 overflow-y-auto p-4 space-y-3"
          >
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.userId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {!isOwn && (
                          <p className="text-xs font-mono text-muted-foreground mb-1">
                            {msg.userName}
                          </p>
                        )}
                        <p className="text-sm break-words">{msg.message}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground/50 mt-1 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-accent text-sm text-foreground"
            />
            <button
              onClick={onSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;