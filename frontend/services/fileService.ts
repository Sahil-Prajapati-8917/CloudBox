import api from './api';
import { StorageFile, FileUploadResponse } from '../types';

interface CreateFolderData {
    name: string;
    parentId?: string;
}

const fileService = {
    getFiles: async (parentId?: string): Promise<StorageFile[]> => {
        try {
            const response = await api.get('/files', { params: { parentId } });
            return response.data;
        } catch (error: any) {
            console.error('Get files error:', error);
            throw error;
        }
    },

    createFolder: async (data: CreateFolderData): Promise<FileUploadResponse> => {
        try {
            const response = await api.post('/files/create-folder', data);
            return response.data;
        } catch (error: any) {
            console.error('Create folder error:', error);
            throw error;
        }
    },

    // Prepare upload by getting signed URL
    prepareUpload: async (metadata: {
        fileName: string;
        fileType: string;
        fileSize: number;
        parentId?: string;
    }): Promise<{ signedUrl: string; fileData: any; uploadId: string }> => {
        try {
            const response = await api.post('/files/upload', metadata);
            return response.data;
        } catch (error: any) {
            console.error('Upload preparation error:', error);
            throw error;
        }
    },

    // Upload directly to S3 using signed URL
    uploadToS3: async (
        signedUrl: string,
        file: File,
        onProgress?: (percent: number) => void
    ): Promise<void> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && onProgress) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    onProgress(percent);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve();
                } else {
                    reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText}`));
                }
            };

            xhr.onerror = () => reject(new Error('Network error during S3 upload'));
            xhr.timeout = 300000; // 5 minutes timeout
            xhr.ontimeout = () => reject(new Error('S3 upload timeout'));

            xhr.open('PUT', signedUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);
        });
    },

    // Confirm upload and save to database
    confirmUpload: async (uploadId: string, fileData: any): Promise<FileUploadResponse> => {
        try {
            const response = await api.post('/files/confirm-upload', { uploadId, fileData });
            return response.data;
        } catch (error: any) {
            console.error('Upload confirmation error:', error);
            throw error;
        }
    },

    deleteFile: async (id: string): Promise<{ message: string }> => {
        try {
            const response = await api.delete(`/files/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Delete file error:', error);
            throw error;
        }
    },
};

export default fileService;
