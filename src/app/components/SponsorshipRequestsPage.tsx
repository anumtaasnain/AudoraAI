import { useEffect, useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useAuth } from '../../context/AuthContext';
import { sponsorshipService } from '../../lib/services';
import { MessageSquare, CheckCircle2, XCircle, Clock, Send, User, Calendar, Building } from 'lucide-react';

export default function SponsorshipRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sponsorshipService.getMyRequests();
      setRequests(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const fetchMessages = async (requestId: string) => {
    try {
      const res = await sponsorshipService.getMessages(requestId);
      setMessages(res.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  useEffect(() => {
    let interval: any;
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      interval = setInterval(() => fetchMessages(selectedChat._id), 3000); // Polling for "live" chat
    }
    return () => clearInterval(interval);
  }, [selectedChat]);

  const onUpdateStatus = async (id: string, status: string) => {
    try {
      await sponsorshipService.updateStatus(id, status);
      fetchRequests();
    } catch (err: any) { alert(err.message); }
  };

  const onSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    try {
      await sponsorshipService.sendMessage(selectedChat._id, newMessage);
      setNewMessage('');
      fetchMessages(selectedChat._id);
    } catch (err: any) { alert(err.message); }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-500">Loading requests...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sponsorship Outreach</h1>
        <p className="text-gray-600">Track and manage your event sponsorship proposals and communications.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Requests List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
             <Calendar className="w-5 h-5" /> Proposals
          </h3>
          {requests.length === 0 ? (
            <Card className="p-8 text-center text-gray-500 border-dashed border-2">No sponsorship requests found.</Card>
          ) : (
            requests.map(req => (
              <Card 
                key={req._id} 
                className={`p-4 border-2 transition-all cursor-pointer hover:shadow-md ${selectedChat?._id === req._id ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-100'}`}
                onClick={() => setSelectedChat(req)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 truncate pr-2">{req.eventId?.title}</h4>
                  <StatusBadge status={req.status} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <User className="w-3 h-3 text-blue-500"/> <b>Org:</b> {req.organizerId?.email}
                  </p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Building className="w-3 h-3 text-purple-500"/> <b>Sponsor:</b> {req.sponsorId?.email}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3">
                   <span className="text-[10px] text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                   <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] py-0">{req.tier}</Badge>
                      <MessageSquare className={`w-4 h-4 ${selectedChat?._id === req._id ? 'text-blue-500' : 'text-gray-300'}`} />
                   </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Chat / Details Area */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <Card className="h-[700px] flex flex-col border-2 shadow-xl bg-white overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{selectedChat.eventId?.title}</h3>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs text-gray-500"><b>Organizer:</b> {selectedChat.organizerId?.email}</p>
                    <p className="text-xs text-gray-500"><b>Sponsor:</b> {selectedChat.sponsorId?.email}</p>
                  </div>
                </div>
                {user?.role === 'sponsor' && selectedChat.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => onUpdateStatus(selectedChat._id, 'rejected')}>Reject</Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onUpdateStatus(selectedChat._id, 'accepted')}>Approve</Button>
                  </div>
                )}
                {user?.role === 'admin' && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">Admin Monitoring Mode</Badge>
                )}
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                {/* Initial Pitch */}
                <div className="flex justify-start">
                   <div className="max-w-[80%] bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                      <p className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">Initial Pitch</p>
                      <p className="text-gray-700">{selectedChat.message}</p>
                      <p className="text-[10px] text-gray-400 mt-2">{new Date(selectedChat.createdAt).toLocaleString()}</p>
                   </div>
                </div>

                {messages.map((m: any) => (
                  <div key={m._id} className={`flex ${m.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 px-4 rounded-2xl shadow-sm ${
                      m.senderId === user?.id 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-none' 
                        : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'
                    }`}>
                      <p className="text-sm">{m.text}</p>
                      <p className={`text-[10px] mt-1 ${m.senderId === user?.id ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t bg-white">
                {selectedChat.status === 'accepted' ? (
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                    <Button 
                      onClick={onSendMessage}
                      className="rounded-full w-10 h-10 p-0 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-500 italic">
                      {selectedChat.status === 'pending' ? 'Chat will unlock once the sponsor approves the proposal.' : 'This proposal was rejected.'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="h-[700px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-white text-gray-400">
               <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
               <p>Select a proposal to view details and start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':  return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
    case 'accepted': return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Accepted</Badge>;
    case 'rejected': return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
    default:         return <Badge>{status}</Badge>;
  }
};


