import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { useDatabase } from './hooks/useDatabase';
import { Client, Policy, Interaction, Task, User, UserRole, Agent, ClientStatus, Message, InteractionType, AgentStatus, License, Notification } from './types';

const App: React.FC = () => {
  // Get all data and handlers from the database hook
  const { isLoading, users, agents, clients, policies, interactions, tasks, messages, licenses, notifications, handlers } = useDatabase();

  // UI state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
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
    // Check for a logged-in user session on initial load
    if (!isLoading) {
      const loggedInUserId = localStorage.getItem('loggedInUserId');
      if (loggedInUserId) {
        const sessionUser = users.find(u => u.id === parseInt(loggedInUserId, 10));
        if (sessionUser) {
          setCurrentUser(sessionUser);
        } else {
          // Clear session if user not found (e.g., deleted)
          localStorage.removeItem('loggedInUserId');
        }
      }
    }
  }, [isLoading, users]);


  const handleLogin = (email: string, password: string): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.password === password) {
        setCurrentUser(user);
        localStorage.setItem('loggedInUserId', user.id.toString());
        setAuthError(null);
        return true;
    }
    setAuthError('Invalid email or password.');
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
    localStorage.removeItem('loggedInUserId');
  };

  const handleNavigation = (view: string) => {
    if (currentView === 'clients' && view !== 'clients') {
      setClientListAgentFilter(null);
    }
    setCurrentView(view);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
        handlers.handleMarkNotificationAsRead(notification.id);
    }
    handleNavigation(notification.link);
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard'); // Reset to dashboard on user switch
    setClientListAgentFilter(null); // Clear any active filters
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
    setTimeout(() => {
        setHighlightedAgentId(null);
    }, 3000); // Highlight for 3 seconds
  };

  const handleApproveAgent = (agentId: number) => {
      handlers.handleApproveAgent(agentId);
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
    // If the deleted agent is the current user, log them out
    if (currentUser && currentUser.id === agentId) {
       handleLogout();
    }
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
        return {
          clients: clients.filter(c => c.agentId === currentUser.id),
          policies: policies.filter(p => clients.some(c => c.id === p.clientId && c.agentId === currentUser.id)),
          tasks: tasks.filter(t => t.agentId === currentUser.id || !t.agentId), // Show agent's tasks + unassigned
        };
      case UserRole.SUB_ADMIN:
        return {
          clients: clients.filter(c => c.status === ClientStatus.LEAD),
          policies: [],
          tasks: [],
        };
      case UserRole.ADMIN:
      default:
        return { clients, policies, tasks };
    }
  }, [currentUser, clients, policies, tasks]);
  
  const isAgentProfileView = currentView.startsWith('agent/');

  const handleAddLeadFromProfile = useCallback((leadData: { firstName: string; lastName: string; email: string; phone: string; message: string; }, agentId: number) => {
    handlers.handleAddLeadFromProfile(leadData, agentId);
  }, [handlers]);


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
                    onBack={() => setCurrentView(currentUser.role === UserRole.SUB_ADMIN ? 'leads' : 'clients')}
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
                        onSelectClient={(id) => setCurrentView(`client/${id}`)}
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
                        onSelectClient={(id) => setCurrentView(`client/${id}`)}
                    />;
        }
        break;
      case 'agents':
        if (currentUser.role === UserRole.ADMIN) {
            return <AgentManagement 
                        agents={agents} 
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
                        leads={visibleData.clients} 
                        onSelectLead={(id) => setCurrentView(`client/${id}`)}
                        onCreateLead={handleOpenCreateLeadModal}
                        onEditLead={handleOpenEditLeadModal}
                        onDeleteLead={handlers.handleDeleteLead} />;
        }
        break;
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

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="text-xl font-semibold text-slate-600">Loading CRM...</div>
        </div>
    );
  }
  
  if (!currentUser) {
    return <Login onLogin={handleLogin} error={authError} />;
  }

  return (
    <div className="flex h-screen bg-background font-sans">
      {!isAgentProfileView && <Sidebar 
        currentUser={currentUser}
        allUsers={users}
        currentView={currentView} 
        onNavigate={handleNavigation}
        onSwitchUser={handleSwitchUser}
        onEditMyProfile={() => setIsMyProfileModalOpen(true)}
        onLogout={handleLogout}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onClearAllNotifications={handlers.handleClearAllNotifications}
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
    </div>
  );
};

export default App;