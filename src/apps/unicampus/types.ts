export interface Paper {
  id: string;
  title: string;
  university: string;
  courseCode: string;
  year: number;
  uploadedBy: string;
  fileUrl: string; // Blob URL or Mock URL
  fileType: string;
  uploadDate: string;
  downloads: number;
  previews: number;
  category: 'Exam' | 'CAT';
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export interface University {
  id: string;
  name: string;
  shortName: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}