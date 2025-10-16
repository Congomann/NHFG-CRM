import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientDetail from './components/ClientDetail';
import AddClientModal from './components/AddClientModal';
import TasksView from './components/TasksView';
import AgentManagement from './components/AgentManagement';
import LeadDistribution from './components/LeadDistribution';
import AddEditLeadModal from './components/AddEditLeadModal';
import MessagingView from './components/MessagingView';
import AgentProfile from './components/AgentProfile';
import CommissionsView from './components/CommissionsView';
import AddEditAgentModal from './components/AddEditAgentModal';
import EditMyProfileModal from './components/EditMyProfileModal';
import AddEditPolicyModal from './components/AddEditPolicyModal';
import LicensesView from './components/LicensesView';
import CalendarView from './components/CalendarView';
import TestimonialsManagement from './components/TestimonialsManagement';
import BroadcastModal from './components/BroadcastModal';
import DemoModeSwitcher from './components/DemoModeSwitcher';
import PublicLayout from './components/PublicLayout';
import HomePage from './components/HomePage';
import AIAssistantView from './components/AIAssistantView';
import Login from './components/Login';
import Register from './components/Register';
import VerifyEmail from './components/VerifyEmail';
import PendingApproval from './components/PendingApproval';

import { useDatabase } from './hooks/useDatabase';
import { Client, Policy, Task, User, UserRole, Agent, ClientStatus, Message, AgentStatus, License, Notification, Testimonial } from './types';
import { ToastProvider, useToast } from './contexts/ToastContext';
import * as authService from './services/authService';

const NotificationHandler: React.FC<{ notifications: Notification[]; currentUser: User | null }> = ({ notifications, currentUser }) => {
  const { addToast } = useToast();
  const prevNotificationsRef = useRef<Notification[]>([]);

  useEffect(() => {
    if (currentUser) {
        const prevNotificationIds = new Set(prevNotificationsRef.current.map(n => n.id));
        const newUnreadNotifications = notifications.filter(
            n => !prevNotificationIds.has(n.id) && n.userId === currentUser.id
        );

        newUnreadNotifications.forEach(notification => {
            addToast('New Notification', notification.message, 'info');
        });
    }
    prevNotificationsRef.current = notifications;
  }, [notifications, currentUser, addToast]);

  return null; // This component doesn't render anything
};

const AuthenticatedApp: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const { isLoading: isDataLoading, users, agents, clients, policies, interactions, tasks, messages, licenses, notifications, calendarNotes, testimonials, handlers } = useDatabase(user);

  // UI state
  const [currentView, setCurrentView] = useState(window.location.hash.replace(/^#\/?/, '') || 'dashboard');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Client | null>(null);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isMyProfileModalOpen, setIsMyProfileModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [policyToEdit, setPolicyToEdit] = useState<Policy | null>(null);
  const [currentClientIdForPolicy, setCurrentClientIdForPolicy] = useState<number | null>(null);
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null);
  const [clientListAgentFilter, setClientListAgentFilter] = useState<Agent | null>(null);
  const [highlightedAgentId, setHighlightedAgentId] = useState<number | null>(null);
  const [impersonatedUserId, setImpersonatedUserId] = useState<number | null>(null);
  const [typingStatus, setTypingStatus] = useState<Record<number, boolean>>({});
  const typingTimeoutRef = useRef<Record<number, number>>({});

  useEffect(() => {
    const getViewFromHash = () => window.location.hash.replace(/^#\/?/, '') || 'dashboard';

    const syncViewFromHash = () => {
        const viewFromHash = getViewFromHash();
        if (currentView !== viewFromHash) {
            if (currentView === 'clients' && !viewFromHash.startsWith('clients')) setClientListAgentFilter(null);
            setCurrentView(viewFromHash);
        }
    };

    syncViewFromHash();
    window.addEventListener('hashchange', syncViewFromHash);
    return () => window.removeEventListener('hashchange', syncViewFromHash);
  }, [currentView]);


  const displayUser = useMemo(() => {
    if (impersonatedUserId === null || !users || users.length === 0) {
      return user;
    }
    return users.find(u => u.id === impersonatedUserId) || user;
  }, [impersonatedUserId, user, users]);


  const handleNavigation = (view: string) => {
    window.location.hash = `/${view}`;
  };
  
  const handleTyping = () => {
    if (!displayUser) return;

    const currentUserId = displayUser.id;

    if (typingTimeoutRef.current[currentUserId]) {
        clearTimeout(typingTimeoutRef.current[currentUserId]);
    }

    setTypingStatus(prev => ({ ...prev, [currentUserId]: true }));

    typingTimeoutRef.current[currentUserId] = window.setTimeout(() => {
        setTypingStatus(prev => ({ ...prev, [currentUserId]: false }));
    }, 3000);
  };


  const handleNotificationClick = (notification: Notification) => {
    handleNavigation(notification.link);
  };

  const handleMessageAgent = (agentId: number) => handleNavigation(`messages/${agentId}`);

  const handleViewAgentClients = (agentId: number) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setClientListAgentFilter(agent);
      handleNavigation('clients');
    }
  };
  
  const handleOpenAddAgentModal = () => {
    setAgentToEdit(null);
    setIsAgentModalOpen(true);
  };
  
  const handleOpenAddPolicyModal = (clientId: number) => {
    setPolicyToEdit(null);
    setCurrentClientIdForPolicy(clientId);
    setIsPolicyModalOpen(true);
  };

  const handleOpenEditPolicyModal = (policy: Policy) => {
    setPolicyToEdit(policy);
    setCurrentClientIdForPolicy(policy.clientId);
    setIsPolicyModalOpen(true);
  };

  const handleSavePolicy = async (policyData: Omit<Policy, 'id'> & { id?: number }) => {
    await handlers.handleSavePolicy(policyData);
    setIsPolicyModalOpen(false);
    setPolicyToEdit(null);
    setCurrentClientIdForPolicy(null);
  };
  
  const handleUpdateMyProfile = async (updatedUser: User) => {
      await handlers.handleUpdateMyProfile(updatedUser);
      setIsMyProfileModalOpen(false);
  };
  
  const handleOpenCreateLeadModal = () => {
    setLeadToEdit(null);
    setIsLeadModalOpen(true);
  };

  const handleOpenEditLeadModal = (lead: Client) => {
    setLeadToEdit(lead);
    setIsLeadModalOpen(true);
  };
  
  const isAgentProfileView = currentView.startsWith('agent/');

  const handleAddLeadFromProfile = useCallback(async (leadData: { firstName: string; lastName: string; email: string; phone: string; message: string; }, agentId: number) => {
    await handlers.handleAddLeadFromProfile(leadData, agentId);
  }, [handlers]);

  const handleAddTestimonialFromProfile = useCallback(async (testimonialData: Omit<Testimonial, 'id' | 'status' | 'submissionDate'>) => {
      // Logic is handled in the backend now.
  }, []);

  const handleSendBroadcast = async (message: string) => {
    await handlers.handleBroadcastMessage(message);
    setIsBroadcastModalOpen(false);
  };

  const renderContent = () => {
    const publicViews = ['home', 'about', 'services', 'contact', ''];
    const currentViewPath = currentView.split('/')[0];

    if (publicViews.includes(currentViewPath)) {
        return (
            <PublicLayout onNavigate={handleNavigation}>
                <HomePage onNavigate={handleNavigation} />
            </PublicLayout>
        );
    }
    
    if (currentView.startsWith('client/')) {
      const clientId = parseInt(currentView.split('/')[1], 10);
      const client = clients.find(c => c.id === clientId);
      if (client) {
        return <ClientDetail 
                    client={client} 
                    policies={policies.filter(p => p.clientId === clientId)} 
                    interactions={interactions.filter(i => i.clientId === clientId)} 
                    assignedAgent={agents.find(a => a.id === client.agentId)}
                    onBack={() => handleNavigation(displayUser.role === UserRole.SUB_ADMIN ? 'leads' : 'clients')}
                    currentUser={displayUser}
                    onUpdateStatus={handlers.handleUpdateClientStatus}
                    onOpenAddPolicyModal={() => handleOpenAddPolicyModal(client.id)}
                    onOpenEditPolicyModal={handleOpenEditPolicyModal}
                    onUpdatePolicy={handlers.handleUpdatePolicy}
                    />;
      }
    }

    if (currentView.startsWith('ai-assistant')) {
        return <AIAssistantView
            currentUser={displayUser}
            clients={clients}
            tasks={tasks}
            agents={agents}
            policies={policies}
            interactions={interactions}
            onSaveTask={handlers.handleSaveTask}
            onAssignLead={handlers.handleUpdateClient}
            onNavigate={handleNavigation}
        />;
    }

    if (isAgentProfileView) {
        const agentSlug = currentView.split('/')[1];
        const agent = agents.find(a => a.slug === agentSlug);
        if (agent) {
            return <AgentProfile 
                agent={agent} 
                onAddLead={(leadData) => handleAddLeadFromProfile(leadData, agent.id)}
                currentUser={user}
                onMessageAgent={handleMessageAgent}
                onViewAgentClients={handleViewAgentClients}
                onUpdateProfile={() => {}}
                licenses={licenses.filter(l => l.agentId === agent.id)}
                onAddLicense={handlers.handleAddLicense}
                onDeleteLicense={handlers.onDeleteLicense}
                testimonials={testimonials}
                onAddTestimonial={handleAddTestimonialFromProfile}
            />;
        }
    }
    
    if (currentView.startsWith('messages')) {
        const preselectedId = currentView.split('/')[1];
        return <MessagingView 
                    currentUser={displayUser}
                    users={users}
                    messages={messages}
                    onSendMessage={handlers.handleSendMessage}
                    onEditMessage={handlers.handleEditMessage}
                    initialSelectedUserId={preselectedId ? Number(preselectedId) : undefined}
                    onTrashMessage={handlers.handleTrashMessage}
                    onRestoreMessage={handlers.handleRestoreMessage}
                    onPermanentlyDeleteMessage={handlers.handlePermanentlyDeleteMessage}
                    onMarkConversationAsRead={handlers.handleMarkConversationAsRead}
                    onOpenBroadcast={() => setIsBroadcastModalOpen(true)}
                    onTyping={handleTyping}
                    typingStatus={typingStatus}
                />;
    }

    switch (currentView) {
      case 'clients':
        if (displayUser.role === UserRole.ADMIN || displayUser.role === UserRole.AGENT) {
            return <ClientList 
                        title={clientListAgentFilter ? `${clientListAgentFilter.name}'s Clients` : (displayUser.role === UserRole.ADMIN ? 'All Clients' : 'My Clients')}
                        clients={clientListAgentFilter ? clients.filter(c => c.agentId === clientListAgentFilter.id) : clients}
                        onSelectClient={(id) => handleNavigation(`client/${id}`)}
                        onAddClient={() => setIsClientModalOpen(true)}
                        agentFilter={clientListAgentFilter}
                        onClearFilter={() => setClientListAgentFilter(null)}
                         />;
        }
        break;
      case 'tasks':
        if (displayUser.role === UserRole.ADMIN || displayUser.role === UserRole.AGENT) {
            return <TasksView 
                        tasks={tasks}
                        clients={clients}
                        onSaveTask={handlers.handleSaveTask}
                        onToggleTask={handlers.handleToggleTask}
                        onDeleteTask={handlers.handleDeleteTask}
                        onSelectClient={(id) => handleNavigation(`client/${id}`)}
                    />;
        }
        break;
      case 'agents':
        if (displayUser.role === UserRole.ADMIN) {
            return <AgentManagement 
                        agents={agents} 
                        users={users}
                        onNavigate={handleNavigation}
                        onAddAgent={handleOpenAddAgentModal}
                        onEditAgent={() => {}}
                        onApproveAgent={handlers.handleApproveAgent}
                        onDeactivateAgent={handlers.handleDeactivateAgent}
                        onReactivateAgent={handlers.handleReactivateAgent}
                        onRejectAgent={handlers.handleRejectAgent}
                        onDeleteAgent={handlers.handleDeleteAgent}
                        highlightedAgentId={highlightedAgentId}
                    />;
        }
        break;
      case 'leads':
        if (displayUser.role === UserRole.SUB_ADMIN) {
            return <LeadDistribution 
                        leads={clients.filter(c => c.status === ClientStatus.LEAD)} 
                        onSelectLead={(id) => handleNavigation(`client/${id}`)}
                        onCreateLead={handleOpenCreateLeadModal}
                        onEditLead={handleOpenEditLeadModal}
                        onDeleteLead={() => {}} />;
        }
        break;
      case 'calendar':
        return <CalendarView
            currentUser={user}
            users={users}
            notes={calendarNotes}
            onSaveNote={handlers.handleSaveCalendarNote}
            onDeleteNote={handlers.handleDeleteCalendarNote}
        />;
      case 'commissions':
        if (displayUser.role === UserRole.ADMIN || displayUser.role === UserRole.AGENT) {
            return <CommissionsView
                        currentUser={displayUser}
                        agents={agents}
                        policies={policies}
                        clients={clients}
                        onUpdatePolicy={handlers.handleUpdatePolicy}
                    />;
        }
        break;
       case 'licenses':
        if (displayUser.role === UserRole.AGENT) {
            const agent = agents.find(a => a.id === displayUser.id);
            if (agent) {
                return <LicensesView
                    agent={agent}
                    licenses={licenses.filter(l => l.agentId === agent.id)}
                    onAddLicense={handlers.handleAddLicense}
                    onDeleteLicense={handlers.onDeleteLicense}
                />;
            }
        }
        break;
      case 'testimonials':
        if (displayUser.role === UserRole.AGENT) {
            return <TestimonialsManagement
                testimonials={testimonials.filter(t => t.agentId === displayUser.id)}
                onUpdateTestimonialStatus={handlers.handleUpdateTestimonialStatus}
                onDeleteTestimonial={handlers.handleDeleteTestimonial}
                onNavigate={handleNavigation}
            />;
        }
        break;
      case 'my-profile':
        if (displayUser.role === UserRole.AGENT) {
            const agent = agents.find(a => a.id === displayUser.id);
            if (agent) {
                return <AgentProfile 
                    agent={agent} 
                    onAddLead={(leadData) => handleAddLeadFromProfile(leadData, agent.id)}
                    currentUser={displayUser}
                    onMessageAgent={handleMessageAgent}
                    onViewAgentClients={handleViewAgentClients}
                    onUpdateProfile={() => {}}
                    licenses={licenses.filter(l => l.agentId === agent.id)}
                    onAddLicense={handlers.handleAddLicense}
                    onDeleteLicense={handlers.onDeleteLicense}
                    testimonials={testimonials}
                    onAddTestimonial={handleAddTestimonialFromProfile}
                    isEmbedded={true}
                />;
            }
        }
        break;
      case 'dashboard':
      default:
        // Fallback to dashboard for unknown CRM views
        return <Dashboard 
                user={displayUser}
                clients={clients}
                policies={policies}
                tasks={tasks}
                agentsCount={agents.filter(a => a.status === AgentStatus.ACTIVE).length}
                agents={agents}
               />;
    }
  };
  
      if (isDataLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mb-4"></div>
                <div className="text-xl font-semibold text-slate-600">Loading CRM...</div>
            </div>
        );
      }
      
      const subAdminUser = users.find(u => u.role === UserRole.SUB_ADMIN);
      const activeAgents = useMemo(() => agents.filter(a => a.status === AgentStatus.ACTIVE), [agents]);

      const publicViews = ['home', 'about', 'services', 'contact', ''];
      const isPublicSiteView = publicViews.includes(currentView.split('/')[0]);

      return (
        <div className="h-screen bg-background font-sans">
          {isPublicSiteView ? (
             <div className="page-enter">
                {renderContent()}
             </div>
          ) : (
            <div className="flex h-full">
                <Sidebar 
                    currentUser={user}
                    currentView={currentView} 
                    onNavigate={handleNavigation}
                    onEditMyProfile={() => setIsMyProfileModalOpen(true)}
                    notifications={notifications}
                    onNotificationClick={handleNotificationClick}
                    onClearAllNotifications={() => {}}
                    impersonatedRole={impersonatedUserId ? displayUser.role : null}
                    onLogout={onLogout}
                />
                <main className={`flex-1 overflow-y-auto relative ml-64`}>
                    {user.role === UserRole.ADMIN && (
                    <DemoModeSwitcher
                        adminUser={user}
                        subAdminUser={subAdminUser}
                        agents={activeAgents}
                        impersonatedUserId={impersonatedUserId}
                        onSwitchUser={setImpersonatedUserId}
                    />
                    )}
                    <div key={currentView + displayUser.role + displayUser.id} className={`page-enter ${currentView.startsWith('messages') ? 'h-full' : ''}`}>
                        {renderContent()}
                    </div>
                </main>
            </div>
          )}
          
          <AddClientModal 
            isOpen={isClientModalOpen} 
            onClose={() => setIsClientModalOpen(false)}
            onAddClient={(client) => { handlers.handleAddClient(client); setIsClientModalOpen(false); }}
          />
          <AddEditLeadModal
            isOpen={isLeadModalOpen}
            onClose={() => setIsLeadModalOpen(false)}
            onSave={handlers.handleUpdateClient as any}
            agents={agents}
            leadToEdit={leadToEdit}
          />
          <AddEditAgentModal
            isOpen={isAgentModalOpen}
            onClose={() => setIsAgentModalOpen(false)}
            onSave={() => {}}
            agentToEdit={agentToEdit}
          />
          <EditMyProfileModal
            isOpen={isMyProfileModalOpen}
            onClose={() => setIsMyProfileModalOpen(false)}
            onSave={handleUpdateMyProfile}
            currentUser={user}
          />
          <AddEditPolicyModal
            isOpen={isPolicyModalOpen}
            onClose={() => setIsPolicyModalOpen(false)}
            onSave={handleSavePolicy}
            policyToEdit={policyToEdit}
            clientId={currentClientIdForPolicy}
          />
          <BroadcastModal
            isOpen={isBroadcastModalOpen}
            onClose={() => setIsBroadcastModalOpen(false)}
            onSend={handleSendBroadcast}
          />
          <NotificationHandler notifications={notifications} currentUser={user} />
        </div>
      );
}

type AuthState = 'initializing' | 'authenticated' | 'unauthenticated' | 'needsVerification' | 'pendingApproval';

const App: React.FC = () => {
    const [authState, setAuthState] = useState<AuthState>('initializing');
    const [authView, setAuthView] = useState<'login' | 'register'>('login');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);
    const { addToast } = useToast();

    const checkAuthStatus = useCallback(async () => {
        const token = authService.getToken();
        if (token) {
            try {
                const { user, agentStatus } = await authService.getMe();
                if (user) {
                    if (!user.isVerified && user.role !== UserRole.ADMIN) {
                        setCurrentUser(user);
                        setAuthState('needsVerification');
                    } else if (agentStatus === AgentStatus.PENDING) {
                        setCurrentUser(user);
                        setAuthState('pendingApproval');
                    } else if (agentStatus === AgentStatus.INACTIVE) {
                        addToast('Account Inactive', 'Your account is inactive. Please contact an administrator.', 'error');
                        authService.logout();
                        setAuthState('unauthenticated');
                    } else {
                        setCurrentUser(user);
                        setAuthState('authenticated');
                    }
                } else {
                    authService.logout();
                    setAuthState('unauthenticated');
                }
            } catch (e) {
                authService.logout();
                setAuthState('unauthenticated');
            }
        } else {
            setAuthState('unauthenticated');
        }
    }, [addToast]);
    
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);
    
    const handleLogin = async (email: string, password: string) => {
        setAuthError(null);
        try {
            await authService.login(email, password);
            addToast('Login Successful', 'Welcome back!', 'success');
            await checkAuthStatus();
            return true;
        } catch (err: any) {
            setAuthError(err.message || 'Login failed.');
            if (err.requiresVerification) {
                setCurrentUser(err.user);
                setAuthState('needsVerification');
            } else if (err.requiresApproval) {
                setCurrentUser(err.user);
                setAuthState('pendingApproval');
            }
            return false;
        }
    };

    const handleRegister = async (userData: Omit<User, 'id' | 'title' | 'avatar'>) => {
        setAuthError(null);
        try {
            const { user } = await authService.register(userData);
            setCurrentUser(user);
            setAuthState('needsVerification');
            setAuthView('login'); // Switch back to login view after registration
            addToast('Registration Successful', 'Please check your "email" for a verification code.', 'success');
        } catch (err: any) {
            addToast('Registration Failed', err.message || 'Could not create account.', 'error');
        }
    };
    
    const handleVerify = async (userId: number, code: string) => {
        try {
            await authService.verifyEmail(userId, code);
            addToast('Verification Successful', 'You can now log in to your account.', 'success');
            setAuthState('unauthenticated');
            setCurrentUser(null);
        } catch (err: any) {
            addToast('Verification Failed', err.message || 'Could not verify email.', 'error');
        }
    };

    const handleLogout = () => {
        authService.logout();
        setCurrentUser(null);
        setAuthState('unauthenticated');
        setAuthError(null);
        window.location.hash = '/home';
    };

    if (authState === 'initializing') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mb-4"></div>
                <div className="text-xl font-semibold text-slate-600">Loading Session...</div>
            </div>
        );
    }

    if (authState === 'authenticated' && currentUser) {
        return <AuthenticatedApp user={currentUser} onLogout={handleLogout} />;
    }

    if (authState === 'needsVerification' && currentUser) {
        return <VerifyEmail user={currentUser} onVerify={handleVerify} onNavigateToLogin={handleLogout} />;
    }

    if (authState === 'pendingApproval') {
        return <PendingApproval onLogout={handleLogout} />;
    }

    if (authState === 'unauthenticated') {
        if (authView === 'login') {
            return <Login onLogin={handleLogin} error={authError} onNavigateToRegister={() => { setAuthView('register'); setAuthError(null); }} />;
        }
        return <Register onRegister={handleRegister} onNavigateToLogin={() => { setAuthView('login'); setAuthError(null); }} />;
    }
    
    return null; // Should not be reached
};

const MainApp: React.FC = () => (
    <ToastProvider>
        <App />
    </ToastProvider>
);

export default MainApp;