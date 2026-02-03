import { supabase } from '../../store/supabaseClient';

// Simple string hash function (djb2 variant)
const generateErrorHash = (message: string, stack: string, ua: string): string => {
    const str = `${message}||${stack}||${ua}`;
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
    }
    return (hash >>> 0).toString(16); // basic hex hash
};

let isInitialized = false;

const logError = async (message: string, stack: string = '', componentStack: string = '') => {
    // Prevent logging our own logging errors or trivial things
    if (message.includes('ResizeObserver') || message.includes('Script error')) return;

    const ua = navigator.userAgent;
    const fullStack = stack + (componentStack ? `\nComponent Stack:\n${componentStack}` : '');
    const hash = generateErrorHash(message, fullStack, ua);

    try {
        const { data: { session } } = await supabase.auth.getSession();

        await supabase.rpc('log_client_error', {
            p_error_hash: hash,
            p_error_message: message,
            p_stack_trace: fullStack,
            p_user_agent: ua,
            p_user_id: session?.user?.id || null,
            p_app_version: '1.0.0'
        });
    } catch (e) {
        // Silent fail
        console.warn("Failed to log to analytics");
    }
};

export const initErrorLogger = () => {
    if (isInitialized) return;
    isInitialized = true;

    // 1. Global Error Listener
    window.onerror = (msg, url, lineNo, columnNo, error) => {
        const stringMsg = typeof msg === 'string' ? msg : JSON.stringify(msg);
        const stack = error?.stack || `${url}:${lineNo}:${columnNo}`;
        logError(stringMsg, stack);
    };

    // 2. Unhandled Promise Rejections
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        const msg = reason?.message || 'Unhandled Rejection';
        const stack = reason?.stack || JSON.stringify(reason);
        logError(msg, stack);
    });
};
