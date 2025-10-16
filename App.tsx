import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppData, User, UserRole, Agent, AgentStatus, Client, Policy, Interaction, Task, Message, License, Notification, CalendarNote, Testimonial, ClientStatus, TestimonialStatus, EmailDraft } from './types';
import * as authService from './services/authService';
import { useDatabase } from './hooks/useDatabase';
import { useToast } from './contexts/ToastContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientDetail from './components/ClientDetail';
import TasksView from './components/TasksView';
import AgentManagement from './components/AgentManagement';
import AgentProfile from './components/AgentProfile';
import LeadDistribution from './components/LeadDistribution';
import CommissionsView from './components/CommissionsView';
import MessagingView from './components/MessagingView';
import CalendarView from './components/CalendarView';
import LicensesView from './components/LicensesView';
import TestimonialsManagement from './components/TestimonialsManagement';
import AIAssistantView from './components/AIAssistantView';
import AddClientModal from './components/AddClientModal';
import AddEditPolicyModal from './components/AddEditPolicyModal';
import AddEditAgentModal from './components/AddEditAgentModal';
import EditMyProfileModal from './components/EditMyProfileModal';
import AddEditLeadModal from './components/AddEditLeadModal';
import AddEditTaskModal from './components/AddEditTaskModal';
import BroadcastModal from './components/BroadcastModal';
import DemoModeSwitcher from './components/DemoModeSwitcher';
import { draftEmail } from './services/geminiService';
import DraftEmailModal from './components/DraftEmailModal';
import PublicLayout from './components/PublicLayout';
import HomePage from './components/HomePage';
import WebsiteStructureView from './components/WebsiteStructureView';

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mb-4"></div>
        <div className="text-xl font-semibold text-slate-600">Loading CRM...</div>
    </div>
);

const App: React.FC = () => {
    const [authChecked, setAuthChecked] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [impersonatedUserId, setImpersonatedUserId] = useState<number | null>(null);
    const { addToast } = useToast();
    const [view, setView] = useState('dashboard');
    const [viewParam, setViewParam] = useState<string | number | null>(null);

    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [isAddEditPolicyModalOpen, setIsAddEditPolicyModalOpen] = useState(false);
    const [policyToEdit, setPolicyToEdit] = useState<Policy | null>(null);
    const [policyClientId, setPolicyClientId] = useState<number | null>(null);
    const [isAddEditAgentModalOpen, setIsAddEditAgentModalOpen] = useState(false);
    const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null);
    const [isEditMyProfileModalOpen, setIsEditMyProfileModalOpen] = useState(false);
    const [isAddEditLeadModalOpen, setIsAddEditLeadModalOpen] = useState(false);
    const [leadToEdit, setLeadToEdit] = useState<Client | null>(null);
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [highlightedAgentId, setHighlightedAgentId] = useState<number | null>(null);
    
    // State for AI Assistant modals
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskToCreate, setTaskToCreate] = useState<Partial<Task> | null>(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);
    const [isDraftingEmail, setIsDraftingEmail] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { user } = await authService.getMe();
                setCurrentUser(user);
            } catch {
                try {
                    const { user } = await authService.login('Support@newhollandfinancial.com', 'Support@2025');
                    setCurrentUser(user);
                } catch (loginError) {
                    console.error("Dev login failed", loginError);
                    addToast("Login Failed", "Could not log in with default admin credentials.", "error");
                }
            } finally {
                setAuthChecked(true);
            }
        };
        checkAuth();
    }, [addToast]);

    const db = useDatabase(currentUser);

    const displayUser = useMemo(() => {
        if (!currentUser) return null;
        if (impersonatedUserId === null) return currentUser;
        return db.users.find(u => u.id === impersonatedUserId) || currentUser;
    }, [impersonatedUserId, currentUser, db.users]);

    const handleNavigate = useCallback((path: string) => {
        if (path === 'my-profile' && displayUser?.role === UserRole.AGENT) {
            const agent = db.agents.find(a => a.id === displayUser.id);
            if (agent) {
                window.location.hash = `/agent/${agent.slug}`;
                return;
            }
        }
        window.location.hash = `/${path}`;
    }, [displayUser, db.agents]);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace(/^#\/?/, '');
            const [path, param] = hash.split('/');
            setView(path || 'dashboard');
            setViewParam(param || null);
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const displayData: AppData = useMemo(() => {
        const allData: AppData = {
            users: db.users, agents: db.agents, clients: db.clients, policies: db.policies, 
            interactions: db.interactions, tasks: db.tasks, messages: db.messages, 
            licenses: db.licenses, notifications: db.notifications, 
            calendarNotes: db.calendarNotes, testimonials: db.testimonials
        };

        if (!displayUser) {
            return {
                users: [], agents: [], clients: [], policies: [], interactions: [],
                tasks: [], messages: [], licenses: [], notifications: [],
                calendarNotes: [], testimonials: []
            };
        }
    
        if (displayUser.role === UserRole.AGENT) {
            const agentClientIds = new Set(allData.clients.filter(c => c.agentId === displayUser.id).map(c => c.id));
            
            return {
                ...allData,
                clients: allData.clients.filter(c => c.agentId === displayUser.id),
                policies: allData.policies.filter(p => agentClientIds.has(p.clientId)),
                tasks: allData.tasks.filter(t => t.agentId === displayUser.id || (t.clientId && agentClientIds.has(t.clientId))),
                interactions: allData.interactions.filter(i => agentClientIds.has(i.clientId)),
                licenses: allData.licenses.filter(l => l.agentId === displayUser.id),
                testimonials: allData.testimonials.filter(t => t.agentId === displayUser.id),
            };
        }
        
        return allData;
    }, [displayUser, db]);

    const handleOpenAddPolicyModal = (clientId: number) => {
        setPolicyToEdit(null);
        setPolicyClientId(clientId);
        setIsAddEditPolicyModalOpen(true);
    };

    const handleOpenEditPolicyModal = (policy: Policy) => {
        setPolicyToEdit(policy);
        setPolicyClientId(policy.clientId);
        setIsAddEditPolicyModalOpen(true);
    };

    const handleSaveAgent = async (agentData: Agent) => {
        const isNew = !agentData.id;
        try {
            if (isNew) {
                await db.handlers.onRegister({ name: agentData.name, email: agentData.email, password: 'password123', role: UserRole.AGENT });
            } else {
                await db.handlers.onUpdateAgentProfile(agentData);
            }
            addToast(isNew ? 'Agent Added' : 'Agent Updated', `${agentData.name}'s profile has been saved.`, 'success');
            setIsAddEditAgentModalOpen(false);
        } catch (error: any) {
            addToast('Save Error', error.message || 'Could not save agent.', 'error');
        }
    };
    
    const handleApproveAgent = async (agentId: number, newRole: UserRole) => {
        await db.handlers.handleApproveAgent(agentId, newRole);
        setHighlightedAgentId(agentId);
        setTimeout(() => setHighlightedAgentId(null), 2000);
    };

    const handleSaveLead = async (leadData: Client) => {
        if (leadData.id) {
            await db.handlers.handleUpdateClient(leadData.id, leadData);
        } else {
            const { id, ...newLeadData } = leadData;
            await db.handlers.handleAddClient(newLeadData);
        }
        setIsAddEditLeadModalOpen(false);
        setLeadToEdit(null);
    };
    
    const handleOpenCreateLead = () => {
        setLeadToEdit(null);
        setIsAddEditLeadModalOpen(true);
    };
    
    const handleOpenEditLead = (lead: Client) => {
        setLeadToEdit(lead);
        setIsAddEditLeadModalOpen(true);
    };
    
    const handleAIAssignLead = (clientId: number, updates: Partial<Client>) => {
        db.handlers.handleUpdateClient(clientId, updates);
        const client = db.clients.find(c => c.id === clientId);
        const agent = db.agents.find(a => a.id === updates.agentId);
        if (client && agent) {
            addToast('Lead Assigned', `Lead ${client.firstName} ${client.lastName} assigned to ${agent.name}.`, 'success');
        }
    };
    
    const handleAIDraftEmail = async (clientId?: number, prompt?: string) => {
        if (!clientId || !prompt) return;
        const client = db.clients.find(c => c.id === clientId);
        if (!client) return;
        
        setIsDraftingEmail(true);
        const draft = await draftEmail(prompt, `${client.firstName} ${client.lastName}`);
        setEmailDraft({
          to: client.email,
          clientName: `${client.firstName} ${client.lastName}`,
          ...draft,
        });
        setIsDraftingEmail(false);
        setIsEmailModalOpen(true);
    };
    
    const handleAICreateTask = (clientId?: number, title?: string) => {
        if (!title) return;
        setTaskToCreate({ title, clientId, dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
        setIsTaskModalOpen(true);
    };

    if (!authChecked || db.isLoading || !currentUser || !displayUser) {
        return <LoadingSpinner />;
    }

    const renderView = () => {
        const clientForDetail = view === 'client' && viewParam ? db.clients.find(c => c.id === Number(viewParam)) : null;
        const agentForProfile = view === 'agent' && viewParam ? db.agents.find(a => a.slug === viewParam) : null;
        const agentForClients = view === 'clients' && viewParam ? db.agents.find(a => a.id === Number(viewParam)) : null;
        const clientsForList = agentForClients ? db.clients.filter(c => c.agentId === agentForClients.id) : displayData.clients;

        switch (view) {
            case 'dashboard': return <Dashboard user={displayUser} clients={displayData.clients} policies={displayData.policies} tasks={displayData.tasks} agentsCount={db.agents.length} agents={db.agents} />;
            case 'clients': return <ClientList title={agentForClients ? `${agentForClients.name}'s Clients` : 'All Clients'} clients={clientsForList} onAddClient={() => setIsAddClientModalOpen(true)} onSelectClient={(id) => handleNavigate(`client/${id}`)} agentFilter={agentForClients} onClearFilter={() => handleNavigate('clients')} />;
            case 'client': return clientForDetail ? <ClientDetail client={clientForDetail} policies={db.policies.filter(p => p.clientId === clientForDetail.id)} interactions={db.interactions.filter(i => i.clientId === clientForDetail.id)} assignedAgent={db.agents.find(a => a.id === clientForDetail.agentId)} onBack={() => handleNavigate('clients')} currentUser={displayUser} onUpdateStatus={db.handlers.handleUpdateClientStatus} onOpenAddPolicyModal={() => handleOpenAddPolicyModal(clientForDetail.id)} onOpenEditPolicyModal={handleOpenEditPolicyModal} onUpdatePolicy={db.handlers.handleUpdatePolicy} /> : <div>Client not found</div>;
            case 'tasks': return <TasksView tasks={displayData.tasks} clients={displayData.clients} onSaveTask={db.handlers.handleSaveTask} onToggleTask={db.handlers.handleToggleTask} onDeleteTask={db.handlers.handleDeleteTask} onSelectClient={(id) => handleNavigate(`client/${id}`)} />;
            case 'agents': return <AgentManagement agents={db.agents} users={db.users} onNavigate={handleNavigate} onAddAgent={() => { setAgentToEdit(null); setIsAddEditAgentModalOpen(true); }} onEditAgent={(agent) => { setAgentToEdit(agent); setIsAddEditAgentModalOpen(true); }} onApproveAgent={handleApproveAgent} onDeactivateAgent={db.handlers.handleDeactivateAgent} onReactivateAgent={db.handlers.handleReactivateAgent} onRejectAgent={db.handlers.handleRejectAgent} onDeleteAgent={db.handlers.handleDeleteAgent} highlightedAgentId={highlightedAgentId} />;
            case 'agent': return agentForProfile ? <AgentProfile agent={agentForProfile} onAddLead={(data) => db.handlers.handleAddLeadFromProfile(data, agentForProfile.id)} currentUser={displayUser} onMessageAgent={(id) => handleNavigate(`messages/${id}`)} onViewAgentClients={(id) => handleNavigate(`clients/${id}`)} onUpdateProfile={db.handlers.onUpdateAgentProfile} licenses={db.licenses.filter(l => l.agentId === agentForProfile.id)} onAddLicense={db.handlers.handleAddLicense} onDeleteLicense={db.handlers.onDeleteLicense} testimonials={db.testimonials} onAddTestimonial={db.handlers.onAddTestimonial} isEmbedded /> : <div>Agent not found</div>;
            case 'leads': return <LeadDistribution leads={db.clients.filter(c => c.status === ClientStatus.LEAD)} onSelectLead={(id) => handleNavigate(`client/${id}`)} onCreateLead={handleOpenCreateLead} onEditLead={handleOpenEditLead} onDeleteLead={(id) => db.handlers.handleUpdateClient(id, { status: ClientStatus.INACTIVE })} />;
            case 'commissions': return <CommissionsView currentUser={displayUser} agents={db.agents} policies={db.policies} clients={db.clients} onUpdatePolicy={db.handlers.handleUpdatePolicy} />;
            case 'messages': return <MessagingView currentUser={displayUser} users={db.users} messages={db.messages} onSendMessage={db.handlers.handleSendMessage} onEditMessage={db.handlers.handleEditMessage} onTrashMessage={db.handlers.handleTrashMessage} onRestoreMessage={db.handlers.handleRestoreMessage} onPermanentlyDeleteMessage={db.handlers.handlePermanentlyDeleteMessage} initialSelectedUserId={Number(viewParam)} onMarkConversationAsRead={db.handlers.handleMarkConversationAsRead} onOpenBroadcast={() => setIsBroadcastModalOpen(true)} onTyping={() => {}} typingStatus={{}} />;
            case 'calendar': return <CalendarView currentUser={displayUser} users={db.users} notes={db.calendarNotes} onSaveNote={db.handlers.handleSaveCalendarNote} onDeleteNote={db.handlers.handleDeleteCalendarNote} />;
            // FIX: Pass all required props to LicensesView and add a guard clause for the agent.
            case 'licenses':
                const agentForLicenses = db.agents.find(a => a.id === displayUser.id);
                if (!agentForLicenses) return <div>Agent profile could not be found.</div>;
                return <LicensesView
                    agent={agentForLicenses}
                    licenses={displayData.licenses}
                    onAddLicense={db.handlers.handleAddLicense}
                    onDeleteLicense={db.handlers.onDeleteLicense}
                />;
            case 'testimonials': return <TestimonialsManagement testimonials={displayData.testimonials} onUpdateTestimonialStatus={db.handlers.handleUpdateTestimonialStatus} onDeleteTestimonial={db.handlers.handleDeleteTestimonial} onNavigate={handleNavigate} />;
            case 'ai-assistant': return <AIAssistantView currentUser={displayUser} clients={db.clients} tasks={db.tasks} agents={db.agents} policies={db.policies} interactions={db.interactions} onSaveTask={(task) => db.handlers.handleSaveTask({ ...task, agentId: displayUser.id })} onAssignLead={handleAIAssignLead} onNavigate={handleNavigate} />;
            
            // Public Pages
            case 'home': return <HomePage onNavigate={handleNavigate} />;
            case 'services':
            case 'about':
            case 'contact':
                return <WebsiteStructureView />; // Placeholder, assuming these are part of a larger component.

            default: return <div>Page not found</div>;
        }
    };
    
    const isPublicView = ['home', 'services', 'about', 'contact'].includes(view);

    if (isPublicView) {
        return (
            <PublicLayout onNavigate={handleNavigate}>
                {renderView()}
            </PublicLayout>
        );
    }

    return (
        <div className="flex bg-slate-50">
            <Sidebar
                currentView={view}
                onNavigate={handleNavigate}
                currentUser={displayUser}
                onEditMyProfile={() => setIsEditMyProfileModalOpen(true)}
                notifications={db.notifications}
                onNotificationClick={(n) => {
                    db.handlers.onMarkNotificationRead(n.id);
                    handleNavigate(n.link);
                }}
                onClearAllNotifications={(userId) => db.handlers.onMarkAllNotificationsRead(userId)}
                impersonatedRole={impersonatedUserId ? displayUser.role : null}
                onLogout={() => {
                    authService.logout();
                    setCurrentUser(null);
                    window.location.hash = '';
                    window.location.reload();
                }}
            />
            <main className="flex-1 ml-64 h-screen overflow-y-auto">
                {currentUser.role === UserRole.ADMIN && (
                    <DemoModeSwitcher
                        adminUser={currentUser}
                        subAdminUser={db.users.find(u => u.role === UserRole.SUB_ADMIN)}
                        agents={db.agents.filter(a => a.status === AgentStatus.ACTIVE)}
                        impersonatedUserId={impersonatedUserId}
                        onSwitchUser={setImpersonatedUserId}
                    />
                )}
                {renderView()}
            </main>

            <AddClientModal
                isOpen={isAddClientModalOpen}
                onClose={() => setIsAddClientModalOpen(false)}
                onAddClient={db.handlers.handleAddClient}
            />

            <AddEditPolicyModal
                isOpen={isAddEditPolicyModalOpen}
                onClose={() => setIsAddEditPolicyModalOpen(false)}
                onSave={db.handlers.handleSavePolicy}
                policyToEdit={policyToEdit}
                clientId={policyClientId}
            />
            
            <AddEditAgentModal
                isOpen={isAddEditAgentModalOpen}
                onClose={() => setIsAddEditAgentModalOpen(false)}
                onSave={handleSaveAgent}
                agentToEdit={agentToEdit}
            />

            <EditMyProfileModal
                isOpen={isEditMyProfileModalOpen}
                onClose={() => setIsEditMyProfileModalOpen(false)}
                onSave={db.handlers.handleUpdateMyProfile}
                currentUser={displayUser}
            />
            
             <AddEditLeadModal
                isOpen={isAddEditLeadModalOpen}
                onClose={() => setIsAddEditLeadModalOpen(false)}
                onSave={handleSaveLead}
                agents={db.agents.filter(a => a.status === AgentStatus.ACTIVE)}
                leadToEdit={leadToEdit}
            />

            <BroadcastModal
                isOpen={isBroadcastModalOpen}
                onClose={() => setIsBroadcastModalOpen(false)}
                onSend={db.handlers.handleBroadcastMessage}
            />
            
            <AddEditTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSave={(task) => {
                    db.handlers.handleSaveTask({...task, agentId: displayUser.id});
                    setIsTaskModalOpen(false);
                }}
                taskToEdit={taskToCreate}
                clients={displayData.clients}
            />

            <DraftEmailModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                draft={emailDraft}
                onSend={() => {
                    setIsEmailModalOpen(false);
                    addToast("Email Sent", `Your email to ${emailDraft?.clientName} has been sent successfully.`, "success");
                }}
            />
        </div>
    );
};

export default App;
