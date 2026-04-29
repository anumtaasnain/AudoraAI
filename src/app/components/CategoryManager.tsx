import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { categoryService } from '../../lib/services';
import { Plus, Trash2, Tag, Briefcase, AlertCircle, Loader2 } from 'lucide-react';

export default function CategoryManager() {
  const [industries, setIndustries] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newInd, setNewInd] = useState({ name: '', description: '' });
  const [newInt, setNewInt] = useState({ name: '', description: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [indRes, intRes] = await Promise.all([
        categoryService.getIndustries(),
        categoryService.getInterests()
      ]);
      setIndustries(indRes.data || []);
      setInterests(intRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddIndustry = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await categoryService.createIndustry(newInd);
      setNewInd({ name: '', description: '' });
      fetchData();
    } catch (err: any) { alert(err.message); }
    finally { setActionLoading(false); }
  };

  const handleAddInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await categoryService.createInterest(newInt);
      setNewInt({ name: '', description: '' });
      fetchData();
    } catch (err: any) { alert(err.message); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (type: 'industry' | 'interest', id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      if (type === 'industry') await categoryService.deleteIndustry(id);
      else await categoryService.deleteInterest(id);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Management</h1>
        <p className="text-gray-600">Define the industries and event interests available for users and organizers.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Industries Section */}
        <div className="space-y-6">
          <Card className="p-6 border-2 shadow-lg">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-blue-600" /> Industries
            </h3>
            <form onSubmit={handleAddIndustry} className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label>Industry Name</Label>
                <Input 
                  value={newInd.name} 
                  onChange={e => setNewInd({...newInd, name: e.target.value})} 
                  placeholder="e.g. Artificial Intelligence" 
                  required 
                />
              </div>
              <Button type="submit" disabled={actionLoading} className="w-full bg-blue-600">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Industry
              </Button>
            </form>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {industries.map(ind => (
                <div key={ind._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border group">
                  <div>
                    <p className="font-semibold text-gray-900">{ind.name}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{ind.slug}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete('industry', ind._id)}
                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Interests Section */}
        <div className="space-y-6">
          <Card className="p-6 border-2 shadow-lg">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-purple-600" /> Event Interests
            </h3>
            <form onSubmit={handleAddInterest} className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label>Interest Name</Label>
                <Input 
                  value={newInt.name} 
                  onChange={e => setNewInt({...newInt, name: e.target.value})} 
                  placeholder="e.g. Cloud Computing" 
                  required 
                />
              </div>
              <Button type="submit" disabled={actionLoading} className="w-full bg-purple-600 text-white">
                 {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                 Add Interest
              </Button>
            </form>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {interests.map(int => (
                <div key={int._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border group">
                  <div>
                    <p className="font-semibold text-gray-900">{int.name}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{int.slug}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete('interest', int._id)}
                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
        <p className="text-sm text-yellow-700">
          Modifying categories will immediately update the dropdowns available for new users and event creation.
        </p>
      </div>
    </div>
  );
}


