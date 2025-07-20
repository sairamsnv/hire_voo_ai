import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, Zap, Target, Brain, Award, Users, MapPin, DollarSign, Clock, User } from 'lucide-react';

const RecommendationSystem = () => {
  const [selectedCategory, setSelectedCategory] = useState('personalized');

  const personalizedJobs = [
    {
      id: 1,
      title: "Senior React Developer",
      company: "TechCorp Solutions",
      location: "San Francisco, USA",
      salary: "$130k - $160k",
      match: 95,
      reason: "Perfect match for your React and TypeScript skills",
      skills: ["React", "TypeScript", "AWS"],
      logo: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      company: "Innovation Labs",
      location: "London, UK",
      salary: "£80k - £100k",
      match: 88,
      reason: "Strong alignment with your full-stack experience",
      skills: ["Node.js", "React", "PostgreSQL"],
      logo: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Lead Frontend Architect",
      company: "Digital Dynamics",
      location: "Toronto, Canada",
      salary: "CAD $120k - $150k",
      match: 82,
      reason: "Leadership role matching your senior experience",
      skills: ["Vue.js", "React", "Team Lead"],
      logo: "/placeholder.svg"
    }
  ];

  const trendingJobs = [
    {
      id: 4,
      title: "AI/ML Engineer",
      company: "FutureTech AI",
      location: "Seattle, USA",
      salary: "$140k - $180k",
      trend: "+45%",
      growth: "High demand field",
      skills: ["Python", "TensorFlow", "ML"],
      logo: "/placeholder.svg"
    },
    {
      id: 5,
      title: "DevOps Specialist",
      company: "CloudFirst Inc",
      location: "Austin, USA",
      salary: "$110k - $140k",
      trend: "+38%",
      growth: "Rapidly growing",
      skills: ["Docker", "Kubernetes", "AWS"],
      logo: "/placeholder.svg"
    }
  ];

  const getMatchColor = (match: number) => {
    if (match >= 90) return "text-green-600 bg-green-100";
    if (match >= 80) return "text-blue-600 bg-blue-100";
    if (match >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  const categories = [
    { id: 'personalized', name: 'Personalized', icon: Target, description: 'Jobs matched to your profile' },
    { id: 'trending', name: 'Trending', icon: TrendingUp, description: 'Hot jobs in the market' },
    { id: 'skills-based', name: 'Skills Based', icon: Brain, description: 'Based on your expertise' },
    { id: 'location', name: 'Location', icon: MapPin, description: 'Jobs near you' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold gradient-text">AI-Powered Recommendations</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our advanced recommendation engine analyzes your profile, skills, and preferences to find perfect job matches
        </p>
        <div className="flex items-center justify-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium">Powered by Advanced AI</span>
        </div>
      </div>

      {/* Category Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card 
              key={category.id}
              className={`glass card-hover cursor-pointer transition-all duration-300 ${
                selectedCategory === category.id ? 'ring-2 ring-primary shadow-luxury' : 'shadow-premium'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  selectedCategory === category.id ? 'gradient-primary' : 'bg-muted'
                }`}>
                  <Icon className={`w-6 h-6 ${selectedCategory === category.id ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <h3 className="font-semibold mb-1">{category.name}</h3>
                <p className="text-xs text-muted-foreground">{category.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Profile Insights */}
      <Card className="glass shadow-luxury">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span className="gradient-text">Your Profile Insights</span>
          </CardTitle>
          <CardDescription>Based on your activity and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile Completeness</span>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Skill Match Rate</span>
                <span className="text-sm text-muted-foreground">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Market Alignment</span>
                <span className="text-sm text-muted-foreground">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge className="gradient-primary text-white">React Expert</Badge>
            <Badge className="gradient-secondary text-white">5+ Years Experience</Badge>
            <Badge className="gradient-success text-white">Remote Preferred</Badge>
            <Badge className="gradient-premium text-black">San Francisco Bay Area</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Content */}
      {selectedCategory === 'personalized' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold gradient-text">Personalized for You</h3>
            <Badge className="gradient-success text-white px-4 py-2">
              <Star className="w-4 h-4 mr-1" />
              {personalizedJobs.length} Perfect Matches
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {personalizedJobs.map((job) => (
              <Card key={job.id} className="glass shadow-luxury card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12 shadow-premium">
                        <AvatarImage src={job.logo} alt={job.company} />
                        <AvatarFallback className="gradient-primary text-white">
                          {job.company.split(' ').map(w => w[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-lg">{job.title}</h4>
                        <p className="text-muted-foreground">{job.company}</p>
                      </div>
                    </div>
                    <Badge className={`px-3 py-1 font-bold ${getMatchColor(job.match)}`}>
                      {job.match}% Match
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-600 font-medium">
                        <DollarSign className="w-4 h-4" />
                        <span>{job.salary}</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm text-blue-800 font-medium">
                        <Brain className="w-4 h-4 inline mr-1" />
                        {job.reason}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="glass text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button className="btn-glossy text-white flex-1">
                        Apply Now
                      </Button>
                      <Button variant="outline" className="glass border-white/30">
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedCategory === 'trending' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold gradient-text">Trending Opportunities</h3>
            <Badge className="gradient-secondary text-white px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              Hot Market
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trendingJobs.map((job) => (
              <Card key={job.id} className="glass shadow-luxury card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12 shadow-premium">
                        <AvatarImage src={job.logo} alt={job.company} />
                        <AvatarFallback className="gradient-secondary text-white">
                          {job.company.split(' ').map(w => w[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-lg">{job.title}</h4>
                        <p className="text-muted-foreground">{job.company}</p>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-600 px-3 py-1 font-bold">
                      {job.trend} Growth
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-600 font-medium">
                        <DollarSign className="w-4 h-4" />
                        <span>{job.salary}</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                      <p className="text-sm text-red-800 font-medium">
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        {job.growth} - Apply early for best chances
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="glass text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button className="btn-glossy text-white flex-1">
                        Apply Now
                      </Button>
                      <Button variant="outline" className="glass border-white/30">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      <Card className="glass shadow-luxury">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span className="gradient-text">AI Career Insights</span>
          </CardTitle>
          <CardDescription>Personalized recommendations to boost your career</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <Award className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-blue-900 mb-1">Skill Recommendation</h4>
              <p className="text-sm text-blue-800">Add Docker skills to increase job matches by 35%</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-semibold text-green-900 mb-1">Market Trend</h4>
              <p className="text-sm text-green-800">Remote React jobs increased 45% this month</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mb-2" />
              <h4 className="font-semibold text-purple-900 mb-1">Network Effect</h4>
              <p className="text-sm text-purple-800">Connect with 3 more colleagues to unlock hidden jobs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationSystem;
