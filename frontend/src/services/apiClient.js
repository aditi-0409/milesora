
/**
 * Centralized API Client for Milesora
 * Communicates with the Java Spring Boot REST backend.
 */

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
).replace(/\/+$/, '');

class ApiClient {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  getToken() {
    try {
      return sessionStorage.getItem('taskora_auth_token');
    } catch {
      return null;
    }
  }

  setToken(token) {
    try {
      if (token) {
        sessionStorage.setItem('taskora_auth_token', token);
      } else {
        sessionStorage.removeItem('taskora_auth_token');
      }
    } catch (error) {
      console.error('Unable to update authentication token:', error);
    }
  }

  getHeaders(isMultipart = false) {
    const headers = {
      Accept: 'application/json',
    };

    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async handleResponse(response) {
    if (response.status === 204) {
      return null;
    }

    let data = null;
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('taskora:unauthorized'));
      }

      const message =
        (data && typeof data === 'object' && (data.message || data.error)) ||
        (typeof data === 'string' && data.trim()) ||
        `HTTP Error ${response.status}: ${response.statusText}`;

      const error = new Error(message);
      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;
  }

  
  async request(url, options = {}) {
    let response;

    try {
      response = await fetch(url, options);
    } catch (cause) {
      const error = new Error(
        'Unable to connect to the backend. Check that Spring Boot is running and the API URL is correct.'
      );
      error.cause = cause;
      throw error;
    }

    return this.handleResponse(response);
  }

  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });

    return this.request(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async post(endpoint, body = {}) {
    return this.request(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body = {}) {
    return this.request(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
  }

  async patch(endpoint, body = {}) {
    return this.request(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint) {
    return this.request(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  async upload(endpoint, formData) {
    return this.request(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData,
    });
  }
}

export const apiClient = new ApiClient();
