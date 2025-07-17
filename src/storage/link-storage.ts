import AsyncStorage from "@react-native-async-storage/async-storage";

const LINK_STORAGE_KEY = 'links-storage';

export type LinkStorage = {
    id: string;
    category: string;
    name: string;
    url: string;
}

async function get(): Promise<LinkStorage[]> {
    try {
        const storage = await AsyncStorage.getItem(LINK_STORAGE_KEY);
        const response = storage ? JSON.parse(storage) : [];
        return response ? response : [];
    } catch (error) {
        console.error("Error fetching links:", error);
        return [];
    }
}

async function save(newLink: LinkStorage): Promise<void> {
    try {
        //const existingLinks = await AsyncStorage.getItem(LINK_STORAGE_KEY);
        //const links: LinkStorage[] = existingLinks ? JSON.parse(existingLinks) : [];

        const storage = await get();
        const update = JSON.stringify([...storage, newLink]);
        
        await AsyncStorage.setItem(LINK_STORAGE_KEY, update);
    } catch (error) {
        throw (error);
    }
}

async function remove(id: string){
    try {
        const storage = await get();
        const updated = storage.filter(link => link.id !== id);
        if (updated.length === 0) {
            await AsyncStorage.removeItem(LINK_STORAGE_KEY);
            return updated  ? updated : [];
        } else if (updated.length > 0) {
            await AsyncStorage.setItem(LINK_STORAGE_KEY, JSON.stringify(updated));
            return [];
        }
    } catch (error) {
        console.error("Error removing link:", error);
        throw error;
    }
}

export const linkStorage = {get, save, remove};