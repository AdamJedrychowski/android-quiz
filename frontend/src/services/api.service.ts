import axios, { AxiosInstance } from 'axios';
import { UploadResponse, QuestionsResponse, Question } from '../types';

// API base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds for large file uploads
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error: No response from server');
    } else {
      // Error setting up the request
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Upload a CSV file
 * @param file - CSV file to upload
 * @returns Upload result with import statistics
 */
export async function uploadCSV(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<UploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Get all questions with pagination
 * @param page - Page number (1-based)
 * @param limit - Items per page
 * @returns Paginated questions list
 */
export async function getQuestions(page: number = 1, limit: number = 20): Promise<QuestionsResponse> {
  const response = await apiClient.get<QuestionsResponse>('/questions', {
    params: { page, limit },
  });

  return response.data;
}

/**
 * Get a single question by ID
 * @param id - Question ID
 * @returns Question details
 */
export async function getQuestionById(id: number): Promise<Question> {
  const response = await apiClient.get<Question>(`/questions/${id}`);
  return response.data;
}

/**
 * Delete all questions from the database
 * @returns Deletion result with count
 */
export async function deleteAllQuestions(): Promise<{ message: string; deletedCount: number }> {
  const response = await apiClient.delete('/questions');
  return response.data;
}

export default apiClient;
