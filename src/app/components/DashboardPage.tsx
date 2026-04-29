import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useAuth } from '../../context/AuthContext';
import { Users, TrendingUp, AlertCircle, CheckCircle2, Clock, Sparkles, FileText, Eye } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { dashboardService, leadRequestService } from '../../lib/services';

const COLORS = { high: '#10b981', moderate: '#f59e0b', low: '#ef4444' };

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [engagementData, setEngagement] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leadRequests, setLeadRequests] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [viewingLeads, setViewingLeads] = useState<any[] | null>(null);
  const [leadsModalOpen, setLeadsModalOpen] = useState(false);
  const [assignErrors, setAssignErrors] = useState<Record<string, string>>({});
  const [viewingLeadsError, setViewingLeadsError] = useState('');

  useEffect(() => {
    if (user?.role === 'attendee') {
      navigate('/dashboard/profile');
      return;
    }
    const fetch = async () => {
      try {
        const [sRes, aRes, eRes] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getActivity(),
          dashboardService.getEngagementTrend(),
        ]);
        setSummary(sRes.data);
        setActivities(aRes.activities || []);
        setEngagement(eRes.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetch();

    // Fetch lead requests separately (organizer/admin)
    if (user?.role === 'organizer' || user?.role === 'admin') {
      (async () => {
        try {
          const lrRes = user?.role === 'organizer'
            ? await leadRequestService.getMy()
            : await leadRequestService.getAll();
          setLeadRequests(lrRes.data || []);
        } catch (err) {
          console.log('Lead requests endpoint not available yet:', err.message);
          // Keep empty array until backend is ready
        } finally {
          setLeadsLoading(false);
        }
      })();
    }
  }, []);

  const handleViewLeads = async (requestId: string) => {
    setViewingLeadsError('');
    try {
      const res = await leadRequestService.getAssignedLeads(requestId);
      setViewingLeads(res.data);
      setLeadsModalOpen(true);
    } catch (e: any) {
      setViewingLeadsError(e.message || 'Failed to load leads');
    }
  };

  if (loading) return <Spinner />;

  if (error) return (
    <div className="p-8 text-center">
      <p className="text-red-500 font-medium">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 underline text-sm">Retry</button>
    </div>
  );

  const relevanceData = summary ? [
    { name: 'High Relevance', value: summary.highRelevance?.count ?? 0,  color: COLORS.high },
    { name: 'Moderate',       value: summary.moderate?.count     ?? 0,  color: COLORS.moderate },
    { name: 'Low Relevance',  value: summary.lowRelevance?.count ?? 0,  color: COLORS.low },
  ] : [];

  const totalAttendees = summary?.totalAttendees ?? 0;

  const activityIconMap: Record<string, { icon: typeof CheckCircle2; color: string }> = {
    lead_identified:  { icon: CheckCircle2, color: 'green' },
    attendee_flagged: { icon: AlertCircle,  color: 'yellow' },
    sponsor_interest: { icon: TrendingUp,   color: 'blue' },
    roi_updated:      { icon: CheckCircle2, color: 'green' },
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    return `${Math.floor(hrs / 24)} day(s) ago`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Real-time insights into your audience quality and engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-2 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +{summary?.totalAttendeesChange ?? 0}%
            </span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Total Attendees</p>
          <p className="text-3xl font-bold text-gray-900">{totalAttendees}</p>
          <p className="text-xs text-gray-500">Registered for upcoming events</p>
        </Card>

        <Card className="p-6 border-2 border-green-100 bg-gradient-to-br from-green-50 to-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Excellent</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Highly Relevant</p>
          <p className="text-3xl font-bold text-green-600">{summary?.highRelevance?.count ?? 0}</p>
          <p className="text-xs text-gray-500">{summary?.highRelevance?.percentage ?? 0}% of total audience</p>
        </Card>

        <Card className="p-6 border-2 border-yellow-100 bg-gradient-to-br from-yellow-50 to-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-200">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">Good</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Moderate Match</p>
          <p className="text-3xl font-bold text-yellow-600">{summary?.moderate?.count ?? 0}</p>
          <p className="text-xs text-gray-500">{summary?.moderate?.percentage ?? 0}% of total audience</p>
        </Card>

        <Card className="p-6 border-2 border-red-100 bg-gradient-to-br from-red-50 to-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">Review</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Low Relevance</p>
          <p className="text-3xl font-bold text-red-600">{summary?.lowRelevance?.count ?? 0}</p>
          <p className="text-xs text-gray-500">{summary?.lowRelevance?.percentage ?? 0}% needs review</p>
        </Card>

        {user?.role === 'organizer' && (
          <Card className="p-6 border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Premium</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Purchased Leads</p>
            <p className="text-3xl font-bold text-purple-600">{summary?.purchasedLeads ?? 0}</p>
            <p className="text-xs text-gray-500">Total high-profile leads provisioned</p>
          </Card>
        )}
      </div>

      {/* My Lead Requests - Organizer & Admin */}
      {(user?.role === 'organizer' || user?.role === 'admin') && (
        <Card className="p-6 shadow-lg border-2 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            {user?.role === 'organizer' ? 'My Lead Requests' : 'All Lead Requests'}
          </h3>
          {leadsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading lead requests...</div>
          ) : leadRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No lead requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-500 border-b">
                  <tr>
                    {user?.role === 'admin' && <th className="pb-3">Organizer</th>}
                    <th className="pb-3">Event</th>
                    <th className="pb-3">Leads</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leadRequests.map((req: any) => (
                    <tr key={req._id} className="hover:bg-gray-50">
                      {user?.role === 'admin' && (
                        <td className="py-3">{req.organizerId?.email || '—'}</td>
                      )}
                      <td className="py-3 font-medium">{req.eventId?.title || '—'}</td>
                      <td className="py-3">{req.requestedLeadCount}</td>
                      <td className="py-3">${req.amountPaid}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          req.status === 'assigned' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {req.status === 'assigned' && (
                          <Button size="sm" variant="outline" className="gap-2" onClick={() => handleViewLeads(req._id)}>
                            <Eye className="w-4 h-4" /> View Assigned
                          </Button>
                        )}
                        {user?.role === 'admin' && req.status === 'pending' && (
                          <div>
                            {assignErrors[req._id] && (
                              <p className="text-xs text-red-600 mb-2">{assignErrors[req._id]}</p>
                            )}
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                              onClick={async () => {
                                setAssignErrors(prev => ({ ...prev, [req._id]: '' }));
                                try {
                                  const resp = await leadRequestService.assign(req._id);
                                  if (resp.success) {
                                    // Refresh list
                                    const lrRes = await leadRequestService.getAll();
                                    setLeadRequests(lrRes.data || []);
                                  } else {
                                    setAssignErrors(prev => ({ ...prev, [req._id]: resp.message }));
                                  }
                                } catch (e: any) {
                                  setAssignErrors(prev => ({ ...prev, [req._id]: e.message || 'Assignment failed' }));
                                }
                              }}
                            >
                              Assign Leads
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Assigned Leads Modal */}
      {leadsModalOpen && viewingLeads && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl p-6 bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Assigned Leads</h3>
              <Button variant="ghost" size="sm" onClick={() => { setLeadsModalOpen(false); setViewingLeadsError(''); }}>Close</Button>
            </div>
            {viewingLeadsError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                {viewingLeadsError}
              </div>
            )}
            <div className="grid gap-4">
              {viewingLeads.map((lead: any) => (
                <Card key={lead.id} className="p-4 border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-semibold">{lead.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold">{lead.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Title</p>
                      <p>{lead.title || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p>{lead.company || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Industry</p>
                      <p>{lead.industry || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p>{lead.phone || '—'}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 shadow-lg border-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Audience Relevance Distribution</h3>
          <p className="text-sm text-gray-600 mb-6">Breakdown by relevance score</p>
          <div style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={relevanceData} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100} dataKey="value">
                  {relevanceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            {relevanceData.map((item, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Engagement Prediction</h3>
          <p className="text-sm text-gray-600 mb-6">Historical vs AI-predicted engagement</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor:'white', border:'1px solid #e5e7eb', borderRadius:'8px' }} />
                <Legend />
                <Line type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={3} dot={{ fill:'#3b82f6', r:5 }} name="Actual Engagement" />
                <Line type="monotone" dataKey="prediction" stroke="#a855f7" strokeWidth={3} strokeDasharray="5 5" dot={{ fill:'#a855f7', r:5 }} name="AI Prediction" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Predicted Growth</span>
            </div>
            <span className="text-lg font-bold text-green-600">+15%</span>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 shadow-lg border-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Recent Activity</h3>
        <p className="text-sm text-gray-600 mb-6">Latest updates and notifications</p>
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent activity.</p>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity: any, index: number) => {
              const cfg = activityIconMap[activity.type] || activityIconMap.roi_updated;
              const Icon = cfg.icon;
              return (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-${cfg.color}-100`}>
                    <Icon className={`w-5 h-5 text-${cfg.color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{timeAgo(activity.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

