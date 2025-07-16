import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Avatar, AvatarFallback, AvatarImage
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User, Mail, Calendar, MapPin, Briefcase, Shield,
  Crown, Star, Edit, Camera, Settings, Save, X, Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function getCSRFToken() {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return value;
  }
  return '';
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/profile/', { withCredentials: true });
        if (res.data?.isAuthenticated) {
          setUserProfile(res.data.user);
          setFormData(res.data.user);
        } else {
          toast({
            title: 'Authentication Error',
            description: 'Please log in to view your profile.',
            variant: 'destructive'
          });
        }
      } catch {
        toast({
          title: 'Fetch Failed',
          description: 'Unable to load profile.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put('/api/update_profile/', formData, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': getCSRFToken(),
        }
      });
      toast({ title: 'Success', description: 'Profile updated.' });
      setUserProfile(res.data.user);
      setIsEditing(false);
    } catch (err) {
      toast({ title: 'Update Failed', description: 'Could not save changes.', variant: 'destructive' });
      console.error(err);
    }
  };

  const avatarURL = `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(formData.full_name || 'User')}`;

  if (loading || !userProfile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto px-6 py-8 rounded-2xl border shadow-xl bg-white space-y-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-900">Profile Details</DialogTitle>
          <DialogDescription className="text-blue-600/70">Your account information and preferences</DialogDescription>
        </DialogHeader>

        {/* Top Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <Avatar className="h-28 w-28 ring-4 ring-white/80 shadow-lg">
              <AvatarImage src={avatarURL} alt={formData.full_name} />
              <AvatarFallback className="bg-blue-100 text-blue-900 text-2xl">
                {formData.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-blue-600 text-white shadow">
              <Camera className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1">
            {isEditing ? (
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="text-2xl font-bold text-blue-900 bg-white border border-blue-200 rounded-md px-3 py-2 w-full"
              />
            ) : (
              <h2 className="text-2xl font-bold text-blue-900">{userProfile.full_name}</h2>
            )}
            {isEditing ? (
              <input
                name="job_stream"
                value={formData.job_stream}
                onChange={handleChange}
                className="text-blue-600/70 border border-blue-200 rounded-md px-3 py-2 w-full mt-2"
              />
            ) : (
              <p className="text-blue-600/70 mb-2">{userProfile.job_stream || 'N/A'}</p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-yellow-400 text-black"><Crown className="w-4 h-4 mr-1" /> Premium Plan</Badge>
              <Badge className="bg-green-100 text-green-800"><Shield className="w-4 h-4 mr-1" /> Verified</Badge>
              <span className="text-sm text-blue-500">Profile 85% complete</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" /> Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
            )}
            <Button variant="outline" size="icon"><Settings className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Info Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center"><User className="w-5 h-5 mr-2" /> Contact Information</h3>
            <InfoLine icon={Mail} label="Email" name="email" value={formData.email} isEditing={isEditing} onChange={handleChange} />
            <InfoLine icon={Phone} label="Phone" name="phone" value={formData.phone || ''} isEditing={isEditing} onChange={handleChange} />
            <InfoLine icon={MapPin} label="Location" name="country" value={formData.country || ''} isEditing={isEditing} onChange={handleChange} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2" /> Account Information</h3>
            <InfoLine icon={Briefcase} label="Job Stream" name="job_stream" value={formData.job_stream || ''} isEditing={isEditing} onChange={handleChange} />
            <InfoLine icon={Calendar} label="Member Since" value="January 15, 2024" />
            <InfoLine icon={Calendar} label="Last Login" value="Today at 2:30 PM" />
            <InfoLine icon={Star} label="Experience" value="8+ years" />
          </div>
        </div>

        {/* About You Section */}
        <div className="w-full">
          <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
            <Star className="w-5 h-5 mr-2" /> About You
          </h3>

          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full min-h-[100px] max-h-40 resize-y bg-white border border-blue-200 rounded-md px-4 py-2 text-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          ) : (
            <p className="text-blue-700 whitespace-pre-wrap break-words">
              {userProfile.bio?.length > 300
                ? userProfile.bio.slice(0, 300) + '...'
                : userProfile.bio || 'No bio provided.'}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InfoLine = ({
  icon: Icon, label, name, value, isEditing = false, onChange
}: {
  icon: any,
  label: string,
  name?: string,
  value: string,
  isEditing?: boolean,
  onChange?: any
}) => (
  <div className="flex items-start gap-3 mb-4">
    <Icon className="w-4 h-4 mt-1 text-blue-600" />
    <div className="w-full">
      <p className="text-sm text-blue-600/70">{label}</p>
      {isEditing && name ? (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-white border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-900"
        />
      ) : (
        <p className="font-medium text-blue-900">{value || 'N/A'}</p>
      )}
    </div>
  </div>
);

export default ProfileModal;




