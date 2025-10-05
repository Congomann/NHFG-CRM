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
import Login from './components/Login';
import Register from './components/Register';
import VerifyEmail from './components/VerifyEmail';
import PendingApproval from './components/PendingApproval';
import CalendarView from './components/CalendarView';
import TestimonialsManagement from './components/TestimonialsManagement';
import { useDatabase } from './hooks/useDatabase';
import { Client, Policy, Interaction, Task, User, UserRole, Agent, ClientStatus, Message, AgentStatus, License, Notification, CalendarNote, Testimonial } from './types';
import { ToastProvider, useToast } from './contexts/ToastContext';

type AuthView = 'login' | 'register' | 'verifyEmail';

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


const App: React.FC = () => {
  // Get all data and handlers from the database hook
  const { isLoading, users, agents, clients, policies, interactions, tasks, messages, licenses, notifications, calendarNotes, testimonials, handlers } = useDatabase();

  const { addToast } = useToast();

  // UI state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [authView, setAuthView] = useState<AuthView>('login');
  const [userForVerification, setUserForVerification] = useState<User | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Client | null>(null);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isMyProfileModalOpen, setIsMyProfileModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyToEdit, setPolicyToEdit] = useState<Policy | null>(null);
  const [currentClientIdForPolicy, setCurrentClientIdForPolicy] = useState<number | null>(null);
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null);
  const [clientListAgentFilter, setClientListAgentFilter] = useState<Agent | null>(null);
  const [highlightedAgentId, setHighlightedAgentId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading) {
      const loggedInUserId = localStorage.getItem('loggedInUserId');
      let sessionUser: User | undefined | null = null;

      if (loggedInUserId) {
        sessionUser = users.find(u => u.id === parseInt(loggedInUserId, 10));
      }

      if (sessionUser) {
        setCurrentUser(sessionUser);
      } else {
        const adminUser = users.find(u => u.role === UserRole.ADMIN);
        if (adminUser) {
          setCurrentUser(adminUser);
          localStorage.setItem('loggedInUserId', adminUser.id.toString());
        }
      }
    }
  }, [isLoading, users]);

  useEffect(() => {
    const getViewFromHash = () => {
        const hash = window.location.hash.replace(/^#\/?/, '');
        return hash || 'dashboard';
    };

    const syncViewFromHash = () => {
        const viewFromHash = getViewFromHash();
        if (currentView !== viewFromHash) {
            if (currentView === 'clients' && !viewFromHash.startsWith('clients')) {
                setClientListAgentFilter(null);
            }
            setCurrentView(viewFromHash);
        }
    };

    syncViewFromHash();
    window.addEventListener('hashchange', syncViewFromHash);
    return () => window.removeEventListener('hashchange', syncViewFromHash);
  }, [currentView]);


  const handleNavigation = (view: string) => {
    window.location.hash = `/${view}`;
  };

  const handleLogin = (email: string, password: string): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.password === password) {
        if (!user.isVerified && user.role !== UserRole.ADMIN) {
            setAuthError('Please verify your email before logging in.');
            setUserForVerification(user);
            setAuthView('verifyEmail');
            return false;
        }
        setCurrentUser(user);
        localStorage.setItem('loggedInUserId', user.id.toString());
        setAuthError(null);
        handleNavigation('dashboard');
        return true;
    }
    setAuthError('Invalid email or password.');
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthView('login');
    localStorage.removeItem('loggedInUserId');
    window.location.hash = '';
  };
  
  const handleRegister = (userData: Omit<User, 'id' | 'title' | 'avatar'>) => {
      const newUser = handlers.handleRegisterUser(userData);
      if (newUser) {
          setUserForVerification(newUser);
          setAuthView('verifyEmail');
      }
  };

  const handleVerify = (userId: number, code: string) => {
      const success = handlers.handleVerifyEmail(userId, code);
      if (success) {
          alert('Email verified successfully! Please log in.');
          setUserForVerification(null);
          setAuthView('login');
      } else {
          alert('Invalid verification code.');
      }
  };

  const handleSwitchUser = (role: UserRole) => {
    let userToSwitchTo: User | undefined;
    switch (role) {
      case UserRole.ADMIN:
        userToSwitchTo = users.find(u => u.id === 1); // Adama Lee
        break;
      case UserRole.SUB_ADMIN:
        userToSwitchTo = users.find(u => u.id === 2); // Gaius Baltar
        break;
      case UserRole.AGENT:
        userToSwitchTo = users.find(u => u.id === 3); // Kara Thrace
        break;
      default:
        userToSwitchTo = users.find(u => u.id === 1); // Default to admin
    }

    if (userToSwitchTo) {
      setCurrentUser(userToSwitchTo);
      localStorage.setItem('loggedInUserId', userToSwitchTo.id.toString());
      handleNavigation('dashboard');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
        handlers.handleMarkNotificationAsRead(notification.id);
    }
    handleNavigation(notification.link);
  };

  const handleMessageAgent = (agentId: number) => {
    handleNavigation(`messages/${agentId}`);
  };

  const handleViewAgentClients = (agentId: number) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setClientListAgentFilter(agent);
      handleNavigation('clients');
    }
  };

  const highlightAgent = (agentId: number) => {
    setHighlightedAgentId(agentId);
    setTimeout(() => setHighlightedAgentId(null), 3000);
  };

  const handleApproveAgent = (agentId: number, newRole: UserRole) => {
      handlers.handleApproveAgent(agentId, newRole);
      highlightAgent(agentId);
  };

  const handleDeactivateAgent = (agentId: number) => {
      handlers.handleDeactivateAgent(agentId);
      highlightAgent(agentId);
  };

  const handleReactivateAgent = (agentId: number) => {
      handlers.handleReactivateAgent(agentId);
      highlightAgent(agentId);
  };

  const handleRejectAgent = (agentId: number) => {
      handlers.handleRejectAgent(agentId);
      highlightAgent(agentId);
  };

  const handleOpenAddAgentModal = () => {
    setAgentToEdit(null);
    setIsAgentModalOpen(true);
  };
  
  const handleOpenEditAgentModal = (agent: Agent) => {
    setAgentToEdit(agent);
    setIsAgentModalOpen(true);
  };
  
  const handleCloseAgentModal = () => {
    setIsAgentModalOpen(false);
    setAgentToEdit(null);
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
  
  const handleClosePolicyModal = () => {
    setIsPolicyModalOpen(false);
    setPolicyToEdit(null);
    setCurrentClientIdForPolicy(null);
  };

  const handleSavePolicy = (policyData: Omit<Policy, 'id'> & { id?: number }) => {
    handlers.handleSavePolicy(policyData);
    handleClosePolicyModal();
  };

  const handleSaveAgent = (agentData: Agent) => {
    handlers.handleSaveAgent(agentData);
    handleCloseAgentModal();
  };
  
  const handleDeleteAgent = (agentId: number) => {
    handlers.handleDeleteAgent(agentId);
    if (currentUser && currentUser.id === agentId) handleLogout();
  };

  const handleUpdateMyProfile = (updatedUser: User) => {
      handlers.handleUpdateMyProfile(updatedUser);
      if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
      }
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

  const handleCloseLeadModal = () => {
    setIsLeadModalOpen(false);
    setLeadToEdit(null);
  };

  const handleSaveLead = (leadData: Client) => {
    if (leadData.id && leadData.id > 0) {
      handlers.handleUpdateLead(leadData);
    } else {
      handlers.handleAddLead(leadData);
    }
    handleCloseLeadModal();
  };

  const visibleData = useMemo(() => {
    if (!currentUser) return { clients: [], policies: [], tasks: [] };

    switch (currentUser.role) {
      case UserRole.AGENT:
      case UserRole.SUB_ADMIN:
        return {
          clients: clients.filter(c => c.agentId === currentUser.id),
          policies: policies.filter(p => clients.some(c => c.id === p.clientId && c.agentId === currentUser.id)),
          tasks: tasks.filter(t => t.agentId === currentUser.id || !t.agentId),
        };
      case UserRole.ADMIN:
      default:
        return { clients, policies, tasks };
    }
  }, [currentUser, clients, policies, tasks]);
  
  const isAgentProfileView = currentView.startsWith('agent/');

  const handleAddLeadFromProfile = useCallback((leadData: { firstName: string; lastName: string; email: string; phone: string; message: string; }, agentId: number) => {
    handlers.handleAddLeadFromProfile(leadData, agentId);
    addToast(
        'Message Sent!', 
        'The agent will review your message in their CRM and contact you shortly.', 
        'success'
    );
  }, [handlers, addToast]);

  const handleAddTestimonialFromProfile = useCallback((testimonialData: Omit<Testimonial, 'id' | 'status' | 'submissionDate'>) => {
      handlers.handleAddTestimonial(testimonialData);
      addToast(
          'Thank You!',
          'Your testimonial has been submitted and is pending approval by the agent.',
          'success'
      );
  }, [handlers, addToast]);

  const renderContent = () => {
    if (!currentUser) return null;

    if (currentView.startsWith('client/')) {
      const clientId = parseInt(currentView.split('/')[1], 10);
      const client = clients.find(c => c.id === clientId);
      if (client) {
        const clientPolicies = policies.filter(p => p.clientId === clientId);
        const clientInteractions = interactions.filter(i => i.clientId === clientId);
        const assignedAgent = agents.find(a => a.id === client.agentId);
        return <ClientDetail 
                    client={client} 
                    policies={clientPolicies} 
                    interactions={clientInteractions} 
                    assignedAgent={assignedAgent}
                    onBack={() => handleNavigation(currentUser.role === UserRole.SUB_ADMIN ? 'leads' : 'clients')}
                    currentUser={currentUser}
                    onUpdateStatus={handlers.handleUpdateClientStatus}
                    onOpenAddPolicyModal={() => handleOpenAddPolicyModal(client.id)}
                    onOpenEditPolicyModal={handleOpenEditPolicyModal}
                    />;
      }
    }

    if (isAgentProfileView) {
        const agentSlug = currentView.split('/')[1];
        const agent = agents.find(a => a.slug === agentSlug);
        if (agent) {
            return <AgentProfile 
                agent={agent} 
                onAddLead={(leadData) => handleAddLeadFromProfile(leadData, agent.id)}
                currentUser={currentUser}
                onMessageAgent={handleMessageAgent}
                onViewAgentClients={handleViewAgentClients}
                onUpdateProfile={handlers.handleUpdateAgentProfile}
                licenses={licenses.filter(l => l.agentId === agent.id)}
                onAddLicense={handlers.handleAddLicense}
                onDeleteLicense={handlers.handleDeleteLicense}
                testimonials={testimonials}
                onAddTestimonial={handleAddTestimonialFromProfile}
            />;
        }
    }
    
    if (currentView.startsWith('messages')) {
        const preselectedId = currentView.split('/')[1];
        return <MessagingView 
                    currentUser={currentUser}
                    users={users}
                    messages={messages}
                    onSendMessage={(receiverId, text) => handlers.handleSendMessage(currentUser.id, receiverId, text)}
                    onEditMessage={handlers.handleEditMessage}
                    initialSelectedUserId={preselectedId ? Number(preselectedId) : undefined}
                    onTrashMessage={(messageId) => handlers.handleTrashMessage(messageId, currentUser)}
                    onRestoreMessage={handlers.handleRestoreMessage}
                    onPermanentlyDeleteMessage={(messageId) => handlers.handlePermanentlyDeleteMessage(messageId, currentUser)}
                />;
    }

    switch (currentView) {
      case 'clients':
        if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.AGENT) {
            const clientsForList = clientListAgentFilter 
                ? clients.filter(c => c.agentId === clientListAgentFilter.id)
                : visibleData.clients;
            
            const title = clientListAgentFilter 
                ? `${clientListAgentFilter.name}'s Clients`
                : (currentUser.role === UserRole.ADMIN ? 'All Clients' : 'My Clients');
            
            return <ClientList 
                        title={title}
                        clients={clientsForList} 
                        onSelectClient={(id) => handleNavigation(`client/${id}`)}
                        onAddClient={() => setIsClientModalOpen(true)}
                        agentFilter={clientListAgentFilter}
                        onClearFilter={() => setClientListAgentFilter(null)}
                         />;
        }
        break;
      case 'tasks':
        if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.AGENT) {
            return <TasksView 
                        tasks={visibleData.tasks}
                        clients={clients}
                        onSaveTask={(task) => handlers.handleSaveTask(task, currentUser.id, currentUser.role)}
                        onToggleTask={handlers.handleToggleTask}
                        onSelectClient={(id) => handleNavigation(`client/${id}`)}
                    />;
        }
        break;
      case 'agents':
        if (currentUser.role === UserRole.ADMIN) {
            return <AgentManagement 
                        agents={agents} 
                        users={users}
                        onNavigate={handleNavigation}
                        onAddAgent={handleOpenAddAgentModal}
                        onEditAgent={handleOpenEditAgentModal}
                        onApproveAgent={handleApproveAgent}
                        onDeactivateAgent={handleDeactivateAgent}
                        onReactivateAgent={handleReactivateAgent}
                        onRejectAgent={handleRejectAgent}
                        onDeleteAgent={handleDeleteAgent}
                        highlightedAgentId={highlightedAgentId}
                    />;
        }
        break;
      case 'leads':
        if (currentUser.role === UserRole.SUB_ADMIN) {
            return <LeadDistribution 
                        leads={visibleData.clients.filter(c => c.status === ClientStatus.LEAD)} 
                        onSelectLead={(id) => handleNavigation(`client/${id}`)}
                        onCreateLead={handleOpenCreateLeadModal}
                        onEditLead={handleOpenEditLeadModal}
                        onDeleteLead={handlers.handleDeleteLead} />;
        }
        break;
      case 'calendar':
        return <CalendarView
            currentUser={currentUser}
            users={users}
            notes={calendarNotes}
            onSaveNote={handlers.handleSaveCalendarNote}
            onDeleteNote={handlers.handleDeleteCalendarNote}
        />;
      case 'commissions':
        if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.AGENT) {
            return <CommissionsView
                        currentUser={currentUser}
                        agents={agents}
                        policies={policies}
                        clients={clients}
                        onUpdatePolicy={handlers.handleUpdatePolicy}
                    />;
        }
        break;
       case 'licenses':
        if (currentUser.role === UserRole.AGENT) {
            const agent = agents.find(a => a.id === currentUser.id);
            if (agent) {
                return <LicensesView
                    agent={agent}
                    licenses={licenses.filter(l => l.agentId === agent.id)}
                    onAddLicense={handlers.handleAddLicense}
                    onDeleteLicense={handlers.handleDeleteLicense}
                />;
            }
        }
        break;
      case 'testimonials':
        if (currentUser.role === UserRole.AGENT) {
            return <TestimonialsManagement
                testimonials={testimonials.filter(t => t.agentId === currentUser.id)}
                onUpdateTestimonialStatus={handlers.handleUpdateTestimonialStatus}
                onDeleteTestimonial={handlers.handleDeleteTestimonial}
                onNavigate={handleNavigation}
            />;
        }
        break;
      case 'my-profile':
        if (currentUser.role === UserRole.AGENT) {
            const agent = agents.find(a => a.id === currentUser.id);
            if (agent) {
                return <AgentProfile 
                    agent={agent} 
                    onAddLead={(leadData) => handleAddLeadFromProfile(leadData, agent.id)}
                    currentUser={currentUser}
                    onMessageAgent={handleMessageAgent}
                    onViewAgentClients={handleViewAgentClients}
                    onUpdateProfile={handlers.handleUpdateAgentProfile}
                    licenses={licenses.filter(l => l.agentId === agent.id)}
                    onAddLicense={handlers.handleAddLicense}
                    onDeleteLicense={handlers.handleDeleteLicense}
                    testimonials={testimonials}
                    onAddTestimonial={handleAddTestimonialFromProfile}
                    isEmbedded={true}
                />;
            }
        }
        break;
      case 'dashboard':
      default:
        return <Dashboard 
                user={currentUser}
                clients={visibleData.clients}
                policies={visibleData.policies}
                tasks={visibleData.tasks}
                agentsCount={agents.filter(a => a.status === AgentStatus.ACTIVE).length}
                agents={agents}
               />;
    }
  };
  
  const AppContent = () => {
      if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-xl font-semibold text-slate-600">Loading CRM...</div>
            </div>
        );
      }
      
      if (!currentUser) {
        // This block will now be skipped in demo mode, but is kept for potential future use.
        switch(authView) {
            case 'register':
                return <Register onRegister={handleRegister} onNavigateToLogin={() => setAuthView('login')} />;
            case 'verifyEmail':
                return <VerifyEmail user={userForVerification} onVerify={handleVerify} onNavigateToLogin={() => setAuthView('login')} />;
            case 'login':
            default:
                return <Login onLogin={handleLogin} error={authError} onNavigateToRegister={() => setAuthView('register')} />;
        }
      }
    
      const agentProfile = agents.find(a => a.id === currentUser.id);
      if (currentUser.role !== UserRole.ADMIN && agentProfile?.status === AgentStatus.PENDING) {
          return <PendingApproval onLogout={handleLogout} />;
      }

      return (
        <div className="flex h-screen bg-background font-sans">
          {!isAgentProfileView && <Sidebar 
            currentUser={currentUser}
            currentView={currentView} 
            onNavigate={handleNavigation}
            onEditMyProfile={() => setIsMyProfileModalOpen(true)}
            onLogout={handleLogout}
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onClearAllNotifications={handlers.handleClearAllNotifications}
            onSwitchUser={handleSwitchUser}
            />}
          <main className={`flex-1 overflow-y-auto ${!isAgentProfileView ? 'ml-64' : ''}`}>
            <div key={currentView} className="page-enter">
                {renderContent()}
            </div>
          </main>
          <AddClientModal 
            isOpen={isClientModalOpen} 
            onClose={() => setIsClientModalOpen(false)}
            onAddClient={handlers.handleAddClient}
          />
          <AddEditLeadModal
            isOpen={isLeadModalOpen}
            onClose={handleCloseLeadModal}
            onSave={handleSaveLead}
            agents={agents}
            leadToEdit={leadToEdit}
          />
          <AddEditAgentModal
            isOpen={isAgentModalOpen}
            onClose={handleCloseAgentModal}
            onSave={handleSaveAgent}
            agentToEdit={agentToEdit}
          />
          <EditMyProfileModal
            isOpen={isMyProfileModalOpen}
            onClose={() => setIsMyProfileModalOpen(false)}
            onSave={handleUpdateMyProfile}
            currentUser={currentUser}
          />
          <AddEditPolicyModal
            isOpen={isPolicyModalOpen}
            onClose={handleClosePolicyModal}
            onSave={handleSavePolicy}
            policyToEdit={policyToEdit}
            clientId={currentClientIdForPolicy}
          />
          <NotificationHandler notifications={notifications} currentUser={currentUser} />
        </div>
      );
  }

  return (
    <ToastProvider>
        <AppContent />
    </ToastProvider>
  )
};

const MainApp: React.FC = () => (
    <ToastProvider>
        <App />
    </ToastProvider>
);

export default MainApp;