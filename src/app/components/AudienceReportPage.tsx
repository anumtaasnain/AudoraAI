import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { attendeeService, eventService, leadRequestService } from '../../lib/services';
import { Download, ArrowLeft, Users, Target, BarChart3, ShieldCheck, Sparkles } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];

export default function AudienceReportPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [event, setEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const confirmPayment = async (sessionId: string) => {
      setConfirming(true);
      try {
        await leadRequestService.confirm(sessionId);
        // Redirect to clean URL (without session_id) to avoid re-confirm on reload
        window.location.href = window.location.pathname;
      } catch (err: any) {
        console.error('Confirmation error:', err);
      } finally {
        setConfirming(false);
      }
    };

    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      confirmPayment(sessionId);
      return;
    }

    const fetch = async () => {
      try {
        setError(null);
        const [eRes, aRes] = await Promise.all([
          eventService.getEvent(eventId!),
          attendeeService.getAttendees({ eventId: eventId! })
        ]);
        setEvent(eRes.data);
        setAttendees(aRes.data || []);
      } catch (err: any) {
        console.error('Report fetch error:', err);
        setError(err.message || 'Failed to load report data');
      } finally { setLoading(false); }
    };
    fetch();
  }, [eventId, searchParams]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 animate-pulse">Generating AI Insight Report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8">
        <div className="text-red-500 text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900">{error}</h2>
        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state: no attendees for this event
  if (!loading && !error && attendees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 p-8 text-center">
        <Target className="w-24 h-24 text-gray-300" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Attendees Yet</h2>
          <p className="text-gray-600 max-w-md">
            This event doesn't have any provisioned attendees or registrations.
            Once attendees are assigned, the AI report will be generated automatically.
          </p>
          <Button onClick={() => navigate('/dashboard/events')} className="mt-6 bg-blue-600 hover:bg-blue-700">
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const industryData = attendees.reduce((acc: any[], curr: any) => {
    const ind = curr.industry || 'Other';
    const existing = acc.find(a => a.name === ind);
    if (existing) existing.value++;
    else acc.push({ name: ind, value: 1 });
    return acc;
  }, []);

  const scoreDistribution = [
    { range: '90-100', count: attendees.filter(a => a.relevanceScore >= 90).length },
    { range: '80-89',  count: attendees.filter(a => a.relevanceScore >= 80 && a.relevanceScore < 90).length },
    { range: '70-79',  count: attendees.filter(a => a.relevanceScore >= 70 && a.relevanceScore < 80).length },
    { range: '<70',    count: attendees.filter(a => a.relevanceScore < 70).length },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen print:bg-white">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
           <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={() => window.print()} className="bg-gray-900 text-white gap-2">
           <Download className="w-4 h-4" /> Export PDF
        </Button>
      </div>

      <Card className="p-12 shadow-2xl border-0 rounded-3xl bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Target className="w-64 h-64" />
        </div>
        
        {/* Header */}
        <div className="border-b pb-8 mb-8 flex justify-between items-end">
           <div>
              <div className="flex items-center gap-2 mb-2">
                 <Badge className="bg-blue-600 text-white border-0">AI INSIGHT REPORT</Badge>
                 <span className="text-gray-400 text-sm font-mono">#{eventId?.slice(-6).toUpperCase()}</span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">{event?.title}</h1>
              <p className="text-gray-500 max-w-xl">{event?.description}</p>
           </div>
           <div className="text-right">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Generated On</p>
              <p className="text-gray-900 font-semibold">{new Date().toLocaleDateString()}</p>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-12">
           <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-sm text-blue-600 font-medium">Total Provisioned</p>
              <p className="text-3xl font-black text-blue-900">{attendees.length}</p>
           </div>
           <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
              <Target className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm text-purple-600 font-medium">Avg. Relevance</p>
              <p className="text-3xl font-black text-purple-900">
                 {attendees.length > 0 ? Math.round(attendees.reduce((a,c)=>a+c.relevanceScore,0)/attendees.length) : 0}%
              </p>
           </div>
           <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
              <ShieldCheck className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-sm text-green-600 font-medium">Qualified Leads</p>
              <p className="text-3xl font-black text-green-900">
                 {attendees.filter(a => a.relevanceScore >= 80).length}
              </p>
           </div>
        </div>

        {/* Visuals */}
        <div className="grid lg:grid-cols-2 gap-12">
           <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                 <BarChart3 className="w-5 h-5 text-blue-600" /> Industry Segmentation
              </h3>
              <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={industryData} layout="vertical">
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} />
                       <Tooltip cursor={{fill: 'transparent'}} />
                       <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {industryData.map((entry:any, index:number) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                 <Target className="w-5 h-5 text-purple-600" /> AI Score Distribution
              </h3>
              <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                          data={scoreDistribution} 
                          cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count"
                          label={({range, percent}) => `${range}: ${(percent * 100).toFixed(0)}%`}
                       >
                          {scoreDistribution.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index]} />
                          ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        <div className="mt-12 p-8 bg-gray-900 rounded-3xl text-white">
           <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold">AI Executive Summary</h3>
           </div>
           <p className="text-gray-400 leading-relaxed italic">
              "The audience for **${event?.title}** shows an exceptional concentration in the **${industryData[0]?.name || 'Technology'}** sector with a high average relevance score of **${attendees.length > 0 ? Math.round(attendees.reduce((a,c)=>a+c.relevanceScore,0)/attendees.length) : 0}%**. 
              Data indicates a strong opportunity for sponsors targeting decision-makers in these fields. 
              Provisioned attendees exhibit a high conversion potential based on their professional background and active interest matching."
           </p>
        </div>

        <div className="mt-12 text-center text-gray-300 text-[10px] font-mono">
           © 2026 AUDORA AI - PROPRIETARY AI INSIGHT REPORT - CONFIDENTIAL
        </div>
      </Card>
    </div>
  );
}

const Badge = ({ children, className }: any) => (
  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${className}`}>{children}</span>
);


