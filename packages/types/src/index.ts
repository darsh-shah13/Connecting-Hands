/**
 * Shared types and interfaces for Connecting Hands
 */

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
  confidence: number;
}

export interface DetectionResult {
  success: boolean;
  landmarks: HandLandmark[];
  confidence: number;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface HandGesture {
  id: string;
  name: string;
  description: string;
  landmarks: HandLandmark[];
}
