import { useEffect } from 'react';

const VersionManager = () => {
    useEffect(() => {
        const checkVersion = async () => {
            try {
                const response = await fetch('/version.json', { cache: 'no-store' });
                const data = await response.json();
                const serverVersion = data.version;
                const localVersion = localStorage.getItem('app_version');

                if (localVersion && localVersion !== serverVersion) {
                    console.log('New version detected:', serverVersion);

                    // Whitelist of keys to preserve
                    const explicitPreserveKeys = ['theme', 'user_preferences'];
                    const preservedData: Record<string, string | null> = {};

                    // Backup explicitly preserved keys
                    explicitPreserveKeys.forEach(key => {
                        const value = localStorage.getItem(key);
                        if (value !== null) {
                            preservedData[key] = value;
                        }
                    });

                    // Dynamically preserve Supabase Auth tokens (keys usually start with 'sb-' or contain 'supabase')
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
                            preservedData[key] = localStorage.getItem(key);
                        }
                    }

                    // Clear storage
                    localStorage.clear();
                    sessionStorage.clear();

                    // Additional cache clearing if needed (e.g. caches API)
                    if ('caches' in window) {
                        const cacheNames = await caches.keys();
                        await Promise.all(cacheNames.map(name => caches.delete(name)));
                    }

                    // Unregister Service Workers
                    if ('serviceWorker' in navigator) {
                        const registrations = await navigator.serviceWorker.getRegistrations();
                        for (const registration of registrations) {
                            await registration.unregister();
                        }
                    }

                    // Restore preserved keys
                    Object.entries(preservedData).forEach(([key, value]) => {
                        if (value !== null) {
                            localStorage.setItem(key, value);
                        }
                    });

                    // Update version
                    localStorage.setItem('app_version', serverVersion);

                    // Reload to apply changes
                    window.location.reload();
                } else if (!localVersion) {
                    // First run, just set the version
                    localStorage.setItem('app_version', serverVersion);
                }
            } catch (error) {
                console.error('Failed to check version:', error);
            }
        };

        checkVersion();
    }, []);

    return null;
};

export default VersionManager;
