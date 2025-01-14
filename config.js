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
    },

    /**
     * Animation configuration for the player.
     * @type {{animateMovement: {directions: {forward: boolean, backward: boolean, left: boolean, right: boolean}, speed: number}}} 
     * @property {object} animateMovement - Configuration for the player's movement animation.
     * @property {object} directions - Directions in which the player can move.
     * @property {boolean} directions.forward - Whether the animation should play when the player moves forward.
     * @property {boolean} directions.backward - Whether the animation should play when the player moves backward.
     * @property {boolean} directions.left - Whether the animation should play when the player moves left.
     * @property {boolean} directions.right - Whether the animation should play when the player moves right.
     * @property {number} speed - Speed at which the animation should play.
     */
    animateMovement: {
        directions: {
            forward: true,
            backward: true,
            left: false,
            right: false,
        },
        duration: 0.75,
    }

};
