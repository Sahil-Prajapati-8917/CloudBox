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

    uploadFile: async (formData: FormData): Promise<FileUploadResponse> => {
        try {
            const response = await api.post('/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                // Add upload progress if needed
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
                    console.log(`Upload progress: ${percentCompleted}%`);
                },
            });
            return response.data;
        } catch (error: any) {
            console.error('File upload error:', error);
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
