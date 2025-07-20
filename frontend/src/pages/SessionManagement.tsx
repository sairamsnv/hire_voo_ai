import React, { useState, useEffect, useContext } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Monitor,
  Users,
  Globe,
  Smartphone,
  Laptop,
  Tablet,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Browser,
  Shield,
  Activity,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Eye,
  Trash2,
  Power,
  Settings,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Info,
} from 'lucide-react';
import Header from '@/components/Header';
import { AuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserSession {
  id: string;
  user: {
    email: string;
    full_name: string;
  };
  ip_address: string;
  device_type: string;
  browser: string;
  os: string;
  location: string;
  is_active: boolean;
  created_at: string;
  last_activity: string;
  expires_at: string;
}

interface SessionActivity {
  id: string;
  activity_type: string;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  metadata: any;
}

const SessionManagement = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);
  const [sessionDetails, setSessionDetails] = useState<UserSession | null>(null);
  const [sessionActivities, setSessionActivities] = useState<SessionActivity[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/sessions/all/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data);
        toast({
          title: "Success",
          description: "Sessions refreshed successfully.",
        });
      } else {
        console.error('Failed to fetch sessions:', response.status);
        toast({
          title: "Error",
          description: "Failed to load sessions. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Network error while loading sessions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch real session data from Django backend
  useEffect(() => {
    fetchSessions();
  }, []);

  const handleViewDetails = async (session: UserSession) => {
    setSelectedSession(session);
    setDetailsLoading(true);
    setDetailsOpen(true);
    
    try {
      const response = await fetch(`/api/admin/sessions/${session.id}/details/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessionDetails(data);
      } else {
        console.error('Failed to fetch session details:', response.status);
        toast({
          title: "Error",
          description: "Failed to load session details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast({
        title: "Error",
        description: "Network error while loading session details.",
        variant: "destructive",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewActivity = async (session: UserSession) => {
    setSelectedSession(session);
    setActivitiesLoading(true);
    setActivitiesOpen(true);
    
    try {
      const response = await fetch(`/api/admin/sessions/${session.id}/activity/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessionActivities(data);
      } else {
        console.error('Failed to fetch session activities:', response.status);
        toast({
          title: "Error",
          description: "Failed to load session activities.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching session activities:', error);
      toast({
        title: "Error",
        description: "Network error while loading session activities.",
        variant: "destructive",
      });
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleForceLogout = async (session: UserSession) => {
    try {
      // Get CSRF token from cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      const csrfToken = getCookie('csrftoken');
      
      const response = await fetch('/api/admin/sessions/force-logout-session/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRFToken': csrfToken }),
        },
        body: JSON.stringify({
          session_id: session.id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message || "Session terminated successfully.",
        });
        // Refresh sessions list
        fetchSessions();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to terminate session.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error terminating session:', error);
      toast({
        title: "Error",
        description: "Network error while terminating session.",
        variant: "destructive",
      });
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Laptop className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Clock className="w-3 h-3 mr-1" />
        Expired
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.ip_address.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && session.is_active) ||
                         (filterStatus === 'expired' && !session.is_active);
    
    return matchesSearch && matchesFilter;
  });

  const activeSessions = sessions.filter(s => s.is_active).length;
  const totalSessions = sessions.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-blue-600">Loading sessions...</p>
            </div>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 flex items-center">
              <Monitor className="w-8 h-8 mr-3" />
              Session Management
            </h1>
            <p className="text-blue-600/70 mt-2">Monitor and manage all user sessions across the platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="border-blue-200 text-blue-700"
              onClick={fetchSessions}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600/70 font-medium">Total Sessions</p>
                  <p className="text-3xl font-bold text-blue-900">{totalSessions}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Monitor className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600/70 font-medium">Active Sessions</p>
                  <p className="text-3xl font-bold text-green-900">{activeSessions}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600/70 font-medium">Expired Sessions</p>
                  <p className="text-3xl font-bold text-orange-900">{totalSessions - activeSessions}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600/70 font-medium">Unique Users</p>
                  <p className="text-3xl font-bold text-purple-900">{new Set(sessions.map(s => s.user.email)).size}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-sm font-medium text-blue-900">Search Sessions</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by user, email, or IP address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-900">Filter by Status</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('active')}
                  >
                    Active
                  </Button>
                  <Button
                    variant={filterStatus === 'expired' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('expired')}
                  >
                    Expired
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Table */}
        <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-blue-900">Active Sessions</CardTitle>
            <CardDescription>Monitor all user sessions and their activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-blue-900">{session.user.full_name}</p>
                          <p className="text-sm text-blue-600/70">{session.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getDeviceIcon(session.device_type)}
                          <div>
                            <p className="text-sm font-medium">{session.browser}</p>
                            <p className="text-xs text-blue-600/70">{session.os}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-blue-400" />
                          <span className="text-sm">{session.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-blue-50 px-2 py-1 rounded">
                          {session.ip_address}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(session.last_activity)}</p>
                          <p className="text-blue-600/70">Created: {formatDate(session.created_at)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(session.is_active)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(session)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewActivity(session)}>
                              <Activity className="w-4 h-4 mr-2" />
                              Activity Log
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Power className="w-4 h-4 mr-2" />
                                  Force Logout
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Force Logout Session</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to force logout this session? 
                                    This will immediately terminate the user's session and they will need to log in again.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleForceLogout(session)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Force Logout
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Session Details Modal */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Session Details
              </DialogTitle>
              <DialogDescription>
                Detailed information about the selected session
              </DialogDescription>
            </DialogHeader>
            {detailsLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2">Loading details...</span>
              </div>
            ) : sessionDetails ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-blue-900">User</Label>
                    <p className="text-sm">{sessionDetails.user?.full_name || 'N/A'}</p>
                    <p className="text-xs text-blue-600/70">{sessionDetails.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Session ID</Label>
                    <code className="text-xs bg-blue-50 px-2 py-1 rounded block mt-1">
                      {sessionDetails.id}
                    </code>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">IP Address</Label>
                    <p className="text-sm">{sessionDetails.ip_address || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Location</Label>
                    <p className="text-sm">{sessionDetails.location || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Device</Label>
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(sessionDetails.device_type)}
                      <span className="text-sm">{sessionDetails.device_type}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Browser</Label>
                    <p className="text-sm">{sessionDetails.browser || 'N/A'}</p>
                    <p className="text-xs text-blue-600/70">{sessionDetails.os || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(sessionDetails.is_active)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Created</Label>
                    <p className="text-sm">{sessionDetails.created_at ? formatDate(sessionDetails.created_at) : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Last Activity</Label>
                    <p className="text-sm">{sessionDetails.last_activity ? formatDate(sessionDetails.last_activity) : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Expires</Label>
                    <p className="text-sm">{sessionDetails.expires_at ? formatDate(sessionDetails.expires_at) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No session details available
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Session Activity Modal */}
        <Dialog open={activitiesOpen} onOpenChange={setActivitiesOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Session Activity Log
              </DialogTitle>
              <DialogDescription>
                Activity history for the selected session
              </DialogDescription>
            </DialogHeader>
            {activitiesLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2">Loading activities...</span>
              </div>
            ) : sessionActivities.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {sessionActivities.map((activity) => (
                    <Card key={activity.id} className="border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {activity.activity_type}
                              </Badge>
                              <span className="text-xs text-blue-600/70">
                                {formatDate(activity.created_at)}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{activity.description}</p>
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-blue-600/70">
                                IP: {activity.ip_address}
                              </p>
                              <p className="text-xs text-blue-600/70 truncate">
                                User Agent: {activity.user_agent}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No activity recorded for this session</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SessionManagement; 