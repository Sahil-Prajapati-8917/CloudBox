
import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { Toast } from '../components/ui/Toast';
import { IconUpload, IconFile, IconX, IconSpinner } from '../components/ui/Icons';
import { StorageFile, FileUploadResponse, FileType } from '../types';
import fileService from '../services/fileService';

interface UploadProps {
  onUploadSuccess: (newFiles: StorageFile[]) => void;
  parentId?: string;
}

interface FileQueueItemProps {
  file: File;
  onRemove: () => void;
  uploading: boolean;
}

const FileQueueItem: React.FC<FileQueueItemProps> = ({ file, onRemove, uploading }) => {
  const isImage = file.type.startsWith('image/');
  const [preview, setPreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isImage]);

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="p-1 bg-slate-50 rounded-xl overflow-hidden shrink-0">
          {isImage && preview ? (
            <img src={preview} alt="preview" className="w-8 h-8 object-cover rounded-lg" />
          ) : (
            <div className="p-1.5"><IconFile className="w-5 h-5 text-blue-500" /></div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 truncate pr-2">
            {file.name}
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Binary'}
          </p>
        </div>
      </div>
      {!uploading && (
        <button
          onClick={onRemove}
          className="p-1.5 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
        >
          <IconX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const Upload: React.FC<UploadProps> = ({ onUploadSuccess, parentId }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [showToast, setShowToast] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const uploadIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
    };
  }, []);

  const startUpload = () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);

    let currentProgress = 0;
    uploadIntervalRef.current = setInterval(() => {
      currentProgress += 5;
      if (currentProgress >= 100) {
        if (uploadIntervalRef.current) {
          clearInterval(uploadIntervalRef.current);
          uploadIntervalRef.current = null;
        }

        setProgress(100);
        setUploading(false);

        const uploadPromises = files.map(f => {
          const formData = new FormData();
          formData.append('file', f);
          // if (parentId) formData.append('parentId', parentId); // backend might not support folder nesting yet

          return fileService.uploadFile(formData);
        });

        Promise.all(uploadPromises)
          .then(responses => {
            // Map FileUploadResponse to StorageFile
            const newFiles: StorageFile[] = responses.map(response => {
              // Safely determine file type
              let fileType: FileType = 'file' as FileType;
              if (response.fileType && typeof response.fileType === 'string') {
                if (response.fileType.startsWith('image/')) {
                  fileType = 'image';
                } else if (response.fileType.startsWith('video/')) {
                  fileType = 'video';
                } else if (response.fileType.startsWith('audio/')) {
                  fileType = 'video'; // Treat audio as video for now
                } else if (response.fileType.includes('pdf')) {
                  fileType = 'document';
                }
              }

              return {
                id: response._id,
                name: response.fileName,
                type: fileType,
                size: response.size,
                uploadedAt: new Date(response.uploadedAt),
                owner: '', // Will be set by parent component
                parentId: response.parentId,
                isFolder: response.isFolder || false
              };
            });

            if (newFiles.length > 0) {
              onUploadSuccess(newFiles);
              setShowToast(true);
              setFiles([]);
            } else {
              // Handle all failed
              console.error("All uploads failed");
            }
          })
          .catch(err => console.error("Upload error", err));

        setUploading(false);
        // Toast is shown in success block now

      } else {
        setProgress(currentProgress);
      }
    }, 100);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {showToast && (
        <Toast
          message="Files uploaded successfully!"
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="text-center space-y-3">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cloud Upload</h2>
        <p className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed">
          Drop your files into the secure vault. We'll handle the compression and safety.
        </p>
      </div>

      <Card className="p-12 border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-sm hover:border-slate-400 hover:bg-slate-50/30 transition-all cursor-pointer group">
        <label className="flex flex-col items-center justify-center space-y-6 w-full h-full cursor-pointer">
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <div className="w-24 h-24 bg-white rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-slate-900 group-hover:scale-105 transition-all">
            <IconUpload className="w-12 h-12" />
          </div>

          <div className="text-center">
            <p className="text-xl font-bold text-slate-900">Push to Cloud</p>
            <p className="text-sm text-slate-400 mt-1 font-medium">Click or drag files here to start upload</p>
          </div>

          <div className="flex gap-2 items-center text-xs font-bold text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            MAX 500MB PER FILE
          </div>
        </label>
      </Card>

      {files.length > 0 && (
        <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              Queue <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full">{files.length}</span>
            </h3>
            {!uploading && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setFiles([])}>Clear All</Button>
                <Button
                  type="button"
                  onClick={startUpload}
                  className={`h-10 rounded-xl px-6 shadow-lg shadow-slate-200 transition-all duration-300 ${
                    uploading ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={uploading}
                >
                  <div className="flex items-center justify-center gap-3">
                    {uploading && <IconSpinner className="w-4 h-4" />}
                    <span className={`transition-opacity duration-300 ${uploading ? 'opacity-70' : 'opacity-100'}`}>
                      {uploading ? 'Uploading...' : 'Confirm & Upload'}
                    </span>
                  </div>
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {files.map((file, i) => (
              <FileQueueItem
                key={i}
                file={file}
                onRemove={() => removeFile(i)}
                uploading={uploading}
              />
            ))}
          </div>
        </div>
      )}
      {uploading && (
        <Card className="p-8 border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
          <div className="space-y-5">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">In Transit</p>
                <h4 className="text-lg font-bold text-slate-900">Synchronizing Vault</h4>
              </div>
              <span className="text-2xl font-black text-slate-900">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              Writing bits to decentralized storage nodes...
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Upload;
