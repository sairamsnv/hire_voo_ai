import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  Clock, 
  MapPin, 
  Trash2, 
  Settings, 
  BarChart3, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface UserSession {
  id: string;
  ip_address: string;
  device_type: string;
  browser: string;
  os: string;
  location: string;
  is_active: boolean;
  created_at: string;
  last_activity: string;
  expires_at: string;
  device_info: string;
  duration: string;
}

interface SessionActivity {
  id: string;
  activity_type: string;
  activity_type_display: string;
  description: string;
  ip_address: string;
  created_at: string;
  time_ago: string;
  metadata: any;
}

interface SessionSettings {
  max_concurrent_sessions: number;
  session_timeout_hours: number;
  require_reauth_for_sensitive_actions: boolean;
  notify_on_new_login: boolean;
  auto_logout_on_inactivity: boolean;
  inactivity_timeout_minutes: number;
}

interface SessionAnalytics {
  total_sessions: number;
  active_sessions: number;
  total_logins: number;
  avg_session_duration: number;
  device_distribution: Record<string, number>;
  browser_distribution: Record<string, number>;
  recent_activities: SessionActivity[];
  session_timeline: Array<{ date: string; count: number }>;
}

const SessionManagement: React.FC = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [activities, setActivities] = useState<SessionActivity[]>([]);
  const [settings, setSettings] = useState<SessionSettings | null>(null);
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [terminating, setTerminating] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const { toast } = useToast();

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions/', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sessions",
        variant: "destructive",
      });
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/sessions/activities/?limit=50', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      });
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/sessions/settings/', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive",
      });
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/sessions/analytics/?days=30', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch analytics",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSessions(),
        fetchActivities(),
        fetchSettings(),
        fetchAnalytics(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const terminateSession = async (sessionId: string) => {
    setTerminating(sessionId);
    try {
      const response = await fetch('/api/sessions/terminate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Session terminated successfully",
        });
        fetchSessions();
      } else {
        throw new Error('Failed to terminate session');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to terminate session",
        variant: "destructive",
      });
    } finally {
      setTerminating(null);
    }
  };

  const terminateAllSessions = async () => {
    if (!confirm('Are you sure you want to terminate all other sessions? This will log you out from all other devices.')) {
      return;
    }

    try {
      const response = await fetch('/api/sessions/terminate-all/', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: `Terminated ${data.terminated_count} sessions`,
        });
        fetchSessions();
      } else {
        throw new Error('Failed to terminate sessions');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to terminate sessions",
        variant: "destructive",
      });
    }
  };

  const updateSettings = async (newSettings: Partial<SessionSettings>) => {
    setSavingSettings(true);
    try {
      const response = await fetch('/api/sessions/settings/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        toast({
          title: "Success",
          description: "Settings updated successfully",
        });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'login':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'api_call':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
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
          <h2 className="text-2xl font-bold gradient-text mb-3">Loading Sessions</h2>
          <p className="text-muted-foreground text-base">Preparing your session management...</p>
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
          <h2 className="text-2xl font-bold tracking-tight">Session Management</h2>
          <p className="text-muted-foreground">
            Manage your active sessions and security settings
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="activities">Activity Log</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Sessions ({sessions.filter(s => s.is_active).length})</span>
                {sessions.filter(s => s.is_active).length > 1 && (
                  <Button onClick={terminateAllSessions} variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Terminate All Others
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(session.device_type)}
                        <Badge variant={session.is_active ? "default" : "secondary"}>
                          {session.device_type}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium">{session.device_info}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.ip_address} • {session.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last activity: {new Date(session.last_activity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{session.duration}</Badge>
                      {session.is_active && (
                        <Button
                          onClick={() => terminateSession(session.id)}
                          variant="destructive"
                          size="sm"
                          disabled={terminating === session.id}
                        >
                          {terminating === session.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No sessions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    {getActivityIcon(activity.activity_type)}
                    <div className="flex-1">
                      <p className="font-medium">{activity.activity_type_display}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.ip_address} • {activity.time_ago}
                      </p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No activity found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Total Sessions</span>
                    </div>
                    <p className="text-2xl font-bold">{analytics.total_sessions}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Active Sessions</span>
                    </div>
                    <p className="text-2xl font-bold">{analytics.active_sessions}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Total Logins</span>
                    </div>
                    <p className="text-2xl font-bold">{analytics.total_logins}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Avg Duration</span>
                    </div>
                    <p className="text-2xl font-bold">{analytics.avg_session_duration.toFixed(1)}h</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(analytics.device_distribution).map(([device, count]) => (
                        <div key={device} className="flex items-center justify-between">
                          <span className="capitalize">{device}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Browser Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(analytics.browser_distribution).map(([browser, count]) => (
                        <div key={browser} className="flex items-center justify-between">
                          <span>{browser}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {settings && (
            <Card>
              <CardHeader>
                <CardTitle>Session Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="max-sessions">Maximum Concurrent Sessions</Label>
                      <p className="text-sm text-muted-foreground">
                        Maximum number of active sessions allowed
                      </p>
                    </div>
                    <Input
                      id="max-sessions"
                      type="number"
                      min="1"
                      max="20"
                      value={settings.max_concurrent_sessions}
                      onChange={(e) => updateSettings({ max_concurrent_sessions: parseInt(e.target.value) })}
                      className="w-20"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="timeout">Session Timeout (hours)</Label>
                      <p className="text-sm text-muted-foreground">
                        How long sessions remain active
                      </p>
                    </div>
                    <Input
                      id="timeout"
                      type="number"
                      min="1"
                      max="8760"
                      value={settings.session_timeout_hours}
                      onChange={(e) => updateSettings({ session_timeout_hours: parseInt(e.target.value) })}
                      className="w-20"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="reauth">Require Re-authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require password for sensitive actions
                      </p>
                    </div>
                    <Switch
                      id="reauth"
                      checked={settings.require_reauth_for_sensitive_actions}
                      onCheckedChange={(checked) => updateSettings({ require_reauth_for_sensitive_actions: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify">Notify on New Login</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when logging in from new devices
                      </p>
                    </div>
                    <Switch
                      id="notify"
                      checked={settings.notify_on_new_login}
                      onCheckedChange={(checked) => updateSettings({ notify_on_new_login: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-logout">Auto Logout on Inactivity</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically logout after period of inactivity
                      </p>
                    </div>
                    <Switch
                      id="auto-logout"
                      checked={settings.auto_logout_on_inactivity}
                      onCheckedChange={(checked) => updateSettings({ auto_logout_on_inactivity: checked })}
                    />
                  </div>

                  {settings.auto_logout_on_inactivity && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="inactivity-timeout">Inactivity Timeout (minutes)</Label>
                        <p className="text-sm text-muted-foreground">
                          Minutes of inactivity before auto logout
                        </p>
                      </div>
                      <Input
                        id="inactivity-timeout"
                        type="number"
                        min="5"
                        max="1440"
                        value={settings.inactivity_timeout_minutes}
                        onChange={(e) => updateSettings({ inactivity_timeout_minutes: parseInt(e.target.value) })}
                        className="w-20"
                      />
                    </div>
                  )}
                </div>

                {savingSettings && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Saving settings...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SessionManagement; 