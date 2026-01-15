import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import authService from '../services/authService';
import { StorageFile } from '../types';
import {
  IconUser,
  IconMapPin,
  IconCalendar,
  IconShield,
  IconFile,
  IconStar
} from '../components/ui/Icons';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  bio: string;
  location: string;
  plan: string;
  profileImage: string;
  isVerified: boolean;
  createdAt: string;
}

interface ProfileProps {
  files?: StorageFile[];
}

const Profile: React.FC<ProfileProps> = ({ files = [] }) => {
  const { user } = useContext(AuthContext)!;
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getUserProfile();
        setProfileData(data as unknown as UserProfile);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Calculate real stats from props
  const fileCount = files.length;
  const storageUsed = files.reduce((acc, file) => acc + (file.size || 0), 0);
  const planLimit = 5 * 1024 * 1024 * 1024; // 5 GB
  const usagePercentage = Math.min(100, Math.round((storageUsed / planLimit) * 100));

  function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Main Identity */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-700">Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <IconUser className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{profileData?.name || user?.name}</h2>
              <p className="text-sm text-slate-500">{profileData?.email || user?.email}</p>

              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                  {profileData?.plan || 'Free Tier'}
                </span>
                {profileData?.isVerified && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Details */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-700">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <IconMapPin className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900">Location</p>
                <p className="text-sm text-slate-500">{profileData?.location || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IconCalendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900">Joined</p>
                <p className="text-sm text-slate-500">
                  {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="min-w-[20px]">
                <IconShield className="w-5 h-5 text-slate-400 mt-0.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Bio</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {profileData?.bio || 'No bio available.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Stats */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-700">Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">Storage</span>
                <span className="text-slate-500">{formatBytes(storageUsed)} / 5 GB</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${usagePercentage}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <IconFile className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 uppercase">Files</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{fileCount}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <IconStar className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 uppercase">Status</span>
                </div>
                <p className="text-lg font-bold text-slate-900">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
