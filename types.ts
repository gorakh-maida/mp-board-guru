
export enum StudentClass {
  CLASS_10 = '10th',
  CLASS_12 = '12th'
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  groundingUrls?: { uri: string; title: string }[];
  attachedFile?: {
    name: string;
    mimeType: string;
  };
}

export interface StudyPlan {
  class: StudentClass;
  subjects: string[];
  intensity: 'light' | 'moderate' | 'intensive';
  examDate: string;
}

export interface Subject {
  name: string;
  id: string;
  icon: string;
}
