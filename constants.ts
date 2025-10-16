import { Client, Policy, Interaction, Task, ClientStatus, PolicyType, PolicyStatus, InteractionType, User, UserRole, Agent, Message, AgentStatus, License, LicenseType, Notification, CalendarNote, Testimonial, TestimonialStatus } from './types';

// Let's assume today is 2024-07-24 for mocking dates.

// NOTE: Passwords for mock users are intentionally omitted.
// For the demo, log in with any of these emails and the password 'password123'.
// Newly registered users will have their passwords stored securely (simulated).
export const MOCK_USERS: User[] = [
    // Default system administrator login. This should remain permanent.
    { id: 1, name: 'Adama Lee', email: 'Support@newhollandfinancial.com', password: 'Support@2025', role: UserRole.ADMIN, avatar: 'https://i.pravatar.cc/150?u=admin', title: 'System Administrator' },
    { id: 2, name: 'Gaius Baltar', email: 'subadmin@newhollandfinancial.com', role: UserRole.SUB_ADMIN, avatar: 'https://i.pravatar.cc/150?u=subadmin', title: 'Lead Manager' },
    { id: 3, name: 'Kara Thrace', email: 'kara.t@newhollandfinancial.com', role: UserRole.AGENT, avatar: 'https://i.pravatar.cc/150?u=agent1', title: 'Senior Agent' },
    { id: 4, name: 'Alex Ray', email: 'alex.r@newhollandfinancial.com', role: UserRole.AGENT, avatar: 'https://picsum.photos/id/237/200/200', title: 'Insurance Agent' },
    { id: 5, name: 'Saul Tigh', email: 'saul.t@newhollandfinancial.com', role: UserRole.AGENT, avatar: 'https://i.pravatar.cc/150?u=agent3', title: 'Insurance Agent' },
    { id: 6, name: 'Laura Roslin', email: 'laura.r@newhollandfinancial.com', role: UserRole.AGENT, avatar: 'https://i.pravatar.cc/150?u=agent4', title: 'Agent Applicant' },
    { id: 7, name: 'William Adama', email: 'william.a@newhollandfinancial.com', role: UserRole.AGENT, avatar: 'https://i.pravatar.cc/150?u=agent5', title: 'Senior Agent' },
    { id: 8, name: 'Karl Agathon', email: 'karl.a@newhollandfinancial.com', role: UserRole.AGENT, avatar: 'https://i.pravatar.cc/150?u=agent6', title: 'Insurance Agent' },
];

export const MOCK_AGENTS: Agent[] = [
    { 
        id: 3, 
        name: 'Kara Thrace', 
        slug: 'kara-thrace',
        avatar: 'https://i.pravatar.cc/150?u=agent1',
        email: 'kara.t@newhollandfinancial.com', 
        leads: 25, 
        clientCount: 1,
        conversionRate: 0.8,
        commissionRate: 0.80,
        location: 'Dallas, TX',
        phone: '(214) 555-1234',
        languages: ['English', 'Spanish'],
        bio: 'Helping families secure their future is my passion. I specialize in life insurance, retirement planning, and protecting what matters most to you.',
        calendarLink: 'https://calendly.com/newholland-kara',
        status: AgentStatus.ACTIVE,
        joinDate: '2024-07-24',
        socials: {
            whatsapp: 'https://wa.me/12145551234',
            linkedin: 'https://linkedin.com/in/karathrace',
            facebook: 'https://facebook.com/karathrace',
            instagram: '',
            tiktok: '',
            twitter: '',
            snapchat: '',
        },
    },
    { 
        id: 4, 
        name: 'Alex Ray',
        slug: 'alex-ray', 
        avatar: 'https://picsum.photos/id/237/200/200',
        email: 'alex.r@newhollandfinancial.com', 
        leads: 30, 
        clientCount: 1,
        conversionRate: 0.75,
        commissionRate: 0.75,
        location: 'Austin, TX',
        phone: '(512) 555-5678',
        languages: ['English'],
        bio: 'I focus on creating customized insurance strategies for small business owners and entrepreneurs. Let\'s build a plan that grows with your business.',
        calendarLink: 'https://calendly.com/newholland-alex',
        status: AgentStatus.ACTIVE,
        joinDate: '2024-07-23',
        socials: {
            whatsapp: '',
            linkedin: 'https://linkedin.com/in/alexray',
            facebook: '',
            instagram: '',
            tiktok: '',
            twitter: '',
            snapchat: '',
        },
    },
    { 
        id: 6, 
        name: 'Laura Roslin', 
        slug: 'laura-roslin',
        avatar: 'https://i.pravatar.cc/150?u=agent4',
        email: 'laura.r@newhollandfinancial.com', 
        leads: 0, 
        clientCount: 0,
        conversionRate: 0,
        commissionRate: 0.75,
        location: 'Caprica City, CAP',
        phone: '(123) 555-0100',
        languages: ['English'],
        bio: 'Eager to begin a new career in helping clients achieve peace of mind through comprehensive insurance solutions.',
        calendarLink: 'https://calendly.com/newholland-laura',
        status: AgentStatus.PENDING,
        joinDate: '',
        socials: {},
    },
    { 
        id: 7, 
        name: 'William Adama', 
        slug: 'william-adama',
        avatar: 'https://i.pravatar.cc/150?u=agent5',
        email: 'william.a@newhollandfinancial.com', 
        leads: 40, 
        clientCount: 15,
        conversionRate: 0.85,
        commissionRate: 0.82,
        location: 'San Antonio, TX',
        phone: '(210) 555-0101',
        languages: ['English'],
        bio: 'A veteran in the insurance industry, committed to providing steadfast guidance and unwavering support to my clients. Specializing in long-term financial planning and family protection.',
        calendarLink: 'https://calendly.com/newholland-william',
        status: AgentStatus.ACTIVE,
        joinDate: '2024-07-23',
        socials: {
            linkedin: 'https://linkedin.com/in/williamadama',
        },
    },
    { 
        id: 8, 
        name: 'Karl Agathon',
        slug: 'karl-agathon', 
        avatar: 'https://i.pravatar.cc/150?u=agent6',
        email: 'karl.a@newhollandfinancial.com', 
        leads: 22, 
        clientCount: 8,
        conversionRate: 0.78,
        commissionRate: 0.75,
        location: 'El Paso, TX',
        phone: '(915) 555-0102',
        languages: ['English', 'Spanish'],
        bio: 'Focused on helping young families and professionals navigate their insurance options. I believe in clear communication and building lasting relationships.',
        calendarLink: 'https://calendly.com/newholland-karl',
        status: AgentStatus.ACTIVE,
        joinDate: '2024-07-23',
        socials: {
            twitter: 'https://twitter.com/karlagathon',
        },
    },
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
    { id: 1, agentId: 3, author: 'Maria G.', quote: 'Kara helped me find affordable coverage for my family. I feel so much more secure knowing we’re protected.', status: TestimonialStatus.APPROVED, submissionDate: '2024-07-24' },
    { id: 2, agentId: 3, author: 'David L.', quote: 'Extremely knowledgeable and patient. Kara walked me through all my options without any pressure.', status: TestimonialStatus.APPROVED, submissionDate: '2024-07-23' },
    { id: 5, agentId: 3, author: 'Samuel T.', quote: 'Working with Kara was a breeze. She is very responsive and clearly explained everything. I highly recommend her services!', status: TestimonialStatus.PENDING, submissionDate: '2024-07-24' },
];

export const MOCK_CLIENTS: Client[] = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '555-0101', address: '123 Maple St, Springfield, IL', city: 'Springfield', state: 'IL', status: ClientStatus.ACTIVE, joinDate: '2024-07-23', agentId: 3 },
  { id: 3, firstName: 'Alice', lastName: 'Johnson', email: 'alice.j@example.com', phone: '555-0103', address: '789 Pine Ln, Gotham, NJ', city: 'Gotham', state: 'NJ', status: ClientStatus.LEAD, joinDate: '2024-07-23' },
  { id: 5, firstName: 'Charlie', lastName: 'Davis', email: 'charlie.d@example.com', phone: '555-0105', address: '212 Cedar Blvd, Central City, MO', city: 'Central City', state: 'MO', status: ClientStatus.ACTIVE, joinDate: '2024-07-24', agentId: 4 },
  { id: 6, firstName: 'Diana', lastName: 'Prince', email: 'diana.p@example.com', phone: '555-0106', address: '1 Paradise Island, Themyscira', city: 'Themyscira', state: 'DC', status: ClientStatus.LEAD, joinDate: '2024-07-24' },
];

export const MOCK_LICENSES: License[] = [
    { id: 1, agentId: 3, type: LicenseType.HOME, state: 'TX', licenseNumber: 'TX-L123456', expirationDate: '2025-08-15', fileName: 'kara-thrace-tx-license.pdf', fileContent: '' },
    { id: 2, agentId: 3, type: LicenseType.NON_RESIDENT, state: 'CA', licenseNumber: 'CA-L987654', expirationDate: '2024-08-10', fileName: 'kara-thrace-ca-license.pdf', fileContent: '' },
    { id: 4, agentId: 4, type: LicenseType.NON_RESIDENT, state: 'FL', licenseNumber: 'FL-L112233', expirationDate: '2026-11-01', fileName: 'alex-ray-fl-license.pdf', fileContent: '' },
];

export const INSURANCE_CARRIERS: string[] = [
  'Root Insurance Company',
  'Next Insurance US Company',
  'Seaworthy Insurance Co',
  'Accendo Insurance Aetna Health Insurance',
  'Allianz Life Insurance',
  'AFLAC',
  'Americo',
  'Blue Ridge Insurance Co',
  'Bristol West Insurance Company',
  'Continental Life Insurance',
  'Foremost Insurance Co',
  'Gerber Life Insurance Co (Medicare)',
  'Geico',
  'Life Insurance Company of the Southwest',
  'National Life Group',
  'Oak Brook County Mutual Insurance Co',
  'Fidelity & Guaranty Life Insurance Company',
  'Symetra Life Insurance',
  'Transamerica Life Insurance',
];

export const MOCK_POLICIES: Policy[] = [
  { id: 101, clientId: 1, policyNumber: 'AUT-12345', type: PolicyType.AUTO, annualPremium: 1200, monthlyPremium: 100, startDate: '2024-07-23', endDate: '2025-07-23', status: PolicyStatus.ACTIVE, carrier: 'Geico' },
  { id: 102, clientId: 1, policyNumber: 'HOM-67890', type: PolicyType.HOME, annualPremium: 800, monthlyPremium: 66.67, startDate: '2024-07-23', endDate: '2025-07-23', status: PolicyStatus.ACTIVE, carrier: 'Foremost Insurance Co' },
  { id: 106, clientId: 5, policyNumber: 'HOM-PQRST', type: PolicyType.HOME, annualPremium: 950, monthlyPremium: 79.17, startDate: '2024-07-24', endDate: '2025-07-24', status: PolicyStatus.ACTIVE, carrier: 'National Life Group' },
];

export const MOCK_INTERACTIONS: Interaction[] = [
  { id: 1, clientId: 1, type: InteractionType.CALL, date: '2024-07-23', summary: 'Discussed renewal options for auto policy.' },
  { id: 2, clientId: 3, type: InteractionType.EMAIL, date: '2024-07-23', summary: 'Sent quote for life insurance.' },
  { id: 3, clientId: 5, type: InteractionType.NOTE, date: '2024-07-24', summary: 'Client mentioned interest in an umbrella policy. Follow up next week.' },
];

export const MOCK_TASKS: Task[] = [
    { id: 1, title: 'Follow up with Alice Johnson', dueDate: '2024-07-28', completed: false, clientId: 3 },
    { id: 2, title: 'Prepare renewal documents for John Doe', dueDate: '2024-07-24', completed: false, clientId: 1, agentId: 3 },
    { id: 4, title: 'Review quarterly performance report', dueDate: '2024-07-30', completed: false },
    { id: 5, title: 'Call Diana Prince about life insurance', dueDate: '2024-07-25', completed: false, clientId: 6, agentId: 4 },
];

export const MOCK_MESSAGES: Message[] = [
    { id: 1, senderId: 1, receiverId: 3, text: 'Hey Kara, how are the new leads looking?', timestamp: '2024-07-23T10:00:00Z', status: 'active', source: 'internal', isRead: true },
    { id: 2, senderId: 3, receiverId: 1, text: 'Looking good! Alice Johnson seems very promising.', timestamp: '2024-07-23T10:05:00Z', status: 'active', source: 'internal', isRead: true },
    { id: 3, senderId: 1, receiverId: 3, text: 'Excellent. Keep me updated.', timestamp: '2024-07-23T10:06:00Z', status: 'active', source: 'internal', isRead: true },
    { id: 4, senderId: 3, receiverId: 1, text: 'Will do.', timestamp: '2024-07-23T10:06:30Z', status: 'active', source: 'internal', isRead: true },
    { id: 5, senderId: 2, receiverId: 1, text: 'I have a new high-priority lead to assign. Who is available?', timestamp: '2024-07-24T09:00:00Z', status: 'active', source: 'internal', isRead: true },
    { id: 6, senderId: 1, receiverId: 2, text: 'Kara Thrace has the most bandwidth right now.', timestamp: '2024-07-24T09:02:00Z', status: 'active', source: 'internal', isRead: true },
    { id: 7, senderId: 4, receiverId: 3, text: 'Can you help me with the paperwork for the Smith policy?', timestamp: '2024-07-24T14:00:00Z', status: 'active', source: 'internal', isRead: true },
];

export const NOTE_COLORS: { name: string; bg: string; text: string; ring: string; }[] = [
    { name: 'Red', bg: 'bg-rose-100', text: 'text-rose-800', ring: 'ring-rose-500' },
    { name: 'Yellow', bg: 'bg-amber-100', text: 'text-amber-800', ring: 'ring-amber-500' },
    { name: 'Green', bg: 'bg-emerald-100', text: 'text-emerald-800', ring: 'ring-emerald-500' },
    { name: 'Blue', bg: 'bg-sky-100', text: 'text-sky-800', ring: 'ring-sky-500' },
    { name: 'Purple', bg: 'bg-violet-100', text: 'text-violet-800', ring: 'ring-violet-500' },
    { name: 'Gray', bg: 'bg-slate-100', text: 'text-slate-800', ring: 'ring-slate-500' },
];


export const MOCK_CALENDAR_NOTES: CalendarNote[] = [
    { id: 4, userId: 2, date: '2024-07-24', text: 'Review new lead assignments for the week.', color: 'Yellow' },
    { id: 5, userId: 1, date: '2024-07-29', text: 'Quarterly commission payout processing.', color: 'Purple' },
    { id: 6, userId: 3, date: '2024-07-25', text: 'Follow up with Diana Prince.', color: 'Green' },
];


export const MOCK_NOTIFICATIONS: Notification[] = [];