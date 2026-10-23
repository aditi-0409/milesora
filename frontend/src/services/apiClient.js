/**
 * Centralized API Client for Taskora Pulse
 * Communicates with the Java Spring Boot REST backend.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

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
    if (token) {
      sessionStorage.setItem('taskora_auth_token', token);
    } else {
      sessionStorage.removeItem('taskora_auth_token');
    }
  }

  getHeaders(isMultipart = false) {
    const headers = {};
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async handleResponse(response) {
    if (response.status === 204) {
      return null;
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle session expiry
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('taskora:unauthorized'));
      }

      const error = new Error(
        (data && data.message) ||
        (data && data.error) ||
        `HTTP Error ${response.status}: ${response.statusText}`
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.append(key, val);
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async post(endpoint, body = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async put(endpoint, body = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async patch(endpoint, body = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async delete(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async upload(endpoint, formData) {
    // Note: Do NOT set Content-Type header for multipart uploads
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData,
    });
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();
