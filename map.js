/**
 * The dormant movement direction.
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
 * The main container for the terrain.
 * @type {HTMLElement}
 */
const terrainContainer = document.getElementById('terrain-container');

/**
 * The main container for the game.
 * @type {HTMLElement}
 */
const gameContainer = document.getElementById('game-container');

/**
 * The terrain element within the terrain container.
 * @type {HTMLElement}
 */
const terrain = document.getElementById('terrain');

/**
 * A list of obstacle elements in the terrain.
 * @type {HTMLElement[]}
 */
const obstacles = Array.from(document.querySelectorAll('.obstacle'));

/**
 * The character element
 * @type {HTMLElement}
 */
const character = document.getElementById('character');

/**
 * A map tracking active labels for obstacles.
 * @type {Map<string, HTMLElement>}
 */
const activeLabels = new Map();

let characterAngle = 0; // Angle in degrees
let offsetX = window.innerWidth * 1.5; // Background X offset
let offsetY = window.innerHeight * 1.5; // Background Y offset
let currentZoom = 1; // Keep track of the current zoom level
let targetZoom = 1; // Desired zoom level

let characterRect; // Bounding rectangle for the character
let characterCenter; // Center point for the character

let obstacleRectsCache = []; // Cache for obstacle bounding rects
let obstaclesWithinRelevanceRadius = []; // Tracks all obstacles within radius
let obstaclesWithinCollisionRadius = []; // Tracks all obstacles the character is colliding with

let isMoving = false; // Whether the character is currently moving
let movingDirection = 0;

/**
 * Updates the character's bounding rectangle.
 */
function updatePlayerRect() {
    characterRect = character.getBoundingClientRect();
    characterCenter = { x: characterRect.left + characterRect.width / 2, y: characterRect.top + characterRect.height / 2 };
}

/**
 * Updates the cache of obstacle bounding rectangles.
 */
function updateObstacleRectsCache() {
    obstacleRectsCache = obstacles.map(obstacle => {
        const rect = obstacle.getBoundingClientRect();
        const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        return { id: obstacle.id, rect, center };
    });
}

/**
 * Updates the list of obstacles within a certain radius of the character.
 */
function updateObstaclesWithinRelevanceRadius() {
    const relevanceRadiusSquared = Math.pow(config.relevanceRadius, 2);
    obstaclesWithinRelevanceRadius = obstacleRectsCache
        .map(({ id, rect, center }) => {
            const distanceSquared = Math.pow(center.x - characterCenter.x, 2) +
                                    Math.pow(center.y - characterCenter.y, 2);
            return { id, rect, center, distanceSquared };
        })
        .filter(({ distanceSquared }) => distanceSquared <= relevanceRadiusSquared);
}

/**
 * Updates the list of obstacles the character is colliding with.
 */
function updateObstaclesWithinCollisionRadius() {
    const collisionRadiusSquared = Math.pow(config.collisionRadius, 2);
    obstaclesWithinCollisionRadius = obstaclesWithinRelevanceRadius
        .filter(({ distanceSquared }) => distanceSquared <= collisionRadiusSquared);
}

/**
 * Checks if the character can move in the given direction.
 * @param {number} direction - The direction of movement (1 for forward, -1 for backward).
 * @returns {boolean} Whether the character can move.
 */
function checkMovementPossible(direction) {
    const step = direction * config.moveSpeed;
    const futureX = characterCenter.x + step * Math.sin((characterAngle * Math.PI) / 180);
    const futureY = characterCenter.y - step * Math.cos((characterAngle * Math.PI) / 180);

    for (const { rect } of obstaclesWithinCollisionRadius) {
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
 * Updates the game container zoom based on proximity to obstacles.
 */
function updateGameContainerZoom() {
    let closestRelevantObstacle = obstaclesWithinRelevanceRadius.reduce((closest, current) => {
        return current.distanceSquared < closest.distanceSquared ? current : closest;
    }, { distanceSquared: Infinity });

    if (closestRelevantObstacle.distanceSquared === Infinity) {
        targetZoom = 1;
        return;
    }

    const distanceFactor = Math.max(0, (config.relevanceRadius - Math.sqrt(closestRelevantObstacle.distanceSquared)) / config.relevanceRadius);
    targetZoom = 1 + distanceFactor * 0.5; // Scale zoom factor
    targetZoom = Math.min(Math.max(targetZoom, 0.8), 2); // Clamp zoom between 0.8 and 2
}

/**
 * Updates labels for obstacles currently within the display distance.
 */
function updateObstacleLabels() {
    for (const { id, rect } of obstaclesWithinRelevanceRadius) {
        const labelId = `label-${id}`;
        let label = document.getElementById(labelId);
        if (!label) {
            label = document.createElement('div');
            label.id = labelId;
            label.className = 'obstacle-label-fixed';
            document.body.appendChild(label);
            activeLabels.set(id, label);
        }
        label.textContent = id;
        label.style.left = `${rect.left + rect.width / 2}px`;
        label.style.top = `${rect.top - 20}px`;
    }

    // Remove labels for obstacles no longer within radius
    for (const [id, label] of activeLabels) {
        if (!obstaclesWithinRelevanceRadius.find(obj => obj.id === id)) {
            label.remove();
            activeLabels.delete(id);
        }
    }
}

/**
 * Updates the drawn gizmos for debugging purposes.
 */
function updateDrawnGizmos() {
    if (!config.debug) {
        return;
    }
    const gizmos = document.querySelectorAll('.gizmo');
    gizmos.forEach(gizmo => gizmo.remove());

    const characterGizmo = document.createElement('div');
    characterGizmo.className = 'gizmo';
    characterGizmo.style.left = `${characterRect.left}px`;
    characterGizmo.style.top = `${characterRect.top}px`;
    characterGizmo.style.width = `${config.characterSize}px`;
    characterGizmo.style.height = `${config.characterSize}px`;
    characterGizmo.style.position = 'absolute';
    characterGizmo.style.border = obstaclesWithinCollisionRadius.length ? '2px solid red' : '2px solid green';
    document.body.appendChild(characterGizmo);

    for (const { id, rect, center } of obstacleRectsCache) {
        const gizmo = document.createElement('div');
        gizmo.className = 'gizmo';
        gizmo.style.left = `${center.x - config.obstacleSize / 2}px`;
        gizmo.style.top = `${center.y - config.obstacleSize / 2}px`;
        gizmo.style.width = `${config.obstacleSize}px`;
        gizmo.style.height = `${config.obstacleSize}px`;
        gizmo.style.position = 'absolute';
        gizmo.style.border = `2px solid ${obstaclesWithinRelevanceRadius.find(obj => obj.id === id) ? 'yellow' : 'green'}`;
        gizmo.style.border = `2px solid ${obstaclesWithinCollisionRadius.find(obj => obj.id === id) ? 'red' : gizmo.style.border}`;
        document.body.appendChild(gizmo);
    }
}

/**
 * Updates the terrain's rotation and position based on character movement.
 */
function updateMovement() {
    terrainContainer.style.transform = `translate(-50%, -50%) rotateX(${config.inclinationAngle}deg) rotate(${characterAngle}deg)`;
    terrain.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
    updatePlayerRect();
    updateObstacleRectsCache();
    updateObstaclesWithinRelevanceRadius();
    updateObstaclesWithinCollisionRadius();
    updateGameContainerZoom();
    updateObstacleLabels();
    updateDrawnGizmos();
}

/**
 * Main game loop that handles continuous updates when keys are pressed.
 */
function gameLoop() {
    // Smoothly adjust zoom toward the target zoom
    if (currentZoom !== targetZoom) {
        currentZoom += (targetZoom - currentZoom) * 0.1; // Adjust the smoothing factor (0.1) as needed
        gameContainer.style.transform = `scale(${currentZoom})`;
    }
    requestAnimationFrame(gameLoop);
}

/**
 * Handles key press events for movement and rotation.
 * @param {KeyboardEvent} e - The keydown event.
 */
function handleKeyDown(e) {
    const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!validKeys.includes(e.key)) return;

    let newX = offsetX;
    let newY = offsetY;

    switch (e.key) {
        case 'ArrowUp':
            if (!checkMovementPossible(MOVEMENT_FORWARD)) {
                break;
            }
            newX += config.moveSpeed * Math.sin((characterAngle * Math.PI) / 180);
            newY += config.moveSpeed * Math.cos((characterAngle * Math.PI) / 180);
            isMoving = true;
            movingDirection = MOVEMENT_FORWARD;
            if (!character.classList.contains('walking')) {
                character.classList.add('walking');
            }
            break;
        case 'ArrowDown':
            if (!checkMovementPossible(MOVEMENT_BACKWARD)) {
                break;
            }
            newX -= config.moveSpeed * Math.sin((characterAngle * Math.PI) / 180);
            newY -= config.moveSpeed * Math.cos((characterAngle * Math.PI) / 180);
            isMoving = true;
            movingDirection = MOVEMENT_BACKWARD;
            if (!character.classList.contains('walking')) {
                character.classList.add('walking');
            }
            break;
        case 'ArrowLeft':
            characterAngle = (characterAngle + config.rotationIncrement) % 360;
            break;
        case 'ArrowRight':
            characterAngle = (characterAngle - config.rotationIncrement + 360) % 360;
            break;
    }

    offsetX = newX;
    offsetY = newY;

    updateMovement();
}

/**
 * Handles key release events.
 * @param {KeyboardEvent} e - The keyup event.
 */
function handleKeyUp(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        isMoving = false;
        movingDirection = MOVEMENT_STATIONARY;
        character.classList.remove('walking');
    }
}

// Event Listeners
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// Initialize
updateMovement();
requestAnimationFrame(gameLoop);
