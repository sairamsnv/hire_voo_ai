import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import { Shield, Key, AlertTriangle, Activity, Plus, Trash2, Eye, EyeOff, Copy, Check, Sparkles } from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key_type: string;
  is_active: boolean;
  last_used: string | null;
  created_at: string;
  expires_at: string | null;
  permissions: string[];
  is_expired: boolean;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip_address: string | null;
  user_agent: string;
  resolved: boolean;
  created_at: string;
}

interface SecurityDashboard {
  total_events: number;
  events_by_severity: Record<string, number>;
  events_by_type: Record<string, number>;
  recent_events: SecurityEvent[];
  top_threat_ips: Array<{ ip_address: string; count: number }>;
  api_key_usage: Array<{
    api_key_id: string;
    api_key_name: string;
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    avg_response_time: number;
    last_used: string | null;
    top_endpoints: Array<{ endpoint: string; count: number }>;
  }>;
}

const SecurityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [dashboardData, setDashboardData] = useState<SecurityDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    key_type: 'read',
    expires_at: '',
    can_read_sessions: false,
    can_write_sessions: false,
    can_read_analytics: false,
    can_write_analytics: false,
    can_admin_users: false,
  });
  const [fullKey, setFullKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [keysRes, eventsRes, dashboardRes] = await Promise.all([
        fetch('/api/security/keys/'),
        fetch('/api/security/events/'),
        fetch('/api/security/dashboard/'),
      ]);

      if (keysRes.ok) {
        const keysData = await keysRes.json();
        setApiKeys(keysData);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setSecurityEvents(eventsData);
      }

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        setDashboardData(dashboardData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load security data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAPIKey = async () => {
    try {
      const response = await fetch('/api/security/keys/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        body: JSON.stringify(newKeyData),
      });

      if (response.ok) {
        const result = await response.json();
        setFullKey(result.full_key);
        setApiKeys([...apiKeys, result.api_key]);
        setShowCreateKey(false);
        setNewKeyData({
          name: '',
          key_type: 'read',
          expires_at: '',
          can_read_sessions: false,
          can_write_sessions: false,
          can_read_analytics: false,
          can_write_analytics: false,
          can_admin_users: false,
        });
        toast({
          title: "Success",
          description: "API key created successfully",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to create API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    }
  };

  const deleteAPIKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const response = await fetch(`/api/security/keys/${keyId}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
      });

      if (response.ok) {
        setApiKeys(apiKeys.filter(key => key.id !== keyId));
        toast({
          title: "Success",
          description: "API key deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  const resolveSecurityEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/security/events/${eventId}/resolve/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        body: JSON.stringify({ resolved: true }),
      });

      if (response.ok) {
        setSecurityEvents(securityEvents.map(event => 
          event.id === eventId ? { ...event, resolved: true } : event
        ));
        toast({
          title: "Success",
          description: "Security event resolved",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to resolve security event",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve security event",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
      toast({
        title: "Copied",
        description: "API key copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy API key",
        variant: "destructive",
      });
    }
  };

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="glass rounded-3xl p-12 text-center shadow-luxury relative z-10 border-white/60">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 gradient-primary rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold gradient-text mb-3">Loading Security Dashboard</h2>
          <p className="text-muted-foreground text-base">Preparing your security overview...</p>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your API security</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="text-sm text-muted-foreground">Security Center</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.total_events || 0}</div>
                <p className="text-xs text-muted-foreground">Security events detected</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiKeys.filter(k => k.is_active).length}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {dashboardData?.events_by_severity?.critical || 0}
                </div>
                <p className="text-xs text-muted-foreground">Require immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unresolved Events</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {securityEvents.filter(e => !e.resolved).length}
                </div>
                <p className="text-xs text-muted-foreground">Pending resolution</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Latest security events that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dashboardData?.recent_events.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{event.event_type}</p>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Threat IPs</CardTitle>
                <CardDescription>IP addresses with the most security events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dashboardData?.top_threat_ips.slice(0, 5).map((ip, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-mono">{ip.ip_address}</span>
                      <Badge variant="secondary">{ip.count} events</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">API Keys</h2>
            <Dialog open={showCreateKey} onOpenChange={setShowCreateKey}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key with specific permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Key Name</Label>
                    <Input
                      id="name"
                      value={newKeyData.name}
                      onChange={(e) => setNewKeyData({...newKeyData, name: e.target.value})}
                      placeholder="Enter key name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="key_type">Key Type</Label>
                    <Select value={newKeyData.key_type} onValueChange={(value) => setNewKeyData({...newKeyData, key_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Read Only</SelectItem>
                        <SelectItem value="write">Read/Write</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expires_at">Expires At (Optional)</Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={newKeyData.expires_at}
                      onChange={(e) => setNewKeyData({...newKeyData, expires_at: e.target.value})}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="can_read_sessions"
                          checked={newKeyData.can_read_sessions}
                          onChange={(e) => setNewKeyData({...newKeyData, can_read_sessions: e.target.checked})}
                        />
                        <Label htmlFor="can_read_sessions">Read Sessions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="can_write_sessions"
                          checked={newKeyData.can_write_sessions}
                          onChange={(e) => setNewKeyData({...newKeyData, can_write_sessions: e.target.checked})}
                        />
                        <Label htmlFor="can_write_sessions">Write Sessions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="can_read_analytics"
                          checked={newKeyData.can_read_analytics}
                          onChange={(e) => setNewKeyData({...newKeyData, can_read_analytics: e.target.checked})}
                        />
                        <Label htmlFor="can_read_analytics">Read Analytics</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="can_write_analytics"
                          checked={newKeyData.can_write_analytics}
                          onChange={(e) => setNewKeyData({...newKeyData, can_write_analytics: e.target.checked})}
                        />
                        <Label htmlFor="can_write_analytics">Write Analytics</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="can_admin_users"
                          checked={newKeyData.can_admin_users}
                          onChange={(e) => setNewKeyData({...newKeyData, can_admin_users: e.target.checked})}
                        />
                        <Label htmlFor="can_admin_users">Admin Users</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateKey(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createAPIKey} disabled={!newKeyData.name}>
                    Create Key
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {fullKey && (
            <Alert>
              <AlertDescription className="flex items-center justify-between">
                <span>Your new API key (copy this now - it won't be shown again):</span>
                <div className="flex items-center space-x-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm">{fullKey}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(fullKey)}
                  >
                    {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            {apiKeys.map((key) => (
              <Card key={key.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{key.name}</span>
                        <Badge variant={key.is_active ? "default" : "secondary"}>
                          {key.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {key.is_expired && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Type: {key.key_type} • Created: {new Date(key.created_at).toLocaleDateString()}
                        {key.last_used && ` • Last used: ${new Date(key.last_used).toLocaleDateString()}`}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAPIKey(key.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Permissions:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {key.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Security Events</h2>
            <Badge variant="outline">
              {securityEvents.filter(e => !e.resolved).length} Unresolved
            </Badge>
          </div>

          <div className="space-y-4">
            {securityEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{event.event_type}</span>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                        {event.resolved && (
                          <Badge variant="secondary">Resolved</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {new Date(event.created_at).toLocaleString()}
                        {event.ip_address && ` • IP: ${event.ip_address}`}
                      </CardDescription>
                    </div>
                    {!event.resolved && (
                      <Button
                        size="sm"
                        onClick={() => resolveSecurityEvent(event.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{event.description}</p>
                  {event.user_agent && (
                    <p className="text-xs text-muted-foreground mt-2">
                      User Agent: {event.user_agent}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold">API Key Analytics</h2>
          
          <div className="grid gap-4">
            {dashboardData?.api_key_usage.map((usage) => (
              <Card key={usage.api_key_id}>
                <CardHeader>
                  <CardTitle>{usage.api_key_name}</CardTitle>
                  <CardDescription>
                    Last used: {usage.last_used ? new Date(usage.last_used).toLocaleString() : 'Never'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-2xl font-bold">{usage.total_requests}</p>
                      <p className="text-xs text-muted-foreground">Total Requests</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{usage.successful_requests}</p>
                      <p className="text-xs text-muted-foreground">Successful</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{usage.failed_requests}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{usage.avg_response_time}s</p>
                      <p className="text-xs text-muted-foreground">Avg Response</p>
                    </div>
                  </div>
                  
                  {usage.top_endpoints.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium">Top Endpoints:</Label>
                      <div className="space-y-1 mt-1">
                        {usage.top_endpoints.map((endpoint, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="font-mono">{endpoint.endpoint}</span>
                            <Badge variant="outline">{endpoint.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard; 