
// User related types
export interface User {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  plan?: string;
  profileImage?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface AuthUser extends User {
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// File related types
export type FileType = 'image' | 'pdf' | 'video' | 'document' | 'archive' | 'folder';

export interface StorageFile {
  id: string;
  _id?: string;
  name: string;
  type: FileType;
  size: number;
  uploadedAt: Date;
  owner: string;
  thumbnail?: string;
  parentId?: string;
  downloadUrl?: string;
  url?: string;
  isFolder?: boolean;
  userId?: string;
  fileName?: string;
  fileType?: string;
  s3Key?: string;
}

export interface StorageStats {
  totalFiles: number;
  storageUsed: string;
  storageLimit: string;
  recentUploadsCount: number;
}

export interface FileUploadResponse {
  _id: string;
  userId: string;
  fileName: string;
  fileType: string;
  s3Key: string;
  size: number;
  uploadedAt: string;
  parentId?: string;
  isFolder?: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  token: string;
}

// UI and Navigation types
export type ViewType = 'dashboard' | 'files' | 'upload' | 'activity' | 'settings' | 'profile';

// Form types
export interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// Context types
export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}
