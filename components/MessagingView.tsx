import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Message, UserRole } from '../types';
import { PencilIcon, TrashIcon, BroadcastIcon, ArrowUpIcon } from './icons';
import { useToast } from '../contexts/ToastContext';

interface MessagingViewProps {
  currentUser: User;
  users: User[];
  messages: Message[];
  onSendMessage: (receiverId: number, text: string) => void;
  onEditMessage: (messageId: number, newText: string) => void;
  onTrashMessage: (messageId: number) => void;
  onRestoreMessage: (messageId: number) => void;
  onPermanentlyDeleteMessage: (messageId: number) => void;
  initialSelectedUserId?: number;
  onMarkConversationAsRead: (senderId: number) => void;
  onOpenBroadcast: () => void;
  onTyping: () => void;
  typingStatus: Record<number, boolean>;
}

// --- Helper Functions for iMessage UI ---

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

const formatDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) {
        return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    if (isSameDay(date, yesterday)) {
        return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (date > oneWeekAgo) {
        return date.toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const DateSeparator: React.FC<{date: string}> = ({date}) => (
    <div className="flex justify-center my-4">
        <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 rounded-full px-3 py-1">
            {formatDateSeparator(date)}
        </span>
    </div>
);

const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (isSameDay(date, today)) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    if (isSameDay(date, yesterday)) {
        return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
};


const MessagingView: React.FC<MessagingViewProps> = ({ currentUser, users, messages, onSendMessage, onEditMessage, onTrashMessage, initialSelectedUserId, onMarkConversationAsRead, onOpenBroadcast, onTyping, typingStatus }) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(initialSelectedUserId || null);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<{ id: number; text: string } | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const editInputRef = useRef<null | HTMLTextAreaElement>(null);
  const textareaRef = useRef<null | HTMLTextAreaElement>(null);
  const { addToast } = useToast();

  const otherUsers = users.filter(u => u.id !== currentUser.id);

  useEffect(() => {
    if (otherUsers.length > 0 && selectedUserId === null) {
        setSelectedUserId(otherUsers[0].id);
    }
  }, [users, currentUser, selectedUserId]);

  useEffect(() => {
    if (selectedUserId) {
        onMarkConversationAsRead(selectedUserId);
    }
  }, [selectedUserId, onMarkConversationAsRead, messages]);

  useEffect(() => {
    if (editingMessage && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.style.height = 'auto';
      editInputRef.current.style.height = `${editInputRef.current.scrollHeight}px`;
    }
  }, [editingMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUserId, typingStatus]);
  
  const conversation = useMemo(() => messages.filter(
    msg =>
      msg.status === 'active' &&
      ((msg.senderId === currentUser.id && msg.receiverId === selectedUserId) ||
      (msg.senderId === selectedUserId && msg.receiverId === currentUser.id))
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()), [messages, currentUser.id, selectedUserId]);

  const lastMyMessage = useMemo(() => {
    return [...conversation].reverse().find(m => m.senderId === currentUser.id);
  }, [conversation, currentUser.id]);

  const conversationData = useMemo(() => {
    const data: Record<string, { lastMessage: Message | null; unreadCount: number; }> = {};
    otherUsers.forEach(user => {
        const userMessages = messages
            .filter(m => m.status === 'active' && ((m.senderId === user.id && m.receiverId === currentUser.id) || (m.senderId === currentUser.id && m.receiverId === user.id)))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        data[user.id] = {
            lastMessage: userMessages[0] || null,
            unreadCount: userMessages.filter(m => m.receiverId === currentUser.id && !m.isRead).length
        };
    });
    return data;
  }, [messages, currentUser.id, otherUsers]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUserId) {
      onSendMessage(selectedUserId, newMessage.trim());
      setNewMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height
      }
    }
  };
  
    const handleStartEdit = (message: Message) => {
        const messageTime = new Date(message.timestamp).getTime();
        const currentTime = new Date().getTime();
        if ((currentTime - messageTime) > 2 * 60 * 1000) { // 2 minute edit window
            addToast('Edit Error', 'You can only edit messages sent within the last 2 minutes.', 'warning');
            return;
        }
        setEditingMessage({ id: message.id, text: message.text });
    };

    const handleCancelEdit = () => {
        setEditingMessage(null);
    };

    const handleSaveEdit = () => {
        if (editingMessage && editingMessage.text.trim()) {
            onEditMessage(editingMessage.id, editingMessage.text.trim());
        }
        setEditingMessage(null);
    };


  const selectedUser = users.find(u => u.id === selectedUserId);

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    const maxHeight = 120; // max height of ~6 lines
    target.style.height = `${Math.min(target.scrollHeight, maxHeight)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e as any);
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Left Pane: Conversation List */}
      <div className="w-full max-w-sm border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center h-[73px]">
            <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
            {currentUser.role === UserRole.ADMIN && (
                <button 
                    onClick={onOpenBroadcast} 
                    className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                    aria-label="Broadcast an announcement"
                >
                    <BroadcastIcon className="w-5 h-5 mr-2" /> Broadcast
                </button>
            )}
        </div>
        <div className="flex-1 overflow-y-auto">
            {otherUsers.map(user => {
                const data = conversationData[user.id];
                const lastMessage = data?.lastMessage;
                const unreadCount = data?.unreadCount || 0;
                const isSelected = selectedUserId === user.id;

                return (
                    <div
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        className={`p-3 flex items-center cursor-pointer relative ${isSelected ? 'bg-blue-500' : 'hover:bg-slate-100'}`}
                    >
                        {unreadCount > 0 && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full absolute left-2 top-1/2 -translate-y-1/2"></span>}
                        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full mr-3 flex-shrink-0" />
                        <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-baseline">
                                <p className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
                                {lastMessage && <p className={`text-xs ml-2 flex-shrink-0 ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>{formatTimestamp(lastMessage.timestamp)}</p>}
                            </div>
                            <p className={`text-sm truncate ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                                {lastMessage ? (
                                    <>
                                        {lastMessage.senderId === currentUser.id && 'You: '}
                                        {lastMessage.text}
                                    </>
                                ) : (
                                    <span className="italic">No messages yet.</span>
                                )}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Right Pane: Chat Window */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {selectedUser ? (
          <>
            <div className="py-3 border-b border-slate-200 bg-slate-100/80 backdrop-blur-md flex flex-col items-center justify-center shadow-sm h-[73px]">
               <img src={selectedUser.avatar} alt={selectedUser.name} className="w-10 h-10 rounded-full" />
               <h2 className="text-sm font-semibold text-slate-800 mt-1">{selectedUser.name}</h2>
            </div>
            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                <div className="flex flex-col">
                    {conversation.map((msg, index) => {
                        const prevMsg = conversation[index - 1];
                        const nextMsg = conversation[index + 1];

                        const isMyMessage = msg.senderId === currentUser.id;
                        const showDateSeparator = !prevMsg || !isSameDay(new Date(msg.timestamp), new Date(prevMsg.timestamp));

                        const isFirstInSequence = !prevMsg || prevMsg.senderId !== msg.senderId || !isSameDay(new Date(msg.timestamp), new Date(prevMsg.timestamp));
                        const isLastInSequence = !nextMsg || nextMsg.senderId !== msg.senderId || !isSameDay(new Date(msg.timestamp), new Date(nextMsg.timestamp));
                        
                        const bubbleClasses = [
                            'px-3.5 py-2 rounded-2xl max-w-md lg:max-w-xl break-words relative',
                            isMyMessage ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-900',
                            isLastInSequence && isMyMessage ? 'rounded-br-md' : '',
                            isLastInSequence && !isMyMessage ? 'rounded-bl-md' : '',
                        ].join(' ');
                        
                        const isEditingThis = editingMessage?.id === msg.id;

                        return (
                             <React.Fragment key={msg.id}>
                                {showDateSeparator && <DateSeparator date={msg.timestamp} />}
                                <div className={`flex items-start gap-2.5 group ${isMyMessage ? 'justify-end' : 'justify-start'} ${isFirstInSequence ? 'mt-2' : 'mt-0.5'}`}>
                                    {!isMyMessage && (
                                        <div className="w-8 flex-shrink-0 self-end">
                                            {isLastInSequence && <img src={selectedUser.avatar} alt={selectedUser.name} className="w-8 h-8 rounded-full" />}
                                        </div>
                                    )}
                                    <div className={`flex items-center ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={bubbleClasses}>
                                            {isEditingThis ? (
                                                <div className="w-80">
                                                    <textarea
                                                        ref={editInputRef}
                                                        value={editingMessage.text}
                                                        onChange={(e) => setEditingMessage(prev => prev ? { ...prev, text: e.target.value } : null)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
                                                            if (e.key === 'Escape') { e.preventDefault(); handleCancelEdit(); }
                                                        }}
                                                        className="w-full bg-blue-600 text-white rounded-lg focus:outline-none resize-none"
                                                        rows={1}
                                                        onInput={handleTextareaInput}
                                                    />
                                                    <div className="text-xs text-blue-200 mt-1">
                                                        <button onClick={handleSaveEdit} className="font-semibold hover:underline">Save</button> &middot; <button onClick={handleCancelEdit} className="hover:underline">Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap">{msg.text} {msg.edited && <span className="text-xs opacity-70 ml-1">(edited)</span>}</p>
                                            )}
                                        </div>
                                        {isMyMessage && (
                                            <div className="flex items-center self-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                                                <button onClick={() => handleStartEdit(msg)} className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-200" aria-label="Edit message"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={() => onTrashMessage(msg.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-slate-200" aria-label="Delete message"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                     {typingStatus[selectedUserId] && selectedUser && (
                        <div className="flex items-end gap-2 justify-start mt-2">
                            <div className="w-8 flex-shrink-0">
                                <img src={selectedUser.avatar} alt={selectedUser.name} className="w-8 h-8 rounded-full" />
                            </div>
                            <div className="px-4 py-3 rounded-2xl bg-slate-200 text-slate-900 flex items-center rounded-bl-md">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        </div>
                    )}
                </div>
                 {lastMyMessage && lastMyMessage.isRead && (
                    <div className="text-right text-xs text-slate-500 mt-1 pr-2">
                        Read
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-slate-100 border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    onTyping();
                  }}
                  onInput={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selectedUser.name}`}
                  className="w-full px-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-[120px]"
                  rows={1}
                />
                <button type="submit" disabled={!newMessage.trim()} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${newMessage.trim() ? 'bg-blue-500 text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}>
                    <ArrowUpIcon className="w-5 h-5"/>
                </button>
              </form>
            </div>
          </>
        ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
                <p>Select a conversation to begin messaging.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default MessagingView;