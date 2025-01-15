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
    },

    /**
     * Interactable items mapped by ID.
     * @type {{interactable1: string[], interactable2: string[], interactable3: string[]}}
     * @property {string[]} interactableN - Interactable items for the N object.
     */
    interactables: {
        interactable1: [
            { subtitle: "Year-Year", title: "Lorem ipsum", status: "Lorem ipsum dolor sit amet" },
            { subtitle: "Year-Year", title: "Lorem ipsum", status: "Lorem ipsum dolor sit amet" },
        ],
        interactable2: [
            { subtitle: "Year-Year", title: "Lorem ipsum", status: "Lorem ipsum dolor sit amet" },
            { subtitle: "Year-Year", title: "Lorem ipsum", status: "Lorem ipsum dolor sit amet" },
        ],
        interactable3: [
            { subtitle: "Interest1", title: "Lorem ipsum", status: "Lorem ipsum dolor sit amet" },
            { subtitle: "Interest2", title: "Lorem ipsum", status: "Lorem ipsum dolor sit amet" },
        ],
    },

    /**
     * Configuration for the audio player.
     * @type {{loop: boolean, autoplay: boolean, volume: number, fadeOutDuration: number, fadeInDuration: number}}
     * @property {boolean} loop - Whether the audio should loop.
     * @property {boolean} autoplay - Whether the audio should play automatically.
     * @property {number} volume - Volume of the audio.
     * @property {number} fadeOutDuration - Duration of the fade out effect.
     * @property {number} fadeInDuration - Duration of the fade in effect.
     */
    audioPlayer: {
        autoplay: false,
        loop: false,
        volume: 0.5,
        fadeOutDuration: 3000,
        fadeInDuration: 1000,
    },

    /**
     * List of music tracks.
     * @type {string[]}
     */
    musicList: [
        'music/Michiko Naruke - WILD ARMS - Migratory Bird of the Wilderness (Rudy\'s Theme).mp3',
        'music/Nobuo Uematsu - Final Fantasy IV - Main Theme of Final Fantasy IV.mp3',
        'music/Nobuo Uematsu - Final Fantasy VI - Terra\'s Theme.mp3'
    ]

};
