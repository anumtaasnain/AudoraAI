import { useEffect, useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../lib/services';
import { FileCheck, Activity, CheckCircle, XCircle, ArrowRightCircle } from 'lucide-react';

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending_admin':     return <Badge className="bg-yellow-100 text-yellow-700">Pending Admin</Badge>;
    case 'pending_organizer': return <Badge className="bg-blue-100 text-blue-700">Pending Organizer</Badge>;
    case 'approved':          return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
    case 'rejected':          return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
    default:                  return <Badge>{status}</Badge>;
  }
};

export default function RegistrationsPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventService.getRegistrations();
      setRegistrations(res.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  const onUpdateStatus = async (id: string, status: string) => {
    try {
      await eventService.updateRegistrationStatus(id, status);
      fetchRegistrations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registrations Queue</h1>
        <p className="text-gray-600">
          {user?.role === 'attendee' && "Track the status of your event registration requests."}
          {user?.role === 'admin' && "Review and forward attendee registration requests."}
          {user?.role === 'organizer' && "Approve or decline incoming attendee requests for your events."}
        </p>
      </div>

      <div className="space-y-4">
        {registrations.length === 0 ? (
          <Card className="p-10 text-center text-gray-500">No registrations found.</Card>
        ) : (
          registrations.map(reg => (
            <Card key={reg._id} className="p-6 border-2 hover:shadow-md transition-shadow">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{reg.eventId?.title || 'Unknown Event'}</h3>
                    <p className="text-gray-600 mb-3">Attendee: {reg.userId?.email || 'Unknown User'}</p>
                    <div className="flex gap-2">
                      {getStatusBadge(reg.status)}
                      <Badge variant="outline" className="text-gray-500">Relevance: {reg.relevanceStatus}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {/* Admin Actions */}
                    {user?.role === 'admin' && reg.status === 'pending_admin' && (
                      <>
                        <Button size="sm" onClick={() => onUpdateStatus(reg._id, 'pending_organizer')} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                          <ArrowRightCircle className="w-4 h-4" /> Send to Organizer
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onUpdateStatus(reg._id, 'rejected')} className="text-red-600 border-red-200">
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                      </>
                    )}

                    {/* Organizer Actions */}
                    {user?.role === 'organizer' && reg.status === 'pending_organizer' && (
                      <>
                        <Button size="sm" onClick={() => onUpdateStatus(reg._id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                          <CheckCircle className="w-4 h-4" /> Approve Attendee
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onUpdateStatus(reg._id, 'rejected')} className="text-red-600 border-red-200">
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                      </>
                    )}
                  </div>
               </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
