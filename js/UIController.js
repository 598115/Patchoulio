/**
 * UIController.js
 * Responsible for all DOM manipulation, event listeners for buttons/inputs,
 * and rendering of collections/items, including modals and messages.
 */
class UIController {
    constructor() {
        this.domElements = {
            userIdDisplay: document.getElementById('userIdDisplay'),
            messageBox: document.getElementById('messageBox'),
            newCollectionNameInput: document.getElementById('newCollectionName'),
            addCollectionBtn: document.getElementById('addCollectionBtn'),
            collectionsList: document.getElementById('collectionsList'),
            itemManagementSection: document.getElementById('itemManagementSection'),
            selectedCollectionNameDisplay: document.getElementById('selectedCollectionNameDisplay'),
            newItemNameInput: document.getElementById('newItemName'),
            newItemDescriptionInput: document.getElementById('newItemDescription'),
            newItemImageInput: document.getElementById('newItemImage'),
            newItemImagePreview: document.getElementById('newItemImagePreview'),
            addItemBtn: document.getElementById('addItemBtn'),
            itemsList: document.getElementById('itemsList')
        };

        this.selectedCollectionId = null;
        this.selectedCollectionName = '';
        this.eventListeners = {}; // To store references to event listeners for proper removal
    }

    /**
     * Displays a message in the message box.
     * @param {string} message - The message to display.
     * @param {string} type - 'success' or 'error'.
     */
    showMessage(message, type = 'error') {
        const { messageBox } = this.domElements;
        messageBox.textContent = message;
        messageBox.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'border-red-400', 'bg-green-100', 'text-green-700', 'border-green-400');
        messageBox.classList.add('show');

        if (type === 'error') {
            messageBox.classList.add('bg-red-100', 'text-red-700', 'border-red-400');
        } else if (type === 'success') {
            messageBox.classList.add('bg-green-100', 'text-green-700', 'border-green-400');
        }

        setTimeout(() => {
            messageBox.classList.remove('show');
            messageBox.classList.add('hidden');
        }, 3000); // Hide after 3 seconds
    }

    /**
     * Sets the user ID display (static for local storage).
     */
    setUserIdDisplay() {
        this.domElements.userIdDisplay.textContent = "Local User (No Authentication)";
    }

    /**
     * Renders the list of collections.
     * @param {Array} collections - An array of collection objects.
     * @param {function} onCollectionSelect - Callback when a collection is selected.
     * @param {function} onCollectionDelete - Callback when a collection delete is requested.
     */
    renderCollections(collections, onCollectionSelect, onCollectionDelete) {
        const { collectionsList } = this.domElements;
        collectionsList.innerHTML = ''; // Clear current list

        if (collections.length === 0) {
            collectionsList.innerHTML = '<p class="text-gray-500 text-center col-span-full">No collections yet. Add one above!</p>';
        } else {
            collections.forEach(collectionData => {
                const collectionCard = document.createElement('div');
                collectionCard.className = `collection-card ${this.selectedCollectionId === collectionData.id ? 'selected' : ''}`;
                collectionCard.dataset.collectionId = collectionData.id;
                collectionCard.dataset.collectionName = collectionData.name;
                collectionCard.innerHTML = `
                    <span class="font-semibold text-lg text-gray-800">${collectionData.name}</span>
                    <button class="delete-btn">Delete</button>
                `;

                // Use a closure to pass the correct collectionId and name to the event listeners
                const handleCardClick = (event) => {
                    if (event.target.classList.contains('delete-btn')) {
                        event.stopPropagation(); // Prevent card selection when delete is clicked
                        onCollectionDelete(collectionData.id, collectionData.name);
                    } else {
                        this.selectCollection(collectionData.id, collectionData.name);
                        onCollectionSelect(collectionData.id);
                    }
                };
                collectionCard.addEventListener('click', handleCardClick);
                collectionsList.appendChild(collectionCard);
            });
        }
    }

    /**
     * Sets the currently selected collection in the UI.
     * @param {string} id - The ID of the selected collection.
     * @param {string} name - The name of the selected collection.
     */
    selectCollection(id, name) {
        this.selectedCollectionId = id;
        this.selectedCollectionName = name;
        this.domElements.selectedCollectionNameDisplay.textContent = name;
        this.domElements.itemManagementSection.classList.remove('hidden');

        // Update selected visual for collection cards
        document.querySelectorAll('.collection-card').forEach(card => {
            if (card.dataset.collectionId === id) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }

    /**
     * Clears item input fields.
     */
    clearItemInputs() {
        this.domElements.newItemNameInput.value = '';
        this.domElements.newItemDescriptionInput.value = '';
        this.domElements.newItemImageInput.value = ''; // Clear the file input
        this.domElements.newItemImagePreview.src = ""; // Clear the image preview
        this.domElements.newItemImagePreview.classList.add('hidden'); // Hide the preview
    }

    /**
     * Handles previewing a newly selected image for an item.
     */
    previewNewItemImage() {
        const file = this.domElements.newItemImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.domElements.newItemImagePreview.src = e.target.result;
                this.domElements.newItemImagePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            this.domElements.newItemImagePreview.src = "";
            this.domElements.newItemImagePreview.classList.add('hidden');
        }
    }

    /**
     * Renders the list of items for a specific collection.
     * @param {Array} items - An array of item objects.
     * @param {function} onItemEdit - Callback when an item edit is requested.
     * @param {function} onItemDelete - Callback when an item delete is requested.
     */
    renderItems(items, onItemEdit, onItemDelete) {
        const { itemsList } = this.domElements;
        itemsList.innerHTML = ''; // Clear current list

        if (items.length === 0) {
            itemsList.innerHTML = '<p class="text-gray-500 text-center">No items in this collection yet. Add one above!</p>';
        } else {
            items.forEach(itemData => {
                const itemCard = document.createElement('div');
                itemCard.className = 'item-card';
                itemCard.innerHTML = `
                    <div class="flex items-center justify-between">
                        <h4 class="text-lg">${itemData.name}</h4>
                        <div>
                            <button class="edit-btn" data-item-id="${itemData.id}" data-item-name="${itemData.name}" data-item-description="${itemData.description || ''}" data-item-image="${itemData.image || ''}">Edit</button>
                            <button class="delete-btn" data-item-id="${itemData.id}">Delete</button>
                        </div>
                    </div>
                    ${itemData.description ? `<p>${itemData.description}</p>` : ''}
                    ${itemData.image ? `<img src="${itemData.image}" class="mt-2 rounded-md max-h-40 object-contain w-full">` : ''}
                `;
                itemsList.appendChild(itemCard);
            });

            // Attach event listeners for edit and delete buttons for items
            document.querySelectorAll('.item-card .delete-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const itemId = event.target.dataset.itemId;
                    onItemDelete(itemId);
                });
            });
            document.querySelectorAll('.item-card .edit-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const itemId = event.target.dataset.itemId;
                    const itemName = event.target.dataset.itemName;
                    const itemDescription = event.target.dataset.itemDescription;
                    const itemImage = event.target.dataset.itemImage;
                    onItemEdit(itemId, itemName, itemDescription, itemImage);
                });
            });
        }
    }

    /**
     * Shows a confirmation modal.
     * @param {string} message - The message to display in the modal.
     * @returns {Promise<boolean>} Resolves true if confirmed, false if canceled.
     */
    showConfirmationModal(message) {
        return new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-xl text-center">
                    <p class="text-lg mb-4">${message}</p>
                    <button id="confirmBtn" class="btn-primary mr-4">Yes</button>
                    <button id="cancelBtn" class="delete-btn">Cancel</button>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('confirmBtn').onclick = () => {
                modal.remove();
                resolve(true);
            };
            document.getElementById('cancelBtn').onclick = () => {
                modal.remove();
                resolve(false);
            };
        });
    }

    /**
     * Shows an item edit modal.
     * @param {string} itemId - The ID of the item being edited.
     * @param {string} currentName - Current item name.
     * @param {string} currentDescription - Current item description.
     * @param {string} currentImage - Current item image (Base64).
     * @returns {Promise<object|null>} Resolves with {name, description, image} or null if canceled.
     */
    showEditItemModal(itemId, currentName, currentDescription, currentImage) {
        return new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-xl w-80">
                    <h3 class="text-xl font-bold mb-4 text-gray-800">Edit Item</h3>
                    <div class="mb-4">
                        <label for="editItemName" class="block text-gray-700 text-sm font-bold mb-2">Item Name:</label>
                        <input type="text" id="editItemName" value="${currentName}" class="input-field">
                    </div>
                    <div class="mb-6">
                        <label for="editItemDescription" class="block text-gray-700 text-sm font-bold mb-2">Description:</label>
                        <textarea id="editItemDescription" class="input-field h-24">${currentDescription}</textarea>
                    </div>
                    <div class="mb-6">
                        <label for="editItemImage" class="block text-gray-700 text-sm font-bold mb-2">Image:</label>
                        <input type="file" id="editItemImage" accept="image/*" class="input-field">
                        <img id="editItemImagePreview" src="${currentImage}" alt="Current Image" class="mt-2 ${currentImage ? '' : 'hidden'} w-24 h-24 object-contain rounded-md border border-gray-300">
                        <button id="clearImageBtn" class="text-sm text-red-500 hover:underline mt-1 ${currentImage ? '' : 'hidden'}">Clear Image</button>
                    </div>
                    <div class="flex justify-end gap-3">
                        <button id="saveEditBtn" class="btn-primary">Save Changes</button>
                        <button id="cancelEditBtn" class="delete-btn">Cancel</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const editItemNameInput = document.getElementById('editItemName');
            const editItemDescriptionInput = document.getElementById('editItemDescription');
            const editItemImageInput = document.getElementById('editItemImage');
            const editItemImagePreview = document.getElementById('editItemImagePreview');
            const clearImageBtn = document.getElementById('clearImageBtn');
            let newImageBase64 = currentImage; // Start with the current image

            // Preview image in the edit modal
            editItemImageInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        editItemImagePreview.src = e.target.result;
                        editItemImagePreview.classList.remove('hidden');
                        clearImageBtn.classList.remove('hidden');
                        newImageBase64 = e.target.result; // Update newImageBase64 with the new selection
                    };
                    reader.readAsDataURL(file);
                } else {
                    editItemImagePreview.src = "";
                    editItemImagePreview.classList.add('hidden');
                    clearImageBtn.classList.add('hidden');
                    newImageBase64 = null;
                }
            });

            clearImageBtn.addEventListener('click', () => {
                newImageBase64 = null;
                editItemImageInput.value = ''; // Clear file input
                editItemImagePreview.src = "";
                editItemImagePreview.classList.add('hidden');
                clearImageBtn.classList.add('hidden');
            });

            document.getElementById('saveEditBtn').onclick = async () => {
                const name = editItemNameInput.value.trim();
                const description = editItemDescriptionInput.value.trim();
                if (!name) {
                    this.showMessage("Item name cannot be empty.", "error");
                    return;
                }
                modal.remove();
                resolve({ name, description, image: newImageBase64 });
            };
            document.getElementById('cancelEditBtn').onclick = () => {
                modal.remove();
                resolve(null);
            };
        });
    }

    /**
     * Gets the values from the new collection input field.
     * @returns {string} The collection name.
     */
    getNewCollectionInput() {
        return this.domElements.newCollectionNameInput.value.trim();
    }

    /**
     * Clears the new collection input field.
     */
    clearNewCollectionInput() {
        this.domElements.newCollectionNameInput.value = '';
    }

    /**
     * Gets the values from the new item input fields, including the image file.
     * @returns {object} An object with name, description, and imageFile.
     */
    getNewItemInput() {
        return {
            name: this.domElements.newItemNameInput.value.trim(),
            description: this.domElements.newItemDescriptionInput.value.trim(),
            imageFile: this.domElements.newItemImageInput.files[0]
        };
    }

    /**
     * Binds an event listener to an element.
     * @param {HTMLElement} element - The DOM element.
     * @param {string} eventType - The type of event (e.g., 'click', 'change').
     * @param {function} handler - The event handler function.
     */
    bindEvent(element, eventType, handler) {
        if (element) {
            element.addEventListener(eventType, handler);
            // Store handler to allow removal later if needed (e.g., for dynamically created elements)
            if (!this.eventListeners[element.id]) {
                this.eventListeners[element.id] = {};
            }
            this.eventListeners[element.id][eventType] = handler;
        }
    }

    /**
     * Removes a bound event listener.
     * @param {HTMLElement} element - The DOM element.
     * @param {string} eventType - The type of event.
     */
    removeEvent(element, eventType) {
        if (element && this.eventListeners[element.id] && this.eventListeners[element.id][eventType]) {
            element.removeEventListener(eventType, this.eventListeners[element.id][eventType]);
            delete this.eventListeners[element.id][eventType];
        }
    }

    /**
     * Retrieves the Base64 string from a file.
     * @param {File} file - The file object to convert.
     * @returns {Promise<string|null>} A promise that resolves with the Base64 string or null if no file.
     */
    async fileToBase64(file) {
        if (!file) return null;
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }
}

export default UIController;
