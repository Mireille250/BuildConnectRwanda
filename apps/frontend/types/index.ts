export type Role =
  | 'CLIENT'
  | 'ENGINEER'
  | 'WORKER'
  | 'COMPANY'
  | 'SUPPLIER'
  | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  profilePhoto: string | null;
  bio: string | null;
  phone: string | null;
  district: string | null;
  isVerified: boolean;
  createdAt: string;
  profile?: Profile | null;
}

export interface Profile {
  profession: string | null;
  skills: string[];
  experience: number | null;
  availability: boolean;
  portfolioUrl: string | null;
  linkedinUrl: string | null;
  rating: number | null;
  ratingCount: number;
  licenseNumber: string | null;
  institution: string | null;
  graduationYear: number | null;
  companyName: string | null;
  registrationNo: string | null;
  website: string | null;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  district: string;
  budgetMin: number | null;
  budgetMax: number | null;
  requiredSkills: string[];
  profession: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: string | null;
  deadline: string | null;
  createdAt: string;
  postedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto: string | null;
    isVerified: boolean;
  };
  applicationCount?: number;
}

export interface Application {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  coverLetter: string | null;
  proposedRate: number | null;
  createdAt: string;
  job?: {
    id: string;
    title: string;
    district: string;
    status: string;
    deadline: string | null;
  };
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  jobTitle?: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto: string | null;
  };
}

export interface Conversation {
  conversationId: string;
  updatedAt: string;
  unreadCount: number;
  lastMessage: string | null;
  lastMessageAt: string | null;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto: string | null;
    role: string;
  };
}

export interface Message {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  sender: {
    firstName: string;
    lastName: string;
    profilePhoto: string | null;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}