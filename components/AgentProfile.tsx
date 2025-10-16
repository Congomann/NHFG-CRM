import React, { useState } from 'react';
import { Agent, User, UserRole, License, Testimonial, TestimonialStatus } from '../types';
// FIX: Removed unused 'DeleteIcon' import to resolve module export error.
import { CrmLogoIcon, LocationPinIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon, CalendarIcon, WhatsAppIcon, LinkedInIcon, FacebookIcon, MessageIcon, ClientsIcon, PencilIcon, InstagramIcon, TikTokIcon, TwitterIcon, SnapchatIcon, PlusIcon, InfoIcon, ShieldCheckIcon, CalendarDaysIcon, SunIcon, ArrowsUpDownIcon, ChartTrendingUpIcon, TruckIcon, CarIcon, WrenchScrewdriverIcon, HomeIcon, BuildingOfficeIcon, FireIcon, StethoscopeIcon, ShareIcon } from './icons';

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
    testimonials: Testimonial[];
    onAddTestimonial: (testimonialData: Omit<Testimonial, 'id' | 'status' | 'submissionDate'>) => void;
    isEmbedded?: boolean;
}

const InfoLine: React.FC<{icon: React.ReactNode; children: React.ReactNode}> = ({ icon, children }) => (
    <div className="flex items-center text-slate-600">
        <span className="mr-3 text-primary-600">{icon}</span>
        {children}
    </div>
);

const EditInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
);

const EditTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
);

const InsuranceServiceCard: React.FC<{ service: InsuranceService, index: number }> = ({ service, index }) => {
    const cardAnimationDelay = `${index * 0.1}s`;
    
    const CheckmarkIcon = () => (
        <svg className="w-5 h-5 text-white/80 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );

    return (
        <div 
            className={`card-enter rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/30 bg-gradient-to-br ${service.gradient}`} 
            style={{ animationDelay: cardAnimationDelay }}
        >
            <div className="flex-shrink-0" style={{ animation: `fadeInBenefit 0.5s ease-out ${parseFloat(cardAnimationDelay) + 0.2}s forwards`, opacity: 0 }}>
                <div className="bg-white/20 rounded-full p-3 inline-block mb-4">
                    {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                <p className="text-sm opacity-90 mb-6">{service.overview}</p>
            </div>
            <ul className="space-y-3 mt-auto">
                {service.benefits.map((benefit, i) => (
                    <li 
                        key={i} 
                        className="flex items-start benefit-item"
                        style={{ animationDelay: `${parseFloat(cardAnimationDelay) + 0.4 + (i * 0.15)}s` }}
                    >
                        <CheckmarkIcon />
                        <span className="text-sm" dangerouslySetInnerHTML={{ __html: benefit.replace(/–/g, '<span class="opacity-80">–</span>') }}></span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const SocialLink: React.FC<{href?: string, icon: React.ReactNode, label: string}> = ({ href, icon, label }) => {
    if (!href) return null;
    return <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors" aria-label={label} title={label}>{icon}</a>;
};

const TabButton: React.FC<{ tabId: string; label: string; activeTab: string; setActiveTab: (tabId: string) => void; }> = ({ tabId, label, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(tabId)}
        className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === tabId ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
    >
        {label}
    </button>
);


const AgentProfile: React.FC<AgentProfileProps> = ({ agent, onAddLead, currentUser, onMessageAgent, onViewAgentClients, onUpdateProfile, licenses, onAddLicense, onDeleteLicense, testimonials, onAddTestimonial, isEmbedded = false }) => {
    const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: ''});
    const [testimonialForm, setTestimonialForm] = useState({ author: '', quote: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<Agent>(agent);
    const [activeTab, setActiveTab] = useState('profile');
    const [copied, setCopied] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const isAdminView = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUB_ADMIN;
    const isOwner = currentUser.id === agent.id;

    const approvedTestimonials = testimonials.filter(t => t.agentId === agent.id && t.status === TestimonialStatus.APPROVED);
    
    const handleShare = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (isSharing) return;

        const canonicalUrl = `${window.location.origin}${window.location.pathname}#/agent/${agent.slug}`;
        const shareData = {
            title: `${agent.name} - Insurance Advisor`,
            text: `Connect with ${agent.name}, your trusted insurance advisor at New Holland Financial.`,
            url: canonicalUrl,
        };

        try {
            setIsSharing(true);
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(canonicalUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (error: any) {
            // Don't show an error if the user cancels the share dialog
            if (error.name === 'AbortError') {
                return;
            }
            console.error('Error sharing profile:', error);
            try {
                await navigator.clipboard.writeText(canonicalUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (copyError) {
                alert('Could not copy link. Please copy it manually: ' + canonicalUrl);
            }
        } finally {
            setIsSharing(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setContactForm({ ...contactForm, [e.target.name]: e.target.value });
    };

    const handleTestimonialFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTestimonialForm({ ...testimonialForm, [e.target.name]: e.target.value });
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

    const handleTestimonialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddTestimonial({ ...testimonialForm, agentId: agent.id });
        setTestimonialForm({ author: '', quote: '' });
    };

    const handleSave = () => {
        onUpdateProfile(editedProfile);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedProfile(agent);
        setIsEditing(false);
    };

    const ActionButton: React.FC<{ onClick: (e: React.MouseEvent<HTMLButtonElement>) => void; children: React.ReactNode; className: string; disabled?: boolean }> = ({ onClick, children, className, disabled }) => (
        <button onClick={onClick} disabled={disabled} className={`flex items-center justify-center text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-md shadow-sm transition-colors ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {children}
        </button>
    );

    return (
        <div className={isEmbedded ? "" : "bg-slate-100 min-h-screen"}>
            {!isEmbedded && (
                <header className="bg-white shadow-sm">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <CrmLogoIcon className="w-48" variant="light" />
                        <a href={`tel:${agent.phone}`} className="hidden sm:flex items-center bg-primary-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-primary-700 transition-colors"><PhoneIcon className="w-5 h-5 mr-2" /> Call {agent.name.split(' ')[0]} Now</a>
                    </div>
                </header>
            )}
            <main className={isEmbedded ? "p-4 sm:p-8" : "container mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
                 <>
                    {/* Agent Profile Header */}
                    <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 mb-8 relative">
                        <div className="absolute top-4 right-4 flex flex-col-reverse items-end sm:flex-row sm:items-center gap-2">
                            {isOwner && (
                                <>
                                    {isEditing ? (
                                        <>
                                            <ActionButton onClick={handleSave} className="bg-emerald-500 text-white hover:bg-emerald-600">Save Changes</ActionButton>
                                            <ActionButton onClick={handleCancel} className="bg-slate-500 text-white hover:bg-slate-600">Cancel</ActionButton>
                                        </>
                                    ) : (
                                        <ActionButton onClick={() => setIsEditing(true)} className="bg-secondary text-white hover:bg-slate-700">
                                            <PencilIcon className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Edit Profile</span>
                                        </ActionButton>
                                    )}
                                </>
                            )}
                             <ActionButton onClick={handleShare} disabled={isSharing} className="bg-sky-500 text-white hover:bg-sky-600">
                                <ShareIcon className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">{isSharing ? 'Sharing...' : copied ? 'Link Copied!' : 'Share Profile'}</span>
                            </ActionButton>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                            <img src={editedProfile.avatar} alt={editedProfile.name} className="w-28 h-28 sm:w-40 sm:h-40 rounded-full border-4 border-primary-600 object-cover" />
                            <div className="text-center md:text-left flex-1">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{agent.name}</h1>
                                <p className="text-lg sm:text-xl text-secondary font-medium mt-1">Your Trusted Insurance Advisor</p>
                                
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
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
                    <div className="mb-6 flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
                        <TabButton tabId="profile" label="About Me" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton tabId="solutions" label="Insurance Solutions" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton tabId="contact" label="Reviews & Contact" activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>

                    {/* Tab Content */}
                    <div className="mt-6">
                        {activeTab === 'profile' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                                <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 sm:p-8">
                                    {isEditing ? (
                                        <div><label className="text-sm font-medium">Bio</label><EditTextArea name="bio" value={editedProfile.bio} onChange={handleProfileChange} rows={5}/></div>
                                    ) : (
                                        <p className="text-lg text-slate-700 leading-relaxed italic">"{agent.bio}"</p>
                                    )}
                                </div>
                                <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg shadow-lg p-8 flex flex-col items-center justify-center text-white">
                                    <CalendarIcon className="w-16 h-16 mb-4" />
                                    <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">Book an Appointment</h2>
                                    <p className="text-center mb-6">Select a time that works for you, and I'll call you to discuss your needs.</p>
                                    <a href={agent.calendarLink} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-white text-primary-600 font-bold px-6 py-3 rounded-lg shadow-md hover:bg-primary-50 transition-transform hover:scale-105">
                                        Book Appointment
                                    </a>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'solutions' && (
                             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {INSURANCE_SERVICES.map((service, index) => (
                                    <InsuranceServiceCard key={service.title} service={service} index={index} />
                                ))}
                            </div>
                        )}

                        {activeTab === 'contact' && (
                            <div className="space-y-8">
                                <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">⭐ What My Clients Say</h2>
                                    <div className="space-y-6">
                                    {approvedTestimonials.map((t) => (
                                        <div key={t.id} className="border-l-4 border-primary-500 pl-4">
                                            <p className="text-slate-600 italic">"{t.quote}"</p>
                                            <p className="text-right font-semibold text-slate-800 mt-2">&ndash; {t.author}</p>
                                        </div>
                                    ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">Share Your Experience</h2>
                                    <form onSubmit={handleTestimonialSubmit}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <input type="text" name="author" placeholder="Your Name (e.g., John D.)" value={testimonialForm.author} onChange={handleTestimonialFormChange} className="w-full px-4 py-2 border border-slate-300 rounded-md" required />
                                        </div>
                                        <textarea name="quote" placeholder="Your experience with me..." value={testimonialForm.quote} onChange={handleTestimonialFormChange} rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-md mb-4" required></textarea>
                                        <button type="submit" className="w-full sm:w-auto flex items-center justify-center bg-primary-600 text-white font-bold px-6 py-3 rounded-md shadow-sm hover:bg-primary-700 transition-transform hover:scale-105">Submit Testimonial</button>
                                    </form>
                                </div>
                                
                                <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 text-center">Connect With Me On Social Media</h2>
                                    <div className="flex justify-center space-x-4 sm:space-x-6 text-3xl sm:text-4xl text-slate-500">
                                        <SocialLink href={agent.socials.whatsapp} icon={<WhatsAppIcon />} label="WhatsApp" />
                                        <SocialLink href={agent.socials.linkedin} icon={<LinkedInIcon />} label="LinkedIn" />
                                        <SocialLink href={agent.socials.facebook} icon={<FacebookIcon />} label="Facebook" />
                                        <SocialLink href={agent.socials.tiktok} icon={<TikTokIcon />} label="TikTok" />
                                        <SocialLink href={agent.socials.instagram} icon={<InstagramIcon />} label="Instagram" />
                                        <SocialLink href={agent.socials.twitter} icon={<TwitterIcon />} label="Twitter" />
                                        <SocialLink href={agent.socials.snapchat} icon={<SnapchatIcon />} label="Snapchat" />
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">Contact Me Directly</h2>
                                    <form onSubmit={handleFormSubmit}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <input type="text" name="firstName" placeholder="First Name" value={contactForm.firstName} onChange={handleFormChange} className="w-full px-4 py-2 border border-slate-300 rounded-md" required />
                                            <input type="text" name="lastName" placeholder="Last Name" value={contactForm.lastName} onChange={handleFormChange} className="w-full px-4 py-2 border border-slate-300 rounded-md" required />
                                            <input type="email" name="email" placeholder="Email" value={contactForm.email} onChange={handleFormChange} className="w-full px-4 py-2 border border-slate-300 rounded-md" required />
                                            <input type="tel" name="phone" placeholder="Phone" value={contactForm.phone} onChange={handleFormChange} className="w-full px-4 py-2 border border-slate-300 rounded-md" required />
                                        </div>
                                        <textarea name="message" placeholder="Your Message..." value={contactForm.message} onChange={handleFormChange} rows={6} className="w-full px-4 py-2 border border-slate-300 rounded-md mb-4" required></textarea>
                                         <div className="flex flex-col sm:flex-row gap-4">
                                            <a href={`tel:${agent.phone}`} className="w-full text-center flex items-center justify-center bg-emerald-500 text-white font-bold px-6 py-3 rounded-md shadow-sm hover:bg-emerald-600 transition-transform hover:scale-105"><PhoneIcon className="w-5 h-5 mr-2" /> Call {agent.name.split(' ')[0]} Now</a>
                                            <button type="submit" className="w-full flex items-center justify-center bg-primary-600 text-white font-bold px-6 py-3 rounded-md shadow-sm hover:bg-primary-700 transition-transform hover:scale-105"><EnvelopeIcon className="w-5 h-5 mr-2" /> Send a Message</button>
                                         </div>
                                    </form>
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
            </main>
            {!isEmbedded && (
                <footer className="bg-slate-800 text-white mt-8">
                    <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between">
                        <p className="text-slate-400">&copy; {new Date().getFullYear()} New Holland Financial Group. All rights reserved.</p>
                    </div>
                </footer>
            )}
        </div>
    );
};

// Data for the insurance solutions cards
interface InsuranceService {
    category: 'Life' | 'Auto & Commercial' | 'Property & Health';
    title: string;
    overview: string;
    benefits: string[];
    gradient: string;
    icon: React.ReactNode;
}

const INSURANCE_SERVICES: InsuranceService[] = [
    {
        category: 'Life',
        title: "Whole Life Insurance",
        overview: "Permanent life insurance that provides coverage for your entire life and builds cash value over time, which you can borrow against or use in the future.",
        benefits: [
            "<b>Lifetime Coverage</b> – Your beneficiaries are guaranteed a death benefit.",
            "<b>Cash Value Growth</b> – Accumulates tax-deferred cash value at a guaranteed rate.",
            "<b>Loan Options</b> – Borrow against the cash value for emergencies or investments.",
            "<b>Level Premiums</b> – Premiums remain the same throughout your lifetime.",
            "<b>Financial Security</b> – Provides a foundation for estate planning."
        ],
        gradient: 'from-blue-800 to-indigo-900',
        icon: <ShieldCheckIcon className="w-8 h-8 text-white" />
    },
    {
        category: 'Life',
        title: "Universal Life (UL) Insurance",
        overview: "Offers permanent coverage with flexible premiums and death benefits, allowing you to adjust coverage to fit changing needs.",
        benefits: [
            "<b>Flexible Premiums</b> – Adjust your premium payments to your financial situation.",
            "<b>Adjustable Death Benefit</b> – Increase or decrease coverage as life changes.",
            "<b>Cash Value Growth</b> – Earn interest on the cash value with tax advantages.",
            "<b>Supplement Retirement</b> – Use cash value to supplement income later in life.",
            "<b>Financial Adaptability</b> – Ideal for changing financial obligations."
        ],
        gradient: 'from-sky-700 to-blue-800',
        icon: <ArrowsUpDownIcon className="w-8 h-8 text-white" />
    },
    {
        category: 'Life',
        title: "Indexed Universal Life (IUL)",
        overview: "Lifelong coverage with higher cash value growth potential linked to a stock market index, plus optional living benefits for illness.",
        benefits: [
            "<b>Market-Linked Growth</b> – Cash value can grow based on an index like the S&P 500.",
            "<b>Lifetime Protection</b> – Ensures your loved ones receive a death benefit.",
            "<b>Living Benefits</b> – Access your death benefit early for a qualifying illness.",
            "<b>Flexible Premiums</b> – Adjust coverage and payments to suit your life stage.",
            "<b>Tax Advantages</b> – Cash value grows tax-deferred and can be accessed tax-free."
        ],
        gradient: 'from-indigo-700 to-slate-800',
        icon: <ChartTrendingUpIcon className="w-8 h-8 text-white" />
    },
    {
        category: 'Life',
        title: "Term Life with Living Benefits",
        overview: "Temporary coverage (e.g., 10-30 years) at affordable rates. Living benefits allow you to access funds early if you face a serious illness.",
        benefits: [
            "<b>Affordable Coverage</b> – Lower premiums compared to permanent insurance.",
            "<b>Temporary Protection</b> – Covers obligations like a mortgage or tuition.",
            "<b>Living Benefits</b> – Access funds early for critical, chronic, or terminal illness.",
            "<b>Flexible Terms</b> – Choose term lengths that match your financial goals.",
            "<b>Peace of Mind</b> – Protection during your family's most vulnerable years."
        ],
        gradient: 'from-blue-700 to-blue-900',
        icon: <CalendarDaysIcon className="w-8 h-8 text-white" />
    },
    {
        category: 'Life',
        title: "Final Expense Insurance",
        overview: "A smaller whole life policy designed to cover funeral costs, medical bills, or other end-of-life expenses, reducing the burden on your family.",
        benefits: [
            "<b>Simplified Application</b> – Usually no medical exam required; quick approval.",
            "<b>Affordable Premiums</b> – Smaller coverage amounts make it accessible.",
            "<b>Covers End-of-Life Costs</b> – Ensures funeral and burial expenses are paid for.",
            "<b>Cash Value Accumulation</b> – Policy builds cash value that can be borrowed.",
            "<b>Peace of Mind for Loved Ones</b> – Reduces financial burden on family."
        ],
        gradient: 'from-slate-800 to-slate-900',
        icon: <SunIcon className="w-8 h-8 text-white" />
    },
    {
        category: 'Auto & Commercial',
        title: "Personal Auto Insurance",
        overview: "Covers your personal vehicles against accidents, theft, and other damages, providing financial protection and peace of mind on the road.",
        benefits: [
            "<b>Accident Protection</b> – Covers repair or replacement costs for your vehicle.",
            "<b>Liability Coverage</b> – Protects you if you cause injury or property damage.",
            "<b>Theft & Vandalism</b> – Pays for loss or damage due to theft or vandalism.",
            "<b>Medical Coverage</b> – Covers medical expenses for you and passengers.",
            "<b>Peace of Mind</b> – Ensures financial protection and legal compliance."
        ],
        gradient: 'from-sky-800 to-indigo-900',
        icon: <CarIcon className="w-8 h-8 text-white" />
    },
    {
        category: 'Auto & Commercial',
        title: "Commercial Auto Insurance",
        overview: "Designed for business vehicles, from single vans to large fleets, protecting against accidents, liability, and vehicle damage related to business.",
        benefits: [
            "<b>Business Vehicle Protection</b> – Covers repair or replacement of business vehicles.",
            "<b>Liability Coverage</b> – Protects if an employee causes injury or damage.",
            "<b>Fleet Management Support</b> – Ideal for companies with multiple vehicles.",
            "<b>Optional Add-Ons</b> – Can include roadside assistance and rental reimbursement.",
            "<b>Legal & Financial Security</b> – Protects your business assets."
        ],
        gradient: 'from-blue-800 to-slate-900',
        icon: <TruckIcon className="w-8 h-8 text-white" />
    },
    {
        category: 'Auto & Commercial',
        title: "Errors & Omissions (E&O)",
        overview: "E&O insurance protects businesses and professionals from claims of negligence, mistakes, or failure to deliver services as promised.",
        benefits: [
            "<b>Professional Liability</b> – Covers legal costs if a client claims financial loss.",
            "<b>Covers Settlements</b> – Pays damages or settlements awarded in lawsuits.",
            "<b>Peace of Mind</b> – Focus on business without fear of personal financial loss.",
            "<b>Business Credibility</b> – Shows clients you are serious about protecting them.",
            "<b>Customizable Coverage</b> – Tailored to fit the specific risks of your industry."
        ],
        gradient: 'from-indigo-800 to-indigo-900',
        icon: <WrenchScrewdriverIcon className="w-8 h-8 text-white" />
    },
    {
        category: 'Property & Health',
        title: "Home Insurance",
        overview: "Protects your home and personal belongings from damage, theft, and other unexpected events, providing financial security and peace of mind.",
        benefits: [
            "<b>Property Protection</b> – Covers your home against risks like fire or storms.",
            "<b>Personal Belongings</b> – Protects furniture, electronics, and other valuables.",
            "<b>Liability Protection</b> – Covers injuries to guests on your property.",
            "<b>Temporary Living Expenses</b> – Pays for housing if your home is uninhabitable.",
            "<b>Peace of Mind</b> – Ensures financial stability in case of unexpected events."
        ],
        gradient: 'from-sky-700 to-indigo-800',
        icon: <HomeIcon className="w-8 h-8 text-white" />
    },
    {
        category: 'Property & Health',
        title: "Property Insurance",
        overview: "Provides coverage for physical assets, including rental properties, commercial buildings, and equipment, against damage, theft, or loss.",
        benefits: [
            "<b>Asset Protection</b> – Safeguards buildings, inventory, and equipment.",
            "<b>Business Continuity</b> – Helps cover losses to maintain operations.",
            "<b>Liability Coverage</b> – Protects against third-party claims from accidents.",
            "<b>Customizable Policies</b> – Can include coverage for theft and natural disasters.",
            "<b>Financial Security</b> – Reduces the risk of significant financial loss."
        ],
        gradient: 'from-blue-700 to-slate-800',
        icon: <BuildingOfficeIcon className="w-8 h-8 text-white" />
    },
    {
        category: 'Property & Health',
        title: "Fire Insurance",
        overview: "Specifically covers damages caused by fire to homes, buildings, and other property, helping owners recover their losses quickly.",
        benefits: [
            "<b>Fire Damage Protection</b> – Pays for repair or rebuilding costs after a fire.",
            "<b>Contents Coverage</b> – Covers furniture and other items destroyed by fire.",
            "<b>Business Continuity</b> – Ensures minimal disruption for commercial properties.",
            "<b>Liability Protection</b> – Covers injuries or damages caused by accidental fires.",
            "<b>Peace of Mind</b> – Helps owners recover quickly and avoid financial strain."
        ],
        gradient: 'from-slate-700 to-slate-900',
        icon: <FireIcon className="w-8 h-8 text-white" />
    },
    {
        category: 'Property & Health',
        title: "Critical Illness Insurance",
        overview: "Provides a lump-sum cash payment if diagnosed with a serious illness, helping cover medical costs and lifestyle adjustments.",
        benefits: [
            "<b>Lump-Sum Payout</b> – Receive funds for treatment or living expenses.",
            "<b>Financial Security</b> – Helps cover costs not included in health insurance.",
            "<b>Flexibility</b> – Use the money for medical bills, mortgage, or daily expenses.",
            "<b>Peace of Mind</b> – Reduces financial stress while focusing on recovery.",
            "<b>Supplements Health Insurance</b> – Complements existing medical coverage."
        ],
        gradient: 'from-indigo-700 to-blue-900',
        icon: <StethoscopeIcon className="w-8 h-8 text-white" />
    }
];

export default AgentProfile;