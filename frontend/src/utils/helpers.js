import { clsx } from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function timeAgo(dateString) {
  const now = new Date();
  const then = new Date(dateString);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateString);
}

export function truncate(str, length = 50) {
  if (!str) return '';
  return str.length > length ? str.slice(0, length) + '…' : str;
}

export function getStatusColor(status) {
  const map = {
    active: 'success',
    approved: 'success',
    live: 'success',
    pending: 'warning',
    upcoming: 'info',
    rejected: 'danger',
    blocked: 'danger',
    closed: 'neutral',
    inactive: 'neutral',
  };
  return map[status?.toLowerCase()] || 'neutral';
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const ROLES = {
  ADMIN: 'admin',
  OFFICE: 'office',
  USER: 'user',
};

export const VEHICLE_TYPES = ['2W', '3W', '4W', 'Commercial'];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
];

// API Base URL for image serving - uses env variable for Cloudflare/production hosting
// In production: VITE_API_URL should be set to backend URL (e.g., https://api.autorevives.com/api)
// In development: defaults to /api (uses Vite proxy)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Get the correct URL for an uploaded image
 * Handles both 'uploads/filename.jpg' and 'filename.jpg' formats
 * Uses API_BASE_URL for proper Cloudflare/separate hosting support
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  // Remove 'uploads/' or 'uploads\\' prefix if present, keeping folder structure
  const cleanPath = imagePath.replace(/^uploads[/\\]?/, '');
  return `${API_BASE_URL}/uploads/${cleanPath}`;
}

/**
 * Parse image_path which can be:
 * - A single path string: "uploads/image.jpg"
 * - A JSON array string: '["uploads/image1.jpg", "uploads/image2.jpg"]'
 * Returns an array of image URLs
 */
export function getImageUrls(imagePath) {
  if (!imagePath) return [];
  
  // Try to parse as JSON array first
  try {
    const parsed = JSON.parse(imagePath);
    if (Array.isArray(parsed)) {
      return parsed.map(p => getImageUrl(p)).filter(Boolean);
    }
  } catch (e) {
    // Not JSON, treat as single path
  }
  
  // Single path
  const url = getImageUrl(imagePath);
  return url ? [url] : [];
}
