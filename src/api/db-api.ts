/**
 * Database API
 * 
 * This file provides API endpoints for database operations.
 * It's designed to be used with a server-side API handler.
 */

// Define the API endpoint URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const DB_API_ENDPOINT = `${API_BASE_URL}/db`;

// Define the API response type
interface ApiResponse<T = any> {
  data: T | null;
  error: {
    message: string;
    code: string;
  } | null;
}

/**
 * Execute a database query through the API
 * @param method HTTP method
 * @param endpoint API endpoint
 * @param body Request body
 * @returns API response
 */
async function apiRequest<T = any>(
  method: string,
  endpoint: string,
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${DB_API_ENDPOINT}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: result.error || 'Unknown error',
          code: response.status.toString(),
        },
      };
    }

    return result;
  } catch (error: any) {
    console.error('API request error:', error);
    return {
      data: null,
      error: {
        message: error.message || 'Network error',
        code: 'NETWORK_ERROR',
      },
    };
  }
}

/**
 * Database API client
 */
export const dbApi = {
  /**
   * Execute a raw SQL query
   * @param sql SQL query
   * @param params Query parameters
   * @returns Query result
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<ApiResponse<T>> {
    return apiRequest<T>('POST', '/query', { sql, params });
  },

  /**
   * Get all rows from a table
   * @param table Table name
   * @param orderBy Optional order by clause
   * @returns All rows from the table
   */
  async getAll<T = any>(table: string, orderBy?: string): Promise<ApiResponse<T[]>> {
    return apiRequest<T[]>('GET', `/tables/${table}${orderBy ? `?orderBy=${orderBy}` : ''}`);
  },

  /**
   * Get a row by ID
   * @param table Table name
   * @param id Row ID
   * @returns Row with the specified ID
   */
  async getById<T = any>(table: string, id: string): Promise<ApiResponse<T>> {
    return apiRequest<T>('GET', `/tables/${table}/${id}`);
  },

  /**
   * Insert a row into a table
   * @param table Table name
   * @param data Row data
   * @returns Inserted row
   */
  async insert<T = any>(table: string, data: Record<string, any>): Promise<ApiResponse<T>> {
    return apiRequest<T>('POST', `/tables/${table}`, data);
  },

  /**
   * Update a row in a table
   * @param table Table name
   * @param id Row ID
   * @param data Row data
   * @returns Updated row
   */
  async update<T = any>(
    table: string,
    id: string,
    data: Record<string, any>
  ): Promise<ApiResponse<T>> {
    return apiRequest<T>('PUT', `/tables/${table}/${id}`, data);
  },

  /**
   * Delete a row from a table
   * @param table Table name
   * @param id Row ID
   * @returns Deleted row
   */
  async delete<T = any>(table: string, id: string): Promise<ApiResponse<T>> {
    return apiRequest<T>('DELETE', `/tables/${table}/${id}`);
  },

  /**
   * Find rows by a field value
   * @param table Table name
   * @param field Field name
   * @param value Field value
   * @returns Rows with the specified field value
   */
  async findBy<T = any>(table: string, field: string, value: any): Promise<ApiResponse<T[]>> {
    return apiRequest<T[]>('GET', `/tables/${table}/find?field=${field}&value=${value}`);
  },
};
