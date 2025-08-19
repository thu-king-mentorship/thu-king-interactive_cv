/**
 * The forward movement direction.
 * @type {number}
 */
const MOVEMENT_FORWARD = 1;

/**
 * The backward movement direction.
 * @type {number}
 */
const MOVEMENT_BACKWARD = -1;

/**
 * The stationary movement direction.
 * @type {number}
 */
const MOVEMENT_STATIONARY = 0;

/**
 * The main container for the camera.
 * @type {HTMLElement}
 */
const cameraContainer = document.querySelector(config.selectors.game.cameraContainer);

/**
 * The main container for the game.
 * @type {HTMLElement}
 */
const gameContainer = document.querySelector(config.selectors.game.gameContainer);

/**
 * The main container for the terrain.
 * @type {HTMLElement}
 */
const terrainContainer = document.querySelector(config.selectors.game.terrainContainer);

/**
 * The terrain element within the terrain container.
 * @type {HTMLElement}
 */
const terrain = document.querySelector(config.selectors.game.terrain);

/**
 * The character element
 * @type {HTMLElement}
 */
const character = document.querySelector(config.selectors.game.character);

/**
 * The textbox element
 * @type {HTMLElement}
 */
const textbox = document.createElement('div');
textbox.id = config.selectors.ui.textbox;
textbox.style.display = 'none';
cameraContainer.appendChild(textbox);

/**
 * The status bar element
 * @type {HTMLElement}
 */
const statusBar = document.createElement('div');
statusBar.id = config.selectors.ui.statusBar;
statusBar.style.display = 'none';
cameraContainer.appendChild(statusBar);

/**
 * A list of collision elements in the terrain.
 * @type {HTMLElement[]}
 */
let collisions = [];

/**
 * A map tracking active labels for interactable collisions.
 * @type {Map<string, HTMLElement>}
 */
const interactableCollisionsLabels = new Map();

let gameStarted = false; // Whether the game has started

let terrainPictureWidth; // Width of the terrain picture
let terrainPictureHeight; // Height of the terrain picture
let columnCount; // Number of columns in the terrain
let rowCount; // Number of rows in the terrain
let tileSize; // The size of the tiles

let gameContainerScale = 1; // Scale factor for the game container
let currentZoom = 1; // Keep track of the current zoom level
let targetZoom = 1; // Desired zoom level

let originalTerrainContainerWidth = 0; // Original width of the terrain container
let originalTerrainContainerHeight = 0; // Original height of the terrain container

let characterAngle = 0; // Angle in degrees
let offsetX = 0 // Background X offset
let offsetY = 0; // Background Y offset

let originalCharacterRect; // Original bounding rectangle for the character
let originalCharacterCenter; // Original center point for the character
let characterRect; // Bounding rectangle for the character
let characterCenter; // Center point for the character

let collisionRectsCache = []; // Cache for collision bounding rects
let collisionsWithinRelevanceRadius = []; // Tracks all collisions within radius
let collisionsWithinCollisionRadius = []; // Tracks all collisions the character is colliding with

let moveSpeed = 0; // Speed at which the player moves
let canMove = true; // Whether the player can move
let isMoving = false; // Whether the character is currently moving
let movingDirection = 0; // The direction in which the character is moving

let isTextboxVisible = false; // Whether the textbox is currently visible
let currentInteractable = null; // The interactable map object the player is inspecting
let currentItems = []; // The items of the current interactable
let selectedItemIndex = 0; // Index of the currently selected item in the items array

//#region Terrain, Grid and Camera

    /**
     * Updates the size of the camera and terrain based on window dimensions.
     */
    function updateLayout() {
        updateCameraSize();
        updateTerrainSize();
        calculateTileSize();
        updateMoveSpeed();
    }

    /**
     * Handles window resize events.
     */
    function handleResize() {
        updateLayout();
        updateCharacter();
        updateMapObjects();
        updateGrid();
        updateDrawnGizmos();
    }

    /**
     * Updates the camera size based on the window dimensions.
     */
    function updateCameraSize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Calculate aspect ratio
        const aspectRatio = config.resolution.width / config.resolution.height;

        // Calculate camera dimensions to preserve aspect ratio
        let cameraWidth, cameraHeight;
        if (windowWidth / windowHeight > aspectRatio) {
            // Window is wider than aspect ratio: limit by height
            cameraHeight = windowHeight;
            cameraWidth = cameraHeight * aspectRatio;
        } else {
            // Window is taller than aspect ratio: limit by width
            cameraWidth = windowWidth;
            cameraHeight = cameraWidth / aspectRatio;
        }

        // Apply camera dimensions
        cameraContainer.style.width = `${cameraWidth}px`;
        cameraContainer.style.height = `${cameraHeight}px`;

        // Center the camera
        cameraContainer.style.left = `${(windowWidth - cameraWidth) / 2}px`;
        cameraContainer.style.top = `${(windowHeight - cameraHeight) / 2}px`;

        // Update game container resolution
        if (cameraWidth < config.resolution.width || cameraHeight < config.resolution.height) {
            gameContainer.style.width = `${config.resolution.width}px`;
            gameContainer.style.height = `${config.resolution.height}px`;
            gameContainer.style.position = 'absolute';
        } else {
            gameContainer.style.width = `${cameraWidth}px`;
            gameContainer.style.height = `${cameraHeight}px`;
            gameContainer.style.position = 'relative';
        }
    }

    /**
     * Retrieves the dimensions of the terrain image.
     * @param {Function} callback - A callback function to execute after the image dimensions are retrieved.
     */
    function getTerrainDimensions(callback) {
        const style = terrain.currentStyle || window.getComputedStyle(terrain, false);
        const img = new Image();
        img.src = style.backgroundImage.replace(/url\((['\"])?(.*?)\1\)/gi, '$2').split(',')[0];
        img.onload = () => {
            terrainPictureWidth = img.width;
            terrainPictureHeight = img.height;
            columnCount = terrainPictureWidth / config.baseTileSize;
            rowCount = terrainPictureHeight / config.baseTileSize;
            callback();
        };
    }

    /**
     * Updates the terrain size based on the container dimensions.
     */
    function updateTerrainSize() {
        // Update terrain-container scale factor (100% of camera-container * scale factor)
        terrainContainer.style.width = `${gameContainer.offsetWidth * config.terrainScaleFactor}px`;
        terrainContainer.style.height = `${gameContainer.offsetHeight * config.terrainScaleFactor}px`;

        // Get the container dimensions
        const containerWidth = terrainContainer.offsetWidth;
        const containerHeight = terrainContainer.offsetHeight;

        // Initialize original dimensions if not set
        if (originalTerrainContainerWidth === 0 || originalTerrainContainerHeight === 0) {
            originalTerrainContainerWidth = containerWidth;
            originalTerrainContainerHeight = containerHeight;
        }

        // Compute scale factors based on the config resolution
        const widthScale = containerWidth / config.resolution.width;
        const heightScale = containerHeight / config.resolution.height;

        // Scale terrain only when resolution exceeds config dimensions
        const scale = Math.max(1, Math.min(widthScale, heightScale)); // Never shrink below 1

        // Apply scaling to terrain
        terrain.style.width = `${config.resolution.width * scale}px`;
        terrain.style.height = `${config.resolution.height * scale}px`;

        // Calculate bias for centering the terrain based on the difference from the original size
        const biasX = (containerWidth - originalTerrainContainerWidth) * 0.5;
        const biasY = (containerHeight - originalTerrainContainerHeight) * 0.5;

        // Center the terrain within the container
        terrain.style.left = `${(containerWidth - terrain.offsetWidth) / 2 + biasX}px`;
        terrain.style.top = `${(containerHeight - terrain.offsetHeight) / 2 + biasY}px`;
    }

    /**
     * Calculates the size of the tiles based on the terrain dimensions.
     */
    function calculateTileSize() {
        const tileWidth = terrain.clientWidth / columnCount;
        const tileHeight = terrain.clientHeight / rowCount;

        tileSize = Math.min(tileWidth, tileHeight);

        document.documentElement.style.setProperty('--tile-size', `${tileSize}px`);
    }

    /**
     * Updates the game container zoom based on proximity to collision interactables.
     */
    function updateGameContainerZoom() {
        let closestRelevantInteractable = collisionsWithinRelevanceRadius
                .filter(({ htmlElement }) => htmlElement.classList.contains('interactable'))
                .reduce((closest, current) => {
            return current.distanceSquared < closest.distanceSquared ? current : closest;
        }, { distanceSquared: Infinity });

        if (closestRelevantInteractable.distanceSquared === Infinity) {
            targetZoom = 1;
            return;
        }

        const distanceFactor = Math.max(0, (config.relevanceRadius - Math.sqrt(closestRelevantInteractable.distanceSquared)) / config.relevanceRadius);
        targetZoom = 1 + distanceFactor * config.zoomLevels.factor; // Adjust zoom factor
        targetZoom = Math.min(Math.max(targetZoom, config.zoomLevels.min), config.zoomLevels.max); // Clamp zoom between min and max

        // Combine with game container scaling
        gameContainer.style.transform = `scale(${gameContainerScale * targetZoom})`;
    }

    /**
     * Applies transformations to the terrain based on movement.
     */
    function applyCameraAndTerrainTransforms() {
        terrainContainer.style.transform = `translate(-50%, -50%) rotateX(${config.inclinationAngle}deg) rotate(${characterAngle}deg)`;
        terrain.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }

//#endregion Terrain, Grid and Camera

//#region Character

    /**
     * Sets the character's initial position based on the starting row and column.
     * @param {number} startRow - The starting row for the character.
     * @param {number} startCol - The starting column for the character.
     */
    function setCharacterStartPosition(startRow, startCol) {
        const localTileWidth = terrainContainer.offsetWidth / columnCount;
        const localTileHeight = terrainContainer.offsetHeight / rowCount;
        offsetX = terrainContainer.offsetWidth / 2 - localTileWidth * startCol - localTileWidth * 0.25;
        offsetY = terrainContainer.offsetHeight / 2 - localTileHeight * startRow - localTileHeight * 0.5;
    }

    /**
     * Updates the character's position and appearance.
     */
    function updateCharacter() {
        //updateCharacterTransform();
        updateCharacterOffset();
        updateCharacterRect();
    }

    /**
     * Updates the character's transform based on its rotation angle.
     */
    function updateCharacterTransform() {
        const transforms = config.character.transforms;

        // Normalize angle
        const angle = (characterAngle % 360 + 360) % 360;

        // Convert keys to an ordered array
        const keys = Object.keys(transforms).map(Number).sort((a, b) => a - b);

        // If exact match for angle, use the predefined values
        if (keys.includes(angle)) {
            const transform = transforms[angle];
            character.style.transform = `translate(${transform.x}%, ${transform.y}%)`;
            return;
        }

        // Find the lower and upper bounds
        let lowerBound = -1;
        let upperBound = -1;

        for (let i = 0; i < keys.length; i++) {
            if (keys[i] <= angle) {
                lowerBound = keys[i];
            }
            if (keys[i] >= angle) {
                upperBound = keys[i];
                break;
            }
        }

        // Handle wrap-around cases
        if (lowerBound === -1) lowerBound = Math.max(...keys); // Wrap to max key
        if (upperBound === -1) upperBound = Math.min(...keys); // Wrap to 0

        // Interpolate between the two bounds
        const lowerTransform = transforms[lowerBound];
        const upperTransform = transforms[upperBound];

        // Handle interpolation across the 0-degree boundary
        const range = (upperBound === 0 ? 360 : upperBound) - lowerBound;
        const progress = (angle - lowerBound) / range;

        const interpolatedX = lowerTransform.x + progress * (upperTransform.x - lowerTransform.x);
        const interpolatedY = lowerTransform.y + progress * (upperTransform.y - lowerTransform.y);

        // Apply the interpolated transform
        character.style.transform = `translate(${interpolatedX}%, ${interpolatedY}%)`;
    }

    /**
     * Updates the character's offset based on its position.
     */
    function updateCharacterOffset() {
        if (characterRect === undefined || characterCenter === undefined) {
            return;
        }
        const newCharacterRect = character.getBoundingClientRect();
        const newCharacterCenter = { x: newCharacterRect.left + newCharacterRect.width / 2, y: newCharacterRect.top + newCharacterRect.height / 2 };
        const deltaX = newCharacterCenter.x - characterCenter.x;
        const deltaY = newCharacterCenter.y - characterCenter.y;
        offsetX += deltaX;
        offsetY += deltaY;
        characterRect = newCharacterRect;
        characterCenter = newCharacterCenter;
    }

    /**
     * Updates the character's bounding rectangle.
     */
    function updateCharacterRect() {
        characterRect = character.getBoundingClientRect();
        characterCenter = { x: characterRect.left + characterRect.width / 2, y: characterRect.top + characterRect.height / 2 };
    }

//#endregion Character

//#region Map Objects and Collisions

    /**
     * Creates the map objects.
     */
    function createMapObjects() {
        config.mapObjects.forEach(obj => {
            const div = document.createElement('div');
            div.id = obj.id;
            div.classList.add('collision', 'obstacle');
            if (obj.type === 'interactable') {
                div.classList.add('interactable');
                div.dataset.name = obj.name;
            }
            div.dataset.row = obj.row;
            div.dataset.col = obj.col;
            terrain.appendChild(div);
        });
    }

    /**
     * Fetches the map objects.
     */
    function fetchMapObjects() {
        collisions = Array.from(document.querySelectorAll(config.selectors.game.collision));
    }

    /**
     * Updates the map objects.
     */
    function updateMapObjects() {
        fetchMapObjects();
        positionMapObjects();
        updateCollisionRects();
        updateRelevanceRadius();
        updateCollisionRadius();
        updateGameContainerZoom();
        updateInteractableLabels();
    }

    /**
     * Positions the map objects within the terrain.
     */
    function positionMapObjects() {
        collisions.forEach(collision => {
            const row = parseInt(collision.dataset.row, 10);
            const col = parseInt(collision.dataset.col, 10);
            collision.style.left = `${col * tileSize}px`;
            collision.style.top = `${row * tileSize}px`;
            collision.style.width = `${tileSize}px`;
            collision.style.height = `${tileSize}px`;
        });
    }

    /**
     * Updates the cache of collisions bounding rectangles.
     */
    function updateCollisionRects() {
        collisionRectsCache = collisions.map(collision => {
            const rect = collision.getBoundingClientRect();
            const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            return { id: collision.id, rect, center, htmlElement: collision };
        });
    }

    /**
     * Updates the list of collisions within a certain radius of the character.
     */
    function updateRelevanceRadius() {
        const relevanceRadiusSquared = Math.pow(config.relevanceRadius, 2);
        collisionsWithinRelevanceRadius = collisionRectsCache
            .map(({ id, rect, center, htmlElement }) => {
                const distanceSquared = Math.pow(center.x - characterCenter.x, 2) +
                                        Math.pow(center.y - characterCenter.y, 2);
                return { id, rect, center, htmlElement, distanceSquared };
            })
            .filter(({ distanceSquared }) => distanceSquared <= relevanceRadiusSquared);
    }

    /**
     * Updates the list of collisions the character is colliding with.
     */
    function updateCollisionRadius() {
        const collisionRadiusSquared = Math.pow(config.collisionRadius, 2);
        collisionsWithinCollisionRadius = collisionsWithinRelevanceRadius
            .filter(({ distanceSquared }) => distanceSquared <= collisionRadiusSquared);
        const interactable = collisionsWithinCollisionRadius.find(({ htmlElement }) =>
            htmlElement.classList.contains('interactable')
        );
        if (interactable) {
            currentInteractable = interactable.htmlElement;
            const interactableId = currentInteractable.id;
            currentItems = config.interactables[interactableId] || [];
            selectedItemIndex = 0;
        } else {
            currentInteractable = null;
            currentItems = [];
            statusBar.style.display = 'none';
        }
    }

    /**
     * Updates labels for interactables currently within the display distance.
     */
    function updateInteractableLabels() {
        for (const { id, rect, htmlElement } of collisionsWithinRelevanceRadius) {
            if (!htmlElement.classList.contains('interactable')) {
                continue;
            }
            const labelId = `label-${id}`;
            let label = document.getElementById(labelId);
            if (!label) {
                label = document.createElement('div');
                label.id = labelId;
                label.className = 'interactable-label-fixed';
                document.body.appendChild(label);
                interactableCollisionsLabels.set(id, label);
            }
            label.textContent = htmlElement.dataset.name;
            label.style.left = `${rect.left + rect.width / 2}px`;
            label.style.top = `${rect.top - 20}px`;
        }

        // Remove labels for interactables no longer within radius
        for (const [id, label] of interactableCollisionsLabels) {
            if (!collisionsWithinRelevanceRadius.find(obj => obj.id === id)) {
                label.remove();
                interactableCollisionsLabels.delete(id);
            }
        }
    }

//#endregion Map Objects and Collisions

//#region Movement

    /**
     * Updates the terrain's rotation and position based on character movement.
     */
    function handleMovement() {
        updateLayout();
        updateCharacter();
        applyCameraAndTerrainTransforms();
        updateMapObjects();
        updateDrawnGizmos();
    }

    /**
     * Checks if the character can move in the given direction.
     * @param {number} direction - The direction of movement (1 for forward, -1 for backward).
     * @returns {boolean} Whether the character can move.
     */
    function isMovementPossible(direction) {
        const step = direction * config.moveSpeed;
        const futureX = characterCenter.x + step * Math.sin((characterAngle * Math.PI) / 180);
        const futureY = characterCenter.y - step * Math.cos((characterAngle * Math.PI) / 180);

        for (const { rect, htmlElement } of collisionRectsCache) {
            if (!htmlElement.classList.contains('collision')) {
                continue;
            }
            if (
                futureX > rect.left &&
                futureX < rect.right &&
                futureY > rect.top &&
                futureY < rect.bottom
            ) {
                // Adjust the position slightly to escape
                offsetX += config.escapeAdjustment * Math.cos((characterAngle * Math.PI) / 180);
                offsetY += config.escapeAdjustment * Math.sin((characterAngle * Math.PI) / 180);
                return false;
            }
        }

        return true;
    }

    /**
     * Updates moveSpeed based on the current resolution.
     */
    function updateMoveSpeed() {
        const baseResolutionDiagonal = Math.sqrt(
            Math.pow(config.resolution.width, 2) + Math.pow(config.resolution.height, 2)
        );
        const currentResolutionDiagonal = Math.sqrt(
            Math.pow(gameContainer.offsetWidth, 2) + Math.pow(gameContainer.offsetHeight, 2)
        );
        const scale = currentResolutionDiagonal / baseResolutionDiagonal;
        moveSpeed = config.moveSpeed * scale;
    }

//#endregion Movement

//#region Input Handling

    /**
     * Handles key press events for movement and rotation.
     * @param {KeyboardEvent} e - The keydown event.
     */
    function handleKeyDown(e) {
        const validKeys = [
            ...config.keybindings.up,
            ...config.keybindings.down,
            ...config.keybindings.left,
            ...config.keybindings.right,
            config.keybindings.interact,
            config.keybindings.cancel,
        ];
        if (!validKeys.includes(e.key.toLowerCase())) {
            return;
        }

        // Textbox logic
        if (isTextboxVisible) {
            if (config.keybindings.up.includes(e.key.toLowerCase())) {
                navigateInteractionMenuItems(-1);
            } else if (config.keybindings.down.includes(e.key.toLowerCase())) {
                navigateInteractionMenuItems(1);
            } else if (e.key.toLowerCase() === config.keybindings.cancel) {
                hideInteractionMenu();
            }
            return;
        }

        // Interactable logic
        if (e.key.toLowerCase() === config.keybindings.interact && currentInteractable) {
            showInteractionMenu();
            return;
        }

        // Movement logic
        if (!canMove) {
            return;
        }

        let newX = offsetX;
        let newY = offsetY;

        if (config.keybindings.up.includes(e.key.toLowerCase())) {
            if (isMovementPossible(MOVEMENT_FORWARD)) {
                newX += config.moveSpeed * Math.sin((characterAngle * Math.PI) / 180);
                newY += config.moveSpeed * Math.cos((characterAngle * Math.PI) / 180);
                isMoving = true;
                movingDirection = MOVEMENT_FORWARD;
                if (config.animateMovement.directions.forward) {
                    character.classList.remove('facing_backward', 'facing_left', 'facing_right');
                    character.classList.add('walking_forward', 'facing_forward');
                }
            }
        } else if (config.keybindings.down.includes(e.key.toLowerCase())) {
            if (isMovementPossible(MOVEMENT_BACKWARD)) {
                newX -= config.moveSpeed * Math.sin((characterAngle * Math.PI) / 180);
                newY -= config.moveSpeed * Math.cos((characterAngle * Math.PI) / 180);
                isMoving = true;
                movingDirection = MOVEMENT_BACKWARD;
                if (config.animateMovement.directions.backward) {
                    character.classList.remove('facing_forward', 'facing_left', 'facing_right');
                    character.classList.add('walking_backward', 'facing_backward');
                }
            }
        } else if (config.keybindings.left.includes(e.key.toLowerCase())) {
            characterAngle = (characterAngle + config.rotationIncrement) % 360;
            if (config.animateMovement.directions.left) {
                character.classList.remove('facing_forward', 'facing_backward', 'facing_right');
                character.classList.add('facing_left');
            }
        } else if (config.keybindings.right.includes(e.key.toLowerCase())) {
            characterAngle = (characterAngle - config.rotationIncrement + 360) % 360;
            if (config.animateMovement.directions.right) {
                character.classList.remove('facing_forward', 'facing_backward', 'facing_left');
                character.classList.add('facing_right');
            }
        }

        offsetX = newX;
        offsetY = newY;

        handleMovement();
    }

    /**
     * Handles key release events.
     * @param {KeyboardEvent} e - The keyup event.
     */
    function handleKeyUp(e) {
        const validKeys = [
            ...config.keybindings.up,
            ...config.keybindings.down,
            ...config.keybindings.left,
            ...config.keybindings.right,
        ];
        if (!validKeys.includes(e.key.toLowerCase())) {
            return;
        }
        // Movement logic
        if (!canMove) {
            return;
        }
        if ([
            ...config.keybindings.up,
            ...config.keybindings.down,
        ].includes(e.key.toLowerCase())) {
            isMoving = false;
            movingDirection = MOVEMENT_STATIONARY;
            character.classList.remove('walking_forward', 'walking_backward');
        }
    }

//#endregion Input Handling

//#region UI

    /**
     * Shows the textbox with the current interactable's details.
     */
    function showInteractionMenu() {
        if (!currentInteractable || currentItems.length === 0 || isTextboxVisible) {
            return;
        }

        canMove = false;

        textbox.innerHTML = '';
        currentItems.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'textbox-item';
            itemElement.textContent = `${item.subtitle}: ${item.title}`;
            if (index === selectedItemIndex) {
                itemElement.classList.add('selected');
            }
            textbox.appendChild(itemElement);
        });

        statusBar.textContent = currentItems[selectedItemIndex]?.status || '';
        textbox.style.display = 'block';
        statusBar.style.display = 'block';
        isTextboxVisible = true;
    }

    /**
     * Hides the textbox and resumes movement.
     */
    function hideInteractionMenu() {
        canMove = true;
        textbox.style.display = 'none';
        statusBar.style.display = 'none';
        isTextboxVisible = false;
    }

    /**
     * Updates the status bar with a one-liner from the interactable items.
     */
    function updateStatusBar() {
        if (!currentItems.length) {
            return;
        }
        statusBar.textContent = currentItems[selectedItemIndex];
        statusBar.style.display = 'block';
    }

    /**
     * Navigates the items in the textbox and updates the status bar.
     * @param {number} direction - The direction to navigate (1 for down, -1 for up).
     */
    function navigateInteractionMenuItems(direction) {
        if (!isTextboxVisible || currentItems.length === 0) {
            return;
        }

        // Update selected item index
        selectedItemIndex = (selectedItemIndex + direction + currentItems.length) % currentItems.length;

        // Update the UI
        const itemElements = Array.from(textbox.children);
        itemElements.forEach((el, index) => el.classList.toggle('selected', index === selectedItemIndex));

        // Update the status bar
        statusBar.textContent = currentItems[selectedItemIndex]?.status || '';
    }

//#endregion UI

//#region Debug

    /**
     * Updates the drawn gizmos for debugging purposes.
     */
    function updateDrawnGizmos() {
        if (!config.debug) {
            return;
        }

        // Delete all gizmos
        const gizmos = document.querySelectorAll('.gizmo');
        gizmos.forEach(gizmo => gizmo.remove());

        // Create the gizmo container
        let gizmoContainer = document.getElementById(config.selectors.debug.gizmoContainer);
        if (!gizmoContainer) {
            gizmoContainer = document.createElement('div');
            gizmoContainer.id = config.selectors.debug.gizmoContainer;
            document.body.appendChild(gizmoContainer);
        }

        // Draw character gizmo
        const characterGizmo = document.createElement('div');
        characterGizmo.className = 'gizmo gizmo-character';
        characterGizmo.style.left = `${characterRect.left}px`;
        characterGizmo.style.top = `${characterRect.top}px`;
        characterGizmo.style.width = `${characterRect.width}px`;
        characterGizmo.style.height = `${characterRect.height}px`;
        characterGizmo.style.position = 'absolute';
        characterGizmo.style.border = collisionsWithinCollisionRadius.length ? '2px solid red' : '2px solid green';
        gizmoContainer.appendChild(characterGizmo);

        // Draw collision gizmos
        for (const { id, rect } of collisionRectsCache) {
            const gizmoCollision = document.createElement('div');
            gizmoCollision.className = 'gizmo gizmo-collision';
            gizmoCollision.style.left = `${rect.left}px`;
            gizmoCollision.style.top = `${rect.top}px`;
            gizmoCollision.style.width = `${rect.width}px`;
            gizmoCollision.style.height = `${rect.height}px`;
            gizmoCollision.style.position = 'absolute';
            gizmoCollision.style.border = `2px solid ${collisionsWithinRelevanceRadius.find(obj => obj.id === id) ? 'yellow' : 'green'}`;
            gizmoCollision.style.border = `2px solid ${collisionsWithinCollisionRadius.find(obj => obj.id === id) ? 'red' : gizmoCollision.style.border}`;
            gizmoContainer.appendChild(gizmoCollision);
        }
    }

    /**
     * Updates the grid overlay.
     */
    function updateGrid() {
        if (!config.debug) {
            return;
        }
        // Draw gizmo grid
        let grid = document.getElementById(config.selectors.debug.grid);
        if (grid) {
            grid.remove();
        }
        grid = document.createElement('div');
        grid.id = config.selectors.debug.grid;
        terrain.appendChild(grid);
        for (let i = 0; i < columnCount; i++) {
            for (let j = 0; j < rowCount; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.setAttribute('data-row', j);
                cell.setAttribute('data-col', i);
                cell.style.left = `${i * tileSize}px`;
                cell.style.top = `${j * tileSize}px`;
                const text = document.createElement('div');
                text.textContent = `${i}, ${j}`;
                text.className = 'grid-cell-text';
                cell.appendChild(text);
                grid.appendChild(cell);
            }
        }
    }

//#endregion Debug

/**
 * Sets up event listeners
 */
function setupEventListeners() {
    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

/**
 * Initializes the game.
 */
function initialize() {
    document.querySelector(config.selectors.ui.title).textContent = config.gameTitle.title;
    document.querySelector(config.selectors.ui.subtitle).textContent = config.gameTitle.subtitle;

    document.documentElement.style.setProperty('--terrain-scale-factor', config.terrainScaleFactor);
    document.documentElement.style.setProperty('--tile-size', `${config.baseTileSize}px`);
    document.documentElement.style.setProperty('--movement-animation-duration', `${config.animateMovement.duration}s`);

    createMapObjects();
    
    getTerrainDimensions(() => {
        updateLayout();
        setCharacterStartPosition(config.character.startRow, config.character.startCol);
        updateCharacter();
        applyCameraAndTerrainTransforms();
        updateMapObjects();
        updateGrid();
        updateDrawnGizmos();
        requestAnimationFrame(update);
    });
    setupEventListeners();
}

/**
 * Main game loop that handles continuous updates
 */
function update() {
    // Smoothly adjust zoom toward the target zoom
    if (currentZoom !== targetZoom) {
        currentZoom += (targetZoom - currentZoom) * 0.1; // Adjust the smoothing factor (0.1) as needed
        gameContainer.style.transform = `scale(${currentZoom})`;
    }
    requestAnimationFrame(update);
}

// Initialize
initialize();
