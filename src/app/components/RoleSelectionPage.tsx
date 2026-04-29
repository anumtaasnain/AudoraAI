import { useNavigate } from 'react-router';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { User, Briefcase, Target, ArrowRight } from 'lucide-react';

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-4">
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center mb-6 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Audora AI Logo" className="h-20 w-auto rounded-xl shadow-lg" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Begin Your Journey</h1>
        <p className="text-lg text-gray-600">Select how you want to use the platform to get started</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Attendee Card */}
        <Card 
          className="group p-8 border-2 hover:border-blue-500 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl bg-white/80 backdrop-blur-sm flex flex-col items-center text-center relative overflow-hidden"
          onClick={() => navigate('/register/attendee')}
        >
          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-6 h-6 text-blue-500" />
          </div>
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Attendee / User</h2>
          <ul className="text-gray-600 space-y-3 mb-8 text-sm">
            <li className="flex items-center gap-2 justify-center"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Discover AI-matched events</li>
            <li className="flex items-center gap-2 justify-center"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Get personalized recommendations</li>
            <li className="flex items-center gap-2 justify-center"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Seamless event registration</li>
          </ul>
          <Button variant="outline" className="w-full border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            Register as Attendee
          </Button>
        </Card>

        {/* Organizer Card */}
        <Card 
          className="group p-8 border-2 hover:border-purple-500 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl bg-white/80 backdrop-blur-sm flex flex-col items-center text-center relative overflow-hidden"
          onClick={() => navigate('/register/organizer')}
        >
          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-6 h-6 text-purple-500" />
          </div>
          <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Briefcase className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Organizer</h2>
          <ul className="text-gray-600 space-y-3 mb-8 text-sm">
            <li className="flex items-center gap-2 justify-center"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> Create and manage major events</li>
            <li className="flex items-center gap-2 justify-center"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> AI-driven audience analytics</li>
            <li className="flex items-center gap-2 justify-center"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> Identify high-quality leads</li>
          </ul>
          <Button variant="outline" className="w-full border-purple-200 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            Register as Organizer
          </Button>
        </Card>
      </div>

      <p className="mt-12 text-sm text-gray-500">
        Already have an account? {' '}
        <button onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-4">
          Sign In here
        </button>
      </p>
    </div>
  );
}


