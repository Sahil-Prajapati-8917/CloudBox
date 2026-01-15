import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { StorageFile } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { IconFiles, IconUpload, IconTrash, IconSettings } from '../components/ui/Icons';

interface ActivityProps {
  files?: StorageFile[];
}

const Activity: React.FC<ActivityProps> = ({ files = [] }) => {
  const { user } = useContext(AuthContext)!;

  // Generate activities from files
  const activities = files
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .map(file => ({
      id: file.id || file._id,
      user: user?.name || 'User',
      action: 'uploaded',
      item: file.name,
      time: new Date(file.uploadedAt).toLocaleString(),
      icon: <IconUpload className="w-4 h-4 text-emerald-500" />
    }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
          <p className="text-sm text-slate-500">A detailed log of all actions in your storage environment.</p>
        </div>
      </div>

      <Card className="shadow-none border-slate-200">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {activities.length > 0 ? (
              activities.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">
                      <span className="font-bold text-slate-900">{item.user}</span> {item.action}{' '}
                      <span className="font-medium text-slate-900 underline decoration-slate-200">{item.item}</span>
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">No activity recorded yet.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Activity;
