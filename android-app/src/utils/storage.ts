import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User } from '@/types/user.types';

const TOKEN_KEY = 'studentlife_auth_token';
const USER_KEY = 'studentlife_user_data';

// In-memory fallback for web / non-secure environments
const memoryStorage = new Map<string, string>();

async function setItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        memoryStorage.set(key, value);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  } catch (err) {
    console.warn(`[storage] Error writing key "${key}":`, err);
    memoryStorage.set(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return memoryStorage.get(key) ?? null;
    }
    return await SecureStore.getItemAsync(key);
  } catch (err) {
    console.warn(`[storage] Error reading key "${key}":`, err);
    return memoryStorage.get(key) ?? null;
  }
}

async function deleteItem(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        memoryStorage.delete(key);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch (err) {
    console.warn(`[storage] Error deleting key "${key}":`, err);
    memoryStorage.delete(key);
  }
}

export const Storage = {
  async saveToken(token: string): Promise<void> {
    await setItem(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return await getItem(TOKEN_KEY);
  },

  async removeToken(): Promise<void> {
    await deleteItem(TOKEN_KEY);
  },

  async saveUser(user: User): Promise<void> {
    await setItem(USER_KEY, JSON.stringify(user));
  },

  async getUser(): Promise<User | null> {
    const raw = await getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  async removeUser(): Promise<void> {
    await deleteItem(USER_KEY);
  },

  async clearAuth(): Promise<void> {
    await Promise.all([
      deleteItem(TOKEN_KEY),
      deleteItem(USER_KEY),
    ]);
  },
};

export default Storage;
