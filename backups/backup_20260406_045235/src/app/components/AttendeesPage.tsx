import { useEffect, useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Search, Filter, Mail, Building2, Briefcase, TrendingUp } from 'lucide-react';
import { attendeeService } from '../../lib/services';

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'high':     return { label: 'High Relevance', className: 'bg-green-100 text-green-700 border-green-200',  dotColor: 'bg-green-500' };
    case 'moderate': return { label: 'Moderate',       className: 'bg-yellow-100 text-yellow-700 border-yellow-200', dotColor: 'bg-yellow-500' };
    case 'low':      return { label: 'Low Relevance',  className: 'bg-red-100 text-red-700 border-red-200',    dotColor: 'bg-red-500' };
    default:         return { label: 'Unknown',        className: 'bg-gray-100 text-gray-700 border-gray-200',  dotColor: 'bg-gray-500' };
  }
};

export default function AttendeesPage() {
  const [filter, setFilter]     = useState<'all'|'high'|'moderate'|'low'>('all');
  const [search, setSearch]     = useState('');
  const [attendees, setAttendees] = useState<any[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const fetchAttendees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { page: '1', limit: '50' };
      if (filter !== 'all') params.status = filter;
      if (search.trim()) params.search = search.trim();
      const res = await attendeeService.getAttendees(params);
      setAttendees(res.data || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load attendees.');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { fetchAttendees(); }, [fetchAttendees]);

  // Counts for filter tabs
  const allCount  = total;
  const highCount = attendees.filter(a => a.status === 'high').length;
  const modCount  = attendees.filter(a => a.status === 'moderate').length;
  const lowCount  = attendees.filter(a => a.status === 'low').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendee Management</h1>
        <p className="text-gray-600">View and manage registered attendees by AI relevance score</p>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {([
          { key: 'all',      label: 'All Attendees',   count: allCount,  active: 'border-blue-500 bg-blue-50',   text: 'text-gray-900' },
          { key: 'high',     label: 'High Relevance',  count: highCount, active: 'border-green-500 bg-green-50', text: 'text-green-600' },
          { key: 'moderate', label: 'Moderate',        count: modCount,  active: 'border-yellow-500 bg-yellow-50', text: 'text-yellow-600' },
          { key: 'low',      label: 'Low Relevance',   count: lowCount,  active: 'border-red-500 bg-red-50',    text: 'text-red-600' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`p-4 rounded-lg border-2 transition-all ${filter === tab.key ? tab.active : 'border-gray-200 bg-white hover:border-gray-300'}`}
          >
            <p className="text-sm text-gray-600 font-medium mb-1">{tab.label}</p>
            <p className={`text-2xl font-bold ${filter === tab.key ? tab.text : 'text-gray-900'}`}>{tab.count}</p>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <Card className="p-4 mb-6 shadow-lg border-2">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, or title..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> More Filters
          </Button>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error} — <button onClick={fetchAttendees} className="underline">Retry</button>
        </div>
      )}

      {/* Attendees List */}
      {loading ? <Spinner /> : (
        <div className="space-y-4">
          {attendees.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">No attendees found matching your criteria.</p>
            </Card>
          ) : attendees.map((attendee: any) => {
            const statusConfig = getStatusConfig(attendee.status);
            return (
              <Card key={attendee.id} className="p-6 shadow-lg border-2 hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {attendee.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{attendee.name}</h3>
                        <Badge className={`${statusConfig.className} border`}>
                          <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor} mr-1.5`} />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="space-y-1.5">
                        {attendee.title && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Briefcase className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">{attendee.title}</span>
                          </div>
                        )}
                        {attendee.company && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building2 className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">{attendee.company}</span>
                          </div>
                        )}
                        {attendee.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">{attendee.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score Ring */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-gray-600" />
                        <p className="text-xs text-gray-600 font-medium">Relevance Score</p>
                      </div>
                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle cx="40" cy="40" r="32" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                          <circle
                            cx="40" cy="40" r="32"
                            stroke={attendee.status === 'high' ? '#10b981' : attendee.status === 'moderate' ? '#f59e0b' : '#ef4444'}
                            strokeWidth="6" fill="none"
                            strokeDasharray={`${((attendee.relevanceScore || 0) / 100) * 201} 201`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-gray-900">{attendee.relevanceScore ?? '—'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => alert(`Opening full profile for ${attendee.name}... \\n\\nCompany: ${attendee.company}\\nTitle: ${attendee.title}\\nScore: ${attendee.relevanceScore}`)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        View Profile
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.location.href = `mailto:${attendee.email}?subject=Hi ${attendee.name.split(' ')[0]} - Interested in connecting`}
                      >
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
