import React, { useState, useMemo } from 'react';
import { DashboardIcon, ClientsIcon, CrmLogoIcon, TasksIcon, ChevronDownIcon, MessageIcon, UserCircleIcon, DollarSignIcon, PencilIcon, ShieldIcon, BellIcon, EyeIcon, CalendarDaysIcon, ChatBubbleLeftRightIcon, AiSparklesIcon, UsersIcon, ShieldCheckIcon, BroadcastIcon } from './icons';
import { User, UserRole, Notification, NotificationType } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User;
  onEditMyProfile: () => void;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onClearAllNotifications: (userId: number) => void;
  impersonatedRole: UserRole | null;
}

const navConfig = {
  [UserRole.ADMIN]: [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <AiSparklesIcon /> },
    { id: 'clients', label: 'Clients', icon: <ClientsIcon /> },
    { id: 'agents', label: 'Agents', icon: <ClientsIcon /> },
    { id: 'tasks', label: 'Tasks', icon: <TasksIcon /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDaysIcon /> },
    { id: 'commissions', label: 'Commissions', icon: <DollarSignIcon /> },
    { id: 'messages', label: 'Messages', icon: <MessageIcon /> },
  ],
  [UserRole.SUB_ADMIN]: [
    { id: 'dashboard', label: 'Lead Dashboard', icon: <DashboardIcon /> },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <AiSparklesIcon /> },
    { id: 'leads', label: 'Lead Distribution', icon: <ClientsIcon /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDaysIcon /> },
    { id: 'messages', label: 'Messages', icon: <MessageIcon /> },
  ],
  [UserRole.AGENT]: [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <AiSparklesIcon /> },
    { id: 'clients', label: 'My Clients', icon: <ClientsIcon /> },
    { id: 'tasks', label: 'My Tasks', icon: <TasksIcon /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDaysIcon /> },
    { id: 'commissions', label: 'Commissions', icon: <DollarSignIcon /> },
    { id: 'messages', label: 'Messages', icon: <MessageIcon /> },
    { id: 'testimonials', label: 'Testimonials', icon: <ChatBubbleLeftRightIcon /> },
    { id: 'licenses', label: 'Licenses', icon: <ShieldIcon /> },
    { id: 'my-profile', label: 'My Public Profile', icon: <UserCircleIcon /> },
  ],
};


const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, currentUser, onEditMyProfile, notifications, onNotificationClick, onClearAllNotifications, impersonatedRole }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const displayRole = impersonatedRole || currentUser.role;
  const navItems = navConfig[displayRole];

  const baseClasses = 'flex items-center px-3 py-2.5 text-sm font-medium rounded-md';
  const activeClasses = 'bg-primary-600 text-white shadow-sm';
  const inactiveClasses = 'text-slate-400 hover:bg-slate-800 hover:text-white';
  
  const userNotifications = useMemo(() => {
    return notifications
        .filter(n => n.userId === currentUser.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, currentUser.id]);

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleNotificationItemClick = (notification: Notification) => {
    onNotificationClick(notification);
    setIsNotificationsOpen(false);
  };
  
  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
  }

  const getNotificationIcon = (type: NotificationType) => {
    const iconClass = "w-5 h-5 flex-shrink-0";
    switch (type) {
      case NotificationType.NEW_MESSAGE:
        return <MessageIcon className={`${iconClass} text-sky-500`} />;
      case NotificationType.LEAD_ASSIGNED:
        return <UsersIcon className={`${iconClass} text-emerald-500`} />;
      case NotificationType.TASK_DUE:
        return <TasksIcon className={`${iconClass} text-amber-500`} />;
      case NotificationType.AGENT_APPROVED:
        return <ShieldCheckIcon className={`${iconClass} text-violet-500`} />;
      case NotificationType.BROADCAST:
        return <BroadcastIcon className={`${iconClass} text-rose-500`} />;
      default:
        return <BellIcon className={`${iconClass} text-slate-500`} />;
    }
  };

  return (
    <div className="w-64 bg-slate-900 h-screen p-4 flex flex-col fixed shadow-2xl">
      <div className="flex items-center justify-between mb-10 px-2">
        <CrmLogoIcon className="w-40" variant="dark" />
        <div className="relative">
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="text-slate-400 hover:text-white relative">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">{unreadCount}</span>}
            </button>
            {isNotificationsOpen && (
                 <div className="absolute top-full mt-2 right-0 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-20 modal-panel">
                    <div className="p-3 flex justify-between items-center border-b border-slate-700">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        <button onClick={() => onClearAllNotifications(currentUser.id)} className="text-xs text-primary-400 hover:underline">Mark all as read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {userNotifications.length > 0 ? userNotifications.map(n => (
                            <div key={n.id} onClick={() => handleNotificationItemClick(n)} className="p-3 flex items-start border-b border-slate-700 hover:bg-slate-700 cursor-pointer">
                                <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                                <div className="ml-3">
                                    <p className={`text-sm ${n.isRead ? 'text-slate-400' : 'text-white'}`}>{n.message}</p>
                                    <p className="text-xs text-slate-500 mt-1">{timeSince(n.timestamp)}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="p-4 text-center text-sm text-slate-400">No notifications yet.</p>
                        )}
                    </div>
                 </div>
            )}
        </div>
      </div>
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`${baseClasses} ${currentView.startsWith(item.id) ? activeClasses : inactiveClasses} w-full text-left button-press`}
              >
                <span className="mr-3">{React.cloneElement(item.icon, { className: 'w-5 h-5' })}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto relative">
        <div className="p-2 rounded-lg hover:bg-slate-800 cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="flex items-center">
            <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-slate-700" />
            <div className="ml-3 flex-1">
                <p className="font-semibold text-sm text-white">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.title}</p>
            </div>
            <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
        {isDropdownOpen && (
            <div className="absolute bottom-full mb-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-1 z-10 modal-panel">
                <a href="#" onClick={(e) => { e.preventDefault(); onEditMyProfile(); setIsDropdownOpen(false); }} className="flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-700">
                    <PencilIcon className="w-4 h-4 mr-3 text-slate-400" />
                    <span>Edit My Profile</span>
                </a>
            </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;