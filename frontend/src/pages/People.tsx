import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Star, Users, Crown, Briefcase, Award, Shield, Filter, Calendar, DollarSign, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';

const People = () => {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  // Mock consultant data
  const consultants = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Senior Software Engineer',
      location: 'San Francisco, USA',
      skills: ['React', 'Node.js', 'AWS', 'TypeScript'],
      rating: 4.9,
      experience: '8+ years',
      hourlyRate: '$120/hr',
      availability: 'Available',
      subscriptionPlan: 'Premium Plan',
      completedProjects: 47,
      avatar: '/placeholder.svg'
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'Data Scientist & ML Engineer',
      location: 'Toronto, Canada',
      skills: ['Python', 'TensorFlow', 'SQL', 'Machine Learning'],
      rating: 4.8,
      experience: '6+ years',
      hourlyRate: '$95/hr',
      availability: 'Available',
      subscriptionPlan: 'Lite Plan',
      completedProjects: 32,
      avatar: '/placeholder.svg'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      title: 'UX/UI Designer',
      location: 'London, UK',
      skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
      rating: 4.7,
      experience: '5+ years',
      hourlyRate: '$85/hr',
      availability: 'Busy until March',
      subscriptionPlan: 'Pro Plan',
      completedProjects: 29,
      avatar: '/placeholder.svg'
    },
    {
      id: 4,
      name: 'David Kim',
      title: 'Product Manager',
      location: 'Berlin, Germany',
      skills: ['Strategy', 'Analytics', 'Agile', 'Leadership'],
      rating: 4.9,
      experience: '10+ years',
      hourlyRate: '$140/hr',
      availability: 'Available',
      subscriptionPlan: 'Premium Plan',
      completedProjects: 56,
      avatar: '/placeholder.svg'
    }
  ];

  const filteredConsultants = consultants.filter(consultant => {
    const matchesSearch = consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultant.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSkill = selectedSkill === 'all' || consultant.skills.some(skill => 
      skill.toLowerCase().includes(selectedSkill.toLowerCase())
    );
    const matchesLocation = selectedLocation === 'all' || consultant.location.includes(selectedLocation);
    return matchesSearch && matchesSkill && matchesLocation;
  });

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Premium Plan':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
      case 'Pro Plan':
        return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white';
      case 'Lite Plan':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
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
          <h2 className="text-2xl font-bold gradient-text mb-3">Loading People</h2>
          <p className="text-muted-foreground text-base">Finding top consultants for you...</p>
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
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 shadow-luxury border-white/60">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Find Expert Consultants
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Discover Top Talent
          </h1>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Connect with verified consultants and freelancers from around the world. Find the perfect match for your project needs.
          </p>

          {/* Search Section */}
          <div className="glass rounded-3xl p-6 max-w-4xl mx-auto shadow-luxury border-white/60 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3 h-4 w-4 text-blue-500" />
                <Input
                  placeholder="Search consultants, skills, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-0 bg-white/70 text-base shadow-premium backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger className="w-full md:w-48 h-12 border-0 bg-white/70 shadow-premium backdrop-blur-sm rounded-xl">
                  <SelectValue placeholder="Select Skill" />
                </SelectTrigger>
                <SelectContent className="glass backdrop-blur-xl border-white/50 shadow-luxury">
                  <SelectItem value="all">All Skills</SelectItem>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="figma">Figma</SelectItem>
                  <SelectItem value="aws">AWS</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full md:w-48 h-12 border-0 bg-white/70 shadow-premium backdrop-blur-sm rounded-xl">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="glass backdrop-blur-xl border-white/50 shadow-luxury">
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="UK">UK</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                </SelectContent>
              </Select>
              <Button className="btn-glossy text-white px-8 h-12 w-full md:w-auto text-base font-semibold shadow-luxury">
                <Filter className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Consultants Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold gradient-text mb-2">
                Available Consultants ({filteredConsultants.length})
              </h2>
              <p className="text-base text-muted-foreground">Connect with verified professionals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConsultants.map((consultant) => (
              <Card key={consultant.id} className="glass card-hover shadow-luxury border-white/60 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
                <CardContent className="relative z-10 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12 ring-2 ring-white/50">
                        <AvatarImage src={consultant.avatar} alt={consultant.name} />
                        <AvatarFallback className="gradient-primary text-white font-bold">
                          {consultant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg text-blue-900">{consultant.name}</h3>
                        <p className="text-sm text-blue-600/70">{consultant.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-blue-900">{consultant.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-blue-600/70">
                      <MapPin className="w-4 h-4 mr-2" />
                      {consultant.location}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {consultant.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-blue-50/50 border-blue-200/50 text-blue-700">
                          {skill}
                        </Badge>
                      ))}
                      {consultant.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-blue-50/50 border-blue-200/50 text-blue-700">
                          +{consultant.skills.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600/70">Experience:</span>
                      <span className="font-semibold text-blue-900">{consultant.experience}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600/70">Rate:</span>
                      <span className="font-semibold text-blue-900">{consultant.hourlyRate}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600/70">Projects:</span>
                      <span className="font-semibold text-blue-900">{consultant.completedProjects}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getPlanColor(consultant.subscriptionPlan)}`}>
                        <Crown className="w-3 h-3 mr-1" />
                        {consultant.subscriptionPlan}
                      </Badge>
                      <Badge className={`text-xs ${
                        consultant.availability === 'Available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {consultant.availability}
                      </Badge>
                    </div>

                    <Button className="w-full btn-glossy text-white mt-4 shadow-luxury">
                      <Briefcase className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default People;
