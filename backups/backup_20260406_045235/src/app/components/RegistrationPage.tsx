import { useNavigate } from 'react-router';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Target, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

type RegistrationFormData = {
  firstName: string; lastName: string; email: string; password: string;
  phone: string; company: string; jobTitle: string;
  industry: string; companySize: string; eventInterest: string; hearAboutUs: string;
};

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<RegistrationFormData>();

  const onSubmit = async (data: RegistrationFormData) => {
    setError('');
    try {
      await registerUser(data);
      setIsSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center shadow-2xl border-2">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Registration Successful! 🎉</h2>
          <p className="text-gray-600 mb-6">
            Thank you for registering! Our AI has analyzed your profile and assigned your relevance score.
          </p>
          <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
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
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Join <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AudienceAI</span>
          </h1>
          <p className="text-lg text-gray-600">Register to get AI-powered event recommendations tailored to your profile</p>
        </div>

        <Card className="p-8 shadow-2xl border-2">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input id="firstName" {...register('firstName', { required: 'First name is required' })} placeholder="John" className={errors.firstName ? 'border-red-500' : ''} />
                  {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input id="lastName" {...register('lastName', { required: 'Last name is required' })} placeholder="Doe" className={errors.lastName ? 'border-red-500' : ''} />
                  {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} placeholder="john@company.com" className={errors.email ? 'border-red-500' : ''} />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                  <Input id="password" type="password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} placeholder="••••••••" className={errors.password ? 'border-red-500' : ''} />
                  {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                  <Input id="phone" type="tel" {...register('phone', { required: 'Phone is required' })} placeholder="+1 (555) 123-4567" className={errors.phone ? 'border-red-500' : ''} />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Professional Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Company Name <span className="text-red-500">*</span></Label>
                  <Input {...register('company', { required: 'Company is required' })} placeholder="Tech Corp Inc." className={errors.company ? 'border-red-500' : ''} />
                  {errors.company && <p className="text-sm text-red-500">{errors.company.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Job Title <span className="text-red-500">*</span></Label>
                  <Input {...register('jobTitle', { required: 'Job title is required' })} placeholder="Chief Technology Officer" className={errors.jobTitle ? 'border-red-500' : ''} />
                  {errors.jobTitle && <p className="text-sm text-red-500">{errors.jobTitle.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Industry <span className="text-red-500">*</span></Label>
                  <Select onValueChange={(v) => setValue('industry', v)}>
                    <SelectTrigger><SelectValue placeholder="Select your industry" /></SelectTrigger>
                    <SelectContent>
                      {['technology','software','cloud','analytics','marketing','sales','finance','healthcare','other'].map(i => (
                        <SelectItem key={i} value={i}>{i.charAt(0).toUpperCase()+i.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" {...register('industry', { required: 'Industry is required' })} />
                </div>
                <div className="space-y-2">
                  <Label>Company Size <span className="text-red-500">*</span></Label>
                  <Select onValueChange={(v) => setValue('companySize', v)}>
                    <SelectTrigger><SelectValue placeholder="Select company size" /></SelectTrigger>
                    <SelectContent>
                      {['1-10','11-50','51-200','201-500','501-1000','1000+'].map(s => (
                        <SelectItem key={s} value={s}>{s} employees</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" {...register('companySize', { required: 'Company size is required' })} />
                </div>
              </div>
            </div>

            {/* Event Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Event Preferences</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Primary Event Interest <span className="text-red-500">*</span></Label>
                  <Select onValueChange={(v) => setValue('eventInterest', v)}>
                    <SelectTrigger><SelectValue placeholder="What events interest you?" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai-ml">AI & Machine Learning</SelectItem>
                      <SelectItem value="cloud">Cloud Computing</SelectItem>
                      <SelectItem value="devops">DevOps & Infrastructure</SelectItem>
                      <SelectItem value="data">Data & Analytics</SelectItem>
                      <SelectItem value="security">Cybersecurity</SelectItem>
                      <SelectItem value="product">Product Management</SelectItem>
                      <SelectItem value="leadership">Leadership & Strategy</SelectItem>
                      <SelectItem value="startup">Startup & Innovation</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" {...register('eventInterest', { required: 'Event interest is required' })} />
                </div>
                <div className="space-y-2">
                  <Label>How did you hear about us? <span className="text-red-500">*</span></Label>
                  <Select onValueChange={(v) => setValue('hearAboutUs', v)}>
                    <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="search">Search Engine</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="event">Event/Conference</SelectItem>
                      <SelectItem value="advertisement">Advertisement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" {...register('hearAboutUs', { required: 'This field is required' })} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">AI-Powered Profile Analysis</p>
                  <p className="text-gray-600">By registering, you consent to our AI analyzing your profile to match you with relevant events and sponsors.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/')} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Complete Registration
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
