/**
 * Student User Profile interfaces matching api-spec.md and databse-schema.md
 */

export interface User {
  id: string;
  name: string;
  email: string;
  university: string;
  department: string;
  targetWakeUpTime: string;       // "HH:mm" (e.g. "06:30")
  targetSleepTime: string;        // "HH:mm" (e.g. "23:00")
  reminderTime: string;           // "HH:mm" (e.g. "21:00")
  reminderEnabled: boolean;
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSuccessData {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  university: string;
  department: string;
}

export interface UpdateProfilePayload {
  name?: string;
  university?: string;
  department?: string;
  targetWakeUpTime?: string;
  targetSleepTime?: string;
  reminderTime?: string;
  reminderEnabled?: boolean;
}
