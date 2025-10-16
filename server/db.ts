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

export const initDB = (): Promise<IDBDatabase> => {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = request.result;
            
            // This function runs only when the DB is created for the first time or the version is upgraded.
            // We will create the schema and seed the data within this single transaction
            // to prevent race conditions.
            
            const seedFunctions: (() => void)[] = [];

            if (!db.objectStoreNames.contains(STORES.users)) {
                const store = db.createObjectStore(STORES.users, { keyPath: 'id', autoIncrement: true });
                store.createIndex('email', 'email', { unique: true });
                seedFunctions.push(() => MOCK_USERS.forEach(item => store.add(item)));
            }
            if (!db.objectStoreNames.contains(STORES.agents)) {
                const store = db.createObjectStore(STORES.agents, { keyPath: 'id' });
                seedFunctions.push(() => MOCK_AGENTS.forEach(item => store.add(item)));
            }
            if (!db.objectStoreNames.contains(STORES.clients)) {
                const store = db.createObjectStore(STORES.clients, { keyPath: 'id', autoIncrement: true });
                seedFunctions.push(() => MOCK_CLIENTS.forEach(item => store.add(item)));
            }
            if (!db.objectStoreNames.contains(STORES.policies)) {
                const store = db.createObjectStore(STORES.policies, { keyPath: 'id', autoIncrement: true });
                seedFunctions.push(() => MOCK_POLICIES.forEach(item => store.add(item)));
            }
            if (!db.objectStoreNames.contains(STORES.interactions)) {
                 const store = db.createObjectStore(STORES.interactions, { keyPath: 'id', autoIncrement: true });
                 seedFunctions.push(() => MOCK_INTERACTIONS.forEach(item => store.add(item)));
            }
            if (!db.objectStoreNames.contains(STORES.tasks)) {
                 const store = db.createObjectStore(STORES.tasks, { keyPath: 'id', autoIncrement: true });
                 seedFunctions.push(() => MOCK_TASKS.forEach(item => store.add(item)));
            }
            if (!db.objectStoreNames.contains(STORES.messages)) {
                 const store = db.createObjectStore(STORES.messages, { keyPath: 'id', autoIncrement: true });
                 seedFunctions.push(() => MOCK_MESSAGES.forEach(item => store.add(item)));
            }
            if (!db.objectStoreNames.contains(STORES.licenses)) {
                 const store = db.createObjectStore(STORES.licenses, { keyPath: 'id', autoIncrement: true });
                 seedFunctions.push(() => MOCK_LICENSES.forEach(item => store.add(item)));
            }
            if (!db.objectStoreNames.contains(STORES.notifications)) {
                const store = db.createObjectStore(STORES.notifications, { keyPath: 'id', autoIncrement: true });
                seedFunctions.push(() => MOCK_NOTIFICATIONS.forEach(item => store.add(item)));
            }
            if (!db.objectStoreNames.contains(STORES.calendarNotes)) {
                 const store = db.createObjectStore(STORES.calendarNotes, { keyPath: 'id', autoIncrement: true });
                 seedFunctions.push(() => MOCK_CALENDAR_NOTES.forEach(item => store.add(item)));
            }
            if (!db.objectStoreNames.contains(STORES.testimonials)) {
                 const store = db.createObjectStore(STORES.testimonials, { keyPath: 'id', autoIncrement: true });
                 seedFunctions.push(() => MOCK_TESTIMONIALS.forEach(item => store.add(item)));
            }

            // After defining schema, run all seed functions within this transaction
            console.log('Database schema created. Seeding initial data...');
            seedFunctions.forEach(fn => fn());
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
    findByEmail: async (email: string): Promise<User | undefined> => {
        const users = await getAll<User>(STORES.users);
        return users.find(user => user.email.toLowerCase() === email.toLowerCase());
    },
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
