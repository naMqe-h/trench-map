export const MAP_SETTINGS = {
    // Toggle to enable or disable the generation and rendering of small vegetation like grass and flowers
    ENABLE_VEGETATION: true,
    // Minimum zoom distance
    CAMERA_MIN_DISTANCE: 50,
    // Maximum zoom distance
    CAMERA_MAX_DISTANCE: 800,
    // Prevents camera from going under the floor
    CAMERA_MAX_POLAR_ANGLE: Math.PI / 2.05,
    // Camera height at which small details disappear
    LOD_VEGETATION_HIDE_HEIGHT: 100,
    // Number of villages fetched per load
    CHUNK_SIZE: 20,
    // Minimum empty space between village boundaries
    VILLAGE_PADDING: 4,
    // Higher number = fewer trees (1 / TREE_DENSITY_DIVISOR)
    TREE_DENSITY_DIVISOR: 300,
    // Base scale for Fermat's Spiral
    SPIRAL_SCALE: 15,
    // Multiplier for camera distance chunk loading
    CAMERA_LOAD_THRESHOLD_MULTIPLIER: 10,
    // Padding for floor generation around villages
    BOUNDS_PADDING: 100,
    // Minimum distance between houses
    MIN_HOUSE_DISTANCE: 12,
    // Additional padding for village radius calculation
    VILLAGE_RADIUS_PADDING: 12,
    // Footprint size for tenement houses
    TENEMENT_FOOTPRINT: 7,
    // Footprint size for other houses
    DEFAULT_HOUSE_FOOTPRINT: 5,
    // Width of paths around villages
    PATH_WIDTH: 1.5,
    // Scale of the noise function for vegetation clumping
    VEGETATION_NOISE_SCALE: 50,
    // Noise value threshold for placing vegetation
    VEGETATION_THRESHOLD: 0.65,
    // Ratio of grass to flowers
    GRASS_TO_FLOWER_RATIO: 0.7,
    // Multiplier for max attempts to place houses
    MAX_PLACEMENT_ATTEMPTS_MULTIPLIER: 100,
    // Base radius for house placement
    HOUSE_PLACEMENT_BASE_RADIUS: 5,
    // Multiplier for house placement radius
    HOUSE_PLACEMENT_RADIUS_MULTIPLIER: 0.5,
    // Random radius addition for house placement
    HOUSE_PLACEMENT_RANDOM_RADIUS: 15,
    // Constant for Fermat's Spiral algorithm (golden angle in radians)
    SPIRAL_ANGLE_CONSTANT: 2.39996,
    // Step for spiral collision check
    SPIRAL_COLLISION_STEP: 0.5,
    // Sun light intensity
    SUN_LIGHT_INTENSITY: 1.2
}
