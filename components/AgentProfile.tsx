import React, { useState } from 'react';
import { Agent, User, UserRole, License, LicenseType } from '../types';
import { SafariLogoIcon, LocationPinIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon, CalendarIcon, WhatsAppIcon, LinkedInIcon, FacebookIcon, ShieldIcon, MessageIcon, ClientsIcon, PencilIcon, InstagramIcon, TikTokIcon, TwitterIcon, SnapchatIcon, DeleteIcon, PlusIcon, InfoIcon } from './icons';
import AgentLicenses from './AgentLicenses';

interface AgentProfileProps {
    agent: Agent;
    onAddLead: (leadData: { firstName: string; lastName: string; email: string; phone: string; message: string; }) => void;
    currentUser: User;
    onMessageAgent: (agentId: number) => void;
    onViewAgentClients: (agentId: number) => void;
    onUpdateProfile: (updatedAgent: Agent) => void;
    licenses: License[];
    onAddLicense: (licenseData: Omit<License, 'id'>) => void;
    onDeleteLicense: (licenseId: number) => void;
    isEmbedded?: boolean;
}

const InfoLine: React.FC<{icon: React.ReactNode; children: React.ReactNode}> = ({ icon, children }) => (
    <div className="flex items-center text-slate-600">
        <span className="mr-3 text-primary-600">{icon}</span>
        {children}
    </div>
);

const InsuranceSolutionCard: React.FC<{title: string, icon: React.ReactNode, items: {name: string, description: string}[]}> = ({title, icon, items}) => (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center mb-4">
            <div className="text-primary-600 mr-3">{icon}</div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        </div>
        <ul className="space-y-3">
            {items.map(item => (
                <li key={item.name}>
                    <p className="font-semibold text-slate-700">{item.name}</p>
                    <p className="text-sm text-slate-600">{item.description}</p>
                </li>
            ))}
        </ul>
    </div>
);

const EditInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
);

const EditTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
);


const AgentProfile: React.FC<AgentProfileProps> = ({ agent, onAddLead, currentUser, onMessageAgent, onViewAgentClients, onUpdateProfile, licenses, onAddLicense, onDeleteLicense, isEmbedded = false }) => {
    const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: ''});
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<Agent>(agent);
    const [activeTab, setActiveTab] = useState('profile');

    const isAdminView = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUB_ADMIN;
    const isOwner = currentUser.id === agent.id;

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setContactForm({ ...contactForm, [e.target.name]: e.target.value });
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "languages") {
            setEditedProfile({...editedProfile, languages: value.split(',').map(lang => lang.trim())});
        } else {
            setEditedProfile({...editedProfile, [name]: value });
        }
    };
    
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setEditedProfile(prev => ({ ...prev, avatar: event.target.result as string }));
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSocialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedProfile(prev => ({
            ...prev,
            socials: {
                ...prev.socials,
                [name]: value
            }
        }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddLead(contactForm);
        setContactForm({ firstName: '', lastName: '', email: '', phone: '', message: ''});
    };

    const handleSave = () => {
        onUpdateProfile(editedProfile);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedProfile(agent);
        setIsEditing(false);
    };

    const TabButton: React.FC<{ tabId: string; label: string }> = ({ tabId, label }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === tabId ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
        >
            {label}
        </button>
    );

    const ProfileContent = () => (
        <>
            {/* Agent Profile Header */}
            <div className="bg-white rounded-lg border border-slate-200 p-8 mb-8 relative">
                {isOwner && (
                    <div className="absolute top-4 right-4 flex gap-2">
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} className="bg-emerald-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-emerald-600">Save Changes</button>
                                <button onClick={handleCancel} className="bg-slate-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-slate-600">Cancel</button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="flex items-center bg-secondary text-white px-4 py-2 rounded-md shadow-sm hover:bg-slate-700">
                                <PencilIcon className="w-5 h-5 mr-2" />
                                Edit Profile
                            </button>
                        )}
                    </div>
                )}
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <img src={editedProfile.avatar} alt={editedProfile.name} className="w-40 h-40 rounded-full border-4 border-primary-600 object-cover" />
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-4xl font-extrabold text-slate-900">{agent.name}</h1>
                        <p className="text-xl text-secondary font-medium mt-1">Your Trusted Insurance Advisor</p>
                        
                        {isEditing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4">
                                <div className="sm:col-span-2">
                                    <label htmlFor="avatar-upload" className="block text-sm font-medium text-slate-700 mb-1">Change Profile Picture</label>
                                    <input 
                                        type="file" 
                                        id="avatar-upload"
                                        name="avatar"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
                                    />
                                </div>
                                <div><label className="text-sm font-medium">Location (City, ST)</label><EditInput name="location" value={editedProfile.location} onChange={handleProfileChange} /></div>
                                <div><label className="text-sm font-medium">Phone</label><EditInput name="phone" value={editedProfile.phone} onChange={handleProfileChange} /></div>
                                <div><label className="text-sm font-medium">Email</label><EditInput name="email" type="email" value={editedProfile.email} onChange={handleProfileChange} /></div>
                                <div><label className="text-sm font-medium">Languages (comma-separated)</label><EditInput name="languages" value={editedProfile.languages.join(', ')} onChange={handleProfileChange} /></div>
                                <div><label className="text-sm font-medium">Calendar Link</label><EditInput name="calendarLink" value={editedProfile.calendarLink} onChange={handleProfileChange} /></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4">
                                <InfoLine icon={<LocationPinIcon />}><p>{agent.location}</p></InfoLine>
                                <InfoLine icon={<PhoneIcon />}><a href={`tel:${agent.phone}`} className="hover:underline">{agent.phone}</a></InfoLine>
                                <InfoLine icon={<EnvelopeIcon />}><a href={`mailto:${agent.email}`} className="hover:underline">{agent.email}</a></InfoLine>
                                <InfoLine icon={<GlobeAltIcon />}><p>{agent.languages.join(', ')}</p></InfoLine>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin Sections */}
            {isAdminView && !isEmbedded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Performance Metrics */}
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Agent Performance Metrics</h2>
                        <div className="grid grid-cols-3 gap-4 text-center pt-2">
                            <div><p className="text-3xl font-bold text-primary-600">{agent.clientCount}</p><p className="text-sm text-slate-500 font-medium">Clients</p></div>
                            <div><p className="text-3xl font-bold text-primary-600">{agent.leads}</p><p className="text-sm text-slate-500 font-medium">Leads</p></div>
                            <div><p className="text-3xl font-bold text-primary-600">{(agent.conversionRate * 100).toFixed(0)}%</p><p className="text-sm text-slate-500 font-medium">Conversion</p></div>
                        </div>
                    </div>
                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Quick Actions</h2>
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <button onClick={() => onMessageAgent(agent.id)} className="w-full flex items-center justify-center bg-secondary text-white font-bold px-6 py-3 rounded-md shadow-sm hover:bg-slate-700 transition-transform hover:scale-105"><MessageIcon className="w-5 h-5 mr-2" /> Message Agent</button>
                            <button onClick={() => onViewAgentClients(agent.id)} className="w-full flex items-center justify-center bg-primary-600 text-white font-bold px-6 py-3 rounded-md shadow-sm hover:bg-primary-700 transition-transform hover:scale-105"><ClientsIcon className="w-5 h-5 mr-2" /> View Clients</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Tab Navigation */}
            <div className="mb-6 flex space-x-2 border-b border-slate-200 pb-2">
                <TabButton tabId="profile" label="About Me" />
                <TabButton tabId="solutions" label="Insurance Solutions" />
                {(isOwner || isAdminView) && <TabButton tabId="licenses" label="Licenses" />}
                <TabButton tabId="contact" label="Contact & Testimonials" />
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-8">
                            {isEditing ? (
                                <div><label className="text-sm font-medium">Bio</label><EditTextArea name="bio" value={editedProfile.bio} onChange={handleProfileChange} rows={5}/></div>
                            ) : (
                                <p className="text-lg text-slate-700 leading-relaxed italic">"{agent.bio}"</p>
                            )}
                        </div>
                        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg shadow-lg p-8 flex flex-col items-center justify-center text-white">
                            <CalendarIcon className="w-16 h-16 mb-4" />
                            <h2 className="text-2xl font-bold mb-4 text-center">Book an Appointment</h2>
                            <p className="text-center mb-6">Select a time that works for you, and I'll call you to discuss your needs.</p>
                            <a href={agent.calendarLink} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-white text-primary-600 font-bold px-6 py-3 rounded-lg shadow-md hover:bg-primary-50 transition-transform hover:scale-105">
                                Book Appointment
                            </a>
                        </div>
                    </div>
                )}
                
                {activeTab === 'solutions' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                       <InsuranceSolutionCard title="Life Insurance" icon={<ShieldIcon />} items={LIFE_INSURANCE_ITEMS} />
                       <InsuranceSolutionCard title="Critical Illness Insurance" icon={<ShieldIcon />} items={CRITICAL_ILLNESS_ITEMS} />
                       <InsuranceSolutionCard title="Auto & Property Insurance" icon={<ShieldIcon />} items={AUTO_PROPERTY_ITEMS} />
                       <InsuranceSolutionCard title="Group Benefits" icon={<ShieldIcon />} items={GROUP_BENEFITS_ITEMS} />
                    </div>
                )}

                {activeTab === 'licenses' && (isOwner || isAdminView) && (
                    <AgentLicenses 
                        agentId={agent.id}
                        licenses={licenses}
                        onAddLicense={onAddLicense}
                        onDeleteLicense={onDeleteLicense}
                    />
                )}

                {activeTab === 'contact' && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
                        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-8">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Contact Me</h2>
                            <form onSubmit={handleFormSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <input type="text" name="firstName" placeholder="First Name" value={contactForm.firstName} onChange={handleFormChange} className="w-full px-4 py-2 border border-slate-300 rounded-md" required />
                                    <input type="text" name="lastName" placeholder="Last Name" value={contactForm.lastName} onChange={handleFormChange} className="w-full px-4 py-2 border border-slate-300 rounded-md" required />
                                    <input type="email" name="email" placeholder="Email" value={contactForm.email} onChange={handleFormChange} className="w-full px-4 py-2 border border-slate-300 rounded-md" required />
                                    <input type="tel" name="phone" placeholder="Phone" value={contactForm.phone} onChange={handleFormChange} className="w-full px-4 py-2 border border-slate-300 rounded-md" required />
                                </div>
                                <textarea name="message" placeholder="Your Message..." value={contactForm.message} onChange={handleFormChange} rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-md mb-4" required></textarea>
                                 <div className="flex flex-col sm:flex-row gap-4">
                                    <a href={`tel:${agent.phone}`} className="w-full text-center flex items-center justify-center bg-emerald-500 text-white font-bold px-6 py-3 rounded-md shadow-sm hover:bg-emerald-600 transition-transform hover:scale-105"><PhoneIcon className="w-5 h-5 mr-2" /> Call {agent.name.split(' ')[0]} Now</a>
                                    <button type="submit" className="w-full flex items-center justify-center bg-primary-600 text-white font-bold px-6 py-3 rounded-md shadow-sm hover:bg-primary-700 transition-transform hover:scale-105"><EnvelopeIcon className="w-5 h-5 mr-2" /> Send a Message</button>
                                 </div>
                            </form>
                        </div>
                         <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-8">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">⭐ Testimonials</h2>
                            <div className="space-y-6">
                            {agent.testimonials.map((t, i) => (
                                <div key={i} className="border-l-4 border-primary-500 pl-4">
                                    <p className="text-slate-600 italic">"{t.quote}"</p>
                                    <p className="text-right font-semibold text-slate-800 mt-2">&ndash; {t.author}</p>
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>
                )}
                 {isEditing && (
                    <div className="bg-white rounded-lg border border-slate-200 p-8 mt-8">
                         <h2 className="text-2xl font-bold text-slate-800 mb-4">Edit Social Handles</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div><label className="text-sm font-medium">WhatsApp</label><EditInput name="whatsapp" value={editedProfile.socials.whatsapp || ''} onChange={handleSocialsChange} /></div>
                            <div><label className="text-sm font-medium">LinkedIn</label><EditInput name="linkedin" value={editedProfile.socials.linkedin || ''} onChange={handleSocialsChange} /></div>
                            <div><label className="text-sm font-medium">Facebook</label><EditInput name="facebook" value={editedProfile.socials.facebook || ''} onChange={handleSocialsChange} /></div>
                            <div><label className="text-sm font-medium">TikTok</label><EditInput name="tiktok" value={editedProfile.socials.tiktok || ''} onChange={handleSocialsChange} /></div>
                            <div><label className="text-sm font-medium">Instagram</label><EditInput name="instagram" value={editedProfile.socials.instagram || ''} onChange={handleSocialsChange} /></div>
                            <div><label className="text-sm font-medium">Twitter</label><EditInput name="twitter" value={editedProfile.socials.twitter || ''} onChange={handleSocialsChange} /></div>
                            <div><label className="text-sm font-medium">Snapchat</label><EditInput name="snapchat" value={editedProfile.socials.snapchat || ''} onChange={handleSocialsChange} /></div>
                         </div>
                    </div>
                 )}
            </div>
        </>
    );

    const SocialLink: React.FC<{href?: string, icon: React.ReactNode}> = ({ href, icon }) => {
        if (!href) return null;
        return <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">{icon}</a>;
    }

    return (
        <div className={isEmbedded ? "" : "bg-slate-100 min-h-screen"}>
            {!isEmbedded && (
                <header className="bg-white shadow-sm">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center"><SafariLogoIcon className="w-10 h-10 text-primary-600" /><span className="text-xl font-bold text-slate-800 ml-3">Safari Life Group</span></div>
                        <a href={`tel:${agent.phone}`} className="hidden sm:flex items-center bg-primary-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-primary-700 transition-colors"><PhoneIcon className="w-5 h-5 mr-2" /> Call {agent.name.split(' ')[0]} Now</a>
                    </div>
                </header>
            )}
            <main className={isEmbedded ? "p-8" : "container mx-auto p-8"}>
                <ProfileContent />
            </main>
            {!isEmbedded && (
                <footer className="bg-slate-800 text-white mt-8">
                    <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between">
                        <p className="text-slate-400">&copy; {new Date().getFullYear()} Safari Life Group. All rights reserved.</p>
                        <div className="flex space-x-4 mt-4 md:mt-0 text-2xl text-slate-400">
                           <SocialLink href={agent.socials.whatsapp} icon={<WhatsAppIcon />} />
                           <SocialLink href={agent.socials.linkedin} icon={<LinkedInIcon />} />
                           <SocialLink href={agent.socials.facebook} icon={<FacebookIcon />} />
                           <SocialLink href={agent.socials.tiktok} icon={<TikTokIcon />} />
                           <SocialLink href={agent.socials.instagram} icon={<InstagramIcon />} />
                           <SocialLink href={agent.socials.twitter} icon={<TwitterIcon />} />
                           <SocialLink href={agent.socials.snapchat} icon={<SnapchatIcon />} />
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};

// Mock data that would typically come from a CMS or DB
const LIFE_INSURANCE_ITEMS = [
    {name: "Whole Life", description: "Permanent protection + growing cash value you can borrow against."},
    {name: "Universal Life", description: "Flexible premiums & coverage, designed to adapt to your changing needs."},
    {name: "Indexed Universal Life (IUL)", description: "Lifetime protection with market-linked growth + living benefits if you get seriously ill."},
    {name: "Term Life with Living Benefits", description: "Affordable coverage with options to access money early in case of illness."},
];

const CRITICAL_ILLNESS_ITEMS = [
    {name: "Lump-Sum Payout", description: "Lump-sum cash payout for cancer, stroke, or heart attack."},
    {name: "Flexible Use", description: "Money you can use however you need: medical bills, mortgage, or income replacement."},
];

const AUTO_PROPERTY_ITEMS = [
    {name: "Personal Auto", description: "Auto insurance tailored to your driving needs."},
    {name: "Home & Renters", description: "Homeowners, renters, or landlord coverage."},
    {name: "Commercial", description: "Commercial auto & business property protection."},
];

const GROUP_BENEFITS_ITEMS = [
    {name: "Health & Dental", description: "Health & Dental Plans for small businesses."},
    {name: "Disability Insurance", description: "Short & Long-Term Disability for income protection."},
    {name: "Income Protector Plans", description: "Supplemental Benefits to top up existing coverage and provide security when you can’t work."},
];


export default AgentProfile;
