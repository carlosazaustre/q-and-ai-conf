import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string; // UID from Firebase Auth
  email: string | null;
  name: string | null;
  imageUrl: string | null;
  createdAt?: Timestamp;
}

export interface Question {
  id: string; // Firestore document ID
  userId: string;
  userName: string;
  userImage: string | null;
  content: string;
  timestamp: Timestamp;
  isRead?: boolean; // Added for admin tracking
}

export interface AiSummary {
  id: string; // Firestore document ID (e.g., 'latest')
  questionId: string;
  summaryText: string;
  generationTimestamp: Timestamp;
}
