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
                    const preserveKeys = ['theme', 'user_preferences', 'supabase.auth.token']; // Add other keys as needed
                    const preservedData: Record<string, string | null> = {};

                    // Backup preserved keys
                    preserveKeys.forEach(key => {
                        const value = localStorage.getItem(key);
                        if (value !== null) {
                            preservedData[key] = value;
                        }
                    });

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
