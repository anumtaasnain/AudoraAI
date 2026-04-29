import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, AreaChart, Area } from 'recharts';
import { Building2, TrendingUp, Target, Users, Zap, AlertCircle } from 'lucide-react';
import { analyticsService } from '../../lib/services';

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function AnalyticsPage() {
  const [overview, setOverview]         = useState<any>(null);
  const [engagementInd, setEngagementInd] = useState<any[]>([]);
  const [segmentation, setSegmentation]   = useState<any>({ total: 0, data: [] });
  const [roiTrend, setRoiTrend]           = useState<any[]>([]);
  const [funnel, setFunnel]               = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ovRes, engRes, segRes, roiRes, funRes] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getEngagementByIndustry(),
          analyticsService.getSegmentation(),
          analyticsService.getRoiTrend(),
          analyticsService.getFunnel(),
        ]);
        setOverview(ovRes.data);
        setEngagementInd(engRes.data);
        setSegmentation({ total: segRes.total, data: segRes.data });
        setRoiTrend(roiRes.data);
        setFunnel(funRes.stages);
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Detailed Analytics</h1>
        <p className="text-gray-600">Deep dive into audience metrics, engagement patterns, and ROI</p>
      </div>

      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/30 rounded-lg"><Zap className="w-6 h-6" /></div>
            <p className="font-medium text-blue-100">AI Accuracy</p>
          </div>
          <p className="text-3xl font-bold">94.2%</p>
          <p className="text-sm text-blue-200 mt-2">Prediction match rate</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/30 rounded-lg"><Target className="w-6 h-6" /></div>
            <p className="font-medium text-purple-100">Avg Engagement</p>
          </div>
          <p className="text-3xl font-bold">{overview?.avgEngagementRate ?? 0}%</p>
          <p className="text-sm text-purple-200 mt-2">+12% from last event</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-600 to-green-700 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/30 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
            <p className="font-medium text-green-100">Sponsor ROI</p>
          </div>
          <p className="text-3xl font-bold">{overview?.avgROI ?? 0}x</p>
          <p className="text-sm text-green-200 mt-2">Average value delivery</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/30 rounded-lg"><Users className="w-6 h-6" /></div>
            <p className="font-medium text-orange-100">Qualified Leads</p>
          </div>
          <p className="text-3xl font-bold">{overview?.qualifiedLeadsThisMonth ?? 0}</p>
          <p className="text-sm text-orange-200 mt-2">Generated this month</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Industry Engagement */}
        <Card className="p-6 shadow-lg border-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Engagement by Industry</h3>
              <p className="text-sm text-gray-600">Actual vs Predicted score</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementInd} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="industry" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="engagement" name="Actual %" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="prediction" name="Predicted %" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={20} />
                <ReferenceLine x={averages(engagementInd.map(e => e.engagement))} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Avg', fill: '#ef4444', fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ROI Trend */}
        <Card className="p-6 shadow-lg border-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sponsor ROI Comparison</h3>
              <p className="text-sm text-gray-600">Traditional vs AI-Powered Matching</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={roiTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#9ca3af" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(v) => `${v}x`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip />
                <Area type="monotone" dataKey="withAI" name="AI-Powered ROI" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorAI)" />
                <Area type="monotone" dataKey="traditional" name="Traditional ROI" stroke="#9ca3af" strokeWidth={2} fillOpacity={1} fill="url(#colorTrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Audience Segmentation */}
        <Card className="p-6 shadow-lg border-2 lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Seniority Segmentation</h3>
          <div className="space-y-6">
            {segmentation.data.map((seg: any) => (
              <div key={seg.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">{seg.name}</span>
                  <span className="text-gray-500">{seg.value} ({Math.round((seg.value / segmentation.total) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-1000"
                    style={{ backgroundColor: seg.color, width: `${(seg.value / segmentation.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Your audience is highly concentrated in decision-making roles, with decision-makers constituting more than half of all attendees.
            </p>
          </div>
        </Card>

        {/* Funnel */}
        <Card className="p-6 shadow-lg border-2 lg:col-span-2">
           <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel Analysis</h3>
           <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={100} tick={{ fontSize: 12, fill: '#4b5563' }} />
                <Tooltip />
                <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]} barSize={32}>
                  {funnel.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

const averages = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

