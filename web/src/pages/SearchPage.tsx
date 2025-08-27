import React from 'react';
import { Search } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Games</h1>
        <p className="text-gray-600 mb-6">
          Advanced search functionality will be implemented in Phase 3
        </p>
        <div className="text-sm text-gray-500">
          Coming soon: Filter by sport, location, skill level, and date
        </div>
      </div>
    </div>
  );
}