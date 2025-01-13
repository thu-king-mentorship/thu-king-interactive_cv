/**
 * Configuration Variables for the Map and Game Logic.
 */
const config = {

    /**
     * Debug mode for logging.
     * @type {boolean}
     */
    debug: true,

    /**
     * Speed at which the player moves.
     * @type {number}
     */
    moveSpeed: 50,

    /**
     * Adjustment for preventing the player from getting stuck.
     * @type {number}
     */
    escapeAdjustment: this.moveSpeed * 0.1,

    /**
     * Speed at which the player rotates.
     * @type {number}
     */
    rotationIncrement: 5,

    /**
     * Radius for considering objects within the character's vicinity.
     * @type {number}
     */
    relevanceRadius: 80,

    /**
     * Radius for considering objects within the character's collision range.
     * @type {number}
     */
    collisionRadius: 40,

    /**
     * Angle for terrain inclination.
     * @type {number}
     */
    inclinationAngle: 75,

    /**
     * Base size of the tiles.
     * @type {number}
     */
    baseTileSize: 16,

    /**
     * Scale factor for the terrain.
     * @type {number}
     */
    terrainScaleFactor: 3,

    /**
     * Size of the virtual camera.
     * @type {{width: number, height: number}}
     * @property {number} width - Width of the virtual camera.
     * @property {number} height - Height of the virtual camera.
     */
    resolution: {
        width: 1024,
        height: 768,
    }
};
