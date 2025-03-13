import React from 'react';
import { YamlForm } from './components/YamlForm';

function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-neutral-800">API Connector Builder</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <YamlForm />
      </main>
      
      <footer className="bg-white border-t border-neutral-200 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-neutral-500">
          &copy; {new Date().getFullYear()} API Connector Builder
        </div>
      </footer>
    </div>
  );
}

export default App;