import React, { useContext, useState, useEffect } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Star,
  Bell,
  Calendar,
  Crown,
  Zap,
  Target,
  Monitor,
  Sparkles,
  Shield,
} from 'lucide-react';
import Header from '@/components/Header';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';

const Dashboard = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  const activeApplications = 12;
  const savedJobs = 28;
  const profileViews = 156;
  const interviewRequests = 5;
  const creditsUsed = 45;
  const creditsLimit = 100;
  const subscriptionPlan = 'Premium Plan';

  const recentActivity = [
    { id: 1, type: 'application', company: 'TechCorp', position: 'Senior Developer', time: '2 hours ago' },
    { id: 2, type: 'interview', company: 'Innovation Labs', position: 'Product Manager', time: '1 day ago' },
    { id: 3, type: 'view', company: 'Digital Dynamics', position: 'UX Designer', time: '2 days ago' },
  ];

  const upcomingInterviews = [
    { id: 1, company: 'TechCorp', position: 'Senior Developer', date: 'Tomorrow', time: '2:00 PM' },
    { id: 2, company: 'StartupXYZ', position: 'Full Stack Engineer', date: 'Friday', time: '10:00 AM' },
  ];

  const creditsPercentage = (creditsUsed / creditsLimit) * 100;

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
          <h2 className="text-2xl font-bold gradient-text mb-3">Loading Dashboard</h2>
          <p className="text-muted-foreground text-base">Preparing your personalized dashboard...</p>
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
      <Header/>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome Section with Credits and Subscription Info */}
       <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 sm:p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold mb-2">Welcome back, John! 👋</h1>
                <p className="text-blue-100 text-base sm:text-lg">Ready to find your next opportunity?</p>
              </div>
              <div className="text-left sm:text-right">
                <Badge className="bg-white/20 text-white border-white/30 px-3 sm:px-4 py-2 mb-2">
                  <Crown className="w-4 h-4 mr-1" />
                  {subscriptionPlan}
                </Badge>
                <p className="text-blue-100 text-sm">Current Plan</p>
              </div>
            </div>

            
            {/* Credits Section */}
            <div className="bg-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-sm border border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Credits Usage</h3>
                    <p className="text-blue-100 text-sm">Monthly allowance</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-2xl font-bold text-white">{creditsUsed}/{creditsLimit}</p>
                  <p className="text-blue-100 text-sm">Credits used</p>
                </div>
              </div>
              <Progress value={creditsPercentage} className="h-3 bg-white/20" />
              <div className="flex justify-between mt-2 text-sm text-blue-100">
                <span>{creditsPercentage.toFixed(0)}% used</span>
                <span>{creditsLimit - creditsUsed} remaining</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent group-hover:from-blue-500/10"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600/70 font-medium">Active Applications</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900">{activeApplications}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent group-hover:from-green-500/10"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600/70 font-medium">Saved Jobs</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900">{savedJobs}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent group-hover:from-purple-500/10"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600/70 font-medium">Profile Views</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900">{profileViews}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent group-hover:from-orange-500/10"></div>
            <CardContent className="p-4 sm:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600/70 font-medium">Interview Requests</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900">{interviewRequests}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent pointer-events-none rounded-lg"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-blue-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-blue-600/70">Your latest job search updates</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">{activity.company} - {activity.position}</p>
                      <p className="text-sm text-blue-600/70">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Interviews */}
            <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent pointer-events-none rounded-lg"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-blue-900 flex items-center text-lg">
                  <Calendar className="w-5 h-5 mr-2" />
                  Upcoming Interviews
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                {upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                    <p className="font-medium text-blue-900 text-sm">{interview.company}</p>
                    <p className="text-xs text-blue-600/70">{interview.position}</p>
                    <p className="text-xs text-blue-800 font-medium mt-1">{interview.date} at {interview.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent pointer-events-none rounded-lg"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-blue-900 flex items-center text-lg">
                  <Zap className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                <Link to="/analytics">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
                <Link to="/people">
                  <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Users className="w-4 h-4 mr-2" />
                    Find People
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Crown className="w-4 h-4 mr-2" />
                    View Pricing
                  </Button>
                </Link>
                <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                  <Star className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
                <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                  <Target className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
                                {user?.is_staff && (
                  <>
                    <Link to="/sessions">
                      <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                        <Monitor className="w-4 h-4 mr-2" />
                        Session Management
                      </Button>
                    </Link>
                    <Link to="/security">
                      <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                        <Shield className="w-4 h-4 mr-2" />
                        Security Dashboard
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
