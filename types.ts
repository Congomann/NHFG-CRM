export enum ClientStatus {
  LEAD = 'Lead',
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export enum PolicyType {
  WHOLE_LIFE = 'Whole Life',
  UNIVERSAL_LIFE = 'Universal Life',
  INDEXED_UNIVERSAL_LIFE = 'Indexed Universal Life (IUL)',
  FINAL_EXPENSE = 'Final Expense',
  CRITICAL_ILLNESS = 'Critical Illness',
  TERM_LIFE_WLB = 'Term Life WLB',
  TERM_LIFE = 'Term Life',
  HOME = 'Home Insurance',
  AUTO = 'Auto Insurance',
  COMMERCIAL = 'Commercial Insurance',
  PROPERTY = 'Property Insurance',
  E_AND_O = 'E&O Insurance',
}

export enum PolicyStatus {
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
  CANCELLED = 'Cancelled',
}

export enum InteractionType {
  CALL = 'Call',
  EMAIL = 'Email',
  MEETING = 'Meeting',
  NOTE = 'Note',
}

export enum UserRole {
  ADMIN = 'Admin',
  SUB_ADMIN = 'Sub-Admin',
  AGENT = 'Agent',
}

export enum AgentStatus {
    PENDING = 'Pending',
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
}

export enum LicenseType {
    HOME = 'Home State License',
    NON_RESIDENT = 'Non-Resident License',
}

export enum TestimonialStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
}

export interface User {
  id: number;
  name: string;
  email: string;
  // NOTE: In a real application, NEVER store passwords in plaintext. This is for simulation only.
  password?: string;
  role: UserRole;
  avatar: string;
  title: string;
  isVerified?: boolean;
  verificationCode?: string;
}

export interface Agent {
    id: number;
    name: string;
    slug: string;
    email: string;
    leads: number;
    clientCount: number;
    conversionRate: number;
    commissionRate: number;
    location: string;
    phone: string;
    languages: string[];
    bio: string;
    calendarLink: string;
    avatar: string;
    status: AgentStatus;
    joinDate: string;
    socials: {
        whatsapp?: string;
        linkedin?: string;
        facebook?: string;
        tiktok?: string;
        instagram?: string;
        twitter?: string;
        snapchat?: string;
    };
}

export interface License {
    id: number;
    agentId: number;
    type: LicenseType;
    state: string; // e.g., 'TX'
    licenseNumber: string;
    expirationDate: string; // YYYY-MM-DD
    fileName: string; // name of the uploaded file
    fileContent: string; // Base64 encoded file content
}


export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  status: ClientStatus;
  joinDate: string;
  agentId?: number;

  // Detailed lead info - optional for existing clients
  dob?: string;
  ssn?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountType?: 'Checking' | 'Saving';
  monthlyPremium?: number;
  annualPremium?: number;
  city?: string;
  state?: string;
  
  // New fields for sub-admin lead creation
  height?: string;
  weight?: number;
  birthState?: string;
  medications?: string;
}


export interface Policy {
  id: number;
  clientId: number;
  policyNumber: string;
  type: PolicyType;
  monthlyPremium: number;
  annualPremium: number;
  startDate: string;
  endDate: string;
  status: PolicyStatus;
  carrier?: string;
}

export interface Interaction {
  id: number;
  clientId: number;
  type: InteractionType;
  date: string;
  summary: string;
}

export interface Task {
  id: number;
  title: string;
  dueDate: string;
  completed: boolean;
  clientId?: number;
  agentId?: number;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  text: string;
  timestamp: string;
  edited?: boolean;
  status: 'active' | 'trashed';
  source: 'internal' | 'public_profile';
  deletedTimestamp?: string;
  deletedBy?: number;
  isRead: boolean;
}

export interface Notification {
  id: number;
  userId: number; // The user who receives the notification
  message: string;
  timestamp: string;
  isRead: boolean;
  link: string; // The view to navigate to, e.g., 'client/5'
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

export interface CalendarNote {
  id: number;
  userId: number;
  date: string; // YYYY-MM-DD
  text: string;
  color: string; // e.g., 'Blue', 'Green', 'Red'
}

export interface Testimonial {
  id: number;
  agentId: number;
  author: string; // e.g., 'Maria G.'
  quote: string;
  status: TestimonialStatus;
  submissionDate: string; // YYYY-MM-DD
}