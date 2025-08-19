/**
 * Configuration Variables for the Map and Game Logic.
 */
const config = {

    /**
     * The title and subtitle of the game.
     * @type {{title: string, subtitle: string}}
     */
    gameTitle: {
        title: "Salvador Banderas Rovira",
        subtitle: "Game Design, Narrative Design, Game Development",
    },

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
     * The zoom levels for the game.
     * @type {{min: number, max: number, factor: number}}
     */
    zoomLevels: {
        min: 0.8,
        max: 2,
        factor: 0.5,
    },

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
     * The objects on the map.
     * @type {Array<{id: string, name: string, type: string, row: number, col: number}>}
     */
    mapObjects: [
        { id: "interactable1", name: "Interactable 1", type: "interactable", row: 6, col: 14 },
        { id: "interactable2", name: "Interactable 2", type: "interactable", row: 15, col: 9 },
        { id: "interactable3", name: "Interactable 3", type: "interactable", row: 9, col: 21 },
        { id: "obstacle1", name: "Obstacle 1", type: "obstacle", row: 14, col: 19 },
    ],

    /**
     * The starting position of the character.
     * @type {{row: number, col: number}}
     */
    character: {
        startRow: 9,
        startCol: 11,
        transforms: {
            0: { x: 50, y: 50 },
            90: { x: -150, y: -25 },
            180: { x: -50, y: -25 },
            270: { x: 50, y: -25 },
        }
    },

    /**
     * Keybindings for the game.
     * @type {{up: string[], down: string[], left: string[], right: string[], interact: string, cancel: string}}
     */
    keybindings: {
        up: ['arrowup', 'w'],
        down: ['arrowdown', 's'],
        left: ['arrowleft', 'a'],
        right: ['arrowright', 'd'],
        interact: 'e',
        cancel: 'q',
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
    ],

    /**
     * The selectors for the DOM elements.
     * @type {{game: {cameraContainer: string, gameContainer: string, terrainContainer: string, terrain: string, character: string, collision: string, interactable: string, obstacle: string}, ui: {title: string, subtitle: string, textbox: string, statusBar: string}, music: {musicPlayer: string, musicControls: string, songTitle: string, prevBtn: string, playPauseBtn: string, muteBtn: string, nextBtn: string}, debug: {grid: string, gizmoContainer: string}}}
     */
    selectors: {
        game: {
            cameraContainer: '#camera-container',
            gameContainer: '#game-container',
            terrainContainer: '#terrain-container',
            terrain: '#terrain',
            character: '#character',
            collision: '.collision',
            interactable: '.interactable',
            obstacle: '.obstacle',
        },
        ui: {
            title: '#title',
            subtitle: '#subtitle',
            textbox: 'textbox',
            statusBar: 'status-bar',
        },
        music: {
            musicPlayer: '#music-player',
            musicControls: '#music-controls',
            songTitle: '#song-title',
            prevBtn: '#previous-btn',
            playPauseBtn: '#play-pause-btn',
            muteBtn: '#mute-btn',
            nextBtn: '#next-btn',
        },
        debug: {
            grid: 'grid',
            gizmoContainer: 'gizmo-container',
        },
    }
};
