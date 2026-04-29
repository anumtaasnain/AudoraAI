import { useEffect, useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../lib/services';
import { Calendar, MapPin, CheckCircle2, XCircle, Send, AlertCircle, PlusCircle, Building } from 'lucide-react';
import { useForm } from 'react-hook-form';

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending_admin':   return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending Admin Approval</Badge>;
    case 'pending_sponsor': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Pending Sponsor Approval</Badge>;
    case 'approved':        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Fully Approved</Badge>;
    case 'rejected':        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
    default:                return <Badge>{status}</Badge>;
  }
};

type EventForm = { title: string; description: string; eventType: string; location: string };

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const { register, handleSubmit, reset } = useForm<EventForm>();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsRes, registrationsRes] = await Promise.all([
        eventService.getEvents(),
        user?.role === 'attendee' ? eventService.getRegistrations() : Promise.resolve({ data: [] })
      ]);
      setEvents(eventsRes.data || []);
      if (user?.role === 'attendee') {
        setRegistrations(registrationsRes.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const onCreateEvent = async (data: EventForm) => {
    try {
      await eventService.createEvent(data);
      reset();
      setShowForm(false);
      fetchEvents();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getRegistrationStatus = (eventId: string) => {
    const reg = registrations.find(r => (r.eventId?._id || r.eventId) === eventId);
    return reg?.status;
  };


  const onUpdateStatus = async (id: string, status: string) => {
    try {
      await eventService.updateEventStatus(id, status);
      fetchEvents(); // Refresh list
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <Spinner />;

  // Admin sees pending_admin (and we can show others below if needed)
  const pendingAdminEvents = events.filter(e => e.status === 'pending_admin');
  const pendingSponsorEvents = events.filter(e => e.status === 'pending_sponsor');
  const otherEvents = events.filter(e => !['pending_admin', 'pending_sponsor'].includes(e.status));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Management</h1>
          <p className="text-gray-600">
            {user?.role === 'organizer' && "Manage your events and track approval status."}
            {user?.role === 'admin' && "Review and route incoming event requests."}
            {user?.role === 'sponsor' && "Review and approve events seeking sponsorship."}
          </p>
        </div>
        {user?.role === 'organizer' && (
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-blue-600 to-purple-600 gap-2">
             <PlusCircle className="w-4 h-4" /> {showForm ? 'Cancel' : 'Create New Event'}
          </Button>
        )}
      </div>

      {error && <div className="mb-4 p-4 text-red-700 bg-red-50 rounded-lg">{error}</div>}

      {/* Organizer Create Form */}
      {showForm && user?.role === 'organizer' && (
        <Card className="p-6 mb-8 border-2 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Create New Event Registration</h3>
          <form onSubmit={handleSubmit(onCreateEvent)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Title <span className="text-red-500">*</span></Label>
                <Input {...register('title', { required: true })} required placeholder="Global Tech Summit 2026" />
              </div>
              <div className="space-y-2">
                <Label>Event Type (Industry) <span className="text-red-500">*</span></Label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('eventType', { required: true })} required>
                  <option value="ai-ml">AI & ML</option>
                  <option value="cloud">Cloud Computing</option>
                  <option value="startup">Startup</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description <span className="text-red-500">*</span></Label>
                <Input {...register('description', { required: true })} required placeholder="A premier gathering of tech leaders..." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Location <span className="text-red-500">*</span></Label>
                <Input {...register('location', { required: true })} required placeholder="San Francisco, CA" />
              </div>
            </div>
            <Button 
              type="submit" 
              className="mt-4 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md border-0"
            >
              Submit for Admin Review
            </Button>
          </form>
        </Card>
      )}

      {/* Lists of Events Based on Role */}
      <div className="space-y-6">
        
        {/* === ADMIN VIEW === */}
        {user?.role === 'admin' && (
          <>
            <h3 className="text-xl font-bold flex items-center gap-2 mt-4"><AlertCircle className="w-5 h-5 text-yellow-500" /> Pending Admin Approval</h3>
            {pendingAdminEvents.length === 0 ? <p className="text-gray-500">No events waiting for admin approval.</p> : 
              pendingAdminEvents.map(event => (
                <EventCard key={event._id} event={event} role="admin" onStatus={onUpdateStatus} />
              ))
            }

            <h3 className="text-xl font-bold flex items-center gap-2 mt-8"><Building className="w-5 h-5 text-blue-500" /> Waiting on Sponsor</h3>
            {pendingSponsorEvents.length === 0 ? <p className="text-gray-500">No events currently routed to sponsors.</p> : 
              pendingSponsorEvents.map(event => (
                <EventCard key={event._id} event={event} role="viewer" onStatus={onUpdateStatus} />
              ))
            }
          </>
        )}

        {/* === SPONSOR VIEW === */}
        {user?.role === 'sponsor' && (
          <>
            <h3 className="text-xl font-bold flex items-center gap-2 mt-4"><Building className="w-5 h-5 text-blue-500" /> Events Available for Sponsorship</h3>
            {pendingSponsorEvents.length === 0 ? <p className="text-gray-500">No new events available for sponsorship at this time.</p> : 
              pendingSponsorEvents.map(event => (
                <EventCard key={event._id} event={event} role="sponsor" onStatus={onUpdateStatus} />
              ))
            }
          </>
        )}

        {/* === ATTENDEE VIEW === */}
        {user?.role === 'attendee' && (
           <div className="mt-8">
             <h3 className="text-xl font-bold mb-4">Browse Available Events</h3>
             {events.length === 0 ? <p className="text-gray-500">No events available right now.</p> :
               events.map(event => (
                 <EventCard 
                   key={event._id} 
                   event={event} 
                   role="attendee" 
                   onStatus={onUpdateStatus} 
                   registrationStatus={getRegistrationStatus(event._id)}
                 />
               ))
             }
           </div>
        )}

        {/* === ORGANIZER VIEW (or generic all list) === */}
        {(user?.role === 'organizer' || user?.role === 'sponsor' || user?.role === 'admin') && (
          <div className="mt-12">
            <h3 className="text-xl font-bold mb-4">
              {user?.role === 'organizer' ? 'Your Events' : 'Past / Processed Events'}
            </h3>
            {user?.role === 'organizer' ? (
              events.length === 0 ? <p className="text-gray-500">You haven't created any events yet.</p> :
              events.map(event => <EventCard key={event._id} event={event} role="viewer" onStatus={onUpdateStatus} />)
            ) : null}

            {user?.role !== 'organizer' && otherEvents.length > 0 && (
              otherEvents.map(event => <EventCard key={event._id} event={event} role="viewer" onStatus={onUpdateStatus} />)
            )}
            {user?.role !== 'organizer' && otherEvents.length === 0 && <p className="text-gray-500">No processed events.</p>}
          </div>
        )}

      </div>
    </div>
  );
}

const EventCard = ({ 
  event, 
  role, 
  onStatus, 
  registrationStatus 
}: { 
  event: any, 
  role: string, 
  onStatus: (id: string, s: string)=>void,
  registrationStatus?: string 
}) => (
  <Card className="p-6 border-2 shadow-sm hover:shadow-md transition-shadow bg-white">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="text-lg font-bold text-gray-900">{event.title}</h4>
          {getStatusBadge(event.status)}
        </div>
        <p className="text-gray-600 text-sm mb-3">{event.description || 'No description provided.'}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {event.location || 'TBA'}</span>
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {event.eventType || 'General'}</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col gap-2 min-w-[200px]">
        {role === 'admin' && event.status === 'pending_admin' && (
          <>
            <Button size="sm" onClick={() => onStatus(event._id, 'pending_sponsor')} className="bg-blue-600 hover:bg-blue-700 gap-2 text-white">
              <Send className="w-4 h-4"/> Send to Sponsor
            </Button>
            <Button size="sm" variant="outline" onClick={() => onStatus(event._id, 'rejected')} className="text-red-500 border-red-200 hover:bg-red-50 gap-2">
              <XCircle className="w-4 h-4"/> Reject Event
            </Button>
          </>
        )}

        {role === 'sponsor' && event.status === 'pending_sponsor' && (
          <>
            <Button size="sm" onClick={() => onStatus(event._id, 'approved')} className="bg-green-600 hover:bg-green-700 gap-2 text-white">
              <CheckCircle2 className="w-4 h-4"/> Accept & Sponsor
            </Button>
            <Button size="sm" variant="outline" onClick={() => onStatus(event._id, 'rejected')} className="text-red-500 border-red-200 hover:bg-red-50 gap-2">
              <XCircle className="w-4 h-4"/> Decline
            </Button>
          </>
        )}

        {role === 'attendee' && (
           <>
             {registrationStatus === 'approved' ? (
               <Button 
                 size="sm" 
                 disabled 
                 className="bg-green-100 text-green-700 border-green-200 gap-2 opacity-100"
               >
                 <CheckCircle2 className="w-4 h-4" /> Approved
               </Button>
             ) : registrationStatus === 'pending_admin' || registrationStatus === 'pending_organizer' ? (
               <Button 
                 size="sm" 
                 disabled 
                 className="bg-yellow-100 text-yellow-700 border-yellow-200 gap-2 opacity-100"
               >
                 <AlertCircle className="w-4 h-4" /> Pending Approval
               </Button>
             ) : registrationStatus === 'rejected' ? (
               <Button 
                 size="sm" 
                 disabled 
                 className="bg-red-100 text-red-700 border-red-200 gap-2 opacity-100"
               >
                 <XCircle className="w-4 h-4" /> Rejected
               </Button>
             ) : (
               <Button 
                 size="sm" 
                 onClick={async () => {
                   try {
                     await eventService.registerForEvent(event._id);
                     alert('Registration request submitted successfully!');
                     window.location.reload(); // Refresh to show pending state
                   } catch (e: any) {
                     alert(e.message);
                   }
                 }}
                 className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
               >
                 Request Registration
               </Button>
             )}
           </>
        )}

      </div>
    </div>
  </Card>
);
