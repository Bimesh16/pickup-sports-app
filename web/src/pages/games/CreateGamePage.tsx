import React from 'react';
import { Plus } from 'lucide-react';

export default function CreateGamePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Plus className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Game</h1>
        <p className="text-gray-600 mb-6">
          Game creation form will be implemented in Phase 2
        </p>
        <div className="text-sm text-gray-500">
          Coming soon: Create and manage pickup games
        </div>
      </div>
    </div>
  );
}