
import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Type, 
  Bell, 
  Mail, 
  Shield, 
  Globe,
  Palette,
  Volume2,
  Key,
  Loader2,
  Save,
  RotateCcw,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserSettings {
  dark_mode: boolean;
  font_size: 'small' | 'medium' | 'large';
  email_notifications: boolean;
  push_notifications: boolean;
  job_alerts: boolean;
  marketing_emails: boolean;
  sound_enabled: boolean;
  auto_save: boolean;
  language: string;
  currency: string;
  timezone: string;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { toast } = useToast();
  const { user, logout } = useContext(AuthContext);
  const [settings, setSettings] = useState<UserSettings>({
    dark_mode: false,
    font_size: 'medium',
    email_notifications: true,
    push_notifications: true,
    job_alerts: true,
    marketing_emails: false,
    sound_enabled: true,
    auto_save: true,
    language: 'english',
    currency: 'usd',
    timezone: 'pst'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Load settings on modal open
  useEffect(() => {
    if (isOpen && user) {
      loadSettings();
    }
  }, [isOpen, user]);

  const getCSRFToken = () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    return cookies.csrftoken;
  };

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const csrfToken = getCSRFToken();
      
      const response = await fetch('/api/settings/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        
        // Apply settings immediately
        applySettings(data);
      } else if (response.status === 401) {
        // User not authenticated, logout
        logout();
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
        onClose();
      } else {
        // If no settings exist, use defaults
        console.log('No settings found, using defaults');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applySettings = (newSettings: UserSettings) => {
    // Apply theme changes
    document.documentElement.classList.toggle('dark', newSettings.dark_mode);
    
    // Apply font size changes
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    document.documentElement.style.fontSize = fontSizeMap[newSettings.font_size];
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    if (!user) return;
    
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Apply changes immediately for UI feedback
    applySettings(newSettings);
    
    // Save to backend
    try {
      const csrfToken = getCSRFToken();
      
      const response = await fetch('/api/settings/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify({ [key]: value }),
      });
      
      if (response.ok) {
        toast({
          title: "Setting Updated",
          description: "Your preference has been saved.",
        });
      } else if (response.status === 401) {
        logout();
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
        onClose();
      } else {
        // Revert on error
        setSettings(settings);
        applySettings(settings);
        throw new Error('Failed to save setting');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save setting",
        variant: "destructive",
      });
    }
  };

  const saveAllSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const csrfToken = getCSRFToken();
      
      const response = await fetch('/api/settings/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "All your preferences have been saved successfully.",
        });
        onClose();
      } else if (response.status === 401) {
        logout();
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
        onClose();
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    if (!user) return;
    
    const defaultSettings = {
      dark_mode: false,
      font_size: 'medium' as const,
      email_notifications: true,
      push_notifications: true,
      job_alerts: true,
      marketing_emails: false,
      sound_enabled: true,
      auto_save: true,
      language: 'english',
      currency: 'usd',
      timezone: 'pst'
    };
    
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    
    try {
      const csrfToken = getCSRFToken();
      
      const response = await fetch('/api/settings/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify(defaultSettings),
      });
      
      if (response.ok) {
        toast({
          title: "Settings Reset",
          description: "All settings have been restored to default values.",
        });
      } else if (response.status === 401) {
        logout();
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
        onClose();
      } else {
        throw new Error('Failed to reset settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset settings",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      const csrfToken = getCSRFToken();
      
      const response = await fetch('/api/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify(passwordData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
        setShowChangePassword(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else if (response.status === 401) {
        logout();
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
        onClose();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass backdrop-blur-xl border-white/50 shadow-luxury max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-blue-600">Loading settings...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass backdrop-blur-xl border-white/50 shadow-luxury max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-900 flex items-center">
              <SettingsIcon className="w-6 h-6 mr-2" />
              Settings & Preferences
            </DialogTitle>
            <DialogDescription className="text-blue-600/70">
              Customize your experience and manage your account preferences
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Appearance Settings */}
            <Card className="glass border-white/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-900 flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize how the app looks and feels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {settings.dark_mode ? <Moon className="w-5 h-5 text-blue-600" /> : <Sun className="w-5 h-5 text-blue-600" />}
                    <div>
                      <p className="font-medium text-blue-900">Dark Mode</p>
                      <p className="text-sm text-blue-600/70">Switch between light and dark themes</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.dark_mode}
                    onCheckedChange={(checked) => updateSetting('dark_mode', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-blue-600" />
                    <label className="font-medium text-blue-900">Font Size</label>
                  </div>
                  <Select value={settings.font_size} onValueChange={(value: 'small' | 'medium' | 'large') => updateSetting('font_size', value)}>
                    <SelectTrigger className="glass border-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="glass border-white/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notifications
                </CardTitle>
                <CardDescription>Manage how you receive updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Email Notifications</p>
                    <p className="text-sm text-blue-600/70">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Push Notifications</p>
                    <p className="text-sm text-blue-600/70">Browser notifications</p>
                  </div>
                  <Switch
                    checked={settings.push_notifications}
                    onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Job Alerts</p>
                    <p className="text-sm text-blue-600/70">New job matching your profile</p>
                  </div>
                  <Switch
                    checked={settings.job_alerts}
                    onCheckedChange={(checked) => updateSetting('job_alerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Marketing Emails</p>
                    <p className="text-sm text-blue-600/70">Product updates and tips</p>
                  </div>
                  <Switch
                    checked={settings.marketing_emails}
                    onCheckedChange={(checked) => updateSetting('marketing_emails', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="glass border-white/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>Control your privacy and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Auto-save</p>
                    <p className="text-sm text-blue-600/70">Automatically save your work</p>
                  </div>
                  <Switch
                    checked={settings.auto_save}
                    onCheckedChange={(checked) => updateSetting('auto_save', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Sound Effects</p>
                    <p className="text-sm text-blue-600/70">Play sounds for notifications</p>
                  </div>
                  <Switch
                    checked={settings.sound_enabled}
                    onCheckedChange={(checked) => updateSetting('sound_enabled', checked)}
                  />
                </div>

                {/* Change Password */}
                <div className="pt-4 border-t border-blue-100">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowChangePassword(true)}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Regional Settings */}
            <Card className="glass border-white/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-900 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Regional Settings
                </CardTitle>
                <CardDescription>Language, currency, and location preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="font-medium text-blue-900">Language</label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger className="glass border-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-blue-900">Currency</label>
                  <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                    <SelectTrigger className="glass border-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="cad">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-blue-900">Timezone</label>
                  <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                    <SelectTrigger className="glass border-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                      <SelectItem value="est">Eastern Time (EST)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="cet">Central European Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-white/20">
            <Button variant="outline" onClick={resetSettings} className="border-orange-200 text-orange-600 hover:bg-orange-50">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={saveAllSettings} disabled={saving} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900">Change Password</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowChangePassword(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                  placeholder="Enter current password"
                />
              </div>
              
              <div>
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                  placeholder="Confirm new password"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowChangePassword(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleChangePassword} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsModal;
