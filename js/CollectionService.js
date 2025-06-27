/**
 * CollectionService.js
 * Manages all data storage and retrieval logic using localStorage.
 */
class CollectionService {
    constructor(localStorageKey = 'collection_keeper_data') {
        this.localStorageKey = localStorageKey;
        this.collectionsData = [];
        this.loadFromLocalStorage();
    }

    /**
     * Saves the current collectionsData to local storage.
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem(this.localStorageKey, JSON.stringify(this.collectionsData));
        } catch (error) {
            console.error("Error saving to local storage:", error);
            // In a real app, you might want to notify the UI here
        }
    }

    /**
     * Loads collectionsData from local storage.
     */
    loadFromLocalStorage() {
        try {
            const storedData = localStorage.getItem(this.localStorageKey);
            if (storedData) {
                this.collectionsData = JSON.parse(storedData);
            } else {
                this.collectionsData = [];
            }
        } catch (error) {
            console.error("Error loading from local storage:", error);
            // Reset if corrupted
            this.collectionsData = [];
        }
    }

    /**
     * Returns all collections.
     * @returns {Array} An array of collection objects.
     */
    getCollections() {
        return this.collectionsData;
    }

    /**
     * Adds a new collection.
     * @param {string} name - The name of the new collection.
     * @returns {object} The newly added collection object.
     */
    addCollection(name) {
        const newId = crypto.randomUUID();
        const newCollection = {
            id: newId,
            name: name,
            items: []
        };
        this.collectionsData.push(newCollection);
        this.saveToLocalStorage();
        return newCollection;
    }

    /**
     * Deletes a collection by its ID.
     * @param {string} collectionId - The ID of the collection to delete.
     * @returns {boolean} True if deleted, false otherwise.
     */
    deleteCollection(collectionId) {
        const initialLength = this.collectionsData.length;
        this.collectionsData = this.collectionsData.filter(col => col.id !== collectionId);
        if (this.collectionsData.length < initialLength) {
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    /**
     * Gets items for a specific collection.
     * @param {string} collectionId - The ID of the collection.
     * @returns {Array} An array of item objects.
     */
    getItemsByCollectionId(collectionId) {
        const collection = this.collectionsData.find(col => col.id === collectionId);
        return collection ? collection.items : [];
    }

    /**
     * Adds a new item to a specific collection.
     * @param {string} collectionId - The ID of the collection.
     * @param {string} name - The name of the item.
     * @param {string} description - The description of the item.
     * @param {string|null} imageBase64 - Base64 string of the image, or null.
     * @returns {object|null} The newly added item object, or null if collection not found.
     */
    addItem(collectionId, name, description, imageBase64) {
        const collection = this.collectionsData.find(col => col.id === collectionId);
        if (collection) {
            const newId = crypto.randomUUID();
            const newItem = {
                id: newId,
                name: name,
                description: description,
                image: imageBase64
            };
            collection.items.push(newItem);
            this.saveToLocalStorage();
            return newItem;
        }
        return null;
    }

    /**
     * Updates an item in a specific collection.
     * @param {string} collectionId - The ID of the collection.
     * @param {string} itemId - The ID of the item to update.
     * @param {string} newName - The new name for the item.
     * @param {string} newDescription - The new description for the item.
     * @param {string|null} newImageBase64 - The new Base64 image data or null if cleared.
     * @returns {boolean} True if updated, false otherwise.
     */
    updateItem(collectionId, itemId, newName, newDescription, newImageBase64) {
        const collection = this.collectionsData.find(col => col.id === collectionId);
        if (collection) {
            const itemToUpdate = collection.items.find(item => item.id === itemId);
            if (itemToUpdate) {
                itemToUpdate.name = newName;
                itemToUpdate.description = newDescription;
                itemToUpdate.image = newImageBase64;
                this.saveToLocalStorage();
                return true;
            }
        }
        return false;
    }

    /**
     * Deletes an item from a specific collection.
     * @param {string} collectionId - The ID of the collection.
     * @param {string} itemId - The ID of the item to delete.
     * @returns {boolean} True if deleted, false otherwise.
     */
    deleteItem(collectionId, itemId) {
        const collection = this.collectionsData.find(col => col.id === collectionId);
        if (collection) {
            const initialLength = collection.items.length;
            collection.items = collection.items.filter(item => item.id !== itemId);
            if (collection.items.length < initialLength) {
                this.saveToLocalStorage();
                return true;
            }
        }
        return false;
    }
}

export default CollectionService;
