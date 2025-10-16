import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initDB } from './server/db';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Show a loading indicator while DB is initializing
root.render(
    <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mb-4"></div>
        <div className="text-xl font-semibold text-slate-600">Initializing CRM...</div>
    </div>
);

initDB().then(() => {
    console.log("Database initialized successfully, rendering application.");
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
}).catch(error => {
    console.error("Failed to initialize database:", error);
    root.render(
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif', color: '#b91c1c' }}>
            <div>
                <h2 className="text-2xl font-bold">Error: Could not initialize CRM database.</h2>
                <p className="mt-2 text-slate-700">This can sometimes happen in certain browser modes or if storage is corrupted. Please try clearing your browser's site data for this page and then refresh.</p>
            </div>
        </div>
    );
});
