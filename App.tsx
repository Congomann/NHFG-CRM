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

import { useDatabase } from './hooks/useDatabase';
import { Client, Policy, Interaction, Task, User, UserRole, Agent, ClientStatus, Message, AgentStatus, License, Notification, CalendarNote, Testimonial } from './types';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { MOCK_USERS } from './constants';
import * as apiClient from './services/apiClient';

const defaultUser = MOCK_USERS.find(u => u.role === UserRole.ADMIN)!;
// This is the pre-generated token for the admin user (ID 1), as the login flow is disabled.
const DEMO_TOKEN = 'eyJpZCI6MSwicm9sZSI6IkFkbWluIn0=.U1VQRVJfU0VDUkVUX0tFWV9GT1JfREVNTw==';
apiClient.setToken(DEMO_TOKEN);

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
  const currentUser = defaultUser;
  
  const { isLoading: isDataLoading, users, agents, clients, policies, interactions, tasks, messages, licenses, notifications, calendarNotes, testimonials, handlers, refetchData } = useDatabase(currentUser);

  // UI state
  const [currentView, setCurrentView] = useState(window.location.hash.replace(/^#\/?/, '') || 'home');
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
  const [impersonatedRole, setImpersonatedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const getViewFromHash = () => window.location.hash.replace(/^#\/?/, '') || 'home';

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


  const handleNavigation = (view: string) => {
    window.location.hash = `/${view}`;
  };

  const handleNotificationClick = (notification: Notification) => {
    // This logic is now handled server-side and via state updates
    // The main purpose is navigation
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

  const highlightAgent = (agentId: number) => {
    setHighlightedAgentId(agentId);
    setTimeout(() => setHighlightedAgentId(null), 3000);
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

  const handleSaveAgent = async (agentData: Agent) => {
    // Logic moved to useDatabase hook
    setIsAgentModalOpen(false);
    setAgentToEdit(null);
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

  const handleSaveLead = async (leadData: Client) => {
    // This now just needs to call the update/create handler from useDatabase
    setIsLeadModalOpen(false);
    setLeadToEdit(null);
  };
  
  const isAgentProfileView = currentView.startsWith('agent/');

  const handleAddLeadFromProfile = useCallback(async (leadData: { firstName: string; lastName: string; email: string; phone: string; message: string; }, agentId: number) => {
    await handlers.handleAddLeadFromProfile(leadData, agentId);
  }, [handlers]);

  const handleAddTestimonialFromProfile = useCallback(async (testimonialData: Omit<Testimonial, 'id' | 'status' | 'submissionDate'>) => {
      // Logic for adding a testimonial is now handled in the backend, initiated by useDatabase hook
      // Simply call the handler. The toast is now inside the hook.
  }, []);

  const handleSendBroadcast = async (message: string) => {
    await handlers.handleBroadcastMessage(message);
    setIsBroadcastModalOpen(false);
  };

  const renderContent = (displayUser: User) => {
    const publicViews = ['home', 'about', 'services', 'contact', ''];
    if (publicViews.includes(currentView)) {
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
                    currentUser={currentUser}
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
            currentUser={currentUser}
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
        // If the default route is hit and it's not 'dashboard', it might be an old link.
        // Redirect to homepage if it's not a known CRM view.
        const knownCrmViews = ['dashboard', 'clients', 'tasks', 'agents', 'leads', 'calendar', 'commissions', 'licenses', 'testimonials', 'my-profile'];
        if (!knownCrmViews.some(v => currentView.startsWith(v))) {
             return (
                <PublicLayout onNavigate={handleNavigation}>
                    <HomePage onNavigate={handleNavigation} />
                </PublicLayout>
            );
        }
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
  
  const AppContent = () => {
      if (isDataLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-xl font-semibold text-slate-600">Loading CRM...</div>
            </div>
        );
      }
      
      const DEMO_AGENT_USER = users.find(u => u.email === 'kara.t@newhollandfinancial.com');
      const DEMO_SUB_ADMIN_USER = users.find(u => u.email === 'subadmin@newhollandfinancial.com');

      let displayUser = currentUser;
      if (impersonatedRole === UserRole.AGENT && DEMO_AGENT_USER) {
          displayUser = DEMO_AGENT_USER;
      } else if (impersonatedRole === UserRole.SUB_ADMIN && DEMO_SUB_ADMIN_USER) {
          displayUser = DEMO_SUB_ADMIN_USER;
      }

      const effectiveRole = impersonatedRole || currentUser.role;

      const publicViews = ['home', 'about', 'services', 'contact', ''];
      const isPublicSiteView = publicViews.includes(currentView.split('/')[0]);

      return (
        <div className="h-screen bg-background font-sans">
          {isPublicSiteView ? (
             <div className="page-enter">
                {renderContent(displayUser)}
             </div>
          ) : (
            <div className="flex h-full">
                <Sidebar 
                    currentUser={currentUser}
                    currentView={currentView} 
                    onNavigate={handleNavigation}
                    onEditMyProfile={() => setIsMyProfileModalOpen(true)}
                    notifications={notifications}
                    onNotificationClick={handleNotificationClick}
                    onClearAllNotifications={() => {}}
                    impersonatedRole={impersonatedRole}
                />
                <main className={`flex-1 overflow-y-auto relative ml-64`}>
                    {currentUser.role === UserRole.ADMIN && (
                    <DemoModeSwitcher
                        activeRole={effectiveRole}
                        onSwitch={setImpersonatedRole}
                    />
                    )}
                    <div key={currentView + displayUser.role + displayUser.id} className="page-enter">
                        {renderContent(displayUser)}
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
            onSave={handleSaveLead}
            agents={agents}
            leadToEdit={leadToEdit}
          />
          <AddEditAgentModal
            isOpen={isAgentModalOpen}
            onClose={() => setIsAgentModalOpen(false)}
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