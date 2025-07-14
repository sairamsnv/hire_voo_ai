import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MapPin, DollarSign, Calendar, TrendingUp, Users, Star, Search, Filter, BarChart3, Globe, Briefcase, Award, Sparkles, Crown, ArrowRight, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import JobCard from '@/components/JobCard';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import RecommendationSystem from '@/components/RecommendationSystem';

const Index = () => {
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Mock job data - limited to 4 jobs for landing page
  const jobsData = [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "TechCorp Global",
      location: "San Francisco, USA",
      country: "USA",
      salary: "$120k - $180k",
      level: "Senior",
      type: "Full-time",
      skills: ["React", "Node.js", "AWS"],
      posted: "2 days ago",
      applicants: 45,
      rating: 4.8,
      premium: true
    },
    {
      id: 2,
      title: "Product Manager",
      company: "Innovation Labs",
      location: "London, UK",
      country: "UK",
      salary: "£75k - £95k",
      level: "Mid-Level",
      type: "Full-time",
      skills: ["Strategy", "Analytics", "Leadership"],
      posted: "1 day ago",
      applicants: 28,
      rating: 4.6,
      premium: false
    },
    {
      id: 3,
      title: "Data Scientist",
      company: "AI Dynamics",
      location: "Toronto, Canada",
      country: "Canada",
      salary: "CAD $90k - $130k",
      level: "Senior",
      type: "Full-time",
      skills: ["Python", "ML", "TensorFlow"],
      posted: "3 days ago",
      applicants: 67,
      rating: 4.9,
      premium: true
    },
    {
      id: 4,
      title: "UX Designer",
      company: "Design Studio Pro",
      location: "Berlin, Germany",
      country: "Germany",
      salary: "€55k - €75k",
      level: "Mid-Level",
      type: "Full-time",
      skills: ["Figma", "User Research", "Prototyping"],
      posted: "4 days ago",
      applicants: 32,
      rating: 4.7,
      premium: false
    }
  ];

  // Analytics data
  const analyticsData = {
    totalJobs: 12847,
    activeApplications: 2341,
    weeklyGrowth: 12.5,
    monthlyGrowth: 28.3,
    topCountries: [
      { name: "USA", jobs: 4520, growth: 15.2 },
      { name: "UK", jobs: 2341, growth: 8.7 },
      { name: "Canada", jobs: 1876, growth: 22.1 },
      { name: "Germany", jobs: 1654, growth: 11.4 }
    ]
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  const filteredJobs = jobsData.filter(job => {
    const matchesCountry = selectedCountry === 'all' || job.country === selectedCountry;
    const matchesLevel = selectedLevel === 'all' || job.level === selectedLevel;
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCountry && matchesLevel && matchesSearch;
  }).slice(0, 3); // Limit to 3 results for search

  // Check if user is logged in based on localStorage (for demo purposes)
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="glass rounded-3xl p-12 text-center shadow-luxury relative z-10 border-white/60">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 gradient-primary rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold gradient-text mb-3">Loading Hire voo.ai</h2>
          <p className="text-muted-foreground text-base">Preparing your premium job experience...</p>
          <div className="flex justify-center mt-6 space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4">
        <div className="container mx-auto text-center relative z-10">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 shadow-luxury border-white/60">
            <Crown className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-semibold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
              Premium Job Platform
            </span>
            <Sparkles className="w-3 h-3 text-yellow-600 animate-pulse" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6 leading-tight">
            Welcome to Hire voo.ai
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Premium marketplace connecting jobs and consultants. Discover opportunities worldwide with 
            <span className="text-blue-600 font-semibold"> advanced analytics</span> and 
            <span className="text-blue-600 font-semibold"> AI-powered recommendations</span>.
          </p>
          
          {/* Search Section */}
          <div className="glass rounded-3xl p-6 max-w-4xl mx-auto shadow-luxury border-white/60 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3 h-4 w-4 text-blue-500" />
                <Input
                  placeholder="Search jobs, people, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-0 bg-white/70 text-base shadow-premium backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-full md:w-48 h-12 border-0 bg-white/70 shadow-premium backdrop-blur-sm rounded-xl">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent className="glass backdrop-blur-xl border-white/50 shadow-luxury">
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="USA">🇺🇸 USA</SelectItem>
                  <SelectItem value="UK">🇬🇧 UK</SelectItem>
                  <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
                  <SelectItem value="Germany">🇩🇪 Germany</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full md:w-48 h-12 border-0 bg-white/70 shadow-premium backdrop-blur-sm rounded-xl">
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent className="glass backdrop-blur-xl border-white/50 shadow-luxury">
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Junior">Junior Level</SelectItem>
                  <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                  <SelectItem value="Senior">Senior Level</SelectItem>
                  <SelectItem value="Executive">Executive</SelectItem>
                </SelectContent>
              </Select>
              <Button className="btn-glossy text-white px-8 h-12 w-full md:w-auto text-base font-semibold shadow-luxury group">
                <Zap className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                Search
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex justify-center items-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-600" />
              <span>Verified Companies</span>
            </div>
            <div className="w-px h-6 bg-border"></div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Secure Platform</span>
            </div>
            <div className="w-px h-6 bg-border"></div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-600" />
              <span>Premium Support</span>
            </div>
          </div>

          {/* Get Started Button */}
          {!isLoggedIn && (
            <div className="mt-8">
              <Link to="/login">
                <Button className="btn-glossy text-white px-10 py-3 text-lg font-semibold shadow-luxury group">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Analytics Overview - Only show if logged in */}
      {isLoggedIn && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold gradient-text mb-4">Platform Analytics</h2>
              <p className="text-lg text-muted-foreground">Real-time insights into our premium marketplace</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass card-hover shadow-luxury border-white/60 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent group-hover:from-blue-100/50 transition-all duration-500"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <Badge className="bg-green-100 text-green-800 px-2 py-1 text-xs">Live</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Total Premium Jobs</p>
                    <p className="text-2xl font-bold gradient-text">{analyticsData.totalJobs.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass card-hover shadow-luxury border-white/60 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent group-hover:from-green-100/50 transition-all duration-500"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 px-2 py-1 text-xs">Active</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Active Applications</p>
                    <p className="text-2xl font-bold gradient-text">{analyticsData.activeApplications.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass card-hover shadow-luxury border-white/60 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent group-hover:from-purple-100/50 transition-all duration-500"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <Badge className="bg-purple-100 text-purple-800 px-2 py-1 text-xs">+{analyticsData.weeklyGrowth}%</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Weekly Growth</p>
                    <p className="text-2xl font-bold gradient-text">+{analyticsData.weeklyGrowth}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass card-hover shadow-luxury border-white/60 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent group-hover:from-orange-100/50 transition-all duration-500"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-orange-100 group-hover:bg-orange-200 transition-colors">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 px-2 py-1 text-xs">+{analyticsData.monthlyGrowth}%</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Monthly Growth</p>
                    <p className="text-2xl font-bold gradient-text">+{analyticsData.monthlyGrowth}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Tabs */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Tabs defaultValue="jobs" className="w-full">
            {isLoggedIn && (
              <TabsList className="glass shadow-luxury p-2 h-14 mb-10 backdrop-blur-xl border-white/60 rounded-2xl">
                <TabsTrigger value="jobs" className="px-8 py-3 text-base data-[state=active]:gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Find Jobs
                </TabsTrigger>
                <TabsTrigger value="people" className="px-8 py-3 text-base data-[state=active]:gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
                  <Users className="w-4 h-4 mr-2" />
                  Find People
                </TabsTrigger>
                <TabsTrigger value="analytics" className="px-8 py-3 text-base data-[state=active]:gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="px-8 py-3 text-base data-[state=active]:gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl">
                  <Star className="w-4 h-4 mr-2" />
                  AI Recommendations
                </TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="jobs" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold gradient-text mb-2">
                    Featured Jobs ({filteredJobs.length})
                  </h2>
                  <p className="text-base text-muted-foreground">Handpicked premium opportunities for top consultants</p>
                </div>
                <Badge className="gradient-premium text-black px-4 py-2 text-base shadow-luxury border-white/60">
                  <Crown className="w-4 h-4 mr-2" />
                  Premium Quality
                </Badge>
              </div>
              
              {/* Job Cards Grid - Improved alignment */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </TabsContent>

            {isLoggedIn && (
              <>
                <TabsContent value="people" className="space-y-6">
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                    <h2 className="text-3xl font-bold gradient-text mb-4">Find Expert Consultants</h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                      Connect with verified consultants and freelancers from around the world. 
                      Find the perfect match for your project needs.
                    </p>
                    <Link to="/people">
                      <Button className="btn-glossy text-white px-8 py-3 text-lg font-semibold shadow-luxury group">
                        Browse Consultants
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </TabsContent>

                <TabsContent value="analytics">
                  <AnalyticsDashboard data={analyticsData} />
                </TabsContent>

                <TabsContent value="recommendations">
                  <RecommendationSystem />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Index;
