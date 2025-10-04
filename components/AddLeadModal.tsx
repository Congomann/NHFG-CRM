import React, { useState } from 'react';
import { Client, Agent } from '../types';
import { CloseIcon, PlusIcon } from './icons';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (leadData: Omit<Client, 'id' | 'status' | 'joinDate' | 'address'> & { agentId?: number }) => void;
  agents: Agent[];
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onAddLead, agents }) => {
  const [formState, setFormState] = useState({
    // Personal & Medical
    firstName: '',
    lastName: '',
    dob: '',
    birthState: '',
    phone: '',
    email: '',
    ssn: '',
    height: '',
    weight: '',
    medications: '',
    // Address
    city: '',
    state: '',
    // Financial
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'Checking' as 'Checking' | 'Saving',
    monthlyPremium: '',
    annualPremium: '',
    // Assignment
    agentId: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLead({
        ...formState,
        agentId: formState.agentId ? Number(formState.agentId) : undefined,
        weight: formState.weight ? Number(formState.weight) : undefined,
        monthlyPremium: Number(formState.monthlyPremium) || 0,
        annualPremium: Number(formState.annualPremium) || 0,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Create New Lead</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Personal Info */}
                <h3 className="col-span-full font-semibold text-lg text-slate-700 border-b border-slate-200 pb-2 mb-2">Personal &amp; Medical Information</h3>
                <InputField label="First Name" name="firstName" value={formState.firstName} onChange={handleChange} required />
                <InputField label="Last Name" name="lastName" value={formState.lastName} onChange={handleChange} required />
                <InputField label="Date of Birth" name="dob" type="date" value={formState.dob} onChange={handleChange} required />
                <InputField label="Birth State" name="birthState" value={formState.birthState} onChange={handleChange} />
                <InputField label="Phone Number" name="phone" type="tel" value={formState.phone} onChange={handleChange} required />
                <InputField label="Email Address" name="email" type="email" value={formState.email} onChange={handleChange} required />
                <InputField label="SSN" name="ssn" value={formState.ssn} onChange={handleChange} placeholder="***-**-****" />
                <InputField label="Height" name="height" value={formState.height} onChange={handleChange} placeholder="e.g., 5' 11&quot;" />
                <InputField label="Weight (lbs)" name="weight" type="number" value={formState.weight} onChange={handleChange} placeholder="e.g., 180" />
                <div className="md:col-span-2">
                    <label htmlFor="medications" className="block text-sm font-medium text-slate-700 mb-1.5">Current Medications</label>
                    <textarea id="medications" name="medications" value={formState.medications} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="List any current medications..."></textarea>
                </div>

                {/* Address Info */}
                <h3 className="col-span-full font-semibold text-lg text-slate-700 border-b border-slate-200 pb-2 mb-2 mt-4">Home Address</h3>
                <InputField label="City" name="city" value={formState.city} onChange={handleChange} required />
                <InputField label="Current State" name="state" value={formState.state} onChange={handleChange} required />
                
                {/* Financial Info */}
                <h3 className="col-span-full font-semibold text-lg text-slate-700 border-b border-slate-200 pb-2 mb-2 mt-4">Financial Details</h3>
                <InputField label="Bank Name" name="bankName" value={formState.bankName} onChange={handleChange} />
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Type</label>
                    <select name="accountType" value={formState.accountType} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="Checking">Checking</option>
                        <option value="Saving">Saving</option>
                    </select>
                </div>
                <InputField label="Routing Number" name="routingNumber" value={formState.routingNumber} onChange={handleChange} />
                <InputField label="Account Number" name="accountNumber" value={formState.accountNumber} onChange={handleChange} />
                <InputField label="Monthly Premium ($)" name="monthlyPremium" type="number" value={formState.monthlyPremium} onChange={handleChange} />
                <InputField label="Annual Premium ($)" name="annualPremium" type="number" value={formState.annualPremium} onChange={handleChange} />
                
                {/* Agent Assignment */}
                <h3 className="col-span-full font-semibold text-lg text-slate-700 border-b border-slate-200 pb-2 mb-2 mt-4">Agent Assignment</h3>
                <div className="md:col-span-2">
                    <label htmlFor="agentId" className="block text-sm font-medium text-slate-700 mb-1.5">Assign to Agent (Optional)</label>
                    <select
                        id="agentId"
                        name="agentId"
                        value={formState.agentId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">Unassigned</option>
                        {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex justify-end mt-8 items-center gap-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-500 flex items-center">
                <PlusIcon className="w-5 h-5 mr-2" /> Create Lead
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

const InputField: React.FC<{label: string, name: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void, type?: string, required?: boolean, placeholder?: string}> = ({ label, name, value, onChange, type = 'text', required = false, placeholder='' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5">{label}{required && <span className="text-red-500">*</span>}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" required={required} placeholder={placeholder} />
    </div>
);


export default AddLeadModal;
