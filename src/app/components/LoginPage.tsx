import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Target, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role: string) => {
    setLoading(true);
    try {
      const emailMap: Record<string, string> = {
        admin: 'admin@audoraai.com',
        organizer: 'organizer@audoraai.com',
        sponsor: 'sponsor@dataflow.io',
        attendee: 'sarah.chen@techcorp.com',
      };
      const userData = await login(emailMap[role], 'password123');
      toast.success(`Logged in as ${role}`);
      if (userData.role === 'admin') navigate('/dashboard');
      else if (userData.role === 'organizer') navigate('/dashboard/events');
      else if (userData.role === 'sponsor') navigate('/dashboard/sponsors');
      else navigate('/dashboard/profile');
    } catch (err: any) {
      toast.error('Quick login failed — make sure backend is running');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Audora AI Logo" className="h-16 w-auto rounded-xl shadow-lg" />
        </div>

        <Card className="p-8 shadow-2xl border-2">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-600 mt-1">Sign in to your account</p>
          </div>

          {/* Quick Login Buttons */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 font-medium mb-3 text-center">QUICK LOGIN (Demo)</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { role: 'admin', label: '🛡 Admin' },
                { role: 'organizer', label: '📅 Organizer' },
                { role: 'sponsor', label: '💼 Sponsor' },
                { role: 'attendee', label: '🎟 Attendee' },
              ].map(({ role, label }) => (
                <button
                  key={role}
                  onClick={() => quickLogin(role)}
                  disabled={loading}
                  className="text-xs py-2 px-2 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all font-medium text-gray-700 disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Create one
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}


