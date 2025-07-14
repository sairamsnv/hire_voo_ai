
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Globe, Users, Briefcase, DollarSign } from 'lucide-react';

interface AnalyticsDashboardProps {
  data: {
    totalJobs: number;
    activeApplications: number;
    weeklyGrowth: number;
    monthlyGrowth: number;
    topCountries: Array<{
      name: string;
      jobs: number;
      growth: number;
    }>;
  };
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data }) => {
  // Mock data for charts
  const weeklyData = [
    { name: 'Mon', jobs: 120, applications: 85 },
    { name: 'Tue', jobs: 132, applications: 92 },
    { name: 'Wed', jobs: 145, applications: 103 },
    { name: 'Thu', jobs: 158, applications: 117 },
    { name: 'Fri', jobs: 171, applications: 128 },
    { name: 'Sat', jobs: 89, applications: 67 },
    { name: 'Sun', jobs: 76, applications: 54 },
  ];

  const monthlyTrends = [
    { month: 'Jan', jobs: 2340, applications: 1850 },
    { month: 'Feb', jobs: 2580, applications: 2100 },
    { month: 'Mar', jobs: 2890, applications: 2380 },
    { month: 'Apr', jobs: 3120, applications: 2650 },
    { month: 'May', jobs: 3450, applications: 2890 },
    { month: 'Jun', jobs: 3780, applications: 3150 },
  ];

  const skillsData = [
    { name: 'React', value: 35, color: '#8884d8' },
    { name: 'Python', value: 28, color: '#82ca9d' },
    { name: 'AWS', value: 22, color: '#ffc658' },
    { name: 'Node.js', value: 15, color: '#ff7300' },
  ];

  const salaryRanges = [
    { range: '$50k-$75k', count: 145, color: '#8884d8' },
    { range: '$75k-$100k', count: 230, color: '#82ca9d' },
    { range: '$100k-$150k', count: 180, color: '#ffc658' },
    { range: '$150k+', count: 95, color: '#ff7300' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Analytics Dashboard</h2>
          <p className="text-muted-foreground mt-2">Comprehensive insights into job market trends</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select defaultValue="last30days">
            <SelectTrigger className="w-48 glass border-white/30">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="glass">
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last90days">Last 90 days</SelectItem>
              <SelectItem value="lastyear">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Badge className="gradient-premium text-black px-4 py-2">
            Real-time Data
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass shadow-premium card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-3xl font-bold gradient-text">{data.totalJobs.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500 font-medium">+{data.weeklyGrowth}% this week</span>
                </div>
              </div>
              <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center shadow-premium">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-premium card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Applications</p>
                <p className="text-3xl font-bold gradient-text">{data.activeApplications.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500 font-medium">+{data.monthlyGrowth}% this month</span>
                </div>
              </div>
              <div className="w-12 h-12 gradient-secondary rounded-full flex items-center justify-center shadow-premium">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-premium card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Salary</p>
                <p className="text-3xl font-bold gradient-text">$98.5k</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500 font-medium">+5.2% increase</span>
                </div>
              </div>
              <div className="w-12 h-12 gradient-success rounded-full flex items-center justify-center shadow-premium">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-premium card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Countries</p>
                <p className="text-3xl font-bold gradient-text">45</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500 font-medium">3 new this month</span>
                </div>
              </div>
              <div className="w-12 h-12 gradient-premium rounded-full flex items-center justify-center shadow-premium">
                <Globe className="w-6 h-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Activity */}
        <Card className="glass shadow-luxury">
          <CardHeader>
            <CardTitle className="gradient-text">Weekly Activity</CardTitle>
            <CardDescription>Jobs posted and applications received this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px'
                  }} 
                />
                <Bar dataKey="jobs" fill="url(#gradient1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="applications" fill="url(#gradient2)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#764ba2" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f093fb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f5576c" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="glass shadow-luxury">
          <CardHeader>
            <CardTitle className="gradient-text">Monthly Trends</CardTitle>
            <CardDescription>6-month growth trajectory</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="jobs" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#f093fb" 
                  strokeWidth={3}
                  dot={{ fill: '#f093fb', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Countries */}
        <Card className="glass shadow-luxury">
          <CardHeader>
            <CardTitle className="gradient-text">Top Countries</CardTitle>
            <CardDescription>Job distribution by location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topCountries.map((country, index) => (
                <div key={country.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{country.name}</p>
                      <p className="text-sm text-muted-foreground">{country.jobs.toLocaleString()} jobs</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">+{country.growth}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills Distribution */}
        <Card className="glass shadow-luxury">
          <CardHeader>
            <CardTitle className="gradient-text">Top Skills</CardTitle>
            <CardDescription>Most demanded skills</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={skillsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {skillsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {skillsData.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skill.color }}></div>
                    <span className="text-sm">{skill.name}</span>
                  </div>
                  <span className="text-sm font-medium">{skill.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Salary Distribution */}
        <Card className="glass shadow-luxury">
          <CardHeader>
            <CardTitle className="gradient-text">Salary Ranges</CardTitle>
            <CardDescription>Distribution of job salaries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salaryRanges.map((range) => (
                <div key={range.range} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{range.range}</span>
                    <span className="text-sm text-muted-foreground">{range.count} jobs</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${(range.count / Math.max(...salaryRanges.map(r => r.count))) * 100}%`,
                        background: `linear-gradient(90deg, ${range.color}, ${range.color}AA)`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
