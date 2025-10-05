import React, { useState, useMemo } from 'react';
import { Testimonial, TestimonialStatus } from '../types';
import { CheckCircleIcon, DeleteIcon, ChatBubbleLeftRightIcon } from './icons';

interface TestimonialsManagementProps {
  testimonials: Testimonial[];
  onUpdateTestimonialStatus: (testimonialId: number, status: TestimonialStatus) => void;
  onDeleteTestimonial: (testimonialId: number) => void;
  onNavigate: (view: string) => void;
}

const TestimonialsManagement: React.FC<TestimonialsManagementProps> = ({ testimonials, onUpdateTestimonialStatus, onDeleteTestimonial, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  const { pendingTestimonials, approvedTestimonials } = useMemo(() => {
    const pending: Testimonial[] = [];
    const approved: Testimonial[] = [];
    testimonials.forEach(t => {
      if (t.status === TestimonialStatus.PENDING) {
        pending.push(t);
      } else if (t.status === TestimonialStatus.APPROVED) {
        approved.push(t);
      }
    });
    return { 
        pendingTestimonials: pending.sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()),
        approvedTestimonials: approved.sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
    };
  }, [testimonials]);

  const handleApprove = (id: number) => {
    onUpdateTestimonialStatus(id, TestimonialStatus.APPROVED);
  };
  
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to permanently delete this testimonial?')) {
        onDeleteTestimonial(id);
    }
  };

  const TabButton: React.FC<{tabId: 'pending' | 'approved', label: string, count: number}> = ({ tabId, label, count }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${activeTab === tabId ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
    >
      {label} <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-xs">{count}</span>
    </button>
  );

  const TestimonialCard: React.FC<{ testimonial: Testimonial, isPending?: boolean }> = ({ testimonial, isPending = false }) => (
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between">
      <div>
        <blockquote className="italic text-slate-600 border-l-4 border-slate-200 pl-4">
          "{testimonial.quote}"
        </blockquote>
        <p className="text-right font-semibold text-slate-800 mt-2">&ndash; {testimonial.author}</p>
      </div>
      <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-200">
        <p className="text-xs text-slate-500">Submitted: {testimonial.submissionDate}</p>
        <div className="flex items-center space-x-2">
            {isPending && (
                <button onClick={() => handleApprove(testimonial.id)} className="flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-800 p-1.5 rounded-md hover:bg-emerald-50 transition-colors">
                    <CheckCircleIcon className="w-5 h-5 mr-1" /> Approve
                </button>
            )}
            <button onClick={() => handleDelete(testimonial.id)} className="flex items-center text-sm font-semibold text-rose-600 hover:text-rose-800 p-1.5 rounded-md hover:bg-rose-50 transition-colors">
                <DeleteIcon className="w-5 h-5 mr-1" /> Delete
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
        <button onClick={() => onNavigate('dashboard')} className="text-primary-600 hover:underline mb-6">&larr; Back to Dashboard</button>
        <div className="flex items-center mb-6">
            <ChatBubbleLeftRightIcon className="w-10 h-10 text-primary-600 mr-4" />
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800">Testimonial Management</h1>
                <p className="text-slate-500">Approve new testimonials to display them on your public profile.</p>
            </div>
        </div>
        
        <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <TabButton tabId="pending" label="Pending Approval" count={pendingTestimonials.length} />
                <TabButton tabId="approved" label="Approved" count={approvedTestimonials.length} />
            </nav>
        </div>

        <div className="mt-6">
            {activeTab === 'pending' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingTestimonials.length > 0 ? (
                        pendingTestimonials.map(t => <TestimonialCard key={t.id} testimonial={t} isPending />)
                    ) : (
                        <p className="text-slate-500 col-span-full text-center py-8">No pending testimonials.</p>
                    )}
                </div>
            )}
            {activeTab === 'approved' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {approvedTestimonials.length > 0 ? (
                        approvedTestimonials.map(t => <TestimonialCard key={t.id} testimonial={t} />)
                    ) : (
                        <p className="text-slate-500 col-span-full text-center py-8">No approved testimonials yet.</p>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default TestimonialsManagement;