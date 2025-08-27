import React from 'react';
import { Shield } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Admin functionality will be implemented in Phase 4
        </p>
        <div className="text-sm text-gray-500">
          Coming soon: User management, moderation tools, and analytics
        </div>
      </div>
    </div>
  );
}