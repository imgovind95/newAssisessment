// src/config.js

// Use the environment variable if defined (for production on Vercel),
// otherwise fallback to the local development server URL.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';
