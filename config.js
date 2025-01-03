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
    moveSpeed: 20,

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
     * Size of the character in pixels.
     * @type {number}
     */
    characterSize: 32,

    /**
     * Size of the obstacles in pixels.
     * @type {number}
     */
    obstacleSize: 50
};
