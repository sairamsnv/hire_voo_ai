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
  DialogFooter,
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
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  UserCheck,
  UserX,
  Crown,
  Shield,
  Calendar,
  Activity,
  TrendingUp,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
} from 'lucide-react';
import Header from '@/components/Header';
import { AuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string;
  total_sessions: number;
  active_sessions: number;
  account_age: number;
  status: string;
  bio: string;
  country: string;
  job_stream: string;
}

interface UserAnalytics {
  overview: {
    total_users: number;
    active_users: number;
    new_users_today: number;
    new_users_week: number;
    new_users_month: number;
  };
  status_distribution: {
    active: number;
    admin: number;
    superuser: number;
    inactive: number;
  };
  recent_users: User[];
  growth_data: Array<{
    date: string;
    new_users: number;
  }>;
}

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Fetch users data
  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: '20',
        search: searchTerm,
        status: statusFilter,
      });

      const response = await fetch(`/api/admin/users/?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.pagination.total_pages);
        setTotalUsers(data.pagination.total_users);
      } else {
        console.error('Failed to fetch users:', response.status);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Network error while loading users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/users/analytics/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        console.error('Failed to fetch analytics:', response.status);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleViewUserDetails = async (user: User) => {
    setSelectedUser(user);
    setDetailsLoading(true);
    setUserDetailsOpen(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserDetails(data);
      } else {
        console.error('Failed to fetch user details:', response.status);
        toast({
          title: "Error",
          description: "Failed to load user details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({
        title: "Error",
        description: "Network error while loading user details",
        variant: "destructive",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setEditUserOpen(true);
  };

  const handleUpdateUser = async (updatedData: Partial<User>) => {
    if (!editUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editUser.id}/update/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u.id === editUser.id ? updatedUser : u));
        setEditUserOpen(false);
        setEditUser(null);
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Network error while updating user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/delete/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== user.id));
        setTotalUsers(prev => prev - 1);
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Network error while deleting user",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'Admin':
        return <Badge className="bg-blue-100 text-blue-800"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'Super Admin':
        return <Badge className="bg-purple-100 text-purple-800"><Crown className="w-3 h-3 mr-1" />Super Admin</Badge>;
      case 'Inactive':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-600">Loading user management...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 flex items-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
              User Management
            </h1>
            <p className="text-blue-600/70 mt-2 text-sm sm:text-base">Manage all registered users and their accounts</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={() => fetchUsers()}
              variant="outline"
              className="border-blue-200 text-blue-700 mobile-button"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => fetchAnalytics()}
              className="bg-blue-600 hover:bg-blue-700 mobile-button"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600/70 font-medium">Total Users</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-900">{analytics.overview.total_users}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600/70 font-medium">Active Users</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-900">{analytics.overview.active_users}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600/70 font-medium">New Today</p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-900">{analytics.overview.new_users_today}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600/70 font-medium">New This Week</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-900">{analytics.overview.new_users_week}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-600/70 font-medium">New This Month</p>
                    <p className="text-2xl sm:text-3xl font-bold text-indigo-900">{analytics.overview.new_users_month}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-1">
                <Label htmlFor="search" className="text-sm font-medium text-blue-900">Search Users</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="status" className="text-sm font-medium text-blue-900">Status Filter</Label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="admin">Admin</option>
                  <option value="superuser">Super User</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-blue-900">All Users ({totalUsers})</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-blue-900">{user.full_name || 'No Name'}</div>
                          <div className="text-sm text-blue-600/70">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{user.active_sessions} active</div>
                          <div className="text-blue-600/70">{user.total_sessions} total</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(user.date_joined)}</div>
                          <div className="text-blue-600/70">{user.account_age} days ago</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-blue-600/70">
                          {user.last_login}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewUserDetails(user)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.full_name || user.email}? 
                                    This action cannot be undone and will permanently remove the user account.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-blue-600/70">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Details Modal */}
      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          {detailsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-600">Loading user details...</p>
              </div>
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-blue-900">Full Name</Label>
                  <p className="text-sm text-blue-600/70">{userDetails.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blue-900">Email</Label>
                  <p className="text-sm text-blue-600/70">{userDetails.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blue-900">Country</Label>
                  <p className="text-sm text-blue-600/70">{userDetails.country || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blue-900">Job Stream</Label>
                  <p className="text-sm text-blue-600/70">{userDetails.job_stream || 'Not provided'}</p>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <Label className="text-sm font-medium text-blue-900">Account Information</Label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-900">Date Joined</div>
                    <div className="text-sm text-blue-600/70">{formatDate(userDetails.date_joined)}</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-900">Last Login</div>
                    <div className="text-sm text-blue-600/70">{formatDate(userDetails.last_login)}</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-900">Status</div>
                    <div className="text-sm text-blue-600/70">{getStatusBadge(userDetails.is_active ? 'Active' : 'Inactive')}</div>
                  </div>
                </div>
              </div>

              {/* Sessions */}
              {userDetails.sessions && userDetails.sessions.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-blue-900">Active Sessions ({userDetails.sessions.length})</Label>
                  <div className="mt-2 space-y-2">
                    {userDetails.sessions.slice(0, 3).map((session: any) => (
                      <div key={session.id} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-blue-900">{session.device_info}</div>
                            <div className="text-sm text-blue-600/70">{session.ip_address}</div>
                          </div>
                          <div className="text-sm text-blue-600/70">{session.duration}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activities */}
              {userDetails.recent_activities && userDetails.recent_activities.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-blue-900">Recent Activities</Label>
                  <div className="mt-2 space-y-2">
                    {userDetails.recent_activities.slice(0, 5).map((activity: any) => (
                      <div key={activity.id} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-blue-900">{activity.activity_type_display}</div>
                            <div className="text-sm text-blue-600/70">{activity.description}</div>
                          </div>
                          <div className="text-sm text-blue-600/70">{activity.time_ago}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-blue-600">Failed to load user details</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information for {editUser?.full_name || editUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          {editUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  defaultValue={editUser.full_name}
                  onChange={(e) => setEditUser({...editUser, full_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  defaultValue={editUser.bio}
                  onChange={(e) => setEditUser({...editUser, bio: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  defaultValue={editUser.country}
                  onChange={(e) => setEditUser({...editUser, country: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="job_stream">Job Stream</Label>
                <Input
                  id="job_stream"
                  defaultValue={editUser.job_stream}
                  onChange={(e) => setEditUser({...editUser, job_stream: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editUser.is_active}
                  onChange={(e) => setEditUser({...editUser, is_active: e.target.checked})}
                />
                <Label htmlFor="is_active">Active Account</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_staff"
                  checked={editUser.is_staff}
                  onChange={(e) => setEditUser({...editUser, is_staff: e.target.checked})}
                />
                <Label htmlFor="is_staff">Admin Access</Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => editUser && handleUpdateUser(editUser)}>
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement; 