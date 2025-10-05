import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Message, UserRole } from '../types';
import { PencilIcon, TrashIcon } from './icons';

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
}

const MessagingView: React.FC<MessagingViewProps> = ({ currentUser, users, messages, onSendMessage, onEditMessage, onTrashMessage, onRestoreMessage, onPermanentlyDeleteMessage, initialSelectedUserId }) => {
  const [viewMode, setViewMode] = useState<'inbox' | 'trash'>('inbox');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(initialSelectedUserId || null);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<{ id: number; text: string } | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const editInputRef = useRef<null | HTMLTextAreaElement>(null);

  const otherUsers = users.filter(u => u.id !== currentUser.id);
  const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

  useEffect(() => {
    if (viewMode === 'inbox' && otherUsers.length > 0 && selectedUserId === null) {
        setSelectedUserId(otherUsers[0].id);
    }
  }, [users, currentUser, selectedUserId, viewMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUserId]);

  useEffect(() => {
    if (editingMessage && editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.style.height = 'auto';
        editInputRef.current.style.height = `${editInputRef.current.scrollHeight}px`;
    }
  }, [editingMessage]);
  
  const handleSelectUser = (userId: number) => {
    setViewMode('inbox');
    setSelectedUserId(userId);
  };
  
  const handleSelectTrash = () => {
    setViewMode('trash');
    setSelectedUserId(null);
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  const conversation = useMemo(() => messages.filter(
    msg =>
      msg.status === 'active' &&
      ((msg.senderId === currentUser.id && msg.receiverId === selectedUserId) ||
      (msg.senderId === selectedUserId && msg.receiverId === currentUser.id))
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()), [messages, currentUser.id, selectedUserId]);
  
  const trashedMessages = useMemo(() => {
    const ninetyDaysAgo = new Date().getTime() - 90 * 24 * 60 * 60 * 1000;
    return messages
      .filter(m => 
        m.status === 'trashed' && 
        (m.deletedBy === currentUser.id || currentUser.role === UserRole.ADMIN) &&
        new Date(m.deletedTimestamp!).getTime() > ninetyDaysAgo
      )
      .sort((a, b) => new Date(b.deletedTimestamp!).getTime() - new Date(a.deletedTimestamp!).getTime());
  }, [messages, currentUser]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUserId) {
      onSendMessage(selectedUserId, newMessage.trim());
      setNewMessage('');
    }
  };
  
  const handleStartEdit = (msg: Message) => {
    setEditingMessage({ id: msg.id, text: msg.text });
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

  return (
    <div className="flex h-screen -my-16">
      <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
        </div>
        <div className="p-2">
            <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Folders</h3>
            <div onClick={handleSelectTrash} className={`p-2 flex items-center cursor-pointer rounded-md ${viewMode === 'trash' ? 'bg-primary-50' : 'hover:bg-slate-50'}`}>
                 <TrashIcon className="w-5 h-5 mr-3 text-slate-500" />
                 <p className={`font-semibold ${viewMode === 'trash' ? 'text-primary-700' : 'text-slate-700'}`}>Trash</p>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto border-t border-slate-200">
            <div className="p-2 pt-3">
                 <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Users</h3>
            </div>
          {otherUsers.map(user => (
            <div
              key={user.id}
              onClick={() => handleSelectUser(user.id)}
              className={`p-4 flex items-center cursor-pointer border-l-4 ${viewMode === 'inbox' && selectedUserId === user.id ? 'bg-primary-50 border-primary-600' : 'border-transparent hover:bg-slate-50'}`}
            >
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full mr-4" />
              <div>
                <p className="font-semibold text-slate-800">{user.name}</p>
                <p className="text-sm text-slate-500">{user.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-2/3 flex flex-col bg-slate-100">
        {viewMode === 'inbox' && selectedUser ? (
          <>
            <div className="p-4 border-b border-slate-200 bg-white flex items-center shadow-sm">
               <img src={selectedUser.avatar} alt={selectedUser.name} className="w-10 h-10 rounded-full mr-3" />
               <h2 className="text-xl font-bold text-slate-800">{selectedUser.name}</h2>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
                {conversation.map(msg => {
                    const isMyMessage = msg.senderId === currentUser.id;
                    const messageTime = new Date(msg.timestamp).getTime();
                    const currentTime = new Date().getTime();
                    const isEditable = isMyMessage && (currentTime - messageTime) < 2 * 60 * 1000;

                    return (
                        <div key={msg.id} className={`flex mb-2 items-start group ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                            {isMyMessage && editingMessage?.id !== msg.id && (
                                <div className="self-center mr-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                    <button onClick={() => onTrashMessage(msg.id)} className="text-slate-400 hover:text-rose-600 p-1" aria-label="Delete message">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                    {isEditable && !msg.edited && (
                                        <button onClick={() => handleStartEdit(msg)} className="text-slate-400 hover:text-slate-600 p-1" aria-label="Edit message">
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                            
                            <div className={`rounded-lg px-4 py-2 max-w-lg ${isMyMessage ? 'bg-primary-600 text-white' : 'bg-white shadow-sm'}`}>
                                {editingMessage?.id === msg.id ? (
                                    <div className="w-full">
                                        <textarea
                                            ref={editInputRef}
                                            value={editingMessage.text}
                                            onChange={(e) => {
                                                setEditingMessage({ ...editingMessage, text: e.target.value });
                                                e.target.style.height = 'auto';
                                                e.target.style.height = `${e.target.scrollHeight}px`;
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSaveEdit();
                                                }
                                                if (e.key === 'Escape') {
                                                    handleCancelEdit();
                                                }
                                            }}
                                            className="w-full bg-transparent text-white border-b border-primary-300 focus:outline-none resize-none overflow-hidden"
                                        />
                                        <div className="text-xs mt-2">
                                            <button onClick={handleSaveEdit} className="font-bold hover:underline text-white">Save</button>
                                            <span className="mx-1 text-primary-200">&middot;</span>
                                            <button onClick={handleCancelEdit} className="hover:underline text-primary-200">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-end">
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                        {msg.edited && <span className={`text-xs ml-2 ${isMyMessage ? 'text-primary-200' : 'text-slate-400'}`}>(edited)</span>}
                                    </div>
                                )}
                            </div>
                            {!isMyMessage && (
                                <div className="self-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => onTrashMessage(msg.id)} className="text-slate-400 hover:text-rose-600 p-1" aria-label="Delete message">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700">Send</button>
              </form>
            </div>
          </>
        ) : viewMode === 'trash' ? (
            <>
                <div className="p-4 border-b border-slate-200 bg-white flex items-center shadow-sm">
                   <TrashIcon className="w-6 h-6 mr-3 text-slate-600" />
                   <h2 className="text-xl font-bold text-slate-800">Trash</h2>
                </div>
                <div className="flex-1 p-6 overflow-y-auto space-y-3">
                    {trashedMessages.length > 0 ? trashedMessages.map(msg => {
                        const sender = userMap.get(msg.senderId);
                        const receiver = userMap.get(msg.receiverId);
                        const deletionDate = new Date(new Date(msg.deletedTimestamp!).getTime() + 90 * 24 * 60 * 60 * 1000);
                        const daysRemaining = Math.ceil((deletionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                        return (
                            <div key={msg.id} className="bg-white rounded-lg border border-slate-200 p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center text-sm text-slate-500 mb-2">
                                            <span>From: <strong>{sender?.name}</strong></span>
                                            <span className="mx-2">&rarr;</span>
                                            <span>To: <strong>{receiver?.name}</strong></span>
                                        </div>
                                        <p className="text-slate-800">{msg.text}</p>
                                    </div>
                                    <div className="text-right ml-4 flex-shrink-0">
                                        <p className={`text-xs font-semibold ${daysRemaining < 10 ? 'text-rose-600' : 'text-slate-500'}`}>
                                            Deletes in {daysRemaining} days
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            on {deletionDate.toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-end space-x-4">
                                    <button onClick={() => onRestoreMessage(msg.id)} className="text-sm font-semibold text-emerald-600 hover:underline">Restore</button>
                                    {currentUser.role === UserRole.ADMIN && (
                                        <button onClick={() => onPermanentlyDeleteMessage(msg.id)} className="text-sm font-semibold text-rose-600 hover:underline">Delete Forever</button>
                                    )}
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="text-center text-slate-500 pt-16">
                            <TrashIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-semibold">Trash is empty</h3>
                            <p>Messages deleted within the last 90 days will appear here.</p>
                        </div>
                    )}
                </div>
            </>
        ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
                <p>Select a user to start a conversation.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default MessagingView;