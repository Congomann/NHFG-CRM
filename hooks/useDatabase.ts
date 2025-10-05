import { useState, useEffect, useCallback } from 'react';
import * as apiClient from '../services/apiClient';
import { User, Agent, Client, Policy, Interaction, Task, Message, ClientStatus, UserRole, InteractionType, AgentStatus, License, Notification, CalendarNote, Testimonial, TestimonialStatus } from '../types';
import { useToast } from '../contexts/ToastContext';

type AppData = {
    users: User[];
    agents: Agent[];
    clients: Client[];
    policies: Policy[];
    interactions: Interaction[];
    tasks: Task[];
    messages: Message[];
    licenses: License[];
    notifications: Notification[];
    calendarNotes: CalendarNote[];
    testimonials: Testimonial[];
};

export const useDatabase = (isLoggedIn: boolean) => {
    const [data, setData] = useState<AppData>({
        users: [], agents: [], clients: [], policies: [], interactions: [],
        tasks: [], messages: [], licenses: [], notifications: [],
        calendarNotes: [], testimonials: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        if (!isLoggedIn) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const appData = await apiClient.get<AppData>('/api/data');
            setData(appData);
        } catch (error) {
            console.error("Failed to fetch initial data", error);
            addToast("Error", "Could not load CRM data.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // Generic wrapper for API calls that handles state updates and notifications
    const handleApiCall = async (
        apiCall: () => Promise<any>,
        successTitle: string,
        successMessage: string
    ) => {
        try {
            await apiCall();
            addToast(successTitle, successMessage, 'success');
            await fetchData(); // Refetch all data to ensure UI is in sync
        } catch (error: any) {
            addToast('Error', error.message || 'An unexpected error occurred.', 'error');
        }
    };
    
    const handlers = {
        // Simple CRUD handlers that now use the generic wrapper
        handleAddClient: (clientData: Omit<Client, 'id'>) => handleApiCall(
            () => apiClient.post('/api/clients', clientData),
            'Client Added', 'New client has been successfully created.'
        ),
        handleSaveTask: async (taskData: Omit<Task, 'id'|'completed'> & { id?: number }) => {
            const apiCall = taskData.id
                ? () => apiClient.put(`/api/tasks/${taskData.id}`, taskData)
                : () => apiClient.post('/api/tasks', { ...taskData, completed: false });
            await handleApiCall(apiCall, 'Task Saved', 'Task details have been updated.');
        },
        handleToggleTask: (taskId: number) => {
            const task = data.tasks.find(t => t.id === taskId);
            if(task) {
                handleApiCall(
                    () => apiClient.put(`/api/tasks/${taskId}`, { completed: !task.completed }),
                    'Task Updated', `Task marked as ${!task.completed ? 'complete' : 'active'}.`
                )
            }
        },
        handleDeleteTask: (taskId: number) => handleApiCall(
            () => apiClient.del(`/api/tasks/${taskId}`),
            'Task Deleted', 'The task has been permanently removed.'
        ),
        handleSavePolicy: async (policyData: Omit<Policy, 'id'> & { id?: number }) => {
             const apiCall = policyData.id
                ? () => apiClient.put(`/api/policies/${policyData.id}`, policyData)
                : () => apiClient.post('/api/policies', policyData);
            await handleApiCall(apiCall, 'Policy Saved', 'Policy details have been updated.');
        },
        handleUpdatePolicy: (policyId: number, updates: Partial<Policy>) => handleApiCall(
            () => apiClient.put(`/api/policies/${policyId}`, updates),
            'Policy Updated', 'The policy has been successfully updated.'
        ),
        handleAddLicense: (licenseData: Omit<License, 'id'>) => handleApiCall(
            () => apiClient.post('/api/licenses', licenseData),
            'License Added', 'New license has been successfully uploaded.'
        ),
        onDeleteLicense: (licenseId: number) => handleApiCall(
            () => apiClient.del(`/api/licenses/${licenseId}`),
            'License Deleted', 'The license has been removed.'
        ),
        handleSaveCalendarNote: async (noteData: Omit<CalendarNote, 'id'> & { id?: number }) => {
             const apiCall = noteData.id
                ? () => apiClient.put(`/api/calendarNotes/${noteData.id}`, noteData)
                : () => apiClient.post('/api/calendarNotes', noteData);
            await handleApiCall(apiCall, 'Note Saved', 'Calendar note has been saved.');
        },
        handleDeleteCalendarNote: (noteId: number) => handleApiCall(
            () => apiClient.del(`/api/calendarNotes/${noteId}`),
            'Note Deleted', 'The calendar note has been removed.'
        ),
        handleUpdateTestimonialStatus: (id: number, status: TestimonialStatus) => handleApiCall(
            () => apiClient.put(`/api/testimonials/${id}`, { status }),
            'Testimonial Updated', `The testimonial has been ${status.toLowerCase()}.`
        ),
        handleDeleteTestimonial: (id: number) => handleApiCall(
            () => apiClient.del(`/api/testimonials/${id}`),
            'Testimonial Deleted', 'The testimonial has been removed.'
        ),
        handleSendMessage: (receiverId: number, text: string) => handleApiCall(
            () => apiClient.sendMessage(receiverId, text),
            'Message Sent', 'Your message has been sent successfully.'
        ),
        handleEditMessage: (messageId: number, text: string) => handleApiCall(
            () => apiClient.editMessage(messageId, text),
            'Message Edited', 'Your message has been updated.'
        ),
        handleTrashMessage: (messageId: number) => handleApiCall(
            () => apiClient.trashMessage(messageId),
            'Message Trashed', 'The message has been moved to the trash.'
        ),
        handleRestoreMessage: (messageId: number) => handleApiCall(
            () => apiClient.restoreMessage(messageId),
            'Message Restored', 'The message has been moved back to the inbox.'
        ),
        handlePermanentlyDeleteMessage: (messageId: number) => handleApiCall(
            () => apiClient.permanentlyDeleteMessage(messageId),
            'Message Deleted', 'The message has been permanently deleted.'
        ),

        // Complex handlers that call specific apiClient methods
        handleUpdateClientStatus: (id: number, status: ClientStatus) => handleApiCall(
            () => apiClient.put(`/api/clients/${id}`, { status }),
            'Client Status Updated', `Client is now marked as ${status}.`
        ),
        handleApproveAgent: (agentId: number, role: UserRole) => handleApiCall(
            () => apiClient.approveAgent(agentId, role),
            'Agent Approved', 'The agent account has been activated.'
        ),
        handleDeactivateAgent: (id: number) => handleApiCall(
            () => apiClient.updateAgentStatus(id, AgentStatus.INACTIVE),
            'Agent Deactivated', 'The agent account is now inactive.'
        ),
        handleReactivateAgent: (id: number) => handleApiCall(
            () => apiClient.updateAgentStatus(id, AgentStatus.ACTIVE),
            'Agent Reactivated', 'The agent account has been reactivated.'
        ),
        handleRejectAgent: (id: number) => handleApiCall(
            () => apiClient.updateAgentStatus(id, AgentStatus.INACTIVE),
            'Agent Rejected', 'The agent application has been rejected.'
        ),
        handleDeleteAgent: (id: number) => handleApiCall(
            () => apiClient.deleteAgent(id),
            'Agent Deleted', 'The agent and their user account have been permanently deleted.'
        ),
        handleUpdateMyProfile: async (user: User) => {
            await handleApiCall(
                () => apiClient.updateMyProfile(user),
                'Profile Updated', 'Your profile has been saved successfully.'
            );
        },
        handleAddLeadFromProfile: async (leadData: any, agentId: number) => {
            // This handler is special because it's called from a public page,
            // so the success message is different.
            try {
                await apiClient.createLeadFromProfile(leadData, agentId);
                addToast('Message Sent!', 'The agent will review your message and contact you shortly.', 'success');
                // No refetch needed as the public user doesn't see the result.
            } catch (error: any) {
                addToast('Error', error.message || 'Could not send message.', 'error');
            }
        },
    };

    return { isLoading, ...data, handlers, refetchData: fetchData };
};