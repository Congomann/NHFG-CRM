import React, { useState, useRef, useEffect } from 'react';
import { User, Message } from '../types';
import { PencilIcon } from './icons';

interface MessagingViewProps {
  currentUser: User;
  users: User[];
  messages: Message[];
  onSendMessage: (receiverId: number, text: string) => void;
  onEditMessage: (messageId: number, newText: string) => void;
  initialSelectedUserId?: number;
}

const MessagingView: React.FC<MessagingViewProps> = ({ currentUser, users, messages, onSendMessage, onEditMessage, initialSelectedUserId }) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(initialSelectedUserId || null);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<{ id: number; text: string } | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const editInputRef = useRef<null | HTMLTextAreaElement>(null);

  const otherUsers = users.filter(u => u.id !== currentUser.id);

  useEffect(() => {
    if (otherUsers.length > 0 && selectedUserId === null) {
        setSelectedUserId(otherUsers[0].id);
    }
  }, [users, currentUser, selectedUserId]);

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

  const selectedUser = users.find(u => u.id === selectedUserId);

  const conversation = messages.filter(
    msg =>
      (msg.senderId === currentUser.id && msg.receiverId === selectedUserId) ||
      (msg.senderId === selectedUserId && msg.receiverId === currentUser.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

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
        <div className="flex-1 overflow-y-auto">
          {otherUsers.map(user => (
            <div
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className={`p-4 flex items-center cursor-pointer border-l-4 ${selectedUserId === user.id ? 'bg-primary-50 border-primary-600' : 'border-transparent hover:bg-slate-50'}`}
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
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-slate-200 bg-white flex items-center shadow-sm">
               <img src={selectedUser.avatar} alt={selectedUser.name} className="w-10 h-10 rounded-full mr-3" />
               <h2 className="text-xl font-bold text-slate-800">{selectedUser.name}</h2>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
                {conversation.map(msg => {
                    const messageTime = new Date(msg.timestamp).getTime();
                    const currentTime = new Date().getTime();
                    const isEditable = (currentTime - messageTime) < 2 * 60 * 1000; // 2 minutes in milliseconds

                    return (
                        <div key={msg.id} className={`flex mb-2 items-start group ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                            {msg.senderId === currentUser.id && editingMessage?.id !== msg.id && (
                                <div className="self-center mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isEditable && !msg.edited && (
                                        <button onClick={() => handleStartEdit(msg)} className="text-slate-400 hover:text-slate-600 p-1" aria-label="Edit message">
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                            
                            <div className={`rounded-lg px-4 py-2 max-w-lg ${msg.senderId === currentUser.id ? 'bg-primary-600 text-white' : 'bg-white shadow-sm'}`}>
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
                                        {msg.edited && <span className={`text-xs ml-2 ${msg.senderId === currentUser.id ? 'text-primary-200' : 'text-slate-400'}`}>(edited)</span>}
                                    </div>
                                )}
                            </div>
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