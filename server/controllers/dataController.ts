import { db } from '../db';
import { User, UserRole, Policy, Client, Interaction, Task, License, Testimonial, Notification, PolicyStatus, NotificationType } from '../../types';

const checkAndCreateRenewalNotifications = async (policies: Policy[], clients: Client[], notifications: Notification[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const expiringPolicies = policies.filter(p => {
        if (p.status !== PolicyStatus.ACTIVE || !p.endDate) return false;
        try {
            const endDate = new Date(p.endDate);
            // Ensure date is valid before comparison
            if (isNaN(endDate.getTime())) return false;
            return endDate <= thirtyDaysFromNow && endDate >= today;
        } catch (e) {
            return false;
        }
    });

    for (const policy of expiringPolicies) {
        const client = clients.find(c => c.id === policy.clientId);
        if (!client || !client.agentId) continue;

        const agentId = client.agentId;
        const notificationExists = notifications.some(n =>
            n.userId === agentId &&
            n.type === NotificationType.POLICY_RENEWAL &&
            n.message.includes(`Policy #${policy.policyNumber}`)
        );

        if (!notificationExists) {
            await db.createRecord('notifications', {
                userId: agentId,
                type: NotificationType.POLICY_RENEWAL,
                message: `Policy #${policy.policyNumber} for ${client.firstName} ${client.lastName} is expiring on ${policy.endDate}.`,
                timestamp: new Date().toISOString(),
                isRead: false,
                link: `client/${client.id}`
            });
        }
    }
};


export const getAllData = async (currentUser: User) => {
    // Fetch all data in parallel for efficiency
    const [
        users, agents, clients, policies, interactions, tasks, messages,
        licenses, calendarNotes, testimonials, initialNotifications
    ] = await Promise.all([
        db.users.find(),
        db.agents.find(),
        db.clients.find(),
        db.getAll('policies'),
        db.getAll('interactions'),
        db.getAll('tasks'),
        db.getAll('messages'),
        db.getAll('licenses'),
        db.getAll('calendarNotes'),
        db.getAll('testimonials'),
        db.getAll('notifications') // Fetch initial notifications
    ]);

    // Check for renewals and create notifications if necessary
    await checkAndCreateRenewalNotifications(policies, clients, initialNotifications);

    // Re-fetch notifications to include any newly created ones in this data load
    const finalNotifications = await db.getAll('notifications');

    // Omit passwords from the user list before sending to the client
    const sanitizedUsers = users.map(({ password, ...u }) => u);

    const allData = {
        users: sanitizedUsers,
        agents, clients, policies, interactions, tasks, messages,
        licenses, notifications: finalNotifications, calendarNotes, testimonials
    };
    
    // Filter data based on the current user's role
    if (currentUser.role === UserRole.AGENT) {
        // Agents should only see clients assigned to them.
        const agentClientIds = new Set(allData.clients.filter((c: Client) => c.agentId === currentUser.id).map(c => c.id));
        
        allData.clients = allData.clients.filter((c: Client) => c.agentId === currentUser.id);
        allData.policies = allData.policies.filter((p: Policy) => agentClientIds.has(p.clientId));
        allData.interactions = allData.interactions.filter((i: Interaction) => agentClientIds.has(i.clientId));
        allData.tasks = allData.tasks.filter((t: Task) => t.agentId === currentUser.id || (t.clientId && agentClientIds.has(t.clientId)));
        allData.licenses = allData.licenses.filter((l: License) => l.agentId === currentUser.id);
        allData.testimonials = allData.testimonials.filter((t: Testimonial) => t.agentId === currentUser.id);
    } else if (currentUser.role === UserRole.SUB_ADMIN) {
        // Sub-Admins primarily deal with leads, but might see all clients for context.
        // For now, let's assume they see all clients/leads but have limited actions handled by UI.
        // No specific data filtering here, but could be added (e.g., only show leads).
    }

    return allData;
};