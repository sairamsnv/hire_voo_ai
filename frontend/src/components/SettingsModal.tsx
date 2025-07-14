
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    darkMode: false,
    fontSize: 'medium',
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    marketingEmails: false,
    soundEnabled: true,
    autoSave: true,
    language: 'english',
    currency: 'usd',
    timezone: 'pst'
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    
    // Apply theme changes immediately
    if (key === 'darkMode') {
      document.documentElement.classList.toggle('dark', value);
    }
    
    // Apply font size changes
    if (key === 'fontSize') {
      document.documentElement.style.fontSize = 
        value === 'small' ? '14px' : 
        value === 'large' ? '18px' : '16px';
    }

    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved successfully.",
    });
  };

  const resetSettings = () => {
    const defaultSettings = {
      darkMode: false,
      fontSize: 'medium',
      emailNotifications: true,
      pushNotifications: true,
      jobAlerts: true,
      marketingEmails: false,
      soundEnabled: true,
      autoSave: true,
      language: 'english',
      currency: 'usd',
      timezone: 'pst'
    };
    setSettings(defaultSettings);
    localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
    
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to default values.",
    });
  };

  return (
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
                  {settings.darkMode ? <Moon className="w-5 h-5 text-blue-600" /> : <Sun className="w-5 h-5 text-blue-600" />}
                  <div>
                    <p className="font-medium text-blue-900">Dark Mode</p>
                    <p className="text-sm text-blue-600/70">Switch between light and dark themes</p>
                  </div>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-blue-600" />
                  <label className="font-medium text-blue-900">Font Size</label>
                </div>
                <Select value={settings.fontSize} onValueChange={(value) => updateSetting('fontSize', value)}>
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
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">Push Notifications</p>
                  <p className="text-sm text-blue-600/70">Browser notifications</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">Job Alerts</p>
                  <p className="text-sm text-blue-600/70">New job matching your profile</p>
                </div>
                <Switch
                  checked={settings.jobAlerts}
                  onCheckedChange={(checked) => updateSetting('jobAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">Marketing Emails</p>
                  <p className="text-sm text-blue-600/70">Product updates and tips</p>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) => updateSetting('marketingEmails', checked)}
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
              <CardDescription>Control your privacy and data preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">Auto-save</p>
                  <p className="text-sm text-blue-600/70">Automatically save your work</p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">Sound Effects</p>
                  <p className="text-sm text-blue-600/70">Play sounds for notifications</p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                />
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                  <Shield className="w-4 h-4 mr-2" />
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
            Reset to Default
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
