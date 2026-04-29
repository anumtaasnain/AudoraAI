import { useEffect, useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../lib/services';
import { FileCheck, Activity, CheckCircle, XCircle, ArrowRightCircle, QrCode, Smartphone } from 'lucide-react';

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
  const [selectedPass, setSelectedPass] = useState<any>(null);

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
               
               {user?.role === 'attendee' && reg.status === 'approved' && (
                 <div className="mt-4 pt-4 border-t flex justify-end">
                   <Button 
                     size="sm" 
                     className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                     onClick={() => setSelectedPass(reg)}
                   >
                     <Smartphone className="w-4 h-4" /> View Digital Pass
                   </Button>
                 </div>
               )}
            </Card>
          ))
        )}
      </div>

      {/* Digital Pass Modal */}
      {selectedPass && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm p-0 bg-white overflow-hidden shadow-2xl rounded-3xl">
             <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white text-center">
                <h3 className="text-xl font-bold mb-1">Entry Pass</h3>
                <p className="text-blue-100 text-sm">{selectedPass.eventId?.title}</p>
             </div>
             <div className="p-8 flex flex-col items-center">
                <div className="bg-white p-4 rounded-2xl shadow-inner border-2 mb-6">
                   <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=AUDORA-AI-${selectedPass._id}`} 
                      alt="Check-in QR" 
                      className="w-48 h-48"
                   />
                </div>
                <div className="text-center space-y-1 mb-8">
                   <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Attendee</p>
                   <p className="text-xl font-bold text-gray-900">{user?.email}</p>
                   <p className="text-sm text-gray-500">Scan at entrance for validation</p>
                </div>
                <Button 
                  className="w-full bg-gray-900 hover:bg-black text-white rounded-xl"
                  onClick={() => setSelectedPass(null)}
                >
                  Close Pass
                </Button>
             </div>
             <div className="bg-gray-50 p-4 text-center border-t border-dashed">
                <p className="text-[10px] text-gray-400 font-mono">ID: {selectedPass._id}</p>
             </div>
          </Card>
        </div>
      )}
    </div>
  );
}


