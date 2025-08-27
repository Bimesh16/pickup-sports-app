import React from 'react';
import { useParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export default function GameDetailsPage() {
  const { id } = useParams();
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Game Details</h1>
        <p className="text-gray-600 mb-6">
          Game ID: {id}
        </p>
        <div className="text-sm text-gray-500">
          Detailed game view will be implemented in Phase 2
        </div>
      </div>
    </div>
  );
}