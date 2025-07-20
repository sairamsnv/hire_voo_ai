import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Briefcase, 
  Star, 
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  Target,
  Award,
  Crown,
  Monitor,
  Sparkles
} from 'lucide-react';
import Header from '@/components/Header';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

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

  const personalAnalytics = {
    applicationSuccess: 68,
    profileViews: 1234,
    searchAppearances: 892,
    skillMatchRate: 85,
    responseRate: 42
  };

  const topSkills = [
    { skill: 'React', demand: 95, growth: 12 },
    { skill: 'TypeScript', demand: 88, growth: 18 },
    { skill: 'Node.js', demand: 82, growth: 8 },
    { skill: 'Python', demand: 79, growth: 15 },
    { skill: 'AWS', demand: 76, growth: 22 }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="glass rounded-3xl p-12 text-center shadow-luxury relative z-10 border-white/60">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 gradient-primary rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold gradient-text mb-3">Loading Analytics</h2>
          <p className="text-muted-foreground text-base">Preparing your analytics dashboard...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center">
                  <BarChart3 className="w-10 h-10 mr-3" />
                  Analytics Dashboard
                </h1>
                <p className="text-blue-100 text-lg">Deep insights into your job search performance</p>
              </div>
              <div className="flex items-center space-x-4">
                {user?.is_staff && (
                  <Link to="/sessions">
                    <button className="bg-white/20 text-white border border-white/30 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center">
                      <Monitor className="w-4 h-4 mr-2" />
                      Session Management
                    </button>
                  </Link>
                )}
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                  <Crown className="w-4 h-4 mr-1" />
                  Premium Analytics
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent group-hover:from-green-500/10"></div>
            <CardContent className="p-6 relative z-10">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-blue-600/70 font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-blue-900">{personalAnalytics.applicationSuccess}%</p>
                <Progress value={personalAnalytics.applicationSuccess} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent group-hover:from-blue-500/10"></div>
            <CardContent className="p-6 relative z-10">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm text-blue-600/70 font-medium">Profile Views</p>
                <p className="text-3xl font-bold text-blue-900">{personalAnalytics.profileViews.toLocaleString()}</p>
                <div className="flex items-center justify-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+12%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent group-hover:from-purple-500/10"></div>
            <CardContent className="p-6 relative z-10">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm text-blue-600/70 font-medium">Skill Match</p>
                <p className="text-3xl font-bold text-blue-900">{personalAnalytics.skillMatchRate}%</p>
                <Progress value={personalAnalytics.skillMatchRate} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent group-hover:from-orange-500/10"></div>
            <CardContent className="p-6 relative z-10">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <p className="text-sm text-blue-600/70 font-medium">Response Rate</p>
                <p className="text-3xl font-bold text-blue-900">{personalAnalytics.responseRate}%</p>
                <Progress value={personalAnalytics.responseRate} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent group-hover:from-pink-500/10"></div>
            <CardContent className="p-6 relative z-10">
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="h-6 w-6 text-pink-600" />
                </div>
                <p className="text-sm text-blue-600/70 font-medium">Search Rank</p>
                <p className="text-3xl font-bold text-blue-900">{personalAnalytics.searchAppearances}</p>
                <div className="flex items-center justify-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills Analysis */}
        <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent pointer-events-none rounded-lg"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-blue-900 flex items-center text-2xl">
              <Award className="w-6 h-6 mr-2" />
              Top Skills in Demand
            </CardTitle>
            <CardDescription className="text-blue-600/70">Skills that are trending in your field</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {topSkills.map((item, index) => (
                <div key={item.skill} className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-900">{item.skill}</span>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {item.demand}%
                    </Badge>
                  </div>
                  <Progress value={item.demand} className="h-2 mb-2" />
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{item.growth}% growth
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Dashboard Component */}
        <AnalyticsDashboard data={analyticsData} />
      </div>
    </div>
  );
};

export default Analytics;
