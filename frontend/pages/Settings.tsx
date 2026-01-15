
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Separator } from '../components/ui/Separator';
import { Toast } from '../components/ui/Toast';

const Settings: React.FC = () => {
  const [twoFactor, setTwoFactor] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleSave = () => {
    setToast({ message: 'Settings saved successfully', type: 'success' });
  };

  const handlePurge = () => {
    if (confirm('Are you absolutely sure you want to purge all data? This cannot be undone.')) {
      setToast({ message: 'All data has been purged', type: 'success' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl mx-auto pb-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500">Manage your account preferences and system security.</p>
      </div>

      <div className="space-y-6">
        <Card className="shadow-none border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="box-name">Cloud Box Name</Label>
                <Input id="box-name" defaultValue="Admin's Private Cloud" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Primary Region</Label>
                <Input id="region" defaultValue="US-East (N. Virginia)" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="(GMT-05:00) Eastern Time" />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 border-t border-slate-100 py-4 px-6">
            <Button size="sm" onClick={handleSave}>Save Changes</Button>
          </CardFooter>
        </Card>

        <Card className="shadow-none border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Security & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
              </div>
              <div
                className={`w-10 h-5 ${twoFactor ? 'bg-slate-900' : 'bg-slate-200'} rounded-full flex items-center ${twoFactor ? 'justify-end' : 'justify-start'} px-1 cursor-pointer transition-all`}
                onClick={() => setTwoFactor(!twoFactor)}
              >
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <Separator className="opacity-50" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Public Profile</p>
                <p className="text-xs text-slate-500">Allow others to see your uploaded public items.</p>
              </div>
              <div
                className={`w-10 h-5 ${publicProfile ? 'bg-slate-900' : 'bg-slate-200'} rounded-full flex items-center ${publicProfile ? 'justify-end' : 'justify-start'} px-1 cursor-pointer transition-all`}
                onClick={() => setPublicProfile(!publicProfile)}
              >
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-red-100 bg-red-50/10 border border-dashed">
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">Deleting your cloud box will permanently remove all files and associated shared links. This action cannot be undone.</p>
            <Button variant="danger" size="sm" className="rounded-xl px-6" onClick={handlePurge}>Purge All Data</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
