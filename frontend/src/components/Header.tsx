import React, { useState, useContext, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Bell, Settings, LogOut, User, Crown, Menu, X,
  Sparkles, Shield, ArrowRight, Monitor, Lock, Home, BarChart3, Users
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import NotificationBar from './NotificationBar';
import ProfileModal from './ProfileModal';
import SettingsModal from './SettingsModal';
import { AuthContext } from '@/context/AuthContext';
import axios from 'axios';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  const unreadNotifications = 3;

  // Fetch profile photo when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchProfilePhoto = async () => {
        try {
          const response = await axios.get('/api/photos/?photo_type=profile', {
            withCredentials: true
          });
          const primaryPhoto = response.data.find((photo: any) => photo.is_primary);
          if (primaryPhoto) {
            setProfilePhoto(primaryPhoto.image_url);
          } else {
            setProfilePhoto(null);
          }
        } catch (error) {
          console.error('Error fetching profile photo:', error);
          setProfilePhoto(null);
        }
      };
      fetchProfilePhoto();
    } else {
      setProfilePhoto(null);
    }
  }, [isAuthenticated, user]);

  const navigationItems = isAuthenticated
    ? [
        { name: 'Jobs', href: '/', icon: Home },
        { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'People', href: '/people', icon: Users },
        { name: 'Pricing', href: '/pricing', icon: Crown },
        // Admin-only features - only show if user is staff/admin
        ...(user?.is_staff ? [
          { name: 'Sessions', href: '/sessions', icon: Monitor },
          { name: 'Security', href: '/security', icon: Shield },
          { name: 'Users', href: '/users', icon: Users },
        ] : []),
      ]
    : [
        { name: 'Jobs', href: '/', icon: Home },
        { name: 'Pricing', href: '/pricing', icon: Crown },
      ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Successfully logged out",
        description: "You have been logged out of your account.",
      });
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMobileNavClick = (href: string) => {
    setIsMenuOpen(false);
    navigate(href);
  };

  return (
    <>
      <header className="sticky top-0 z-50 nav-glass backdrop-blur-xl border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6">
          <nav className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo and Nav */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-luxury rounded-2xl flex items-center justify-center shadow-luxury relative overflow-hidden">
                <span className="text-white font-bold text-xl sm:text-2xl relative z-10">H</span>
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Hire voo.ai</h1>
                <p className="text-xs text-blue-600/70 -mt-1 font-medium">Premium Job Platform</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-xl font-bold gradient-text">Hire voo.ai</h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 sm:px-6 py-2 sm:py-3 text-sm font-semibold transition-all duration-300 relative group rounded-xl ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50/80'
                      : 'text-muted-foreground hover:text-primary hover:bg-white/60'
                  }`}
                >
                  {item.name}
                  <span className={`absolute -bottom-1 left-3 right-3 h-0.5 gradient-primary transition-all duration-300 rounded-full ${
                    isActive(item.href) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}></span>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {!isAuthenticated ? (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <Link to="/login">
                    <Button variant="ghost" className="text-sm font-semibold px-3 sm:px-6 py-2 hover:bg-white/60 rounded-xl">
                      <span className="hidden sm:inline">Sign In</span>
                      <span className="sm:hidden">Login</span>
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="btn-glossy text-white text-sm px-4 sm:px-8 py-2 font-semibold shadow-luxury group">
                      <span className="hidden sm:inline">Get Started</span>
                      <span className="sm:hidden">Join</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  {/* Premium Badge - Hidden on mobile */}
                  <Badge className="hidden sm:flex gradient-premium text-black px-3 sm:px-4 py-2 shadow-luxury border-white/60 font-semibold">
                    <Crown className="w-4 h-4 mr-2" />
                    Premium
                    <Sparkles className="w-3 h-3 ml-2 animate-pulse" />
                  </Badge>

                  {/* Notification Bell */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-10 w-10 sm:h-12 sm:w-12 glass hover:bg-white/60 rounded-xl shadow-luxury"
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    >
                      <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                      {unreadNotifications > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center p-0 text-xs bg-red-500 text-white animate-pulse">
                          {unreadNotifications}
                        </Badge>
                      )}
                    </Button>
                  </div>

                  {/* User Avatar Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full hover:ring-2 hover:ring-blue-500/20 transition-all">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shadow-luxury ring-2 ring-white/50">
                          <AvatarImage src={profilePhoto || "/placeholder.svg"} alt="User" />
                          <AvatarFallback className="gradient-primary text-white font-bold text-sm sm:text-base">
                            {user?.full_name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass w-64 sm:w-72 shadow-luxury backdrop-blur-xl border-white/50 rounded-2xl p-2" align="end">
                      <DropdownMenuLabel className="font-normal p-4">
                        <div className="flex flex-col space-y-2">
                          <p className="text-base font-semibold leading-none">
                            {user?.full_name || 'User'}
                          </p>
                          <p className="text-sm leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                          <Badge className="bg-green-100 text-green-800 w-fit px-2 py-1 text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/30" />
                      <DropdownMenuItem
                        className="p-3 rounded-xl hover:bg-white/60 cursor-pointer"
                        onClick={() => setIsProfileOpen(true)}
                      >
                        <User className="mr-3 h-4 w-4" />
                        <span className="font-medium">Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="p-3 rounded-xl hover:bg-white/60 cursor-pointer"
                        onClick={() => setIsSettingsOpen(true)}
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        <span className="font-medium">Settings</span>
                      </DropdownMenuItem>
                      {/* Admin-only menu items */}
                      {user?.is_staff && (
                        <>
                          <DropdownMenuItem
                            className="p-3 rounded-xl hover:bg-white/60 cursor-pointer"
                            onClick={() => navigate('/sessions')}
                          >
                            <Monitor className="mr-3 h-4 w-4" />
                            <span className="font-medium">Session Management</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="p-3 rounded-xl hover:bg-white/60 cursor-pointer"
                            onClick={() => navigate('/security')}
                          >
                            <Lock className="mr-3 h-4 w-4" />
                            <span className="font-medium">Security Dashboard</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="p-3 rounded-xl hover:bg-white/60 cursor-pointer"
                            onClick={() => navigate('/users')}
                          >
                            <Users className="mr-3 h-4 w-4" />
                            <span className="font-medium">User Management</span>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator className="bg-white/30" />
                      <DropdownMenuItem
                        className="p-3 rounded-xl hover:bg-red-50 text-red-600 cursor-pointer"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span className="font-medium">Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-10 w-10 hover:bg-white/60 rounded-xl"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </nav>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-white/20 bg-white/95 backdrop-blur-xl">
              <div className="flex flex-col space-y-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleMobileNavClick(item.href)}
                      className={`flex items-center space-x-3 text-base font-semibold transition-colors duration-200 py-3 px-4 rounded-xl ${
                        isActive(item.href)
                          ? 'text-blue-600 bg-blue-50/80'
                          : 'text-muted-foreground hover:text-primary hover:bg-white/60'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
                
                {!isAuthenticated && (
                  <div className="flex flex-col space-y-3 pt-4 border-t border-white/20">
                    <Link to="/login">
                      <Button variant="ghost" className="justify-start w-full py-3 px-4 rounded-xl hover:bg-white/60">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button className="btn-glossy text-white w-full py-3 px-4 font-semibold shadow-luxury group">
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                )}

                {isAuthenticated && (
                  <div className="flex flex-col space-y-3 pt-4 border-t border-white/20">
                    <div className="flex items-center space-x-3 px-4 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" alt="User" />
                        <AvatarFallback className="gradient-primary text-white font-bold text-sm">
                          {user?.full_name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{user?.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsProfileOpen(true);
                      }}
                      className="flex items-center space-x-3 text-base font-medium py-3 px-4 rounded-xl hover:bg-white/60"
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsSettingsOpen(true);
                      }}
                      className="flex items-center space-x-3 text-base font-medium py-3 px-4 rounded-xl hover:bg-white/60"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center space-x-3 text-base font-medium py-3 px-4 rounded-xl hover:bg-red-50 text-red-600"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      {isProfileOpen && <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />}
      {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
      {isNotificationOpen && <NotificationBar isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />}
    </>
  );
};

export default Header;
