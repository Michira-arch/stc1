
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ChatDB extends DBSchema {
    conversations: {
        key: string;
        value: {
            id: string;
            title: string;
            lastMessage: string;
            timestamp: number;
            messages: { role: 'user' | 'assistant'; content: string }[];
        };
        indexes: { 'by-timestamp': number };
    };
}

const DB_NAME = 'stc-chat-db';
const STORE_NAME = 'conversations';
const MAX_CONVERSATIONS = 5;

let dbPromise: Promise<IDBPDatabase<ChatDB>>;

export const initChatDB = () => {
    if (!dbPromise) {
        dbPromise = openDB<ChatDB>(DB_NAME, 1, {
            upgrade(db) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('by-timestamp', 'timestamp');
            },
        });
    }
    return dbPromise;
};

export const saveConversation = async (conversation: any) => {
    const db = await initChatDB();
    await db.put(STORE_NAME, conversation);
    await pruneConversations();
};

export const getConversations = async () => {
    const db = await initChatDB();
    return db.getAllFromIndex(STORE_NAME, 'by-timestamp');
};

export const getConversation = async (id: string) => {
    const db = await initChatDB();
    return db.get(STORE_NAME, id);
};

export const clearConversations = async () => {
    const db = await initChatDB();
    await db.clear(STORE_NAME);
}

// Keep only the 5 most recent
const pruneConversations = async () => {
    const db = await initChatDB();
    const keys = await db.getAllKeysFromIndex(STORE_NAME, 'by-timestamp');

    if (keys.length > MAX_CONVERSATIONS) {
        // Delete oldest (since index is ascending by default, oldest are at the beginning? Wait, timestamp ascending means oldest is first. Yes.)
        const keysToDelete = keys.slice(0, keys.length - MAX_CONVERSATIONS);
        for (const key of keysToDelete) {
            await db.delete(STORE_NAME, key);
        }
    }
};
