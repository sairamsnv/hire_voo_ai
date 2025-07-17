import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Crown, Shield, Sparkles, ArrowRight, Star, Users, Award, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    expertise: '',
    experience: '',
    bio: '',
    country: '',
    jobStream: ''
  });

  const [errors, setErrors] = useState({ ...formData });
  const navigate = useNavigate();
  const { toast } = useToast();

  const countries = [
    { value: 'usa', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'canada', label: 'Canada' }
  ];

  const jobStreams = [
    { value: 'strategy', label: 'Strategy & Operations' },
    { value: 'technology', label: 'Technology & Digital' },
    { value: 'finance', label: 'Finance & Accounting' },
    { value: 'marketing', label: 'Marketing & Sales' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'supply-chain', label: 'Supply Chain & Logistics' },
    { value: 'healthcare', label: 'Healthcare & Life Sciences' },
    { value: 'legal', label: 'Legal & Compliance' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = { ...errors };
    let isValid = true;

    const requiredFields = [
      'firstName', 'lastName', 'email', 'password', 'expertise',
      'experience', 'bio', 'country', 'jobStream'
    ];

    for (let field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field as keyof typeof newErrors] = 'This field is required';
        isValid = false;
      }
    }

    if (formData.bio.length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters';
      isValid = false;
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await fetch('/api/register/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': cookies.get('csrftoken'),
        },
        body: JSON.stringify({
      full_name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
      bio: formData.bio,
      country: formData.country,
      job_stream: formData.jobStream
    })
      });

      if (res.ok) {
        toast({
          title: "Registration Successful!",
          description: "Your consultant profile has been created successfully.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        navigate('/login?activation=required');
      } else {
        const data = await res.json();
        toast({
          title: "Registration Failed",
          description: data?.error || "Please correct the errors and try again.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Server Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Enhanced Floating Elements */}
      <div className="absolute top-10 left-20 w-40 h-40 bg-gradient-to-br from-blue-200/40 to-blue-300/20 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-10 right-20 w-48 h-48 bg-gradient-to-br from-blue-300/30 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-blue-100/50 rounded-full blur-xl animate-bounce delay-500"></div>
      <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-blue-200/40 rounded-full blur-lg animate-pulse delay-2000"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          {/* Logo & Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl shadow-2xl relative overflow-hidden">
              <span className="text-4xl font-bold text-white z-10">K</span>
              <div className="absolute inset-0 bg-white/20 rounded-3xl animate-pulse"></div>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                Join KnowHire
              </h1>
              <p className="text-xl text-blue-600/80 font-medium">
                Become a Premium Consultant
              </p>
              <p className="text-blue-600/60 max-w-md mx-auto">
                Connect with top companies and showcase your expertise on our exclusive platform
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-blue-600">
                <Star className="w-4 h-4 fill-current" />
                <span>Elite Network</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <Users className="w-4 h-4" />
                <span>Top Companies</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <Award className="w-4 h-4" />
                <span>Premium Rates</span>
              </div>
            </div>
          </div>

          {/* Signup Card */}
          <Card className="backdrop-blur-xl bg-white/95 border-white/60 shadow-2xl relative overflow-hidden">
            {/* Enhanced Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/30 to-white/10 pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200/60 to-transparent"></div>
            
            <CardHeader className="relative z-10 text-center pb-4">
              <CardTitle className="text-3xl font-bold text-blue-900">Create Your Profile</CardTitle>
              <CardDescription className="text-blue-600/70 text-lg">
                Start your journey as a premium consultant
              </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10 space-y-6">
              <form onSubmit={handleSignup} className="space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-blue-900 font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`bg-white/90 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 transition-all duration-300 hover:bg-white ${
                        errors.firstName ? 'border-red-300 focus:border-red-500' : ''
                      }`}
                      placeholder="Enter your first name"
                      required
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-blue-900 font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`bg-white/90 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 transition-all duration-300 hover:bg-white ${
                        errors.lastName ? 'border-red-300 focus:border-red-500' : ''
                      }`}
                      placeholder="Enter your last name"
                      required
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-900 font-medium">Professional Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`bg-white/90 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 transition-all duration-300 hover:bg-white ${
                      errors.email ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                    placeholder="Enter your professional email"
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-blue-900 font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`bg-white/90 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 pr-12 transition-all duration-300 hover:bg-white ${
                        errors.password ? 'border-red-300 focus:border-red-500' : ''
                      }`}
                      placeholder="Create a strong password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Country and Job Stream Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-blue-900 font-medium">Target Country</Label>
                    <Select onValueChange={(value) => handleSelectChange('country', value)} required>
                      <SelectTrigger className={`bg-white/90 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 transition-all duration-300 hover:bg-white ${
                        errors.country ? 'border-red-300 focus:border-red-500' : ''
                      }`}>
                        <SelectValue placeholder="Select your target country" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-blue-200 shadow-xl">
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value} className="hover:bg-blue-50">
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="text-sm text-red-600 mt-1">{errors.country}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobStream" className="text-blue-900 font-medium">Job Stream</Label>
                    <Select onValueChange={(value) => handleSelectChange('jobStream', value)} required>
                      <SelectTrigger className={`bg-white/90 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 transition-all duration-300 hover:bg-white ${
                        errors.jobStream ? 'border-red-300 focus:border-red-500' : ''
                      }`}>
                        <SelectValue placeholder="Select your expertise area" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-blue-200 shadow-xl">
                        {jobStreams.map((stream) => (
                          <SelectItem key={stream.value} value={stream.value} className="hover:bg-blue-50">
                            {stream.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.jobStream && (
                      <p className="text-sm text-red-600 mt-1">{errors.jobStream}</p>
                    )}
                  </div>
                </div>

                {/* Expertise and Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expertise" className="text-blue-900 font-medium">Specific Expertise</Label>
                    <Input
                      id="expertise"
                      name="expertise"
                      type="text"
                      value={formData.expertise}
                      onChange={handleInputChange}
                      className={`bg-white/90 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 transition-all duration-300 hover:bg-white ${
                        errors.expertise ? 'border-red-300 focus:border-red-500' : ''
                      }`}
                      placeholder="e.g., Digital Transformation, M&A"
                      required
                    />
                    {errors.expertise && (
                      <p className="text-sm text-red-600 mt-1">{errors.expertise}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-blue-900 font-medium">Years of Experience</Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="text"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className={`bg-white/90 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 transition-all duration-300 hover:bg-white ${
                        errors.experience ? 'border-red-300 focus:border-red-500' : ''
                      }`}
                      placeholder="e.g., 5+ years"
                      required
                    />
                    {errors.experience && (
                      <p className="text-sm text-red-600 mt-1">{errors.experience}</p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-blue-900 font-medium">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className={`bg-white/90 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 min-h-[100px] transition-all duration-300 hover:bg-white resize-none ${
                      errors.bio ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                    placeholder="Tell us about your expertise and what makes you unique..."
                    required
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-600 mt-1">{errors.bio}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group text-lg"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Create My Consultant Profile
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </Button>
              </form>

              {/* Benefits Section */}
              <div className="pt-6 border-t border-blue-200/50">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 text-center">What You Get</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50/50">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-800">Direct access to premium clients</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50/50">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-800">AI-powered project matching</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50/50">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-800">Secure payment processing</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50/50">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-800">Professional profile showcase</span>
                  </div>
                </div>
              </div>

              {/* Premium Features */}
              <div className="pt-4 border-t border-blue-200/50">
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified Profiles
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium Platform
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Enhanced
                  </Badge>
                </div>
              </div>

              <div className="text-center text-sm text-blue-600/70">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors">
                  Sign in here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
