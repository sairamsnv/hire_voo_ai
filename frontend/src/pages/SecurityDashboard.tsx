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
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Browser,
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
  Lock,
  Unlock,
  Key,
  User,
  Globe,
  Zap,
  Target,
  Crosshair,
  Database,
  Network,
  HardDrive,
  Cpu,
  Wifi,
  WifiOff,
  Server,
  Cloud,
  CloudOff,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Fingerprint,
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  MoreHorizontal,
} from 'lucide-react';
import Header from '@/components/Header';
import { AuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip_address: string;
  user_agent: string;
  user?: {
    email: string;
    full_name: string;
  };
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  key_type: string;
  is_active: boolean;
  last_used?: string;
  created_at: string;
  expires_at?: string;
  permissions: string[];
}

const SecurityDashboard = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'resolved' | 'unresolved'>('all');
  
  // Modal states
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [selectedApiKey, setSelectedApiKey] = useState<APIKey | null>(null);
  const [eventDetails, setEventDetails] = useState<SecurityEvent | null>(null);
  const [apiKeyDetails, setApiKeyDetails] = useState<APIKey | null>(null);
  const [eventActivities, setEventActivities] = useState<any[]>([]);
  const [apiKeyUsage, setApiKeyUsage] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const [eventActivitiesOpen, setEventActivitiesOpen] = useState(false);
  const [apiKeyDetailsOpen, setApiKeyDetailsOpen] = useState(false);
  const [apiKeyUsageOpen, setApiKeyUsageOpen] = useState(false);
  const [createApiKeyOpen, setCreateApiKeyOpen] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newApiKeyType, setNewApiKeyType] = useState('read');
  const [newApiKeyPermissions, setNewApiKeyPermissions] = useState<string[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [securitySettingsOpen, setSecuritySettingsOpen] = useState(false);

  // Fetch real security data from Django backend
  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        // Fetch security events
        const eventsResponse = await fetch('/api/admin/security/events/', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData);
        } else {
          console.error('Failed to fetch security events:', eventsResponse.status);
        }

        // Fetch API keys
        const keysResponse = await fetch('/api/security/keys/', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (keysResponse.ok) {
          const keysData = await keysResponse.json();
          setApiKeys(keysData);
        } else {
          console.error('Failed to fetch API keys:', keysResponse.status);
        }

      } catch (error) {
        console.error('Error fetching security data:', error);
        toast({
          title: "Error",
          description: "Network error while loading security data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityData();
  }, [toast]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="w-3 h-3 mr-1" />High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800"><Info className="w-3 h-3 mr-1" />Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800"><Info className="w-3 h-3 mr-1" />Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (resolved: boolean) => {
    return resolved ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Resolved
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <Clock className="w-3 h-3 mr-1" />
        Open
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.ip_address.includes(searchTerm) ||
                         event.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'resolved' && event.resolved) ||
                         (filterStatus === 'unresolved' && !event.resolved);
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const criticalEvents = events.filter(e => e.severity === 'critical').length;
  const highEvents = events.filter(e => e.severity === 'high').length;
  const openEvents = events.filter(e => !e.resolved).length;
  const totalEvents = events.length;
  const activeApiKeys = apiKeys.filter(k => k.is_active).length;

  // Security Event Handlers
  const handleViewEventDetails = async (event: SecurityEvent) => {
    setSelectedEvent(event);
    setDetailsLoading(true);
    setEventDetailsOpen(true);
    
    try {
      const response = await fetch(`/api/admin/security/events/${event.id}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEventDetails(data);
      } else {
        console.error('Failed to fetch event details:', response.status);
        toast({
          title: "Error",
          description: "Failed to load event details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast({
        title: "Error",
        description: "Network error while loading event details.",
        variant: "destructive",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewEventInvestigation = async (event: SecurityEvent) => {
    setSelectedEvent(event);
    setActivitiesLoading(true);
    setEventActivitiesOpen(true);
    
    try {
      const response = await fetch(`/api/admin/security/events/${event.id}/investigation/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEventActivities(data);
      } else {
        console.error('Failed to fetch event investigation:', response.status);
        toast({
          title: "Error",
          description: "Failed to load investigation data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching event investigation:', error);
      toast({
        title: "Error",
        description: "Network error while loading investigation data.",
        variant: "destructive",
      });
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleResolveEvent = async (event: SecurityEvent) => {
    try {
      // Get CSRF token from cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      const csrfToken = getCookie('csrftoken');
      
      const response = await fetch(`/api/admin/security/events/${event.id}/resolve/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRFToken': csrfToken }),
        },
        body: JSON.stringify({
          resolved: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message || "Event marked as resolved.",
        });
        // Refresh events list without reloading the page
        const eventsResponse = await fetch('/api/admin/security/events/', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData);
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to resolve event.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error resolving event:', error);
      toast({
        title: "Error",
        description: "Network error while resolving event.",
        variant: "destructive",
      });
    }
  };

  const handleBlockIP = async (event: SecurityEvent) => {
    try {
      // Get CSRF token from cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      const csrfToken = getCookie('csrftoken');
      
      const response = await fetch('/api/admin/security/block-ip/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRFToken': csrfToken }),
        },
        body: JSON.stringify({
          ip_address: event.ip_address,
          reason: `Blocked due to ${event.event_type} event`,
          event_id: event.id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message || "IP address blocked successfully.",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to block IP address.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error blocking IP:', error);
      toast({
        title: "Error",
        description: "Network error while blocking IP address.",
        variant: "destructive",
      });
    }
  };

  // API Key Handlers
  const handleViewApiKeyDetails = async (apiKey: APIKey) => {
    setSelectedApiKey(apiKey);
    setDetailsLoading(true);
    setApiKeyDetailsOpen(true);
    
    try {
      const response = await fetch(`/api/security/keys/${apiKey.id}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeyDetails(data);
      } else {
        console.error('Failed to fetch API key details:', response.status);
        toast({
          title: "Error",
          description: "Failed to load API key details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching API key details:', error);
      toast({
        title: "Error",
        description: "Network error while loading API key details.",
        variant: "destructive",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewApiKeyUsage = async (apiKey: APIKey) => {
    setSelectedApiKey(apiKey);
    setActivitiesLoading(true);
    setApiKeyUsageOpen(true);
    
    try {
      const response = await fetch(`/api/security/keys/${apiKey.id}/usage/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeyUsage(data);
      } else {
        console.error('Failed to fetch API key usage:', response.status);
        toast({
          title: "Error",
          description: "Failed to load API key usage data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching API key usage:', error);
      toast({
        title: "Error",
        description: "Network error while loading API key usage.",
        variant: "destructive",
      });
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleRevokeApiKey = async (apiKey: APIKey) => {
    try {
      // Get CSRF token from cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      const csrfToken = getCookie('csrftoken');
      
      const response = await fetch(`/api/security/keys/${apiKey.id}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRFToken': csrfToken }),
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "API key revoked successfully.",
        });
        // Refresh API keys list without reloading the page
        const keysResponse = await fetch('/api/security/keys/', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (keysResponse.ok) {
          const keysData = await keysResponse.json();
          setApiKeys(keysData);
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to revoke API key.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast({
        title: "Error",
        description: "Network error while revoking API key.",
        variant: "destructive",
      });
    }
  };

  // Create new API key
  const handleCreateApiKey = async () => {
    try {
      // Get CSRF token from cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      const csrfToken = getCookie('csrftoken');
      
      const response = await fetch('/api/security/keys/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRFToken': csrfToken }),
        },
        body: JSON.stringify({
          name: newApiKeyName,
          key_type: newApiKeyType,
          permissions: newApiKeyPermissions,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "API key created successfully.",
        });
        
        // Show the new API key details
        setApiKeyDetails(data.api_key);
        setApiKeyDetailsOpen(true);
        
        // Reset form
        setNewApiKeyName('');
        setNewApiKeyType('read');
        setNewApiKeyPermissions([]);
        setCreateApiKeyOpen(false);
        
        // Refresh the API keys list
        const keysResponse = await fetch('/api/security/keys/', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (keysResponse.ok) {
          const keysData = await keysResponse.json();
          setApiKeys(keysData);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to create API key.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "Error",
        description: "Network error while creating API key.",
        variant: "destructive",
      });
    }
  };

  // Handle payment
  const handlePayment = async (plan: string) => {
    try {
      const response = await fetch('/api/payments/create-checkout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: plan,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to payment page or handle payment flow
        window.location.href = data.checkout_url;
      } else {
        toast({
          title: "Error",
          description: "Failed to initiate payment.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast({
        title: "Error",
        description: "Network error while processing payment.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-blue-600">Loading security dashboard...</p>
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
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
              Security Dashboard
            </h1>
            <p className="text-blue-600/70 mt-2 text-sm sm:text-base">Monitor security events, threats, and API key management</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button 
              variant="outline" 
              className="border-blue-200 text-blue-700 mobile-button"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={() => setPaymentModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 mobile-button"
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
            <Button 
              onClick={() => setSecuritySettingsOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 mobile-button"
            >
              <Settings className="w-4 h-4 mr-2" />
              Security Settings
            </Button>
          </div>
        </div>

        {/* Security Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600/70 font-medium">Critical Events</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-900">{criticalEvents}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600/70 font-medium">High Priority</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-900">{highEvents}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600/70 font-medium">Open Issues</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900">{openEvents}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600/70 font-medium">Active API Keys</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-900">{activeApiKeys}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Key className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Security Events */}
          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Recent Security Events
              </CardTitle>
              <CardDescription>Monitor and respond to security threats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-blue-900 text-sm">{event.event_type.replace('_', ' ').toUpperCase()}</p>
                        {getSeverityBadge(event.severity)}
                      </div>
                      <p className="text-sm text-blue-600/70 mt-1">{event.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-blue-500">
                        <span>{event.ip_address}</span>
                        <span>{formatDate(event.created_at)}</span>
                        {getStatusBadge(event.resolved)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-900 flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    API Key Management
                  </CardTitle>
                  <CardDescription>Manage API keys and permissions</CardDescription>
                </div>
                <Button 
                  onClick={() => setCreateApiKeyOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Create API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-blue-900">{apiKey.name}</p>
                        <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                          {apiKey.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-blue-600/70 mt-1">
                        <code className="text-xs bg-blue-100 px-2 py-1 rounded">
                          {apiKey.key.substring(0, 12)}...
                        </code>
                      </p>
                      <p className="text-xs text-blue-500 mt-1">
                        Type: {apiKey.key_type} • Created: {formatDate(apiKey.created_at)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewApiKeyDetails(apiKey)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewApiKeyUsage(apiKey)}>
                          <Activity className="w-4 h-4 mr-2" />
                          Usage Log
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Revoke Key
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to revoke this API key? 
                                This action cannot be undone and will immediately invalidate the key.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRevokeApiKey(apiKey)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Revoke Key
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-sm font-medium text-blue-900">Search Events</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by description, IP address, or user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-900">Filter by Severity</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    variant={filterSeverity === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterSeverity('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterSeverity === 'critical' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterSeverity('critical')}
                  >
                    Critical
                  </Button>
                  <Button
                    variant={filterSeverity === 'high' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterSeverity('high')}
                  >
                    High
                  </Button>
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
                    variant={filterStatus === 'unresolved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('unresolved')}
                  >
                    Open
                  </Button>
                  <Button
                    variant={filterStatus === 'resolved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('resolved')}
                  >
                    Resolved
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Events Table */}
        <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-blue-900">Security Events</CardTitle>
            <CardDescription>Detailed view of all security events and threats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="font-medium text-blue-900">
                          {event.event_type.replace('_', ' ').toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(event.severity)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm">{event.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-blue-50 px-2 py-1 rounded">
                          {event.ip_address}
                        </code>
                      </TableCell>
                      <TableCell>
                        {event.user ? (
                          <div>
                            <p className="text-sm font-medium">{event.user.full_name}</p>
                            <p className="text-xs text-blue-600/70">{event.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-blue-600/70">Anonymous</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(event.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(event.resolved)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewEventDetails(event)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewEventInvestigation(event)}>
                              <Activity className="w-4 h-4 mr-2" />
                              Investigation Log
                            </DropdownMenuItem>
                            {!event.resolved && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark Resolved
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Mark Event as Resolved</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to mark this security event as resolved?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleResolveEvent(event)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Mark Resolved
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <ShieldX className="w-4 h-4 mr-2" />
                                  Block IP
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Block IP Address</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to block the IP address {event.ip_address}? 
                                    This will prevent all requests from this IP address.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleBlockIP(event)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Block IP
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

        {/* Security Event Details Modal */}
        <Dialog open={eventDetailsOpen} onOpenChange={setEventDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Security Event Details
              </DialogTitle>
              <DialogDescription>
                Detailed information about the security event
              </DialogDescription>
            </DialogHeader>
            {detailsLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2">Loading details...</span>
              </div>
            ) : eventDetails ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Event Type</Label>
                    <p className="text-sm font-medium">{eventDetails.event_type.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Severity</Label>
                    <div className="mt-1">
                      {getSeverityBadge(eventDetails.severity)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(eventDetails.resolved)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Created</Label>
                    <p className="text-sm">{formatDate(eventDetails.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">IP Address</Label>
                    <code className="text-xs bg-blue-50 px-2 py-1 rounded block mt-1">
                      {eventDetails.ip_address || 'N/A'}
                    </code>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">User</Label>
                    {eventDetails.user ? (
                      <div>
                        <p className="text-sm">{eventDetails.user.full_name}</p>
                        <p className="text-xs text-blue-600/70">{eventDetails.user.email}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-blue-600/70">Anonymous</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blue-900">Description</Label>
                  <p className="text-sm mt-1 bg-blue-50 p-3 rounded">
                    {eventDetails.description}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blue-900">User Agent</Label>
                  <p className="text-xs mt-1 bg-gray-50 p-2 rounded font-mono break-all">
                    {eventDetails.user_agent || 'N/A'}
                  </p>
                </div>
                {eventDetails.resolved_at && (
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Resolved At</Label>
                    <p className="text-sm">{formatDate(eventDetails.resolved_at)}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No event details available
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Security Event Investigation Modal */}
        <Dialog open={eventActivitiesOpen} onOpenChange={setEventActivitiesOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Investigation Log
              </DialogTitle>
              <DialogDescription>
                Investigation activities and related events
              </DialogDescription>
            </DialogHeader>
            {activitiesLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2">Loading investigation data...</span>
              </div>
            ) : eventActivities.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {eventActivities.map((activity: any) => (
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
                <p>No investigation data available for this event</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* API Key Details Modal */}
        <Dialog open={apiKeyDetailsOpen} onOpenChange={setApiKeyDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                API Key Details
              </DialogTitle>
              <DialogDescription>
                Detailed information about the API key
              </DialogDescription>
            </DialogHeader>
            {detailsLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2">Loading details...</span>
              </div>
            ) : apiKeyDetails ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Name</Label>
                    <p className="text-sm font-medium">{apiKeyDetails.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Type</Label>
                    <Badge variant="outline" className="text-xs">
                      {apiKeyDetails.key_type}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Status</Label>
                    <Badge variant={apiKeyDetails.is_active ? "default" : "secondary"}>
                      {apiKeyDetails.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Created</Label>
                    <p className="text-sm">{formatDate(apiKeyDetails.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Last Used</Label>
                    <p className="text-sm">{apiKeyDetails.last_used ? formatDate(apiKeyDetails.last_used) : 'Never'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Expires</Label>
                    <p className="text-sm">{apiKeyDetails.expires_at ? formatDate(apiKeyDetails.expires_at) : 'Never'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blue-900">API Key</Label>
                  <code className="text-xs bg-blue-50 px-2 py-1 rounded block mt-1 font-mono break-all">
                    {apiKeyDetails.key}
                  </code>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blue-900">Permissions</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {apiKeyDetails.permissions?.map((permission: string) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No API key details available
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* API Key Usage Modal */}
        <Dialog open={apiKeyUsageOpen} onOpenChange={setApiKeyUsageOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                API Key Usage Log
              </DialogTitle>
              <DialogDescription>
                Usage history and request logs for this API key
              </DialogDescription>
            </DialogHeader>
            {activitiesLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2">Loading usage data...</span>
              </div>
            ) : apiKeyUsage.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {apiKeyUsage.map((usage: any) => (
                    <Card key={usage.id} className="border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {usage.method} {usage.status_code}
                              </Badge>
                              <span className="text-xs text-blue-600/70">
                                {formatDate(usage.created_at)}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{usage.endpoint}</p>
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-blue-600/70">
                                IP: {usage.ip_address}
                              </p>
                              <p className="text-xs text-blue-600/70">
                                Response Time: {usage.response_time}ms
                              </p>
                              {usage.error_message && (
                                <p className="text-xs text-red-600">
                                  Error: {usage.error_message}
                                </p>
                              )}
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
                <p>No usage data available for this API key</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create API Key Modal */}
        <Dialog open={createApiKeyOpen} onOpenChange={setCreateApiKeyOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Create New API Key
              </DialogTitle>
              <DialogDescription>
                Create a new API key with specific permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="keyName" className="text-sm font-medium text-blue-900">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="Enter a descriptive name"
                  value={newApiKeyName}
                  onChange={(e) => setNewApiKeyName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="keyType" className="text-sm font-medium text-blue-900">Key Type</Label>
                <select
                  id="keyType"
                  value={newApiKeyType}
                  onChange={(e) => setNewApiKeyType(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="read">Read Only</option>
                  <option value="write">Read & Write</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-900">Permissions</Label>
                <div className="mt-2 space-y-2">
                  {['read', 'write', 'delete', 'admin'].map((permission) => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newApiKeyPermissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewApiKeyPermissions([...newApiKeyPermissions, permission]);
                          } else {
                            setNewApiKeyPermissions(newApiKeyPermissions.filter(p => p !== permission));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setCreateApiKeyOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateApiKey}
                  disabled={!newApiKeyName.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Key
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Security Settings Modal */}
        <Dialog open={securitySettingsOpen} onOpenChange={setSecuritySettingsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Security Settings
              </DialogTitle>
              <DialogDescription>
                Configure security preferences and notifications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900">Authentication</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-blue-600/70">Auto-logout after inactivity</p>
                    </div>
                    <select className="p-2 border border-gray-300 rounded-md">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                      <option>24 hours</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-blue-600/70">Get notified of suspicious activity</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Login Notifications</p>
                      <p className="text-sm text-blue-600/70">Alert on new device logins</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900">API Security</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Rate Limiting</p>
                      <p className="text-sm text-blue-600/70">Limit API request frequency</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">IP Whitelist</p>
                      <p className="text-sm text-blue-600/70">Restrict API access to specific IPs</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setSecuritySettingsOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Modal */}
        <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Upgrade Plan
              </DialogTitle>
              <DialogDescription>
                Choose a plan to unlock premium features
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Card className="border-2 border-blue-200 hover:border-blue-400 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="font-bold text-lg">Basic</h3>
                      <p className="text-3xl font-bold text-blue-600">$9<span className="text-sm">/month</span></p>
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        <li>• 5 API Keys</li>
                        <li>• Basic Security</li>
                        <li>• Email Support</li>
                      </ul>
                      <Button 
                        onClick={() => handlePayment('basic')}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                      >
                        Choose Basic
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 hover:border-green-400 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="font-bold text-lg">Pro</h3>
                      <p className="text-3xl font-bold text-green-600">$29<span className="text-sm">/month</span></p>
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        <li>• 25 API Keys</li>
                        <li>• Advanced Security</li>
                        <li>• Priority Support</li>
                        <li>• Analytics</li>
                      </ul>
                      <Button 
                        onClick={() => handlePayment('pro')}
                        className="w-full mt-4 bg-green-600 hover:bg-green-700"
                      >
                        Choose Pro
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200 hover:border-purple-400 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="font-bold text-lg">Enterprise</h3>
                      <p className="text-3xl font-bold text-purple-600">$99<span className="text-sm">/month</span></p>
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        <li>• Unlimited API Keys</li>
                        <li>• Enterprise Security</li>
                        <li>• 24/7 Support</li>
                        <li>• Custom Features</li>
                      </ul>
                      <Button 
                        onClick={() => handlePayment('enterprise')}
                        className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                      >
                        Choose Enterprise
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SecurityDashboard; 