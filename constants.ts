import { Client, Policy, Interaction, Task, ClientStatus, PolicyType, PolicyStatus, InteractionType, User, UserRole, Agent, Message, AgentStatus, License, LicenseType, Notification, CalendarNote, Testimonial, TestimonialStatus } from './types';

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
        joinDate: '2022-08-15',
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
        clientCount: 2,
        conversionRate: 0.75,
        commissionRate: 0.75,
        location: 'Austin, TX',
        phone: '(512) 555-5678',
        languages: ['English'],
        bio: 'I focus on creating customized insurance strategies for small business owners and entrepreneurs. Let\'s build a plan that grows with your business.',
        calendarLink: 'https://calendly.com/newholland-alex',
        status: AgentStatus.ACTIVE,
        joinDate: '2023-01-20',
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
        id: 5, 
        name: 'Saul Tigh', 
        slug: 'saul-tigh',
        avatar: 'https://i.pravatar.cc/150?u=agent3',
        email: 'saul.t@newhollandfinancial.com', 
        leads: 15, 
        clientCount: 1,
        conversionRate: 0.9,
        commissionRate: 0.90,
        location: 'Houston, TX',
        phone: '(713) 555-9012',
        languages: ['English', 'German'],
        bio: 'With over 20 years of experience, I provide comprehensive auto, home, and property insurance solutions. My goal is to ensure you are properly covered for life\'s unexpected events.',
        calendarLink: 'https://calendly.com/newholland-saul',
        status: AgentStatus.INACTIVE,
        joinDate: '2021-11-01',
        socials: {
            whatsapp: '',
            linkedin: '',
            facebook: 'https://facebook.com/saultigh',
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
        joinDate: '2020-03-10',
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
        joinDate: '2023-05-22',
        socials: {
            twitter: 'https://twitter.com/karlagathon',
        },
    },
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
    { id: 1, agentId: 3, author: 'Maria G.', quote: 'Kara helped me find affordable coverage for my family. I feel so much more secure knowing we’re protected.', status: TestimonialStatus.APPROVED, submissionDate: '2024-06-10' },
    { id: 2, agentId: 3, author: 'David L.', quote: 'Extremely knowledgeable and patient. Kara walked me through all my options without any pressure.', status: TestimonialStatus.APPROVED, submissionDate: '2024-05-22' },
    { id: 3, agentId: 4, author: 'John S.', quote: 'Alex is a true professional. He understood my business needs and found the perfect group benefits package for my team.', status: TestimonialStatus.APPROVED, submissionDate: '2024-04-15' },
    { id: 4, agentId: 5, author: 'Laura P.', quote: 'Saul saved me hundreds on my auto insurance while getting me better coverage. A fantastic experience from start to finish.', status: TestimonialStatus.APPROVED, submissionDate: '2024-03-01' },
    { id: 5, agentId: 3, author: 'Samuel T.', quote: 'Working with Kara was a breeze. She is very responsive and clearly explained everything. I highly recommend her services!', status: TestimonialStatus.PENDING, submissionDate: '2024-06-18' },
];

export const MOCK_CLIENTS: Client[] = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '555-0101', address: '123 Maple St, Springfield, IL', city: 'Springfield', state: 'IL', status: ClientStatus.ACTIVE, joinDate: '2023-08-15', agentId: 3 },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '555-0102', address: '456 Oak Ave, Metropolis, NY', city: 'Metropolis', state: 'NY', status: ClientStatus.ACTIVE, joinDate: '2022-05-20', agentId: 4 },
  { id: 3, firstName: 'Alice', lastName: 'Johnson', email: 'alice.j@example.com', phone: '555-0103', address: '789 Pine Ln, Gotham, NJ', city: 'Gotham', state: 'NJ', status: ClientStatus.LEAD, joinDate: '2024-05-10' },
  { id: 4, firstName: 'Bob', lastName: 'Brown', email: 'bob.brown@example.com', phone: '555-0104', address: '101 Birch Rd, Star City, CA', city: 'Star City', state: 'CA', status: ClientStatus.INACTIVE, joinDate: '2022-02-01', agentId: 5 },
  { id: 5, firstName: 'Charlie', lastName: 'Davis', email: 'charlie.d@example.com', phone: '555-0105', address: '212 Cedar Blvd, Central City, MO', city: 'Central City', state: 'MO', status: ClientStatus.ACTIVE, joinDate: '2024-01-30', agentId: 4 },
  { id: 6, firstName: 'Diana', lastName: 'Prince', email: 'diana.p@example.com', phone: '555-0106', address: '1 Paradise Island, Themyscira', city: 'Themyscira', state: 'DC', status: ClientStatus.LEAD, joinDate: '2024-06-01' },
];

export const MOCK_LICENSES: License[] = [
    { id: 1, agentId: 3, type: LicenseType.HOME, state: 'TX', licenseNumber: 'TX-L123456', expirationDate: '2025-08-15', fileName: 'kara-thrace-tx-license.pdf', fileContent: '' },
    { id: 2, agentId: 3, type: LicenseType.NON_RESIDENT, state: 'CA', licenseNumber: 'CA-L987654', expirationDate: '2024-07-15', fileName: 'kara-thrace-ca-license.pdf', fileContent: '' },
    { id: 3, agentId: 4, type: LicenseType.HOME, state: 'TX', licenseNumber: 'TX-L654321', expirationDate: '2024-01-20', fileName: 'alex-ray-tx-license.pdf', fileContent: '' },
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
  { id: 101, clientId: 1, policyNumber: 'AUT-12345', type: PolicyType.AUTO, annualPremium: 1200, monthlyPremium: 100, startDate: '2024-01-01', endDate: '2025-01-01', status: PolicyStatus.ACTIVE, carrier: 'Geico' },
  { id: 102, clientId: 1, policyNumber: 'HOM-67890', type: PolicyType.HOME, annualPremium: 800, monthlyPremium: 66.67, startDate: '2024-03-15', endDate: '2025-03-15', status: PolicyStatus.ACTIVE, carrier: 'Foremost Insurance Co' },
  { id: 103, clientId: 2, policyNumber: 'LIF-ABCDE', type: PolicyType.WHOLE_LIFE, annualPremium: 2400, monthlyPremium: 200, startDate: '2022-06-01', endDate: '2032-06-01', status: PolicyStatus.ACTIVE, carrier: 'Transamerica Life Insurance' },
  { id: 104, clientId: 2, policyNumber: 'AUT-FGHIJ', type: PolicyType.AUTO, annualPremium: 1500, monthlyPremium: 125, startDate: '2022-07-20', endDate: '2023-07-20', status: PolicyStatus.EXPIRED, carrier: 'Bristol West Insurance Company' },
  { id: 105, clientId: 4, policyNumber: 'HEA-KLMNO', type: PolicyType.CRITICAL_ILLNESS, annualPremium: 3000, monthlyPremium: 250, startDate: '2021-11-11', endDate: '2022-11-11', status: PolicyStatus.CANCELLED, carrier: 'AFLAC' },
  { id: 106, clientId: 5, policyNumber: 'HOM-PQRST', type: PolicyType.HOME, annualPremium: 950, monthlyPremium: 79.17, startDate: '2024-02-10', endDate: '2025-02-10', status: PolicyStatus.ACTIVE, carrier: 'National Life Group' },
];

export const MOCK_INTERACTIONS: Interaction[] = [
  { id: 1, clientId: 1, type: InteractionType.CALL, date: '2024-05-20', summary: 'Discussed renewal options for auto policy.' },
  { id: 2, clientId: 1, type: InteractionType.EMAIL, date: '2024-05-18', summary: 'Sent quote for updated home insurance.' },
  { id: 3, clientId: 2, type: InteractionType.MEETING, date: '2024-05-15', summary: 'Annual policy review meeting.' },
  { id: 4, clientId: 3, type: InteractionType.CALL, date: '2024-05-10', summary: 'Initial call to discuss insurance needs.' },
  { id: 5, clientId: 1, type: InteractionType.NOTE, date: '2024-04-15', summary: 'Client mentioned interest in an umbrella policy during a casual conversation. Follow up in Q4.' },
];

export const MOCK_TASKS: Task[] = [
    { id: 1, title: 'Follow up with Alice Johnson', dueDate: '2024-06-25', completed: false, clientId: 3 },
    { id: 2, title: 'Prepare renewal documents for John Doe', dueDate: '2024-06-10', completed: false, clientId: 1, agentId: 3 },
    { id: 3, title: 'Send birthday email to Jane Smith', dueDate: '2024-05-20', completed: true, clientId: 2, agentId: 4 },
    { id: 4, title: 'Review quarterly performance report', dueDate: '2024-06-30', completed: false },
    { id: 5, title: 'Call Diana Prince about life insurance', dueDate: '2024-06-18', completed: false, clientId: 6, agentId: 4 },
];

export const MOCK_MESSAGES: Message[] = [
    { id: 1, senderId: 1, receiverId: 3, text: 'Hey Kara, how are the new leads looking?', timestamp: '2024-06-17T10:00:00Z', status: 'active', source: 'internal', isRead: true },
    { id: 2, senderId: 3, receiverId: 1, text: 'Looking good! Alice Johnson seems very promising.', timestamp: '2024-06-17T10:05:00Z', status: 'active', source: 'internal', isRead: true },
    { id: 3, senderId: 1, receiverId: 3, text: 'Excellent. Keep me updated.', timestamp: '2024-06-17T10:06:00Z', status: 'active', source: 'internal', isRead: true },
    { id: 4, senderId: 3, receiverId: 1, text: 'Will do.', timestamp: '2024-06-17T10:06:30Z', status: 'active', source: 'internal', isRead: true },
    { id: 5, senderId: 2, receiverId: 1, text: 'I have a new high-priority lead to assign. Who is available?', timestamp: '2024-06-18T09:00:00Z', status: 'active', source: 'internal', isRead: true },
    { id: 6, senderId: 1, receiverId: 2, text: 'Kara Thrace has the most bandwidth right now.', timestamp: '2024-06-18T09:02:00Z', status: 'active', source: 'internal', isRead: true },
    { id: 7, senderId: 4, receiverId: 3, text: 'Can you help me with the paperwork for the Smith policy?', timestamp: '2024-06-18T14:00:00Z', status: 'active', source: 'internal', isRead: true },
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
    { id: 1, userId: 1, date: '2024-07-10', text: 'Follow up with all pending agents.', color: 'Red' },
    { id: 2, userId: 3, date: '2024-07-15', text: 'Annual policy review for John Doe.', color: 'Blue' },
    { id: 3, userId: 4, date: '2024-07-15', text: 'Call Diana Prince re: life insurance options.', color: 'Green' },
    { id: 4, userId: 2, date: '2024-07-22', text: 'Review new lead assignments for the week.', color: 'Yellow' },
    { id: 5, userId: 1, date: '2024-07-29', text: 'Quarterly commission payout processing.', color: 'Purple' },
];


export const MOCK_NOTIFICATIONS: Notification[] = [];