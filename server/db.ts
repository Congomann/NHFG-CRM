import { MOCK_USERS, MOCK_AGENTS, MOCK_CLIENTS, MOCK_POLICIES, MOCK_INTERACTIONS, MOCK_TASKS, MOCK_MESSAGES, MOCK_LICENSES, MOCK_NOTIFICATIONS, MOCK_CALENDAR_NOTES, MOCK_TESTIMONIALS } from '../constants';
import { User, Agent, Client, Policy, Interaction, Task, Message, License, Notification, CalendarNote, Testimonial, AgentStatus, UserRole } from '../types';

// In-memory data stores, initialized with mock data
let users: User[] = JSON.parse(JSON.stringify(MOCK_USERS));
let agents: Agent[] = JSON.parse(JSON.stringify(MOCK_AGENTS));
let clients: Client[] = JSON.parse(JSON.stringify(MOCK_CLIENTS));
let policies: Policy[] = JSON.parse(JSON.stringify(MOCK_POLICIES));
let interactions: Interaction[] = JSON.parse(JSON.stringify(MOCK_INTERACTIONS));
let tasks: Task[] = JSON.parse(JSON.stringify(MOCK_TASKS));
let messages: Message[] = JSON.parse(JSON.stringify(MOCK_MESSAGES));
let licenses: License[] = JSON.parse(JSON.stringify(MOCK_LICENSES));
let notifications: Notification[] = JSON.parse(JSON.stringify(MOCK_NOTIFICATIONS));
let calendarNotes: CalendarNote[] = JSON.parse(JSON.stringify(MOCK_CALENDAR_NOTES));
let testimonials: Testimonial[] = JSON.parse(JSON.stringify(MOCK_TESTIMONIALS));

// --- ID Generation ---
// To handle concurrent data growth, we'll manage a single sequence for IDs.
// This is more performant than scanning arrays on every creation.
let nextId = Math.max(
    0,
    ...users.map(u => u.id),
    ...agents.map(a => a.id),
    ...clients.map(c => c.id),
    ...policies.map(p => p.id),
    ...interactions.map(i => i.id),
    ...tasks.map(t => t.id),
    ...messages.map(m => m.id),
    ...licenses.map(l => l.id),
    ...notifications.map(n => n.id),
    ...calendarNotes.map(c => c.id),
    ...testimonials.map(t => t.id)
) + 1;

const getNextId = () => nextId++;


// --- User and Agent Management ---
export const db = {
  users: {
    find: () => users,
    findByEmail: (email: string) => users.find(u => u.email.toLowerCase() === email.toLowerCase()),
    findById: (id: number) => users.find(u => u.id === id),
    create: (data: Omit<User, 'id'>) => {
      const newId = getNextId();
      const newUser: User = { ...data, id: newId };
      users.push(newUser);
      return newUser;
    },
    update: (id: number, data: Partial<User>) => {
      let foundUser: User | undefined;
      users = users.map(u => {
        if (u.id === id) {
          foundUser = { ...u, ...data };
          return foundUser;
        }
        return u;
      });
      return foundUser;
    },
     delete: (id: number) => {
      const initialLength = users.length;
      users = users.filter(u => u.id !== id);
      return users.length < initialLength;
    }
  },
  agents: {
    find: () => agents,
    findById: (id: number) => agents.find(a => a.id === id),
    create: (data: Agent) => {
        agents.push(data);
        return data;
    },
    update: (id: number, data: Partial<Agent>) => {
        let foundAgent: Agent | undefined;
        agents = agents.map(a => {
            if (a.id === id) {
                foundAgent = { ...a, ...data };
                return foundAgent;
            }
            return a;
        });
        return foundAgent;
    },
    delete: (id: number) => {
        const initialLength = agents.length;
        agents = agents.filter(a => a.id !== id);
        // Cascading delete: also remove the user record
        if (agents.length < initialLength) {
            db.users.delete(id);
        }
        return agents.length < initialLength;
    }
  },
  clients: {
      find: () => clients,
      findById: (id: number) => clients.find(c => c.id === id),
      create: (data: Omit<Client, 'id'>) => {
          const newId = getNextId();
          const newClient = { ...data, id: newId };
          clients.push(newClient);
          return newClient;
      },
      update: (id: number, data: Partial<Client>) => {
          let foundClient: Client | undefined;
          clients = clients.map(c => {
            if (c.id === id) {
              foundClient = { ...c, ...data };
              return foundClient;
            }
            return c;
          });
          return foundClient;
      },
      delete: (id: number) => {
          const initialLength = clients.length;
          clients = clients.filter(c => c.id !== id);
          return clients.length < initialLength;
      }
  },
  // Generic CRUD for other models
  getAll: (resource: string) => {
      switch(resource) {
          case 'policies': return policies;
          case 'interactions': return interactions;
          case 'tasks': return tasks;
          case 'messages': return messages;
          case 'licenses': return licenses;
          case 'notifications': return notifications;
          case 'calendarNotes': return calendarNotes;
          case 'testimonials': return testimonials;
          default: return [];
      }
  },
  createRecord: <T extends {id: number}>(resource: string, data: Omit<T, 'id'>): T => {
      const newId = getNextId();
      const newRecord = { ...data, id: newId } as T;
      
      switch(resource) {
          case 'policies': policies.push(newRecord as any); break;
          case 'tasks': tasks.push(newRecord as any); break;
          case 'messages': messages.push(newRecord as any); break;
          case 'licenses': licenses.push(newRecord as any); break;
          case 'notifications': notifications.push(newRecord as any); break;
          case 'calendarNotes': calendarNotes.push(newRecord as any); break;
          case 'testimonials': testimonials.push(newRecord as any); break;
      }
      return newRecord;
  },
  updateRecord: <T extends {id: number}>(resource: string, id: number, data: Partial<T>): T | undefined => {
      let updatedRecord: T | undefined;
      const update = (table: T[]) => table.map(r => {
          if (r.id === id) {
              updatedRecord = { ...r, ...data };
              return updatedRecord;
          }
          return r;
      });

      switch(resource) {
          case 'policies': policies = update(policies as any) as any; break;
          case 'tasks': tasks = update(tasks as any) as any; break;
          case 'messages': messages = update(messages as any) as any; break;
          case 'licenses': licenses = update(licenses as any) as any; break;
          case 'notifications': notifications = update(notifications as any) as any; break;
          case 'calendarNotes': calendarNotes = update(calendarNotes as any) as any; break;
          case 'testimonials': testimonials = update(testimonials as any) as any; break;
      }
      return updatedRecord;
  },
  deleteRecord: (resource: string, id: number): boolean => {
      const filterById = <T extends {id: number}>(table: T[]) => table.filter(r => r.id !== id);
       switch(resource) {
          case 'policies': policies = filterById(policies); break;
          case 'tasks': tasks = filterById(tasks); break;
          case 'messages': messages = filterById(messages); break;
          case 'licenses': licenses = filterById(licenses); break;
          case 'testimonials': testimonials = filterById(testimonials); break;
          default: return false;
      }
      return true;
  }
};