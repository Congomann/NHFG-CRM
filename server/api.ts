import * as authController from './controllers/authController';
import * as agentsController from './controllers/agentsController';
import * as leadsController from './controllers/leadsController';
import * as usersController from './controllers/usersController';
import * as messagesController from './controllers/messagesController';
import * as auth from './auth';
import { db } from './db';
import { User, UserRole, Policy, Interaction, Task, Message, License, Notification, CalendarNote, Testimonial } from '../types';

const SIMULATED_LATENCY = 300; // ms

// A simple routing function to handle protected resources
const handleProtectedRequest = (method: string, path: string, body: any, currentUser: User) => {
    // Agent-specific business logic
    const approveAgentMatch = path.match(/^\/api\/agents\/(\d+)\/approve$/);
    if (approveAgentMatch && method === 'POST') {
        return agentsController.approveAgent(Number(approveAgentMatch[1]), body);
    }
    const agentStatusMatch = path.match(/^\/api\/agents\/(\d+)\/status$/);
    if (agentStatusMatch && method === 'PUT') {
        return agentsController.updateAgentStatus(Number(agentStatusMatch[1]), body);
    }
    const agentDeleteMatch = path.match(/^\/api\/agents\/(\d+)$/);
     if (agentDeleteMatch && method === 'DELETE') {
        return agentsController.deleteAgent(Number(agentDeleteMatch[1]));
    }
    
    // Lead/Client business logic
    if (path === '/api/leads/from-profile' && method === 'POST') {
        return leadsController.createFromProfile(body);
    }

    // User business logic
    if (path === '/api/users/me' && method === 'PUT') {
        return usersController.updateMyProfile(currentUser.id, body);
    }
    
    // Message business logic
    if (path === '/api/messages/broadcast' && method === 'POST') {
        return messagesController.broadcastMessage(currentUser, body);
    }
    if (path === '/api/messages/mark-as-read' && method === 'PUT') {
        return messagesController.markConversationAsRead(currentUser, body);
    }

    const messageActionMatch = path.match(/^\/api\/messages\/(\d+)\/(trash|restore)$/);
    if (messageActionMatch && method === 'PUT') {
        const [, messageId, action] = messageActionMatch;
        if (action === 'trash') {
            return messagesController.trashMessage(currentUser, Number(messageId));
        }
        if (action === 'restore') {
            return messagesController.restoreMessage(currentUser, Number(messageId));
        }
    }
    
    // Simple CRUD operations
    const resourceMatch = path.match(/^\/api\/([a-zA-Z0-9]+)(?:\/(\d+))?$/);
    if (resourceMatch) {
        const [, resource, idStr] = resourceMatch;
        const id = Number(idStr);
        
        if (resource === 'messages') {
             if (method === 'POST') {
                return messagesController.sendMessage(currentUser, body);
            }
            if (method === 'PUT' && id) {
                return messagesController.editMessage(currentUser, id, body);
            }
            if (method === 'DELETE' && id) {
                return messagesController.permanentlyDeleteMessage(currentUser, id);
            }
        }

        if (method === 'POST') {
            if (currentUser.role === UserRole.AGENT && resource === 'clients') body.agentId = currentUser.id;
            return db.createRecord(resource, body);
        }
        if (method === 'PUT' && id) {
            return db.updateRecord(resource, id, body);
        }
        if (method === 'DELETE' && id) {
            return db.deleteRecord(resource, id);
        }
    }
    
    // Fallback for initial data load
    if (path === '/api/data' && method === 'GET') {
        // FIX: Explicitly cast the results of db.getAll to fix type inference issues.
        const allData = {
            users: db.users.find().map(({ password, ...u }) => u),
            agents: db.agents.find(),
            clients: db.clients.find(),
            policies: db.getAll('policies') as Policy[],
            interactions: db.getAll('interactions') as Interaction[],
            tasks: db.getAll('tasks') as Task[],
            messages: db.getAll('messages') as Message[],
            licenses: db.getAll('licenses') as License[],
            notifications: db.getAll('notifications') as Notification[],
            calendarNotes: db.getAll('calendarNotes') as CalendarNote[],
            testimonials: db.getAll('testimonials') as Testimonial[],
        };
        // Simple filtering based on role for initial load
        if (currentUser.role === UserRole.AGENT) {
            const agentClientIds = new Set(allData.clients.filter(c => c.agentId === currentUser.id).map(c => c.id));
            allData.clients = allData.clients.filter(c => c.agentId === currentUser.id);
            // FIX: Removed the unnecessary `as any` cast as `p` is now correctly typed as `Policy`.
            allData.policies = allData.policies.filter(p => agentClientIds.has(p.clientId));
            // further filtering can be added
        }
        return allData;
    }

    throw { status: 404, message: 'API endpoint not found' };
};

// This function simulates an API server handling a request.
export const handleRequest = async (method: string, path: string, body?: any, headers?: any) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        console.log(`[API Request] ${method} ${path}`, { body });

        // --- AUTH ROUTES (Public) ---
        if (path.startsWith('/api/auth')) {
          if (path === '/api/auth/login' && method === 'POST') return resolve(authController.login(body));
          if (path === '/api/auth/register' && method === 'POST') return resolve(authController.register(body));
          if (path === '/api/auth/verify' && method === 'POST') return resolve(authController.verifyEmail(body));
          return reject({ status: 404, message: 'Auth endpoint not found' });
        }
        
        // --- PROTECTED ROUTES ---
        const token = headers?.Authorization?.split(' ')[1];
        if (!token) return reject({ status: 401, message: 'No token provided' });
        
        const payload = auth.verify(token);
        if (!payload) return reject({ status: 401, message: 'Invalid token' });

        const currentUser = db.users.findById(payload.id);
        if (!currentUser) return reject({ status: 401, message: 'User not found' });

        // Delegate to the protected route handler
        resolve(handleProtectedRequest(method, path, body, currentUser));

      } catch (error: any) {
        console.error(`[API Error] ${method} ${path}`, error);
        reject({ status: error.status || 500, message: error.message, ...(error.requiresVerification && {requiresVerification: true, user: error.user}) });
      }
    }, SIMULATED_LATENCY);
  });
};