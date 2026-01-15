import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { IconFiles, IconSpinner } from '../components/ui/Icons';
import { Toast } from '../components/ui/Toast';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useContext(AuthContext)!;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      await login({ email, password });
    } catch (err: any) {
      console.error(err);
      setToast({
        message: err.response?.data?.message || 'Authentication failed. Please check your credentials.',
        type: 'error'
      });
    } finally {
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
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your details to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
                  <a href="#" className="text-xs text-slate-500 hover:text-slate-900">Forgot password?</a>
                </div>
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
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </span>
                </div>
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/account" className="font-semibold text-slate-900 hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
