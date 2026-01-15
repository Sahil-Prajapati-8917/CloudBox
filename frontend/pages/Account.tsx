import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { IconFiles, IconSpinner } from '../components/ui/Icons';
import { Toast } from '../components/ui/Toast';
import { Link } from 'react-router-dom';


const Account: React.FC = () => {
  const { register } = useContext(AuthContext)!;
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setToast({ message: 'Password must be at least 8 characters long', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      await register({ name, email, password });
    }
    catch (err: any) {
      console.error(err);
      setToast({
        message: err.response?.data?.message || 'Registration failed. Please try again.',
        type: 'error'
      });
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] p-3 sm:p-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="w-full max-w-[380px] sm:max-w-[400px]">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center bg-slate-900 text-white p-3 rounded-2xl shadow-xl mb-4">
            <IconFiles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">CloudBox</h1>
          <p className="text-slate-500 mt-2">Professional Cloud Management</p>
        </div>

        <Card className="shadow-xl border-slate-100">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Enter your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="name">Full Name</label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="email">Email address</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">Confirm Password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                />
              </div>
              <Button
                type="submit"
                className={`w-full py-6 text-base transition-all duration-300 ${
                  loading ? 'bg-slate-600 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'
                }`}
                disabled={loading}
              >
                <div className="flex items-center justify-center gap-3">
                  {loading && <IconSpinner className="w-5 h-5" />}
                  <span className={`transition-opacity duration-300 ${loading ? 'opacity-70' : 'opacity-100'}`}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </span>
                </div>
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm text-slate-500">
              By clicking create account, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
            </div>
          </CardFooter>
        </Card>

        <p className="text-center mt-6 text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-900 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Account;
