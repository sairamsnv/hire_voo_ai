
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Shield, 
  Crown, 
  Star,
  Edit,
  Phone,
  Globe,
  Camera,
  Settings,
  Save,
  X
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarWidth, setAvatarWidth] = useState(120);
  const [avatarHeight, setAvatarHeight] = useState(120);

  // Mock user data - in real app this would come from authentication/database
  const userProfile = {
    name: 'Sayyapu Reddy Sairam',
    email: 'sayypureddysairam@gmail.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA, USA',
    joinDate: 'January 15, 2024',
    lastLogin: 'Today at 2:30 PM',
    subscriptionPlan: 'Premium Plan',
    profileCompletion: 85,
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Python'],
    jobTitle: 'Senior Software Engineer',
    experience: '8+ years',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  };

  const handleSaveSettings = () => {
    setIsEditing(false);
    // Here you would save the avatar dimensions to your backend/localStorage
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass backdrop-blur-xl border-white/50 shadow-luxury max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-900">Profile Details</DialogTitle>
          <DialogDescription className="text-blue-600/70">
            Your account information and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl">
            <div className="relative">
              <Avatar 
                className="shadow-luxury ring-4 ring-white/50" 
                style={{ width: `${avatarWidth}px`, height: `${avatarHeight}px` }}
              >
                <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                <AvatarFallback className="gradient-primary text-white font-bold text-2xl">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full gradient-primary text-white shadow-luxury"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-blue-900 mb-1">{userProfile.name}</h3>
              <p className="text-blue-600/70 mb-2">{userProfile.jobTitle}</p>
              <div className="flex items-center gap-4 mb-3">
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1">
                  <Crown className="w-4 h-4 mr-1" />
                  {userProfile.subscriptionPlan}
                </Badge>
                <Badge className="bg-green-100 text-green-800 px-3 py-1">
                  <Shield className="w-4 h-4 mr-1" />
                  Verified
                </Badge>
              </div>
              <div className="text-sm text-blue-600/70">
                Profile {userProfile.profileCompletion}% complete
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Avatar Settings - Only show when editing */}
          {isEditing && (
            <Card className="glass border-white/50">
              <CardContent className="p-6">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Avatar Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="avatar-width" className="text-blue-700">Width (px)</Label>
                    <Input
                      id="avatar-width"
                      type="number"
                      min="50"
                      max="200"
                      value={avatarWidth}
                      onChange={(e) => setAvatarWidth(Number(e.target.value))}
                      className="border-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar-height" className="text-blue-700">Height (px)</Label>
                    <Input
                      id="avatar-height"
                      type="number"
                      min="50"
                      max="200"
                      value={avatarHeight}
                      onChange={(e) => setAvatarHeight(Number(e.target.value))}
                      className="border-blue-200"
                    />
                  </div>
                </div>
                <Button 
                  className="mt-4 gradient-primary text-white"
                  onClick={handleSaveSettings}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass border-white/50">
              <CardContent className="p-6">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Contact Information
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600/70">Email</p>
                      <p className="font-medium text-blue-900">{userProfile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600/70">Phone</p>
                      <p className="font-medium text-blue-900">{userProfile.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600/70">Location</p>
                      <p className="font-medium text-blue-900">{userProfile.location}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="glass border-white/50">
              <CardContent className="p-6">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Account Information
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600/70">Member Since</p>
                      <p className="font-medium text-blue-900">{userProfile.joinDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600/70">Last Login</p>
                      <p className="font-medium text-blue-900">{userProfile.lastLogin}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-600/70">Experience</p>
                      <p className="font-medium text-blue-900">{userProfile.experience}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills */}
          <Card className="glass border-white/50">
            <CardContent className="p-6">
              <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Skills & Expertise
              </h4>
              <div className="flex flex-wrap gap-2">
                {userProfile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
