import { useEffect, useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Search, Flame, ThermometerSun, Snowflake, DollarSign, Target, Briefcase, Mail, Building2, ExternalLink, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { sponsorService } from '../../lib/services';
import { useAuth } from '../../context/AuthContext';

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const getQualityConfig = (quality: string) => {
  switch (quality) {
    case 'hot':  return { icon: Flame,          color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-200' };
    case 'warm': return { icon: ThermometerSun, color: 'text-yellow-500', bg: 'bg-yellow-100', border: 'border-yellow-200' };
    case 'cold': return { icon: Snowflake,      color: 'text-blue-500',   bg: 'bg-blue-100',   border: 'border-blue-200' };
    default:     return { icon: Flame,          color: 'text-gray-500',   bg: 'bg-gray-100',   border: 'border-gray-200' };
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new':       return 'bg-blue-100 text-blue-700';
    case 'viewed':    return 'bg-gray-100 text-gray-700';
    case 'contacted': return 'bg-yellow-100 text-yellow-700';
    case 'converted': return 'bg-green-100 text-green-700';
    case 'rejected':  return 'bg-red-100 text-red-700';
    default:          return 'bg-gray-100 text-gray-700';
  }
};

export default function SponsorPage() {
  const { user } = useAuth();
  const [filter, setFilter]       = useState<'all'|'hot'|'warm'|'cold'>('all');
  const [search, setSearch]       = useState('');
  const [leads, setLeads]         = useState<any[]>([]);
  const [metrics, setMetrics]     = useState<any>(null);
  const [trend, setTrend]         = useState<any[]>([]);
  const [quality, setQuality]     = useState<any[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { page: '1', limit: '50' };
      if (filter !== 'all') params.quality = filter;
      
      const [lRes, mRes, tRes, qRes] = await Promise.all([
        sponsorService.getLeads(params),
        sponsorService.getMetrics(),
        sponsorService.getConversionTrend(),
        sponsorService.getLeadQuality(),
      ]);
      
      setLeads(lRes.data || []);
      setTotal(lRes.total || 0);
      setMetrics(mRes.data);
      setTrend(tRes.data);
      setQuality(qRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load sponsor data.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await sponsorService.generateLeads();
      await fetchAll();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await sponsorService.updateLeadStatus(id, status);
      setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <Spinner />;

  // Quick stat counts
  const hotCount  = quality.find(q => q.category === 'Hot Leads')?.count || 0;
  const warmCount = quality.find(q => q.category === 'Warm Leads')?.count || 0;
  const coldCount = quality.find(q => q.category === 'Cold Leads')?.count || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Lead Generation</h1>
          <p className="text-gray-600">Discover and manage highly qualified prospects for your solutions</p>
        </div>
        {user?.role === 'sponsor' && (
          <Button onClick={handleGenerate} disabled={generating} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white gap-2">
            <Zap className={`w-4 h-4 ${generating ? 'animate-pulse' : ''}`} />
            {generating ? 'Scoring leads...' : 'Regenerate Leads'}
          </Button>
        )}
      </div>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Hot Leads', value: metrics?.hotLeadsCount || 0, icon: Flame, color: 'orange' },
          { label: 'Total Qualified', value: metrics?.qualifiedLeads || 0, icon: Target, color: 'blue' },
          { label: 'Conversion Rate', value: `${metrics?.conversionRate || 0}%`, icon: Zap, color: 'green' },
          { label: 'Expected ROI', value: `${metrics?.expectedROI || 0}x`, icon: DollarSign, color: 'purple' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 border-2 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Trend Chart */}
      <Card className="p-6 mb-8 shadow-lg border-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Prediction Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" stroke="#6b7280" />
              <YAxis yAxisId="left" stroke="#6b7280" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="aiPowered" name="AI Match Rate" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
              <Line yAxisId="left" type="monotone" dataKey="traditional" name="Traditional Method" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Leads Section */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          {([
            { key: 'all',  label: 'All Leads', count: total },
            { key: 'hot',  label: 'Hot 🔥', count: hotCount },
            { key: 'warm', label: 'Warm ☀️', count: warmCount },
            { key: 'cold', label: 'Cold ❄️', count: coldCount },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.key ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {leads.filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase())).map((lead) => {
          const qual = getQualityConfig(lead.leadQuality);
          const QualIcon = qual.icon;
          return (
            <Card key={lead.id} className="p-6 border-2 hover:border-blue-200 transition-colors shadow-sm">
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Left - Profile info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{lead.name}</h3>
                        <Badge variant="outline" className={`${qual.bg} ${qual.color} ${qual.border} gap-1 px-2.5 py-0.5`}>
                          <QualIcon className="w-3.5 h-3.5" />
                          <span className="capitalize">{lead.leadQuality} Match</span>
                        </Badge>
                        <Badge variant="secondary" className={`${getStatusColor(lead.status)} capitalize`}>
                          {lead.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mt-2">
                        <Briefcase className="w-4 h-4" /> <span>{lead.title}</span>
                        <span className="text-gray-300">•</span>
                        <Building2 className="w-4 h-4" /> <span>{lead.company}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg border">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">CONTACT INFO</p>
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Mail className="w-4 h-4 text-gray-400" /> {lead.email || 'Hidden until contacted'}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">INTERESTS</p>
                      <div className="flex flex-wrap gap-1">
                        {lead.interests?.map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs capitalize">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right - AI Scores & Actions */}
                <div className="lg:w-72 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">AI Match Score</span>
                        <span className="font-bold text-gray-900">{lead.matchScore}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${lead.matchScore >= 80 ? 'bg-green-500' : lead.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${lead.matchScore}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">Conversion Prob.</span>
                        <span className="font-bold text-purple-600">{lead.conversionProbability}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${lead.conversionProbability}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-lg text-sm">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Est. Value: ${lead.estimatedValueMin?.toLocaleString()} - ${lead.estimatedValueMax?.toLocaleString()}</span>
                    </div>
                  </div>

                  {lead.status === 'new' ? (
                    <Button onClick={() => handleStatusChange(lead.id, 'contacted')} className="w-full mt-4 bg-gray-900 hover:bg-gray-800 gap-2">
                      Request Introduction <ExternalLink className="w-4 h-4" />
                    </Button>
                  ) : lead.status === 'contacted' ? (
                    <Button onClick={() => handleStatusChange(lead.id, 'converted')} className="w-full mt-4 bg-green-600 hover:bg-green-700 gap-2">
                      Mark as Converted <Target className="w-4 h-4" />
                    </Button>
                  ) : null}
                </div>

              </div>
            </Card>
          );
        })}
        {leads.length === 0 && (
          <div className="p-12 text-center text-gray-500 bg-white rounded-lg border">
            No leads found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}