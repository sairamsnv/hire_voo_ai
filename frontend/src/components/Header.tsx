import React, { useState, useContext } from 'react';
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
  Sparkles, Shield, ArrowRight
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import NotificationBar from './NotificationBar';
import ProfileModal from './ProfileModal';
import SettingsModal from './SettingsModal';
import { AuthContext } from '@/context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user, logout } = useContext(AuthContext); // 👈 Using new context

  const unreadNotifications = 3;

  const navigationItems = isAuthenticated
    ? [
        { name: 'Jobs', href: '/' },
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Analytics', href: '/analytics' },
        { name: 'People', href: '/people' },
        { name: 'Pricing', href: '/pricing' },
      ]
    : [
        { name: 'Jobs', href: '/' },
        { name: 'Pricing', href: '/pricing' },
      ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = async () => {
    try {
      await logout(); // 👈 Use context logout
      toast({
        title: "Successfully logged out",
        description: "You have been logged out of your account.",
      });
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 nav-glass backdrop-blur-xl border-b border-white/20">
        <div className="container mx-auto px-6">
          <nav className="flex items-center justify-between h-20">
            {/* Logo and Nav */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 gradient-luxury rounded-2xl flex items-center justify-center shadow-luxury relative overflow-hidden">
                <span className="text-white font-bold text-2xl relative z-10">H</span>
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Hire voo.ai</h1>
                <p className="text-xs text-blue-600/70 -mt-1 font-medium">Premium Job Platform</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-6 py-3 text-sm font-semibold transition-all duration-300 relative group rounded-xl ${
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

            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link to="/login">
                    <Button variant="ghost" className="text-sm font-semibold px-6 py-2 hover:bg-white/60 rounded-xl">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="btn-glossy text-white text-sm px-8 py-2 font-semibold shadow-luxury group">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Badge className="gradient-premium text-black px-4 py-2 shadow-luxury border-white/60 font-semibold">
                    <Crown className="w-4 h-4 mr-2" />
                    Premium
                    <Sparkles className="w-3 h-3 ml-2 animate-pulse" />
                  </Badge>

                  {/* Notification Bell */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-12 w-12 glass hover:bg-white/60 rounded-xl shadow-luxury"
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    >
                      <Bell className="h-5 w-5" />
                      {unreadNotifications > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs bg-red-500 text-white animate-pulse">
                          {unreadNotifications}
                        </Badge>
                      )}
                    </Button>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:ring-2 hover:ring-blue-500/20 transition-all">
                        <Avatar className="h-12 w-12 shadow-luxury ring-2 ring-white/50">
                          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face" alt="User" />
                          <AvatarFallback className="gradient-primary text-white font-bold">
                            {user?.full_name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass w-64 shadow-luxury backdrop-blur-xl border-white/50 rounded-2xl p-2" align="end">
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

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-11 w-11 hover:bg-white/60 rounded-xl"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </nav>

          {isMenuOpen && (
            <div className="md:hidden py-6 border-t border-white/20">
              <div className="flex flex-col space-y-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-base font-semibold transition-colors duration-200 py-3 px-4 rounded-xl ${
                      isActive(item.href)
                        ? 'text-blue-600 bg-blue-50/80'
                        : 'text-muted-foreground hover:text-primary hover:bg-white/60'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <div className="flex flex-col space-y-3 pt-4 border-t border-white/20">
                    <Link to="/login">
                      <Button variant="ghost" className="justify-start w-full py-3 px-4 rounded-xl hover:bg-white/60">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button className="btn-glossy text-white justify-start py-3 font-semibold shadow-luxury">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {isAuthenticated && isNotificationOpen && (
        <NotificationBar onClose={() => setIsNotificationOpen(false)} />
      )}

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default Header;
