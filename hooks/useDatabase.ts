import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import * as db from '../services/db';
import { User, Agent, Client, Policy, Interaction, Task, Message, ClientStatus, UserRole, InteractionType, AgentStatus, License, Notification } from '../types';

const usePersistentState = <T extends {id: number}>(
  storageGetter: () => T[],
  storageSaver: (data: T[]) => void
): [T[], Dispatch<SetStateAction<T[]>>, boolean] => {
  const [state, setState] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setState(storageGetter());
    setLoading(false);
  }, [storageGetter]);

  const setAndPersistState: Dispatch<SetStateAction<T[]>> = useCallback((newStateAction) => {
    setState(prevState => {
      const resolvedState = typeof newStateAction === 'function' 
        ? (newStateAction as (prev: T[]) => T[])(prevState) 
        : newStateAction;
      storageSaver(resolvedState);
      return resolvedState;
    });
  }, [storageSaver]);

  return [state, setAndPersistState, loading];
};

export const useDatabase = () => {
    const [users, setUsers, usersLoading] = usePersistentState<User>(db.getUsers, db.saveUsers);
    const [agents, setAgents, agentsLoading] = usePersistentState<Agent>(db.getAgents, db.saveAgents);
    const [clients, setClients, clientsLoading] = usePersistentState<Client>(db.getClients, db.saveClients);
    const [policies, setPolicies, policiesLoading] = usePersistentState<Policy>(db.getPolicies, db.savePolicies);
    const [interactions, setInteractions, interactionsLoading] = usePersistentState<Interaction>(db.getInteractions, db.saveInteractions);
    const [tasks, setTasks, tasksLoading] = usePersistentState<Task>(db.getTasks, db.saveTasks);
    const [messages, setMessages, messagesLoading] = usePersistentState<Message>(db.getMessages, db.saveMessages);
    const [licenses, setLicenses, licensesLoading] = usePersistentState<License>(db.getLicenses, db.saveLicenses);
    const [notifications, setNotifications, notificationsLoading] = usePersistentState<Notification>(db.getNotifications, db.saveNotifications);
  
    const isLoading = usersLoading || agentsLoading || clientsLoading || policiesLoading || interactionsLoading || tasksLoading || messagesLoading || licensesLoading || notificationsLoading;
    
    const handleAddClient = useCallback((newClientData: Omit<Client, 'id'>) => {
      setClients(prev => {
        const newId = prev.length > 0 ? Math.max(...prev.map(c => c.id)) + 1 : 1;
        return [...prev, { ...newClientData, id: newId }];
      });
    }, [setClients]);

    const handleAddLead = useCallback((newLeadData: Omit<Client, 'id' | 'status' | 'joinDate' | 'address'>) => {
      let newLeadId = 0;

      setClients(prevClients => {
        const newId = prevClients.length > 0 ? Math.max(...prevClients.map(c => c.id)) + 1 : 1;
        newLeadId = newId;
        const newLead: Client = {
            id: newId,
            ...newLeadData,
            address: `${newLeadData.city}, ${newLeadData.state}`,
            status: ClientStatus.LEAD,
            joinDate: new Date().toISOString().split('T')[0],
        };

        if (newLead.agentId) {
            setAgents(prevAgents => prevAgents.map(agent => {
              if (agent.id === newLead.agentId) {
                const newLeadsCount = agent.leads + 1;
                const newConversionRate = newLeadsCount > 0 ? agent.clientCount / newLeadsCount : 0;
                return { ...agent, leads: newLeadsCount, conversionRate: newConversionRate };
              }
              return agent;
            }));

            setNotifications(prev => {
                const newNotificationId = prev.length > 0 ? Math.max(...prev.map(n => n.id)) + 1 : 1;
                const newNotification: Notification = {
                    id: newNotificationId,
                    userId: newLead.agentId!,
                    message: `You have a new lead assigned: ${newLead.firstName} ${newLead.lastName}.`,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    link: `client/${newLeadId}`
                };
                return [...prev, newNotification];
            });
        }
        return [...prevClients, newLead];
      });
    }, [setClients, setAgents, setNotifications]);
    
    const handleUpdateLead = useCallback((updatedLeadData: Client) => {
        setClients(prevClients => {
            const oldClient = prevClients.find(c => c.id === updatedLeadData.id);
            if (oldClient && !oldClient.agentId && updatedLeadData.agentId) {
                // This is a new assignment, create a notification
                const notificationMessage = `A lead has been assigned to you: ${updatedLeadData.firstName} ${updatedLeadData.lastName}.`;
                const notificationLink = `client/${updatedLeadData.id}`;
                setNotifications(prev => {
                    const newId = prev.length > 0 ? Math.max(...prev.map(n => n.id)) + 1 : 1;
                    const newNotification: Notification = {
                        id: newId, userId: updatedLeadData.agentId!, message: notificationMessage, timestamp: new Date().toISOString(), isRead: false, link: notificationLink
                    };
                    return [...prev, newNotification];
                });
                
                setAgents(prevAgents => prevAgents.map(agent => {
                  if (agent.id === updatedLeadData.agentId) {
                    const newLeadsCount = agent.leads + 1;
                    const newConversionRate = newLeadsCount > 0 ? agent.clientCount / newLeadsCount : 0;
                    return { ...agent, leads: newLeadsCount, conversionRate: newConversionRate };
                  }
                  return agent;
                }));
            }
            return prevClients.map(c => c.id === updatedLeadData.id ? updatedLeadData : c);
        });
    }, [setClients, setNotifications, setAgents]);


    const handleDeleteLead = useCallback((leadId: number) => {
        setClients(prevClients => {
            const leadToDelete = prevClients.find(c => c.id === leadId);

            if (leadToDelete && leadToDelete.status === ClientStatus.LEAD && leadToDelete.agentId) {
                setAgents(prevAgents => prevAgents.map(agent => {
                    if (agent.id === leadToDelete.agentId) {
                    const newLeadsCount = agent.leads > 0 ? agent.leads - 1 : 0;
                    const newConversionRate = newLeadsCount > 0 ? agent.clientCount / newLeadsCount : 0;
                    return {
                        ...agent,
                        leads: newLeadsCount,
                        conversionRate: newConversionRate,
                    };
                    }
                    return agent;
                }));
            }
            return prevClients.filter(c => c.id !== leadId);
        });
    }, [setClients, setAgents]);
    
    const handleSendMessage = useCallback((senderId: number, receiverId: number, text: string) => {
        setMessages(prev => {
            const newId = prev.length > 0 ? Math.max(...prev.map(m => m.id)) + 1 : 1;
            const newMessage: Message = {
                id: newId,
                senderId: senderId,
                receiverId,
                text,
                timestamp: new Date().toISOString(),
            };
            return [...prev, newMessage];
        });
    }, [setMessages]);

    const handleEditMessage = useCallback((messageId: number, newText: string) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...msg, text: newText, edited: true } : msg
          )
        );
    }, [setMessages]);

    const handleSaveTask = useCallback((taskData: Omit<Task, 'id' | 'completed'> & { id?: number }, currentUserId: number, currentUserRole: UserRole) => {
        setTasks(prev => {
          if (taskData.id) {
            return prev.map(task => task.id === taskData.id ? { ...task, ...taskData } : task);
          } else {
            const newId = prev.length > 0 ? Math.max(...prev.map(t => t.id)) + 1 : 1;
            const newTask: Task = {
              id: newId,
              title: taskData.title,
              dueDate: taskData.dueDate,
              completed: false,
              clientId: taskData.clientId,
              agentId: currentUserRole === UserRole.AGENT ? currentUserId : undefined,
            };
            return [...prev, newTask];
          }
        });
    }, [setTasks]);

    const handleToggleTask = useCallback((taskId: number) => {
        setTasks(prev => prev.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task));
    }, [setTasks]);

    const handleUpdateClientStatus = useCallback((clientId: number, newStatus: ClientStatus) => {
        setClients(prevClients => {
            const clientToUpdate = prevClients.find(c => c.id === clientId);

            if (clientToUpdate && clientToUpdate.status === ClientStatus.LEAD && newStatus === ClientStatus.ACTIVE && clientToUpdate.agentId) {
                setAgents(prevAgents => prevAgents.map(agent => {
                    if (agent.id === clientToUpdate.agentId) {
                    const newClientCount = agent.clientCount + 1;
                    const newConversionRate = agent.leads > 0 ? newClientCount / agent.leads : 0;
                    return { ...agent, clientCount: newClientCount, conversionRate: newConversionRate };
                    }
                    return agent;
                }));
            }
            
            return prevClients.map(client =>
                client.id === clientId ? { ...client, status: newStatus } : client
            );
        });
    }, [setClients, setAgents]);

    const handleUpdateAgentProfile = useCallback((updatedAgent: Agent) => {
        setAgents(prev => prev.map(agent => agent.id === updatedAgent.id ? updatedAgent : agent));
        setUsers(prev => prev.map(user => user.id === updatedAgent.id ? { ...user, name: updatedAgent.name, avatar: updatedAgent.avatar } : user));
    }, [setAgents, setUsers]);
    
    const handleSavePolicy = useCallback((policyData: Omit<Policy, 'id'> & { id?: number }) => {
        setPolicies(prev => {
          if (policyData.id) { // Editing
            return prev.map(p => p.id === policyData.id ? { ...p, ...policyData } as Policy : p);
          } else { // Adding new
            const newId = prev.length > 0 ? Math.max(...prev.map(p => p.id)) + 1 : 1;
            const newPolicy: Policy = { ...policyData, id: newId };
            return [...prev, newPolicy];
          }
        });
    }, [setPolicies]);
    
    const handleSaveAgent = useCallback((agentData: Agent) => {
      setAgents(prevAgents => {
        const isUpdating = agentData.id !== 0 && prevAgents.some(a => a.id === agentData.id);

        if (isUpdating) { // Editing an existing agent
          setUsers(prevUsers => prevUsers.map(u => u.id === agentData.id ? { ...u, name: agentData.name, avatar: agentData.avatar } : u));
          return prevAgents.map(a => a.id === agentData.id ? agentData : a);
        } else { // Adding a new agent application
          const allIds = [...prevAgents.map(a => a.id), ...users.map(u => u.id)];
          const maxId = Math.max(0, ...allIds);
          const newId = maxId + 1;
          const newAgent: Agent = {
              ...agentData,
              id: newId,
              status: AgentStatus.PENDING,
              joinDate: '',
              slug: agentData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          };
          return [...prevAgents, newAgent];
        }
      });
    }, [setAgents, setUsers, users]);

    const handleApproveAgent = useCallback((agentId: number) => {
        let agentToApprove: Agent | undefined;

        setAgents(prev => {
            const updatedAgents = prev.map(a => {
                if (a.id === agentId) {
                    agentToApprove = { ...a, status: AgentStatus.ACTIVE, joinDate: new Date().toISOString().split('T')[0] };
                    return agentToApprove;
                }
                return a;
            });
            return updatedAgents;
        });

        setUsers(prevUsers => {
            if (agentToApprove && !prevUsers.some(u => u.id === agentId)) {
                const newUser: User = {
                    id: agentToApprove.id,
                    name: agentToApprove.name,
                    email: agentToApprove.email,
                    role: UserRole.AGENT,
                    avatar: agentToApprove.avatar,
                    title: 'Insurance Agent',
                    password: 'password123'
                };
                return [...prevUsers, newUser];
            }
            return prevUsers;
        });
    }, [setAgents, setUsers]);
    
    const handleDeactivateAgent = useCallback((agentId: number) => {
        setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: AgentStatus.INACTIVE } : a));
        setUsers(prev => prev.filter(u => u.id !== agentId));
        setClients(prev => prev.map(c => c.agentId === agentId ? { ...c, agentId: undefined } : c));
    }, [setAgents, setUsers, setClients]);

    const handleReactivateAgent = useCallback((agentId: number) => {
        let agentToReactivate: Agent | undefined;
        setAgents(prev => {
            const updatedAgents = prev.map(a => {
                if (a.id === agentId) {
                    agentToReactivate = { ...a, status: AgentStatus.ACTIVE };
                    return agentToReactivate;
                }
                return a;
            });
            return updatedAgents;
        });
        
        setUsers(prev => {
            if (agentToReactivate && !prev.some(u => u.id === agentId)) {
                 const newUser: User = {
                    id: agentToReactivate.id, name: agentToReactivate.name, email: agentToReactivate.email, role: UserRole.AGENT, avatar: agentToReactivate.avatar, title: 'Insurance Agent', password: 'password123'
                };
                return [...prev, newUser];
            }
            return prev;
        });
    }, [setAgents, setUsers]);

    const handleDeleteAgent = useCallback((agentId: number) => {
        setAgents(prev => prev.filter(a => a.id !== agentId));
        setUsers(prev => prev.filter(u => u.id !== agentId));
        setClients(prev => prev.map(c => c.agentId === agentId ? { ...c, agentId: undefined } : c));
    }, [setAgents, setUsers, setClients]);
    
    const handleRejectAgent = useCallback((agentId: number) => {
        setAgents(prev => prev.map(a => 
            (a.id === agentId && a.status === AgentStatus.PENDING) 
            ? { ...a, status: AgentStatus.INACTIVE } 
            : a
        ));
    }, [setAgents]);
    
    const handleUpdateMyProfile = useCallback((updatedUser: User) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
        
        if (updatedUser.role === UserRole.AGENT) {
            setAgents(prevAgents => prevAgents.map(a => a.id === updatedUser.id ? { ...a, name: updatedUser.name, avatar: updatedUser.avatar } : a));
        }
    }, [setUsers, setAgents]);
    
    const handleAddLeadFromProfile = useCallback((leadData: { firstName: string; lastName: string; email: string; phone: string; message: string; }, agentId: number) => {
        let newLeadId: number = 0;
        setClients(prevClients => {
            const newId = prevClients.length > 0 ? Math.max(...prevClients.map(c => c.id)) + 1 : 1;
            newLeadId = newId;
            const newLead: Client = {
                id: newId, firstName: leadData.firstName, lastName: leadData.lastName, email: leadData.email, phone: leadData.phone, address: 'From Agent Profile Contact', status: ClientStatus.LEAD, joinDate: new Date().toISOString().split('T')[0], agentId: agentId,
            };
            return [...prevClients, newLead];
        });
        
        setInteractions(prevInteractions => {
            const newId = prevInteractions.length > 0 ? Math.max(...prevInteractions.map(i => i.id)) + 1 : 1;
            const newInteraction: Interaction = {
                id: newId, clientId: newLeadId, type: InteractionType.NOTE, date: new Date().toISOString().split('T')[0], summary: `Lead from agent profile contact form: "${leadData.message}"`,
            };
            return [...prevInteractions, newInteraction];
        });
        alert('Your message has been sent. The agent will contact you shortly.');
    }, [setClients, setInteractions]);

    const handleUpdatePolicy = useCallback((policyId: number, updates: Partial<Omit<Policy, 'id'>>) => {
      setPolicies(prevPolicies => 
        prevPolicies.map(policy => 
          policy.id === policyId ? { ...policy, ...updates } : policy
        )
      );
    }, [setPolicies]);

    const handleAddLicense = useCallback((licenseData: Omit<License, 'id'>) => {
        setLicenses(prev => {
            const newId = prev.length > 0 ? Math.max(...prev.map(l => l.id)) + 1 : 1;
            return [...prev, { ...licenseData, id: newId }];
        });
    }, [setLicenses]);

    const handleDeleteLicense = useCallback((licenseId: number) => {
        setLicenses(prev => prev.filter(l => l.id !== licenseId));
    }, [setLicenses]);

    const handleMarkNotificationAsRead = useCallback((notificationId: number) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    }, [setNotifications]);

    const handleClearAllNotifications = useCallback((userId: number) => {
        setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, isRead: true } : n));
    }, [setNotifications]);

    return {
        isLoading, users, agents, clients, policies, interactions, tasks, messages, licenses, notifications,
        handlers: {
            handleAddClient, handleAddLead, handleUpdateLead, handleDeleteLead, handleSendMessage, handleEditMessage, handleSaveTask, handleToggleTask,
            handleUpdateClientStatus, handleUpdateAgentProfile, handleSavePolicy, handleSaveAgent, handleUpdateMyProfile,
            handleAddLeadFromProfile, handleUpdatePolicy,
            handleApproveAgent, handleDeleteAgent,
            handleDeactivateAgent, handleReactivateAgent, handleRejectAgent,
            handleAddLicense, handleDeleteLicense,
            handleMarkNotificationAsRead, handleClearAllNotifications,
        }
    };
};