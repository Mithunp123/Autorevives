/**
 * errorLogger.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Captures rich error context (device model, browser, OS, screen, locale, etc.)
 * and POSTs it to /api/features/log-error for storage in the error_logs table.
 *
 * Usage:
 *   import { logError } from '@/utils';
 *   try { ... } catch (err) { logError(err, { component: 'Home' }); }
 * ─────────────────────────────────────────────────────────────────────────────
 */
import api from '@/services/api';

// ── Queue + flush to batch rapid errors ──────────────────────────────────────
let _queue = [];
let _flushing = false;
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

async function _flush() {
    if (_flushing || _queue.length === 0) return;
    _flushing = true;
    const batch = [..._queue];
    _queue = [];
    try {
        await Promise.allSettled(
            batch.map((payload) => api.post('/features/log-error', payload).catch(() => { }))
        );
    } finally {
        _flushing = false;
    }
}

// ── Device / Browser parser ───────────────────────────────────────────────────
function _getDeviceInfo() {
    try {
        const ua = navigator.userAgent || '';

        // ── OS detection ─────────────────────────────────────────────────────────
        let os_name = 'Unknown';
        let os_version = '';

        if (/Windows NT/.test(ua)) {
            os_name = 'Windows';
            const match = ua.match(/Windows NT ([\d.]+)/);
            const ntMap = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.1': 'XP' };
            os_version = match ? (ntMap[match[1]] || match[1]) : '';
        } else if (/iPhone OS/.test(ua)) {
            os_name = 'iOS';
            const match = ua.match(/iPhone OS ([\d_]+)/);
            os_version = match ? match[1].replace(/_/g, '.') : '';
        } else if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) {
            os_name = 'iPadOS';
            const match = ua.match(/OS ([\d_]+)/);
            os_version = match ? match[1].replace(/_/g, '.') : '';
        } else if (/Android/.test(ua)) {
            os_name = 'Android';
            const match = ua.match(/Android ([\d.]+)/);
            os_version = match ? match[1] : '';
        } else if (/Mac OS X/.test(ua)) {
            os_name = 'macOS';
            const match = ua.match(/Mac OS X ([\d_.]+)/);
            os_version = match ? match[1].replace(/_/g, '.') : '';
        } else if (/Linux/.test(ua)) {
            os_name = 'Linux';
        } else if (/CrOS/.test(ua)) {
            os_name = 'ChromeOS';
        }

        // ── Browser detection ─────────────────────────────────────────────────────
        let browser_name = 'Unknown';
        let browser_version = '';

        if (/Edg\//.test(ua)) {
            browser_name = 'Edge';
            const m = ua.match(/Edg\/([\d.]+)/);
            browser_version = m ? m[1] : '';
        } else if (/OPR\//.test(ua) || /Opera\//.test(ua)) {
            browser_name = 'Opera';
            const m = ua.match(/(?:OPR|Opera)\/([\d.]+)/);
            browser_version = m ? m[1] : '';
        } else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) {
            browser_name = 'Chrome';
            const m = ua.match(/Chrome\/([\d.]+)/);
            browser_version = m ? m[1] : '';
        } else if (/Firefox\//.test(ua)) {
            browser_name = 'Firefox';
            const m = ua.match(/Firefox\/([\d.]+)/);
            browser_version = m ? m[1] : '';
        } else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) {
            browser_name = 'Safari';
            const m = ua.match(/Version\/([\d.]+)/);
            browser_version = m ? m[1] : '';
        } else if (/MSIE|Trident/.test(ua)) {
            browser_name = 'Internet Explorer';
            const m = ua.match(/(?:MSIE |rv:)([\d.]+)/);
            browser_version = m ? m[1] : '';
        } else if (/Chromium/.test(ua)) {
            browser_name = 'Chromium';
            const m = ua.match(/Chromium\/([\d.]+)/);
            browser_version = m ? m[1] : '';
        }

        // ── Device type + model ────────────────────────────────────────────────────
        let device_type = 'Desktop';
        let device_model = '';

        if (/Mobile|Android|iPhone|iPod/.test(ua) && !/iPad/.test(ua)) {
            device_type = 'Mobile';
        } else if (/iPad|Tablet/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) {
            device_type = 'Tablet';
        }

        // Try to extract device model
        if (/iPhone/.test(ua)) {
            device_model = 'iPhone';
        } else if (/iPad/.test(ua)) {
            device_model = 'iPad';
        } else if (/Android/.test(ua)) {
            // Android device model is usually between "Android x.x; " and "Build/"
            const m = ua.match(/Android[\d. ]+;\s*([^;)]+?)(?:\s+Build|\))/);
            device_model = m ? m[1].trim() : 'Android Device';
        } else if (/Windows Phone/.test(ua)) {
            device_model = 'Windows Phone';
        } else if (/Macintosh/.test(ua)) {
            device_model = 'Mac';
        } else if (/Windows/.test(ua)) {
            device_model = 'PC';
        } else if (/Linux/.test(ua)) {
            device_model = 'Linux Device';
        }

        return {
            os_name,
            os_version,
            browser_name,
            browser_version,
            device_type,
            device_model,
            user_agent: ua.slice(0, 1000),
            screen_width: window.screen?.width ?? null,
            screen_height: window.screen?.height ?? null,
            viewport_width: window.innerWidth ?? null,
            viewport_height: window.innerHeight ?? null,
            language: navigator.language || navigator.userLanguage || null,
            timezone: Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || null,
        };
    } catch {
        return {};
    }
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * Log an error to the backend error_logs table.
 *
 * @param {Error|string} error     - The error object or message string
 * @param {object}       options   - Optional context
 * @param {string}       options.errorType    - Category: 'api', 'wishlist', 'ui', etc.
 * @param {string}       options.component    - React component name where error occurred
 * @param {string}       options.pageUrl      - Override page URL (defaults to window.location.href)
 */
export function logError(error, options = {}) {
    try {
        const occurred_at = new Date().toISOString(); // Exact client-side timestamp
        const message = error instanceof Error ? error.message : String(error || 'Unknown error');
        const stack = error instanceof Error ? (error.stack || '') : '';

        const device = _getDeviceInfo();

        _queue.push({
            // Timing — exact moment error occurred
            occurred_at,

            // Error details
            error_type: options.errorType || options.error_type || 'frontend',
            error_message: message,
            error_stack: stack,
            component_name: options.component || options.componentName || null,

            // Page context
            page_url: options.pageUrl || window.location.href,
            page_title: document.title || null,
            referrer_url: document.referrer || null,

            // App version
            app_version: APP_VERSION,

            // Full device / browser fingerprint
            ...device,
        });

        // Debounced flush (200ms to batch rapid errors)
        setTimeout(_flush, 200);
    } catch {
        // Error logger must NEVER throw
    }
}

export default logError;
