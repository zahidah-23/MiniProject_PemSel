export function openDB(): Promise<IDBDatabase>;
export function setItem(key: string, value: any): Promise<void>;
export function getItem(key: string): Promise<any>;
export function removeItem(key: string): Promise<void>;