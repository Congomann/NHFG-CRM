import { MOCK_USERS, MOCK_AGENTS, MOCK_CLIENTS, MOCK_POLICIES, MOCK_INTERACTIONS, MOCK_TASKS, MOCK_MESSAGES, MOCK_LICENSES, MOCK_NOTIFICATIONS } from '../constants';
import { User, Agent, Client, Policy, Interaction, Task, Message, License, Notification } from '../types';

const DB_PREFIX = 'safariLifeCrm_';

const getFromStorage = <T>(key: string, mockData: T): T => {
    try {
        const item = localStorage.getItem(DB_PREFIX + key);
        // If data exists, parse it. Otherwise, return the initial mock data.
        return item ? JSON.parse(item) : mockData;
    } catch (error) {
        console.error(`Error reading from localStorage for key "${key}":`, error);
        return mockData;
    }
};

const saveToStorage = <T>(key: string, data: T): void => {
    try {
        localStorage.setItem(DB_PREFIX + key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving to localStorage for key "${key}":`, error);
    }
};

// Initial Load / Getters
export const getUsers = () => getFromStorage<User[]>('users', MOCK_USERS);
export const getAgents = () => getFromStorage<Agent[]>('agents', MOCK_AGENTS);
export const getClients = () => getFromStorage<Client[]>('clients', MOCK_CLIENTS);
export const getPolicies = () => getFromStorage<Policy[]>('policies', MOCK_POLICIES);
export const getInteractions = () => getFromStorage<Interaction[]>('interactions', MOCK_INTERACTIONS);
export const getTasks = () => getFromStorage<Task[]>('tasks', MOCK_TASKS);
export const getMessages = () => getFromStorage<Message[]>('messages', MOCK_MESSAGES);
export const getLicenses = () => getFromStorage<License[]>('licenses', MOCK_LICENSES);
export const getNotifications = () => getFromStorage<Notification[]>('notifications', MOCK_NOTIFICATIONS);

// Savers (for entire tables)
export const saveUsers = (data: User[]) => saveToStorage('users', data);
export const saveAgents = (data: Agent[]) => saveToStorage('agents', data);
export const saveClients = (data: Client[]) => saveToStorage('clients', data);
export const savePolicies = (data: Policy[]) => saveToStorage('policies', data);
export const saveInteractions = (data: Interaction[]) => saveToStorage('interactions', data);
export const saveTasks = (data: Task[]) => saveToStorage('tasks', data);
export const saveMessages = (data: Message[]) => saveToStorage('messages', data);
export const saveLicenses = (data: License[]) => saveToStorage('licenses', data);
export const saveNotifications = (data: Notification[]) => saveToStorage('notifications', data);

// Check if it's the first run to initialize data from mocks
if (!localStorage.getItem(`${DB_PREFIX}initialized`)) {
    console.log("Initializing database in localStorage for the first time.");
    saveUsers(MOCK_USERS);
    saveAgents(MOCK_AGENTS);
    saveClients(MOCK_CLIENTS);
    savePolicies(MOCK_POLICIES);
    saveInteractions(MOCK_INTERACTIONS);
    saveTasks(MOCK_TASKS);
    saveMessages(MOCK_MESSAGES);
    saveLicenses(MOCK_LICENSES);
    saveNotifications(MOCK_NOTIFICATIONS);
    localStorage.setItem(`${DB_PREFIX}initialized`, 'true');
}