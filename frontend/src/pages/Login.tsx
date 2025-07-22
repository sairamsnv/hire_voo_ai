import React, { useState, useEffect, useContext } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye, EyeOff, Crown, Shield, Sparkles, ArrowRight, CheckCircle, Loader2
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Cookies from 'universal-cookie';
import { AuthContext } from '@/context/AuthContext';

const cookies = new Cookies();

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });

  const { setIsAuthenticated, setUser, checkSession } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Registration Successful!",
        description: "Your account has been created successfully. Please login to your account.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    }
    // Show toast if account was just verified
    if (searchParams.get('verified') === '1') {
      toast({
        title: "Account Verified!",
        description: "Your account has been verified. Please login to continue.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    }
    // Show error if verification failed
    if (searchParams.get('error') === 'invalid_link') {
      toast({
        title: "Verification Failed",
        description: "The verification link is invalid or has expired.",
        variant: "destructive",
      });
    }
    if (searchParams.get('error') === 'invalid_token') {
      toast({
        title: "Verification Failed",
        description: "The verification token is invalid or has expired.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const validateForm = () => {
    const newErrors = { email: '', password: '', general: '' };
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({ email: '', password: '', general: '' });

    try {
      // Get CSRF token first
      await fetch('/api/csrf/', {
        method: 'GET',
        credentials: 'include',
      });

      const response = await fetch('/api/login/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': cookies.get('csrftoken') || '',
        },
        body: JSON.stringify({ 
          username: email, 
          password 
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update auth context
        setIsAuthenticated(true);
        setUser(data.user);
        
        // Refresh session data to get complete user info (including is_staff)
        await checkSession();
        
        // Show success toast
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${data.user?.full_name || data.user?.email}`,
          className: "bg-green-50 border-green-200 text-green-800",
        });

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // Handle errors
        const errorMessage = data.detail || data.error || 'Login failed. Please check your credentials.';
        setErrors({ ...errors, general: errorMessage });
        
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'Unable to connect to the server. Please try again.';
      setErrors({ ...errors, general: errorMessage });
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-100/40 rounded-full blur-lg animate-bounce"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl">
              <span className="text-3xl font-bold text-white">H</span>
              <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-blue-600/70 mt-2">Sign in to Hire voo.ai</p>
            </div>
          </div>

          {searchParams.get('success') === 'true' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Registration successful! Please login to your account.
              </AlertDescription>
            </Alert>
          )}

          {searchParams.get('activation') === 'required' && (
            <Alert className="bg-blue-50 border-blue-200">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Please check your email and click the activation link to activate your account before logging in.
              </AlertDescription>
            </Alert>
          )}

          {searchParams.get('verified') === '1' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your account has been verified! Please login to continue.
              </AlertDescription>
            </Alert>
          )}

          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

            <CardHeader className="relative z-10 text-center pb-2">
              <CardTitle className="text-2xl font-bold text-blue-900">Consultant Sign In</CardTitle>
              <CardDescription className="text-blue-600/70">
                Access your premium consultant platform
              </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10 space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {errors.general && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {errors.general}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-900 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    className={`bg-white/80 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 ${
                      errors.email ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-blue-900 font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) {
                          setErrors(prev => ({ ...prev, password: '' }));
                        }
                      }}
                      className={`bg-white/80 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 pr-12 ${
                        errors.password ? 'border-red-300 focus:border-red-500' : ''
                      }`}
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                  )}
                  <div className="text-right mt-2">
                    <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm font-medium">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </Button>
              </form>

              {/* ✅ Removed demo credentials */}

              <div className="pt-4 border-t border-blue-200/50">
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <Shield className="w-3 h-3 mr-1" />
                    Secure
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                </div>
              </div>

              <div className="text-center text-sm text-blue-600/70">
                New to Hire voo.ai?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                  Create your consultant profile
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;

