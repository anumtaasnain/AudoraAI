import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, MapPin, Building, ShieldCheck } from 'lucide-react';

export default function UserProfilePage() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">View and manage your account details.</p>
      </div>

      <Card className="p-8 border-2 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="relative pt-16 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-white flex items-center justify-center text-4xl font-bold text-blue-600 bg-gradient-to-br from-blue-100 to-purple-100">
            {user.email.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {user.email.split('@')[0]}
              {user.role === 'attendee' && <ShieldCheck className="w-5 h-5 text-green-500" />}
            </h2>
            <p className="text-gray-500 text-lg capitalize">{user.role}</p>
          </div>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="w-5 h-5 text-gray-400" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <User className="w-5 h-5 text-gray-400" />
              <span>Account ID: {user.id || (user as any)._id}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Professional Details</h3>
            <div className="flex items-center gap-3 text-gray-600">
              <Building className="w-5 h-5 text-gray-400" />
              <span>Acme Corp (Placeholder)</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>San Francisco, CA</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


