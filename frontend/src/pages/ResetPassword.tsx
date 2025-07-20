import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      toast({
        title: "Passwords do not match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }
    const res = await fetch('/api/reset-password/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: searchParams.get('uid'),
        token: searchParams.get('token'),
        password,
      }),
    });
    if (res.ok) {
      setSuccess(true);
      toast({
        title: "Password Reset Successful!",
        description: "You can now log in with your new password.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      setTimeout(() => navigate('/login?reset=1'), 2000);
    } else {
      const data = await res.json();
      setError(data.error || "The reset link may be invalid or expired.");
      toast({
        title: "Reset Failed",
        description: data.error || "The reset link may be invalid or expired.",
        variant: "destructive",
      });
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
                Reset Password
              </h1>
              <p className="text-blue-600/70 mt-2">Set a new password for your Hire voo.ai account</p>
            </div>
          </div>
          <Card className="backdrop-blur-xl bg-white/90 border-white/50 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            <CardHeader className="relative z-10 text-center pb-2">
              <CardTitle className="text-2xl font-bold text-blue-900">Reset Password</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    placeholder="Confirm new password"
                  />
                </div>
                <Button type="submit" className="w-full">Reset Password</Button>
              </form>
              {error && (
                <Alert className="mt-4 bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mt-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Password reset successful! Redirecting to login...
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 