
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageFile } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AspectRatio } from '../components/ui/AspectRatio';
import { Progress } from '../components/ui/Progress';
import { Toast } from '../components/ui/Toast';
import fileService from '../services/fileService';
import {
  IconFolder,
  IconFile,
  IconSearch,
  IconEye,
  IconTrash,
  IconDownloadCloud,
  IconX,
  IconChevronDown,
  IconUpload,
  IconMenu,
  IconLayoutDashboard,
  IconSpinner
} from '../components/ui/Icons';

interface FilesProps {
  files?: StorageFile[];
  onDelete?: (id: string) => void;
  onAddFolder?: (name: string, parentId?: string) => void;
  onRefresh?: (folderId?: string) => void | Promise<void>;
}

const Files: React.FC<FilesProps> = ({ files: propFiles, onDelete, onAddFolder, onRefresh }) => {
  const { folderId: currentFolderId } = useParams<{ folderId?: string }>();
  const navigate = useNavigate();

  // const [files, setFiles] = useState<any[]>([]); // Use propFiles instead
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState<any | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video' | 'document' | null>(null);
  const [previewFiles, setPreviewFiles] = useState<any[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);

  // Use propFiles instead of fetching
  const files = propFiles || [];

  // useEffect(() => {
  //   fetchData();
  // }, [currentFolderId]);

  const fetchData = async () => {
    if (onRefresh) {
      try {
        await onRefresh(currentFolderId);
      } catch (error) {
        console.error('Failed to refresh files:', error);
        setToast({ message: 'Failed to refresh files', type: 'error' });
      }
    }
  };

  //   const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //       // const token = localStorage.getItem('token') || '';
  //       const res = await fileService.getFiles();
  //       if (res.success) {
  //         setFolders([]); // Backend doesn't support folders yet
  //         setFiles(res.data || []);
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch files:', error);
  //       setToast({ message: 'Failed to load files', type: 'error' });
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  // Files prop already contains both folders and files (folders have isFolder: true)
  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' ||
      (typeFilter === 'folder' && f.isFolder) ||
      (!f.isFolder && f.type === typeFilter);
    return matchesSearch && matchesType;
  });

  // Since we don't have full recursive breadcrumbs from backend yet without a path, 
  // we'll rely on the folderId from params or simple back navigation for now.
  // Real implementation would request breadcrumbs from API.

  const handleDownload = async (fileName: string, fileUrl?: string) => {
    if (!fileUrl) {
      setToast({ message: `Download link not available for ${fileName}`, type: 'error' });
      return;
    }

    try {
      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToast({ message: `Downloading ${fileName}`, type: 'success' });
    } catch (error) {
      console.error('Download error:', error);
      setToast({ message: `Failed to download ${fileName}`, type: 'error' });
    }
  };


  const handleDelete = async (id: string, type: 'file' | 'folder', name: string) => {
    if (onDelete) {
      onDelete(id);
      setToast({ message: `Deleted: ${name}`, type: 'success' });
    } else {
      // Fallback or deprecated independent mode
      try {
        await fileService.deleteFile(id);
        if (onRefresh) onRefresh();
      } catch (e) { console.error(e); }
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      setActionLoading(prev => ({ ...prev, 'create-folder': true }));
      try {
        if (onAddFolder) {
          await onAddFolder(newFolderName.trim(), currentFolderId);
          setToast({ message: `Folder "${newFolderName}" created`, type: 'success' });
          setNewFolderName('');
          setIsNewFolderModalOpen(false);
        } else {
          // Fallback: call API directly
          await fileService.createFolder({ name: newFolderName.trim(), parentId: currentFolderId });
          setToast({ message: `Folder "${newFolderName}" created`, type: 'success' });
          setNewFolderName('');
          setIsNewFolderModalOpen(false);
          if (onRefresh) onRefresh();
        }
      } catch (error) {
        console.error('Folder creation error:', error);
        setToast({ message: 'Failed to create folder', type: 'error' });
      } finally {
        setActionLoading(prev => ({ ...prev, 'create-folder': false }));
      }
    }
  };

  const handleShare = (name: string, fileUrl?: string) => {
    const mockLink = `https://cloudbox.io/s/${Math.random().toString(36).substr(2, 9)}`;
    navigator.clipboard.writeText(mockLink);
    setToast({ message: 'Link copied to clipboard!', type: 'success' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadFiles(prev => [...prev, ...newFiles]);
      // Reset the input value to allow selecting the same files again
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setUploadFiles(prev => [...prev, ...files]);
      setIsUploadOpen(true);
    }
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startUpload = async () => {
    if (uploadFiles.length === 0) return;
    setUploading(true);
    setUploadProgress(0);

    try {
      // const token = localStorage.getItem('token') || ''; // token handled by interceptor
      const uploadPromises = uploadFiles.map(f => {
        const formData = new FormData();
        formData.append('file', f);
        if (currentFolderId) formData.append('parentId', currentFolderId);
        return fileService.uploadFile(formData);
      });

      const responses = await Promise.all(uploadPromises);
      // Responses are File objects from backend
      const newFiles = responses;

      if (newFiles.length > 0) {
        setToast({ message: `${newFiles.length} files uploaded successfully!`, type: 'success' });
        setUploadFiles([]);
        setIsUploadOpen(false);
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setToast({ message: 'Failed to upload files', type: 'error' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFilePreview = (file: any) => {
    const fileType = file.type;
    if (fileType === 'image') {
      setPreviewType('image');
      const allImages = files.filter(f => f.type === 'image');
      setPreviewFiles(allImages);
      setCurrentPreviewIndex(allImages.findIndex(f => f.id === file.id));
      setPreviewFile(file);
    } else if (fileType === 'video') {
      setPreviewType('video');
      const allVideos = files.filter(f => f.type === 'video');
      setPreviewFiles(allVideos);
      setCurrentPreviewIndex(allVideos.findIndex(f => f.id === file.id));
      setPreviewFile(file);
    } else if (fileType === 'document' || fileType === 'pdf') {
      setPreviewType('document');
      setPreviewFile(file);
      setPreviewFiles([]);
      setCurrentPreviewIndex(0);
    } else {
      // For other file types, just show basic info
      setSelectedFile(file);
    }
  };

  const navigatePreview = (direction: 'prev' | 'next') => {
    if (!previewFiles.length) return;

    let newIndex = currentPreviewIndex;
    if (direction === 'prev') {
      newIndex = currentPreviewIndex > 0 ? currentPreviewIndex - 1 : previewFiles.length - 1;
    } else {
      newIndex = currentPreviewIndex < previewFiles.length - 1 ? currentPreviewIndex + 1 : 0;
    }

    setCurrentPreviewIndex(newIndex);
    setPreviewFile(previewFiles[newIndex]);
  };

  const handleFileSelect = (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      setSelectedFiles(prev =>
        prev.includes(fileId)
          ? prev.filter(id => id !== fileId)
          : [...prev, fileId]
      );
    } else if (event.shiftKey && lastSelectedIndex !== -1) {
      // Range select with Shift
      const currentIndex = filteredFiles.findIndex(f => (f._id || f.id) === fileId);
      const startIndex = Math.min(lastSelectedIndex, currentIndex);
      const endIndex = Math.max(lastSelectedIndex, currentIndex);

      const rangeIds = filteredFiles.slice(startIndex, endIndex + 1).map(f => f._id || f.id);
      setSelectedFiles(prev => {
        const newSelection = new Set(prev);
        rangeIds.forEach(id => newSelection.add(id));
        return Array.from(newSelection);
      });
    } else {
      // Single select
      setSelectedFiles(prev => prev.includes(fileId) && prev.length === 1 ? [] : [fileId]);
    }

    setLastSelectedIndex(filteredFiles.findIndex(f => (f._id || f.id) === fileId));
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedFiles.length} selected file(s)? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    setActionLoading(prev => ({ ...prev, 'bulk-delete': true }));

    try {
      const deletePromises = selectedFiles.map(id => fileService.deleteFile(id));
      await Promise.all(deletePromises);

      setToast({ message: `Successfully deleted ${selectedFiles.length} file(s)`, type: 'success' });
      setSelectedFiles([]);

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Bulk delete error:', error);
      setToast({ message: 'Failed to delete some files', type: 'error' });
    } finally {
      setActionLoading(prev => ({ ...prev, 'bulk-delete': false }));
    }
  };

  const handleBulkDownload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      const selectedFileObjects = files.filter(f => selectedFiles.includes(f._id || f.id));

      for (const file of selectedFileObjects) {
        if (file.url) {
          // Create a temporary link element and trigger download
          const link = document.createElement('a');
          link.href = file.url;
          link.download = file.name;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Small delay between downloads to avoid browser blocking
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setToast({ message: `Downloading ${selectedFiles.length} file(s)`, type: 'success' });
    } catch (error) {
      console.error('Bulk download error:', error);
      setToast({ message: 'Failed to download files', type: 'error' });
    }
  };

  const fileTypes = ['all', 'folder', 'pdf', 'image', 'video', 'document', 'archive'];

  return (
    <div
      className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDrop={handleDrop}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Section */}
      <div className="space-y-4">
        {/* Breadcrumb and Title */}
        <div className="flex items-center gap-4">
          {currentFolderId && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl flex-shrink-0"
              onClick={() => navigate(-1)}
            >
              <IconChevronDown className="w-4 h-4 rotate-90" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-900">File Browser</h2>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <button
                className={`hover:text-slate-900 transition-colors ${!currentFolderId ? 'font-bold text-slate-900' : 'text-slate-500'}`}
                onClick={() => navigate('/files')}
              >
                All Files
              </button>
              {currentFolderId && (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="font-bold text-slate-900 truncate">
                    {files.find(f => f.id === currentFolderId)?.name || 'Unknown Folder'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar - Full width on mobile */}
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Search files..."
              className="pl-9 h-9 text-sm border-slate-200 focus:ring-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bulk Actions */}
            {selectedFiles.length > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm font-medium text-slate-700">
                  {selectedFiles.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDownload}
                  className="h-9 px-3"
                >
                  <IconDownloadCloud className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <IconTrash className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFiles([])}
                  className="h-9 px-3"
                >
                  Clear
                </Button>
              </div>
            )}

            {/* Filter */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className={`h-9 capitalize ${typeFilter !== 'all' ? 'bg-slate-900 text-white' : ''}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                {typeFilter === 'all' ? 'Filter' : typeFilter}
              </Button>
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg border border-slate-200 shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {fileTypes.map(type => (
                      <button
                        key={type}
                        className={`w-full text-left px-4 py-2 text-sm capitalize hover:bg-slate-50 ${typeFilter === type ? 'font-bold text-slate-900 bg-slate-50/50' : 'text-slate-600'}`}
                        onClick={() => { setTypeFilter(type); setIsFilterOpen(false); }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-2">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => setViewMode('list')}
              >
                <IconMenu className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => setViewMode('grid')}
              >
                <IconLayoutDashboard className="w-4 h-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 sm:px-4"
                onClick={() => fetchData()}
              >
                <span className="hidden sm:inline">Refresh</span>
                <IconMenu className="w-4 h-4 sm:hidden" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 sm:px-4"
                onClick={() => setIsUploadOpen(!isUploadOpen)}
              >
                <IconUpload className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
              <Button
                size="sm"
                className="h-9 px-3 sm:px-4"
                onClick={() => setIsNewFolderModalOpen(true)}
              >
                <span className="hidden sm:inline">New Folder</span>
                <IconFolder className="w-4 h-4 sm:hidden" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Card className="shadow-none border-slate-200 overflow-hidden rounded-none sm:rounded-lg">
        {viewMode === 'list' ? (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden p-4 space-y-3">
              {loading ? (
                <div className="text-center text-slate-500 py-8">Loading files...</div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center text-slate-400 py-8">No files found in this folder.</div>
              ) : (
                filteredFiles.map((file) => (
                  <div
                    key={file._id || file.id}
                    className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button')) return;
                      if (file.type === 'folder') {
                        navigate(`/files/${file._id || file.id}`);
                      } else {
                        handleFilePreview(file);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-slate-400 flex-shrink-0">
                          {file.type === 'folder' ? <IconFolder className="w-5 h-5 text-amber-500" /> : <IconFile className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-700 truncate text-sm">{file.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span className="capitalize">{file.type}</span>
                            {file.type !== 'folder' && (
                              <>
                                <span>•</span>
                                <span>{formatBytes(file.size)}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'Just now'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedFile(file)} className="h-8 w-8 text-slate-400 hover:text-slate-900">
                          <IconEye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(file.name, file.url)} className="h-8 w-8 text-slate-400 hover:text-slate-900">
                          <IconDownloadCloud className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(file._id || file.id, file.isFolder ? 'folder' : 'file', file.name)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                          <IconTrash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 w-12">
                      <input
                        type="checkbox"
                        checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFiles(filteredFiles.map(f => f._id || f.id));
                          } else {
                            setSelectedFiles([]);
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Size</th>
                    <th className="px-6 py-3">Modified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading files...</td></tr>
                  ) : filteredFiles.map((file) => {
                    const fileId = file._id || file.id;
                    const isSelected = selectedFiles.includes(fileId);

                    return (
                      <tr
                        key={fileId}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 hover:bg-blue-100'
                            : 'hover:bg-slate-50'
                        }`}
                        onClick={(e) => {
                          // If clicking on checkbox, let it handle selection
                          if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
                          // Otherwise, open the file/folder
                          if (file.type === 'folder') {
                            navigate(`/files/${fileId}`);
                          } else {
                            handleFilePreview(file);
                          }
                        }}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSelectedFiles(prev =>
                                prev.includes(fileId)
                                  ? prev.filter(id => id !== fileId)
                                  : [...prev, fileId]
                              );
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="text-slate-400">
                              {file.type === 'folder' ? <IconFolder className="w-4 h-4 text-amber-500" /> : <IconFile className="w-4 h-4" />}
                            </div>
                            <span className="font-semibold text-slate-700 truncate">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">{file.type}</td>
                        <td className="px-6 py-4 text-slate-500">{file.type === 'folder' ? '--' : formatBytes(file.size)}</td>
                        <td className="px-6 py-4 text-slate-500">
                          {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'Just now'}
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && filteredFiles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        No files found in this folder.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-6">
            {loading ? (
              <div className="text-center text-slate-500 py-12">Loading files...</div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center text-slate-400 py-12">No files found in this folder.</div>
            ) : (
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4">
                {filteredFiles.map((file, index) => {
                  const fileId = file._id || file.id;
                  const isSelected = selectedFiles.includes(fileId);

                  return (
                    <div
                      key={fileId}
                      className={`group relative bg-white border rounded-lg overflow-hidden transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-slate-200 hover:shadow-lg'
                      }`}
                      onClick={(e) => {
                        // If clicking on checkbox, let it handle selection
                        if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
                        // Otherwise, open the file/folder
                        if (file.type === 'folder') {
                          navigate(`/files/${fileId}`);
                        } else {
                          handleFilePreview(file);
                        }
                      }}
                    >
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            const fileId = file._id || file.id;
                            setSelectedFiles(prev =>
                              prev.includes(fileId)
                                ? prev.filter(id => id !== fileId)
                                : [...prev, fileId]
                            );
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      {/* Thumbnail */}
                      <div className="aspect-square bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
                        {file.type === 'folder' ? (
                          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
                            <IconFolder className="w-10 h-10 text-amber-600" />
                          </div>
                        ) : file.type === 'image' && file.url ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling!.classList.remove('hidden');
                            }}
                          />
                        ) : file.type === 'video' && file.url ? (
                          <div className="w-full h-full bg-slate-200 rounded-lg flex items-center justify-center relative">
                            <video
                              src={file.url}
                              className="w-full h-full object-cover rounded-lg"
                              muted
                              onLoadedData={(e) => {
                                // Create thumbnail from video
                                const video = e.currentTarget;
                                const canvas = document.createElement('canvas');
                                canvas.width = video.videoWidth;
                                canvas.height = video.videoHeight;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  ctx.drawImage(video, 0, 0);
                                  const thumbnailUrl = canvas.toDataURL();
                                  video.style.display = 'none';
                                  const img = video.parentElement!.querySelector('.video-thumb') as HTMLImageElement;
                                  if (img) {
                                    img.src = thumbnailUrl;
                                    img.style.display = 'block';
                                  }
                                }
                              }}
                            />
                            <img
                              src=""
                              alt={file.name}
                              className="video-thumb w-full h-full object-cover rounded-lg hidden"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center">
                                <div className="w-0 h-0 border-l-3 border-l-white border-t-2 border-t-transparent border-b-2 border-b-transparent ml-0.5"></div>
                              </div>
                            </div>
                          </div>
                        ) : null}
                        {/* Fallback icon */}
                        <div className={`${file.type === 'folder' || ((file.type === 'image' || file.type === 'video') && file.url) ? 'hidden' : ''}`}>
                          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                            <IconFile className="w-10 h-10 text-slate-500" />
                          </div>
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-slate-900 truncate mb-1">{file.name}</h4>
                        <p className="text-xs text-slate-500">
                          {file.type === 'folder' ? 'Folder' : formatBytes(file.size)}
                        </p>
                      </div>


                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Upload Area Modal */}
      {isUploadOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl shadow-2xl border-0 animate-in zoom-in-95 duration-300 overflow-hidden relative bg-white">
            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-6 border-b border-blue-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600">
                    <IconUpload className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Upload Files</h3>
                    <p className="text-sm text-slate-500">Add content to <span className="font-semibold text-blue-600">{currentFolderId ? 'current folder' : 'root'}</span></p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsUploadOpen(false)} className="h-10 w-10 rounded-xl hover:bg-white/50">
                  <IconX className="w-5 h-5 text-slate-500" />
                </Button>
              </div>
            </div>

            <div className="p-8">
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300 group cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <div className="space-y-6 pointer-events-none">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <IconUpload className="w-10 h-10 text-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-slate-900">Drop files here or click to browse</p>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">Support for images, videos, documents, archives and more. Up to 2GB per file.</p>
                  </div>
                </div>
              </div>

              {/* File List */}
              {uploadFiles.length > 0 && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">{uploadFiles.length}</span>
                      Selected Files
                    </h4>
                    {!uploading && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setUploadFiles([])} className="text-red-500 hover:text-red-600 hover:bg-red-50">Clear All</Button>
                        <Button onClick={startUpload} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 px-6">
                          Start Upload
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {uploadFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100">
                            <IconFile className="w-4 h-4 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        {!uploading ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeUploadFile(index)}
                            className="h-8 w-8 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <IconX className="w-4 h-4" />
                          </Button>
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {uploading && (
                    <div className="space-y-2 pt-2 animate-in fade-in">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-blue-600">Uploading...</span>
                        <span className="text-slate-700">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>,
        document.body
      )}

      {/* Enhanced File Preview Modal */}
      {previewFile && previewType && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  {previewType === 'image' ? <IconEye className="w-5 h-5 text-slate-600" /> : <IconFile className="w-5 h-5 text-slate-600" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 truncate">{previewFile.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{formatBytes(previewFile.size)}</span>
                    <span>•</span>
                    <span>{new Date(previewFile.uploadedAt).toLocaleString()}</span>
                    {previewFiles.length > 1 && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-medium ml-2">
                        {currentPreviewIndex + 1} / {previewFiles.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleDownload(previewFile.name, previewFile.url)} className="hidden sm:flex">
                  <IconDownloadCloud className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="ghost" size="icon" onClick={() => {
                  setPreviewFile(null);
                  setPreviewType(null);
                  setPreviewFiles([]);
                  setCurrentPreviewIndex(0);
                }} className="h-10 w-10 rounded-full hover:bg-slate-100">
                  <IconX className="w-6 h-6 text-slate-500" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {previewType === 'image' && (
                <div className="relative bg-slate-50 p-6 flex items-center justify-center min-h-[400px]">
                  {previewFiles.length > 1 && (
                    <>
                      <button
                        onClick={() => navigatePreview('prev')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                      >
                        <IconChevronDown className="w-5 h-5 rotate-90" />
                      </button>
                      <button
                        onClick={() => navigatePreview('next')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                      >
                        <IconChevronDown className="w-5 h-5 -rotate-90" />
                      </button>
                    </>
                  )}
                  <div className="max-w-full max-h-[600px]">
                    <img
                      src={previewFile.url || previewFile.thumbnail || 'https://picsum.photos/800/600'}
                      alt={previewFile.name}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.src = 'https://picsum.photos/800/600';
                      }}
                    />
                  </div>
                </div>
              )}

              {previewType === 'video' && (
                <div className="relative bg-slate-900 p-6 flex items-center justify-center min-h-[400px]">
                  {previewFiles.length > 1 && (
                    <>
                      <button
                        onClick={() => navigatePreview('prev')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                      >
                        <IconChevronDown className="w-5 h-5 rotate-90" />
                      </button>
                      <button
                        onClick={() => navigatePreview('next')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                      >
                        <IconChevronDown className="w-5 h-5 -rotate-90" />
                      </button>
                    </>
                  )}
                  <div className="w-full max-w-4xl">
                    <video
                      controls
                      className="w-full rounded-lg shadow-2xl"
                      poster={previewFile.thumbnail}
                    >
                      <source src={previewFile.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}

              {previewType === 'document' && (
                <div className="bg-slate-50 p-6 flex items-center justify-center min-h-[400px]">
                  <div className="text-center space-y-6 max-w-md">
                    <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-slate-100">
                      <IconFile className="w-12 h-12 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">{previewFile.name}</h4>
                      <p className="text-sm text-slate-500 mb-4">
                        {previewFile.type.toUpperCase()} Document • {previewFile.size}
                      </p>
                      <p className="text-xs text-slate-400">
                        Document preview not available. Click download to view the file.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-sm">
                <Button variant="ghost" size="sm" onClick={() => handleShare(previewFile.name, previewFile.url)}>Share Link</Button>
              </div>
              <Button size="sm" onClick={() => handleDownload(previewFile.name, previewFile.url)}>
                Download File
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Basic File Info Modal (for unsupported files) */}
      {selectedFile && !previewFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{selectedFile.name}</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)} className="h-8 w-8 rounded-full">
                <IconX className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 bg-slate-50 flex items-center justify-center">
              <div className="w-full max-w-sm text-center">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto shadow-lg border border-slate-100 mb-4">
                  <IconFile className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">File Information</p>
                <p className="text-sm text-slate-600">Preview not available for this file type.</p>
              </div>
            </div>

            <div className="p-4 bg-white flex items-center justify-between">
              <div className="text-[11px] text-slate-400 font-bold uppercase">
                {selectedFile.size} • {selectedFile.owner || 'Me'}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleShare(selectedFile.name)}>Share</Button>
                <Button size="sm" onClick={() => handleDownload(selectedFile.name)}>Download</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {isNewFolderModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200/50 animate-in zoom-in-95 duration-300">
            <form onSubmit={handleCreateFolder}>
              <div className="p-6 border-b border-slate-100/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <IconFolder className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Create New Folder</h3>
                    <p className="text-sm text-slate-500">Organize your files with folders</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <label htmlFor="folder-name" className="text-sm font-semibold text-slate-700">Folder Name</label>
                  <Input
                    id="folder-name"
                    autoFocus
                    placeholder="My New Folder"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder(e)}
                    className="h-12 text-base border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
                  />
                  <p className="text-xs text-slate-500">Choose a descriptive name for your folder</p>
                </div>
              </div>
              <div className="p-6 bg-slate-50/50 flex justify-end gap-3 border-t border-slate-100/80">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl shadow-sm transition-all duration-300 ${
                    actionLoading['create-folder'] ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                  disabled={!newFolderName.trim() || actionLoading['create-folder']}
                >
                  <div className="flex items-center justify-center gap-3">
                    {actionLoading['create-folder'] && <IconSpinner className="w-4 h-4" />}
                    <span className={`transition-opacity duration-300 ${actionLoading['create-folder'] ? 'opacity-70' : 'opacity-100'}`}>
                      {actionLoading['create-folder'] ? 'Creating...' : 'Create Folder'}
                    </span>
                  </div>
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Files;
