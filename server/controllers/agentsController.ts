import { db } from '../db';
import { AgentStatus, UserRole, User } from '../../types';

export const approveAgent = (agentId: number, { role }: { role: UserRole }) => {
    const agent = db.agents.findById(agentId);
    const user = db.users.findById(agentId);

    if (!agent || !user) {
        throw { status: 404, message: 'Agent or user not found.' };
    }

    const updatedAgent = db.agents.update(agentId, { 
        status: AgentStatus.ACTIVE, 
        joinDate: new Date().toISOString().split('T')[0] 
    });

    const updatedUser = db.users.update(agentId, { 
        role: role, 
        title: role === UserRole.SUB_ADMIN ? 'Lead Manager' : 'Insurance Agent'
    });
    
    // Create a notification for the agent
    db.createRecord('notifications', {
        userId: agentId,
        message: `Congratulations! Your application has been approved. Welcome to New Holland Financial.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        link: 'dashboard'
    });

    return { agent: updatedAgent, user: updatedUser };
};

export const updateAgentStatus = (agentId: number, { status }: { status: AgentStatus }) => {
    const agent = db.agents.findById(agentId);
    if (!agent) {
        throw { status: 404, message: 'Agent not found.' };
    }
    
    const updatedAgent = db.agents.update(agentId, { status });

    // Also update the user's title to reflect their status
    if (status === AgentStatus.INACTIVE) {
        db.users.update(agentId, { title: 'Inactive Agent' });
    } else if (status === AgentStatus.ACTIVE) {
        const user = db.users.findById(agentId);
        db.users.update(agentId, { title: user?.role === UserRole.SUB_ADMIN ? 'Lead Manager' : 'Insurance Agent' });
    }
    
    return updatedAgent;
};

export const deleteAgent = (agentId: number) => {
    // The DB method now handles cascading the delete to the users table
    const success = db.agents.delete(agentId);
    if (!success) {
        throw { status: 404, message: 'Agent not found.' };
    }
    return { success: true };
};