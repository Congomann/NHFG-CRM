import { MOCK_USERS, MOCK_AGENTS, MOCK_CLIENTS, MOCK_POLICIES, MOCK_INTERACTIONS, MOCK_TASKS, MOCK_MESSAGES, MOCK_LICENSES, MOCK_NOTIFICATIONS, MOCK_CALENDAR_NOTES, MOCK_TESTIMONIALS } from '../constants';
import { User, Agent, Client, Policy, Interaction, Task, Message, License, Notification, CalendarNote, Testimonial } from '../types';

const DB_NAME = 'NewHollandCRM_DB';
const DB_VERSION = 1;

const STORES = {
    users: 'users',
    agents: 'agents',
    clients: 'clients',
    policies: 'policies',
    interactions: 'interactions',
    tasks: 'tasks',
    messages: 'messages',
    licenses: 'licenses',
    notifications: 'notifications',
    calendarNotes: 'calendarNotes',
    testimonials: 'testimonials',
};

let dbPromise: Promise<IDBDatabase>;

const initDB = (): Promise<IDBDatabase> => {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = request.result;
            const transaction = request.transaction!;
            
            // Define schema
            if (!db.objectStoreNames.contains(STORES.users)) {
                const userStore = db.createObjectStore(STORES.users, { keyPath: 'id', autoIncrement: true });
                userStore.createIndex('email', 'email', { unique: true });
            }
            if (!db.objectStoreNames.contains(STORES.agents)) {
                db.createObjectStore(STORES.agents, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.clients)) {
                db.createObjectStore(STORES.clients, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(STORES.policies)) {
                db.createObjectStore(STORES.policies, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(STORES.interactions)) {
                 db.createObjectStore(STORES.interactions, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(STORES.tasks)) {
                 db.createObjectStore(STORES.tasks, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(STORES.messages)) {
                 db.createObjectStore(STORES.messages, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(STORES.licenses)) {
                 db.createObjectStore(STORES.licenses, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(STORES.notifications)) {
                db.createObjectStore(STORES.notifications, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(STORES.calendarNotes)) {
                 db.createObjectStore(STORES.calendarNotes, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(STORES.testimonials)) {
                 db.createObjectStore(STORES.testimonials, { keyPath: 'id', autoIncrement: true });
            }
            
            // Seed data after schema is created
            transaction.oncomplete = () => {
                const seedDB = indexedDB.open(DB_NAME, DB_VERSION);
                seedDB.onsuccess = () => {
                    const db = seedDB.result;
                    const seedTransaction = db.transaction(Object.values(STORES), 'readwrite');
                    
                    MOCK_USERS.forEach(item => seedTransaction.objectStore(STORES.users).add(item));
                    MOCK_AGENTS.forEach(item => seedTransaction.objectStore(STORES.agents).add(item));
                    MOCK_CLIENTS.forEach(item => seedTransaction.objectStore(STORES.clients).add(item));
                    MOCK_POLICIES.forEach(item => seedTransaction.objectStore(STORES.policies).add(item));
                    MOCK_INTERACTIONS.forEach(item => seedTransaction.objectStore(STORES.interactions).add(item));
                    MOCK_TASKS.forEach(item => seedTransaction.objectStore(STORES.tasks).add(item));
                    MOCK_MESSAGES.forEach(item => seedTransaction.objectStore(STORES.messages).add(item));
                    MOCK_LICENSES.forEach(item => seedTransaction.objectStore(STORES.licenses).add(item));
                    MOCK_NOTIFICATIONS.forEach(item => seedTransaction.objectStore(STORES.notifications).add(item));
                    MOCK_CALENDAR_NOTES.forEach(item => seedTransaction.objectStore(STORES.calendarNotes).add(item));
                    MOCK_TESTIMONIALS.forEach(item => seedTransaction.objectStore(STORES.testimonials).add(item));
                    
                    seedTransaction.oncomplete = () => console.log('Database seeded successfully.');
                    seedTransaction.onerror = (e) => console.error('Error seeding database:', e);
                }
            }
        };
    });
    return dbPromise;
};

// Generic helper functions for DB operations
const getAll = <T>(storeName: string): Promise<T[]> => new Promise(async (resolve, reject) => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

const getById = <T>(storeName: string, id: number): Promise<T | undefined> => new Promise(async (resolve, reject) => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

const add = <T>(storeName: string, item: any): Promise<T> => new Promise(async (resolve, reject) => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const request = tx.objectStore(storeName).add(item);
    request.onsuccess = () => resolve({ ...item, id: request.result as number });
    request.onerror = () => reject(request.error);
});

const put = <T>(storeName: string, item: T): Promise<T> => new Promise(async (resolve, reject) => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const request = tx.objectStore(storeName).put(item);
    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
});

const remove = (storeName: string, id: number): Promise<boolean> => new Promise(async (resolve, reject) => {
    const db = await initDB();
    const tx = db.transaction(storeName, 'readwrite');
    const request = tx.objectStore(storeName).delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(false);
});

// Database interface
export const db = {
  users: {
    find: () => getAll<User>(STORES.users),
    findByEmail: (email: string): Promise<User | undefined> => new Promise(async (resolve, reject) => {
        const db = await initDB();
        const tx = db.transaction(STORES.users, 'readonly');
        const index = tx.objectStore(STORES.users).index('email');
        const request = index.get(email.toLowerCase());
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    }),
    findById: (id: number) => getById<User>(STORES.users, id),
    create: (data: Omit<User, 'id'>) => add<User>(STORES.users, data),
    update: async (id: number, data: Partial<User>) => {
        const user = await getById<User>(STORES.users, id);
        if (!user) throw new Error('User not found');
        return put<User>(STORES.users, { ...user, ...data });
    },
    delete: (id: number) => remove(STORES.users, id),
  },
  agents: {
    find: () => getAll<Agent>(STORES.agents),
    findById: (id: number) => getById<Agent>(STORES.agents, id),
    create: (data: Agent) => add<Agent>(STORES.agents, data),
    update: async (id: number, data: Partial<Agent>) => {
        const agent = await getById<Agent>(STORES.agents, id);
        if (!agent) throw new Error('Agent not found');
        return put<Agent>(STORES.agents, { ...agent, ...data });
    },
    delete: async (id: number) => {
        // Unassign clients first
        const clients = await getAll<Client>(STORES.clients);
        for (const client of clients) {
            if (client.agentId === id) {
                await put<Client>(STORES.clients, { ...client, agentId: undefined });
            }
        }
        
        // Then delete the user and agent records
        await remove(STORES.users, id);
        return remove(STORES.agents, id);
    },
  },
  clients: {
      find: () => getAll<Client>(STORES.clients),
      findById: (id: number) => getById<Client>(STORES.clients, id),
      create: (data: Omit<Client, 'id'>) => add<Client>(STORES.clients, data),
      update: async (id: number, data: Partial<Client>) => {
          const client = await getById<Client>(STORES.clients, id);
          if (!client) throw new Error('Client not found');
          return put<Client>(STORES.clients, { ...client, ...data });
      },
      delete: (id: number) => remove(STORES.clients, id),
  },
  getAll: (resource: string) => getAll<any>(resource),
  createRecord: <T extends {id?: number}>(resource: string, data: Omit<T, 'id'>): Promise<T> => add<T>(resource, data),
  updateRecord: async <T extends {id: number}>(resource: string, id: number, data: Partial<Omit<T, 'id'>>): Promise<T | undefined> => {
      const record = await getById<T>(resource, id);
      if (!record) throw new Error('Record not found');
      return put<T>(resource, { ...record, ...data });
  },
  deleteRecord: (resource: string, id: number): Promise<boolean> => remove(resource, id),
};

// Ensure DB is initialized on load
initDB();