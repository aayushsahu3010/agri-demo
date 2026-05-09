import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { getNextMockScan } from './mockData';

// ── Web-Safe Storage ───────────────────────────────────────────
export const setStorageItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

export const getStorageItem = async (key: string) => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

export const removeStorageItem = async (key: string) => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

// ── Demo Mode ──────────────────────────────────────────────────
// Set to true to run the app without a backend or trained AI model.
// Switch to false once your FastAPI backend is running.
export const DEMO_MODE = true;

// ── Config ─────────────────────────────────────────────────────
// Change this to your FastAPI backend URL
export const API_BASE_URL = __DEV__
  ? 'http://192.168.1.100:8000/api/v1'   // ← your local IP when testing on device
  : 'https://api.croopic.in/api/v1';     // ← production URL

const TOKEN_KEY = 'croopic_jwt_token';

// ── Axios Instance ──────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor — attach JWT ───────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await getStorageItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor — handle 401 ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeStorageItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

// ── Auth Helpers ───────────────────────────────────────────────
export const saveToken = (token: string) => setStorageItem(TOKEN_KEY, token);
export const getToken = () => getStorageItem(TOKEN_KEY);
export const clearToken = () => removeStorageItem(TOKEN_KEY);

// ── API Methods ────────────────────────────────────────────────

/** Register new farmer */
export const register = async (data: {
  name: string;
  phone: string;
  password: string;
  state?: string;
  preferred_language?: string;
}) => {
  if (DEMO_MODE) {
    const fakeToken = 'demo_jwt_token_croopic';
    await saveToken(fakeToken);
    return { user_id: 'demo-user-001', name: data.name, phone: data.phone };
  }
  const res = await api.post('/auth/register', data);
  await saveToken(res.data.access_token);
  return res.data;
};

/** Login with phone + password */
export const login = async (phone: string, password: string) => {
  if (DEMO_MODE) {
    // Demo: accept any credentials, return a fake user
    const fakeToken = 'demo_jwt_token_croopic';
    await saveToken(fakeToken);
    return { user_id: 'demo-user-001', name: 'Demo Farmer', phone };
  }
  const res = await api.post('/auth/login', { phone, password });
  await saveToken(res.data.access_token);
  return res.data;
};

/** Logout — clear token */
export const logout = () => clearToken();

/**
 * Scan a crop leaf image for disease.
 * @param imageUri - Local URI from ImagePicker/Camera
 * @returns Full ScanResponse from FastAPI
 */
export const scanCrop = async (imageUri: string): Promise<ScanResponse> => {
  if (DEMO_MODE) {
    // Simulate network delay for realism
    await new Promise(r => setTimeout(r, 2200));
    const mock = getNextMockScan();
    return {
      ...mock,
      scan_id:   `demo-${Date.now()}`,
      timestamp: new Date().toISOString(),
      image_url: imageUri, // use local URI so the image still shows
    };
  }

  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    name: 'leaf.jpg',
    type: 'image/jpeg',
  } as any);

  const res = await api.post('/predict/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return res.data;
};

// ── Types ──────────────────────────────────────────────────────
export interface ScanResponse {
  scan_id: string;
  timestamp: string;
  disease: string;
  disease_name_en: string;
  disease_name_hi: string;
  confidence: number;
  severity: 'High' | 'Medium' | 'Low' | 'None';
  is_healthy: boolean;
  top_3: Array<{ label: string; confidence: number }>;
  image_url: string;
  message_en: string;
  message_hi: string;
  treatment: Treatment;
}

export interface Treatment {
  disease_name_en: string;
  disease_name_hi: string;
  description_en: string;
  description_hi: string;
  chemical_treatments: Array<{
    name: string;
    dosage: string;
    frequency: string;
    brand_example?: string;
  }>;
  organic_treatments: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  prevention: string[];
  urgency: string;
}

export default api;
