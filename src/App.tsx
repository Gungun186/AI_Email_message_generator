import React from 'react';
import { Header } from './components/Header';
import { GeneratorTab } from './components/GeneratorTab';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Header */}
      <Header />

      {/* Main Email & Message Generator Interface */}
      <main className="flex-1 pb-12">
        <GeneratorTab />
      </main>
    </div>
  );
}
