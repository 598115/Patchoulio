/**
 * CollectionApp.js
 * The central application logic that initializes and orchestrates
 * CollectionService and UIController.
 */
import CollectionService from './CollectionService.js';
import UIController from './UIController.js';

class CollectionApp {
    constructor() {
        this.collectionService = new CollectionService();
        this.uiController = new UIController();
        this.selectedCollectionId = null;
    }

    /**
     * Initializes the application.
     */
    init() {
        this.uiController.setUserIdDisplay();
        this.loadAndRenderCollections();
        this.bindEventListeners();
    }

    /**
     * Binds all necessary event listeners for the application.
     */
    bindEventListeners() {
        // Collection-related events
        this.uiController.bindEvent(
            this.uiController.domElements.addCollectionBtn,
            'click',
            this.handleAddCollection.bind(this)
        );
        this.uiController.bindEvent(
            this.uiController.domElements.newCollectionNameInput,
            'keypress',
            (e) => { if (e.key === 'Enter') this.handleAddCollection(); }
        );

        // Item-related events
        this.uiController.bindEvent(
            this.uiController.domElements.addItemBtn,
            'click',
            this.handleAddItem.bind(this)
        );
        this.uiController.bindEvent(
            this.uiController.domElements.newItemNameInput,
            'keypress',
            (e) => { if (e.key === 'Enter') this.handleAddItem(); }
        );
        this.uiController.bindEvent(
            this.uiController.domElements.newItemDescriptionInput,
            'keypress',
            (e) => { if (e.key === 'Enter') this.handleAddItem(); }
        );
        this.uiController.bindEvent(
            this.uiController.domElements.newItemImageInput,
            'change',
            this.uiController.previewNewItemImage.bind(this.uiController)
        );
    }

    /**
     * Loads collections from service and renders them.
     */
    loadAndRenderCollections() {
        const collections = this.collectionService.getCollections();
        this.uiController.renderCollections(
            collections,
            this.handleCollectionSelect.bind(this),
            this.handleCollectionDelete.bind(this)
        );
    }

    /**
     * Handles adding a new collection.
     */
    handleAddCollection() {
        const name = this.uiController.getNewCollectionInput();
        if (!name) {
            this.uiController.showMessage("Collection name cannot be empty.");
            return;
        }
        this.collectionService.addCollection(name);
        this.uiController.clearNewCollectionInput();
        this.loadAndRenderCollections(); // Re-render all collections
        this.uiController.showMessage("Collection added successfully!", "success");
    }

    /**
     * Handles selecting a collection.
     * @param {string} collectionId - The ID of the selected collection.
     */
    handleCollectionSelect(collectionId) {
        this.selectedCollectionId = collectionId;
        const selectedCollection = this.collectionService.getCollections().find(col => col.id === collectionId);
        if (selectedCollection) {
            this.uiController.selectCollection(collectionId, selectedCollection.name);
            this.loadAndRenderItems(collectionId);
        }
    }

    /**
     * Handles deleting a collection.
     * @param {string} collectionId - The ID of the collection to delete.
     * @param {string} collectionName - The name of the collection (for confirmation).
     */
    async handleCollectionDelete(collectionId, collectionName) {
        const confirmed = await this.uiController.showConfirmationModal(
            `Are you sure you want to delete collection "${collectionName}" and all its items?`
        );
        if (confirmed) {
            const deleted = this.collectionService.deleteCollection(collectionId);
            if (deleted) {
                // If the deleted collection was the currently selected one, clear selection
                if (this.selectedCollectionId === collectionId) {
                    this.selectedCollectionId = null;
                    this.uiController.domElements.itemManagementSection.classList.add('hidden');
                    this.uiController.domElements.itemsList.innerHTML = '';
                }
                this.loadAndRenderCollections();
                this.uiController.showMessage("Collection deleted successfully!", "success");
            } else {
                this.uiController.showMessage("Failed to delete collection.", "error");
            }
        }
    }

    /**
     * Loads items for the selected collection and renders them.
     * @param {string} collectionId - The ID of the collection whose items to load.
     */
    loadAndRenderItems(collectionId) {
        const items = this.collectionService.getItemsByCollectionId(collectionId);
        this.uiController.renderItems(
            items,
            this.handleItemEdit.bind(this),
            this.handleItemDelete.bind(this)
        );
    }

    /**
     * Handles adding a new item to the selected collection.
     */
    async handleAddItem() {
        if (!this.selectedCollectionId) {
            this.uiController.showMessage("Please select a collection first.");
            return;
        }

        const { name, description, imageFile } = this.uiController.getNewItemInput();
        if (!name) {
            this.uiController.showMessage("Item name cannot be empty.");
            return;
        }

        const imageBase64 = await this.uiController.fileToBase64(imageFile);

        const newItem = this.collectionService.addItem(this.selectedCollectionId, name, description, imageBase64);
        if (newItem) {
            this.uiController.clearItemInputs();
            this.loadAndRenderItems(this.selectedCollectionId);
            this.uiController.showMessage("Item added successfully!", "success");
        } else {
            this.uiController.showMessage("Failed to add item. Selected collection not found.", "error");
        }
    }

    /**
     * Handles editing an item.
     * @param {string} itemId - The ID of the item to edit.
     * @param {string} currentName - The current name of the item.
     * @param {string} currentDescription - The current description of the item.
     * @param {string} currentImage - The current Base64 image data.
     */
    async handleItemEdit(itemId, currentName, currentDescription, currentImage) {
        const result = await this.uiController.showEditItemModal(itemId, currentName, currentDescription, currentImage);
        if (result) {
            const { name, description, image } = result;
            const updated = this.collectionService.updateItem(this.selectedCollectionId, itemId, name, description, image);
            if (updated) {
                this.loadAndRenderItems(this.selectedCollectionId);
                this.uiController.showMessage("Item updated successfully!", "success");
            } else {
                this.uiController.showMessage("Failed to update item.", "error");
            }
        }
    }

    /**
     * Handles deleting an item.
     * @param {string} itemId - The ID of the item to delete.
     */
    async handleItemDelete(itemId) {
        const confirmed = await this.uiController.showConfirmationModal(
            "Are you sure you want to delete this item?"
        );
        if (confirmed) {
            const deleted = this.collectionService.deleteItem(this.selectedCollectionId, itemId);
            if (deleted) {
                this.loadAndRenderItems(this.selectedCollectionId);
                this.uiController.showMessage("Item deleted successfully!", "success");
            } else {
                this.uiController.showMessage("Failed to delete item.", "error");
            }
        }
    }
}

// Initialize the app when the window loads
window.addEventListener('load', () => {
    const app = new CollectionApp();
    app.init();
});
