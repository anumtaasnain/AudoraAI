import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { Target, TrendingUp, Users, Zap, BarChart3, Shield, Sparkles, ArrowRight, CheckCircle2, Calendar, MapPin, Tag } from 'lucide-react';
import { eventService } from '../../lib/services';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function LandingPage() {
  const navigate = useNavigate();
  const [publicEvents, setPublicEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    const fetchPublicEvents = async () => {
      try {
        const res = await eventService.getPublicEvents();
        setPublicEvents(res.data || []);
      } catch (err) {
        console.error('Failed to load public events', err);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchPublicEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="Audora AI Logo" className="h-10 w-auto rounded-lg shadow-sm" />
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">How it Works</a>
            <a href="#why-us" className="text-gray-600 hover:text-gray-900 transition">Why Us</a>
            <Button onClick={() => navigate('/login')} variant="outline" className="border-2">Sign In</Button>
            <Button onClick={() => navigate('/register')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Audience Intelligence
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Ensuring the{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Right Audience
              </span>{' '}
              for the Right Event
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Leverage AI to match qualified attendees with events, maximize sponsor ROI, and eliminate wasted marketing budgets. Transform your event strategy with data-driven audience insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate('/register')}
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-3xl opacity-20"></div>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1769798643237-8642a3fbe5bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMGNvbmZlcmVuY2UlMjBhdWRpZW5jZXxlbnwxfHx8fDE3NzEyMTY5MjN8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Professional conference audience"
              className="relative rounded-2xl shadow-2xl w-full"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for the Future of Events
            </h2>
            <p className="text-xl text-gray-600">
              Every tool you need to eliminate audience mismatch and maximize event ROI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Target, title: 'AI Neural Matching', desc: 'Our proprietary algorithm analyzes professional profiles, industry trends, and historical engagement to score every attendee-event match with 98% accuracy.', color: 'from-blue-500 to-cyan-500' },
              { icon: Sparkles, title: 'Pitch Optimizer', desc: 'Using Google Gemini AI, we help Organizers craft the perfect sponsorship proposal, optimizing every word to increase acceptance rates by up to 40%.', color: 'from-purple-500 to-pink-500' },
              { icon: Zap, title: 'Audience Provisioning', desc: 'Need high-profile leads? Instantly provision a verified, high-interest audience through our Stripe-integrated lead marketplace.', color: 'from-yellow-500 to-orange-500' },
              { icon: BarChart3, title: 'Audience Insights', desc: 'Export beautiful, data-rich PDF reports that visualize audience distribution, quality scores, and engagement predictions for your sponsors.', color: 'from-pink-500 to-rose-500' },
              { icon: Shield, title: 'Digital Entry Passes', desc: 'Seamless check-ins with AI-generated QR codes. Attendees receive their passes instantly upon registration approval.', color: 'from-green-500 to-emerald-500' },
              { icon: Users, title: 'Direct Collaboration', desc: 'Once a sponsorship is accepted, a secure live-chat environment opens between Organizer and Sponsor for seamless event execution.', color: 'from-indigo-500 to-purple-500' }
            ].map((feature, i) => (
              <Card key={i} className="p-8 hover:shadow-xl transition-shadow duration-300 bg-white border-2">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How the Ecosystem Works</h2>
            <p className="text-xl text-gray-600">A seamless integration for sponsors, organizers, and attendees.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Connect', desc: 'Register your profile and define your interests.' },
              { step: '02', title: 'Match', desc: 'AI identifies high-value opportunities for you.' },
              { step: '03', title: 'Fund', desc: 'Automated tiers and secure payments via Stripe.' },
              { step: '04', title: 'Deliver', desc: 'High-intent audience engages with your event.' }
            ].map((s, i) => (
              <div key={i} className="relative p-6 text-center">
                <div className="text-5xl font-black text-gray-200 mb-4">{s.step}</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h4>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Audora AI?</h2>
            <p className="text-xl text-gray-600">Deliver unmatched value to every stakeholder in the event ecosystem.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 border-2 hover:shadow-xl transition-shadow text-center">
              <Target className="w-10 h-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Matchmaking</h3>
              <p className="text-gray-600 text-sm">Precision pairing of attendees and events based on industry, interests, and engagement history.</p>
            </Card>
            <Card className="p-6 border-2 hover:shadow-xl transition-shadow text-center">
              <Zap className="w-10 h-10 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sponsor Leads</h3>
              <p className="text-gray-600 text-sm">High-intent leads delivered directly to sponsors with AI-computed match scores.</p>
            </Card>
            <Card className="p-6 border-2 hover:shadow-xl transition-shadow text-center">
              <BarChart3 className="w-10 h-10 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
              <p className="text-gray-600 text-sm">Live insights on attendance, engagement trends, and audience quality distribution.</p>
            </Card>
            <Card className="p-6 border-2 hover:shadow-xl transition-shadow text-center">
              <Shield className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Check-ins</h3>
              <p className="text-gray-600 text-sm">QR-based digital entry passes for streamlined and verified on-site verification.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Events - Always Visible */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <Calendar className="w-4 h-4" />
              Upcoming Events
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Summits & Conferences</h2>
            <p className="text-xl text-gray-600">Join industry leaders at these high-profile upcoming events.</p>
          </div>

          {eventsLoading ? (
            /* Loading Skeletons */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 border-2 bg-white animate-pulse">
                  <div className="h-5 w-24 bg-gray-200 rounded-full mb-4" />
                  <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-full bg-gray-100 rounded mb-1" />
                  <div className="h-4 w-5/6 bg-gray-100 rounded mb-6" />
                  <div className="pt-4 border-t space-y-2">
                    <div className="h-4 w-1/2 bg-gray-100 rounded" />
                    <div className="h-4 w-1/3 bg-gray-100 rounded" />
                  </div>
                  <div className="h-10 w-full bg-gray-200 rounded-lg mt-4" />
                </Card>
              ))}
            </div>
          ) : publicEvents.length > 0 ? (
            /* Event Cards */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publicEvents.map((event) => (
                <Card key={event._id} className="p-6 border-2 hover:shadow-xl transition-all duration-300 bg-white group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {event.interestId?.name || event.industryId?.name || 'General'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                      Live
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{event.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{event.description || 'Join this exciting upcoming event.'}</p>
                  <div className="space-y-2 mb-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{event.location || 'Location TBA'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      {event.startsAt
                        ? new Date(event.startsAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                        : 'Date Coming Soon'}
                    </div>
                    {event.industryId && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Tag className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span className="truncate">{event.industryId?.name}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => navigate('/register/attendee')}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Register Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20 px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Upcoming Events Yet</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Events will appear here once organizers create and publish them. Register now to get notified when new events go live!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/register/organizer')}
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Create an Event
                </Button>
                <Button
                  onClick={() => navigate('/register/attendee')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Register as Attendee <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Events?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join leading event organizers who are maximizing ROI with AI-powered audience intelligence.
          </p>
          <Button 
            onClick={() => navigate('/register')}
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Audora AI Logo" className="h-8 w-auto rounded-lg" />
            </div>
            <div className="flex gap-8 text-sm">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
            <p className="text-sm text-gray-500">© 2026 Audora AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

