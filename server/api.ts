import * as authController from './controllers/authController';
import * as agentsController from './controllers/agentsController';
import * as leadsController from './controllers/leadsController';
import * as usersController from './controllers/usersController';
import * as messagesController from './controllers/messagesController';
import * as dataController from './controllers/dataController';
import * as auth from './auth';
import { db } from './db';
import { User, UserRole, Policy, Interaction, Task, Message, License, Notification, CalendarNote, Testimonial } from '../types';

const SIMULATED_LATENCY = 0; // ms

const handleProtectedRequest = async (method: string, path: string, body: any, currentUser: User) => {
    // Agent-specific business logic
    const approveAgentMatch = path.match(/^\/api\/agents\/(\d+)\/approve$/);
    if (approveAgentMatch && method === 'POST') {
        return await agentsController.approveAgent(Number(approveAgentMatch[1]), body);
    }
    const agentStatusMatch = path.match(/^\/api\/agents\/(\d+)\/status$/);
    if (agentStatusMatch && method === 'PUT') {
        return await agentsController.updateAgentStatus(Number(agentStatusMatch[1]), body);
    }
    const agentDeleteMatch = path.match(/^\/api\/agents\/(\d+)$/);
     if (agentDeleteMatch && method === 'DELETE') {
        return await agentsController.deleteAgent(Number(agentDeleteMatch[1]));
    }
    
    // Lead/Client business logic
    if (path === '/api/leads/from-profile' && method === 'POST') {
        return await leadsController.createFromProfile(body);
    }

    // User business logic
    if (path === '/api/users/me' && method === 'PUT') {
        return await usersController.updateMyProfile(currentUser.id, body);
    }
    
    // Message business logic
    if (path === '/api/messages/broadcast' && method === 'POST') {
        return await messagesController.broadcastMessage(currentUser, body);
    }
    if (path === '/api/messages/mark-as-read' && method === 'PUT') {
        return await messagesController.markConversationAsRead(currentUser, body);
    }

    const messageActionMatch = path.match(/^\/api\/messages\/(\d+)\/(trash|restore)$/);
    if (messageActionMatch && method === 'PUT') {
        const [, messageId, action] = messageActionMatch;
        if (action === 'trash') {
            return await messagesController.trashMessage(currentUser, Number(messageId));
        }
        if (action === 'restore') {
            return await messagesController.restoreMessage(currentUser, Number(messageId));
        }
    }
    
    if (path === '/api/notifications/mark-all-read' && method === 'PUT') {
        return await messagesController.markAllNotificationsRead(body.userId);
    }
    
    const resourceMatch = path.match(/^\/api\/([a-zA-Z0-9]+)(?:\/(\d+))?$/);
    if (resourceMatch) {
        const [, resource, idStr] = resourceMatch;
        const id = Number(idStr);
        
        if (resource === 'messages') {
             if (method === 'POST') {
                return await messagesController.sendMessage(currentUser, body);
            }
            if (method === 'PUT' && id) {
                return await messagesController.editMessage(currentUser, id, body);
            }
            if (method === 'DELETE' && id) {
                return await messagesController.permanentlyDeleteMessage(currentUser, id);
            }
        }

        if (method === 'POST') {
            if (currentUser.role === UserRole.AGENT && resource === 'clients') body.agentId = currentUser.id;
            // When admin adds an agent, it goes through registration flow now.
            if (resource === 'agents' && currentUser.role === UserRole.ADMIN) {
                const existingUser = await db.users.findByEmail(body.email);
                if (existingUser) throw { status: 409, message: 'An account with this email already exists.' };
                
                const agentUser = await authController.register({
                    name: body.name,
                    email: body.email,
                    password: 'password123', // Default password
                    role: UserRole.AGENT,
                });
                const newAgent = await db.agents.findById(agentUser.user.id);
                if (!newAgent) throw { status: 500, message: "Failed to create agent profile."};
                return await db.updateRecord('agents', newAgent.id, body);
            }
            return await db.createRecord(resource, body);
        }
        if (method === 'PUT' && id) {
            return await db.updateRecord(resource, id, body);
        }
        if (method === 'DELETE' && id) {
            return await db.deleteRecord(resource, id);
        }
    }
    
    if (path === '/api/data' && method === 'GET') {
        return await dataController.getAllData(currentUser);
    }

    throw { status: 404, message: 'API endpoint not found' };
};

export const handleRequest = async (method: string, path: string, body?: any, headers?: any) => {
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      try {
        console.log(`[API Request] ${method} ${path}`, { body });

        if (path.startsWith('/api/auth')) {
          if (path === '/api/auth/login' && method === 'POST') return resolve(await authController.login(body));
          if (path === '/api/auth/register' && method === 'POST') return resolve(await authController.register(body));
          if (path === '/api/auth/verify' && method === 'POST') return resolve(await authController.verifyEmail(body));
          
          if (path === '/api/auth/me' && method === 'GET') {
            const token = headers?.Authorization?.split(' ')[1];
            if (!token) return reject({ status: 401, message: 'No token provided' });
            
            const payload = auth.verify(token);
            if (!payload) return reject({ status: 401, message: 'Invalid token' });

            const currentUser = await db.users.findById(payload.id);
            if (!currentUser) return reject({ status: 401, message: 'User not found' });
            
            return resolve(await authController.getMe(currentUser));
          }
          
          return reject({ status: 404, message: 'Auth endpoint not found' });
        }
        
        const token = headers?.Authorization?.split(' ')[1];
        if (!token) return reject({ status: 401, message: 'No token provided' });
        
        const payload = auth.verify(token);
        if (!payload) return reject({ status: 401, message: 'Invalid token' });

        const currentUser = await db.users.findById(payload.id);
        if (!currentUser) return reject({ status: 401, message: 'User not found' });

        resolve(await handleProtectedRequest(method, path, body, currentUser));

      } catch (error: any) {
        console.error(`[API Error] ${method} ${path}`, error);
        reject({ status: error.status || 500, message: error.message, ...(error.requiresVerification && {requiresVerification: true, user: error.user}), ...(error.requiresApproval && {requiresApproval: true, user: error.user}) });
      }
    }, SIMULATED_LATENCY);
  });
};