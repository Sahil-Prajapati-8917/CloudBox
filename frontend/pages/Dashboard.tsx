
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { StorageFile, StorageStats } from '../types';
import { IconFiles, IconDownloadCloud, IconMore, IconFolder, IconFile, IconUpload } from '../components/ui/Icons';

interface DashboardProps {
  files: StorageFile[];
  stats: StorageStats;
}

const Dashboard: React.FC<DashboardProps> = ({ files, stats }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const recentFiles = files.slice(0, 6);

  // Calculate file type distribution
  const getFileTypeDistribution = () => {
    const distribution = {
      images: files.filter(f => f.type === 'image').length,
      videos: files.filter(f => f.type === 'video').length,
      documents: files.filter(f => f.type === 'document' || f.type === 'pdf').length,
      archives: files.filter(f => f.type === 'archive').length,
      others: files.filter(f => !['image', 'video', 'document', 'pdf', 'archive'].includes(f.type)).length,
    };

    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    if (total === 0) return distribution;

    // Convert to percentages (minimum 5% for visibility)
    return {
      images: Math.max(5, Math.round((distribution.images / total) * 100)),
      videos: Math.max(5, Math.round((distribution.videos / total) * 100)),
      documents: Math.max(5, Math.round((distribution.documents / total) * 100)),
      archives: Math.max(5, Math.round((distribution.archives / total) * 100)),
      others: Math.max(5, Math.round((distribution.others / total) * 100)),
    };
  };

  const fileDistribution = getFileTypeDistribution();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="lg:col-span-2 h-[450px]" />
          <Skeleton className="h-[450px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard label="Total Files" value={stats.totalFiles.toLocaleString()} sub="12% from last month" icon={<IconFiles className="w-4 h-4" />} />
        <MetricCard label="Used Storage" value={stats.storageUsed} sub="42.5% capacity" icon={<IconDownloadCloud className="w-4 h-4" />} />
        <MetricCard label="Recent Uploads" value={stats.recentUploadsCount.toString()} sub="+2 in last hour" icon={<IconUpload className="w-4 h-4" />} />
        <MetricCard label="Shared Items" value="0" sub="No shared files" icon={<IconMore className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Analytics Viz */}
        <Card className="lg:col-span-2 shadow-none border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold">Storage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex flex-col justify-end gap-2 px-4">
              <div className="flex items-end justify-between h-full gap-3">
                {[
                  { label: 'Images', value: fileDistribution.images, color: 'bg-blue-500' },
                  { label: 'Videos', value: fileDistribution.videos, color: 'bg-indigo-500' },
                  { label: 'Docs', value: fileDistribution.documents, color: 'bg-slate-900' },
                  { label: 'Archives', value: fileDistribution.archives, color: 'bg-slate-400' },
                  { label: 'Others', value: fileDistribution.others, color: 'bg-slate-200' },
                ].map((item) => (
                  <div key={item.label} className="flex-1 flex flex-col items-center gap-4 group">
                    <div
                      className={`w-full rounded-t-sm transition-all duration-1000 ${item.color} group-hover:brightness-110 cursor-pointer`}
                      style={{ height: `${item.value}%` }}
                    />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 grid grid-cols-3 border-t border-slate-100 pt-6">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Upload Speed</p>
                <p className="text-lg font-bold text-slate-900">45 Mbps</p>
              </div>
              <div className="text-center border-x border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Latency</p>
                <p className="text-lg font-bold text-slate-900">12ms</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Uptime</p>
                <p className="text-lg font-bold text-emerald-600">99.9%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Recent Files List */}
        <Card className="shadow-none border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold">Latest Files</CardTitle>
          </CardHeader>
          <CardContent className="px-1">
            <div className="space-y-1">
              {recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => navigate('/files')}
                >
                  <div className="flex-shrink-0 p-2 bg-slate-100 rounded text-slate-500 group-hover:bg-white group-hover:text-slate-900 transition-colors">
                    {file.type === 'folder' ? <IconFolder className="w-4 h-4 text-amber-500" /> : <IconFile className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{file.size} • {file.uploadedAt.toLocaleDateString()}</p>
                  </div>
                  <Badge variant="secondary" className="scale-75 origin-right">New</Badge>
                </div>
              ))}
            </div>
            <button
              className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all"
              onClick={() => navigate('/activity')}
            >
              View File History
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, sub, icon }: { label: string, value: string, sub: string, icon: React.ReactNode }) => (
  <Card className="shadow-none border-slate-200 hover:border-slate-300 transition-all cursor-default">
    <CardContent className="p-5 flex flex-col gap-1">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
        <div className="p-1.5 bg-slate-50 rounded-md text-slate-400">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
      <p className="text-[11px] text-slate-400 font-medium">{sub}</p>
    </CardContent>
  </Card>
);

export default Dashboard;
