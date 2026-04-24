import axios from 'axios';

// Base URL from env variable (for Vercel) or proxied via vite.config.ts (for local)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillvibes_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server returns 401, clear session and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('skillvibes_token');
      localStorage.removeItem('skillvibes_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponseDTO {
  id: number;
  fullName: string;
  email: string;
  role: string;
  balance: number;
}

export interface AuthResponseDTO {
  token: string;
  user: UserResponseDTO;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: string; // "STUDENT" | "TUTOR"
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponseDTO>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<UserResponseDTO>('/auth/register', data),

  getUser: (id: number) =>
    api.get<UserResponseDTO>(`/auth/${id}`),
};

// ── Tutorias ─────────────────────────────────────────────────────────────────

export interface Tutoria {
  id: number;
  materia: string;
  descripcion: string;
  precio: number;
  fechaHora: string; // ISO string from backend
  meetingLink: string;
  estado: string; // "PROGRAMADA" | "EN_CURSO" | "FINALIZADA"
  tutor: UserResponseDTO;
  estudiante: UserResponseDTO;
}

export interface CrearTutoriaRequest {
  materia: string;
  descripcion: string;
  precio: number;
  fechaHora: string;
  meetingLink: string;
  tutor: { id: number };
  estudiante: { id: number };
}

export const tutoriasApi = {
  getMyBoard: (userId: number) =>
    api.get<Tutoria[]>(`/tutorias/mi-tablero/${userId}`),

  create: (data: CrearTutoriaRequest) =>
    api.post<Tutoria>('/tutorias/programar', data),

  finalize: (id: number) =>
    api.put<Tutoria>(`/tutorias/${id}/finalizar`),
};

export default api;
