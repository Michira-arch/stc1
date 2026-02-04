export const timeAgo = (timestamp: number | string | Date): string => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    if (isNaN(time)) return 'Unknown date';

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
        return new Date(timestamp).toLocaleDateString();
    }
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
};
