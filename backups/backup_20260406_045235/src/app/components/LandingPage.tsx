import { useNavigate } from 'react-router';
import { Target, TrendingUp, Users, Zap, BarChart3, Shield, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AudienceAI
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
            <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition">Benefits</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition">Contact</a>
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
              <Button 
                onClick={() => navigate('/dashboard')}
                size="lg" 
                variant="outline" 
                className="border-2 text-lg px-8"
              >
                View Demo
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

      {/* Problem Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Problem We Solve
            </h2>
            <p className="text-xl text-gray-600">
              Traditional event marketing wastes resources on mismatched audiences
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border-2 border-red-100 bg-red-50/50 shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Wrong Audience</h3>
              <p className="text-gray-600">
                Events attract attendees who aren't genuinely interested, leading to poor engagement and conversion rates.
              </p>
            </Card>
            <Card className="p-8 border-2 border-orange-100 bg-orange-50/50 shadow-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Low ROI</h3>
              <p className="text-gray-600">
                Sponsors invest heavily but receive poorly qualified leads that don't convert to customers.
              </p>
            </Card>
            <Card className="p-8 border-2 border-yellow-100 bg-yellow-50/50 shadow-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Wasted Budget</h3>
              <p className="text-gray-600">
                Marketing dollars spent on broad campaigns that fail to reach the right decision-makers.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600">
              AI-driven insights to optimize your event success
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'AI Audience Matching',
                description: 'Machine learning algorithms analyze attendee profiles to ensure perfect event-audience fit.',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: BarChart3,
                title: 'Real-Time Analytics',
                description: 'Monitor engagement scores, relevance metrics, and conversion predictions in real-time.',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: Users,
                title: 'Attendee Segmentation',
                description: 'Automatically categorize attendees by relevance level with intelligent scoring.',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: TrendingUp,
                title: 'ROI Optimization',
                description: 'Maximize sponsor returns with highly qualified lead recommendations.',
                gradient: 'from-orange-500 to-red-500'
              },
              {
                icon: Shield,
                title: 'Quality Assurance',
                description: 'Filter out irrelevant attendees before they consume sponsor resources.',
                gradient: 'from-indigo-500 to-purple-500'
              },
              {
                icon: Sparkles,
                title: 'Predictive Insights',
                description: 'AI-powered predictions for engagement rates and conversion likelihood.',
                gradient: 'from-pink-500 to-rose-500'
              }
            ].map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-shadow duration-300 bg-white border-2">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Benefits for Everyone
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* For Sponsors */}
            <Card className="p-10 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">For Sponsors</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Access only highly relevant, qualified leads',
                  'Increase conversion rates by 3-5x',
                  'Reduce wasted marketing spend',
                  'Get predictive ROI analytics',
                  'Detailed audience insights and demographics'
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* For Organizers */}
            <Card className="p-10 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">For Organizers</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Attract premium sponsors with quality guarantees',
                  'Improve attendee satisfaction scores',
                  'Reduce no-show rates significantly',
                  'Data-driven event planning decisions',
                  'Enhanced event reputation and credibility'
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Events?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join leading event organizers who are maximizing ROI with AI-powered audience intelligence
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
      <footer id="contact" className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-white">AudienceAI</span>
              </div>
              <p className="text-sm text-gray-400">
                AI-powered audience matching for successful events
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>support@audienceai.com</li>
                <li>+1 (555) 123-4567</li>
                <li>San Francisco, CA</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center text-gray-400">
            <p>© 2026 AudienceAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}