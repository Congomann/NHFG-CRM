import React from 'react';
import { ShieldIcon, HeartIcon, HomeIcon, CarIcon, CheckCircleIcon, UsersIcon } from './icons';

interface HomePageProps {
  onNavigate: (view: string) => void;
}

const ServiceCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 card-enter">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mx-auto mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600">{description}</p>
    </div>
);

const BenefitItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-start">
        <CheckCircleIcon className="w-6 h-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
        <p className="text-slate-600">{children}</p>
    </div>
);

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-20 md:py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="container mx-auto px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4" style={{ animation: `slideInUp 0.5s ease-out`}}>
            Protect What Matters Most
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8" style={{ animation: `slideInUp 0.5s ease-out 0.2s backwards`}}>
            Your Life, Family & Future. We provide tailored insurance solutions that secure financial peace of mind for individuals, families, and businesses.
          </p>
          <div className="flex justify-center items-center gap-4" style={{ animation: `slideInUp 0.5s ease-out 0.4s backwards`}}>
            <button onClick={() => onNavigate('contact')} className="bg-primary-600 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-primary-700 transition-transform hover:scale-105 button-press">
              Get a Free Quote
            </button>
            <button onClick={() => onNavigate('services')} className="bg-white text-primary-600 font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-slate-100 transition-transform hover:scale-105 button-press">
              Explore Services
            </button>
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800">Our Core Insurance Services</h2>
            <p className="text-slate-600 mt-2">Comprehensive protection for every stage of your life.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard icon={<ShieldIcon className="w-8 h-8"/>} title="Life Insurance" description="Secure your family's future with permanent or term life policies." />
            <ServiceCard icon={<HeartIcon className="w-8 h-8"/>} title="Health Insurance" description="Individual and group plans to cover medical, dental, and supplemental needs." />
            <ServiceCard icon={<HomeIcon className="w-8 h-8"/>} title="Property Insurance" description="Protect your home, belongings, and rental properties from unexpected events." />
            <ServiceCard icon={<CarIcon className="w-8 h-8"/>} title="Auto & Commercial" description="Reliable coverage for your personal, classic, and business vehicles." />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Why New Holland Financial?</h2>
              <p className="text-slate-600 mb-6">
                We're more than just an insurance agency; we're your partners in building a secure financial future. Our mission is rooted in integrity, experience, and a deep commitment to personalized service. We work with you to understand your unique needs and find the perfect coverage from top-rated carriers.
              </p>
              <div className="space-y-4">
                <BenefitItem><strong>Trusted Carriers:</strong> We partner with the nation's most reputable insurance companies to offer you the best products.</BenefitItem>
                <BenefitItem><strong>Personalized Coverage:</strong> Your needs are unique. We take the time to build a policy that fits your life and budget perfectly.</BenefitItem>
                <BenefitItem><strong>Licensed & Experienced Agents:</strong> Our team of professionals is dedicated to providing expert guidance and long-term support.</BenefitItem>
                <BenefitItem><strong>Fast Claims Assistance:</strong> When you need us most, we're here to help you navigate the claims process smoothly and efficiently.</BenefitItem>
              </div>
            </div>
            <div className="relative">
                <img src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1974&auto=format&fit=crop" alt="Insurance agent with clients" className="rounded-lg shadow-xl w-full" />
                 <div className="absolute -bottom-4 -right-4 bg-primary-600 text-white p-6 rounded-lg shadow-2xl max-w-sm">
                    <UsersIcon className="w-10 h-10 mb-2 opacity-50"/>
                    <p className="font-bold">"Our agent was incredibly knowledgeable and helped us find affordable coverage we can truly rely on."</p>
                    <p className="text-sm mt-2 text-primary-200">- The Johnson Family</p>
                </div>
            </div>
          </div>
        </div>
      </section>
      
        {/* Call to Action Section */}
        <section className="bg-primary-700">
            <div className="container mx-auto px-6 lg:px-8 py-16 text-center text-white">
                <h2 className="text-3xl font-bold mb-2">Ready to Secure Your Future?</h2>
                <p className="max-w-2xl mx-auto mb-6">Let's talk. A short conversation with one of our expert advisors can help you find the perfect coverage. Get started with a no-obligation quote today.</p>
                <button onClick={() => onNavigate('contact')} className="bg-white text-primary-700 font-bold px-10 py-4 rounded-lg shadow-xl text-lg hover:bg-slate-100 transition-transform hover:scale-105 button-press">
                    Request a Free Consultation
                </button>
            </div>
        </section>
    </div>
  );
};

export default HomePage;