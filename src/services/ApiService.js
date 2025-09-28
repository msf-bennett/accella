import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('user_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  handleUnauthorized() {
    AsyncStorage.removeItem('user_token');
    AsyncStorage.removeItem('user_data');
  }

  // Auth endpoints
  login(credentials) {
    return this.api.post('/auth/login', credentials);
  }

  register(userData) {
    return this.api.post('/auth/register', userData);
  }

  // Training endpoints
  getTrainingPlans() {
    return this.api.get('/training-plans');
  }

  createTrainingPlan(planData) {
    return this.api.post('/training-plans', planData);
  }

  getSessions(planId) {
    return this.api.get(`/training-plans/${planId}/sessions`);
  }

  submitFeedback(sessionId, feedback) {
    return this.api.post(`/sessions/${sessionId}/feedback`, feedback);
  }
}

export default new ApiService();