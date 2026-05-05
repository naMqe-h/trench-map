export const MAP_SETTINGS = {
    // --- Camera & Visibility ---
    // Minimum zoom distance
    CAMERA_MIN_DISTANCE: 50,
    // Maximum zoom distance
    CAMERA_MAX_DISTANCE: 800,
    // Prevents camera from going under the floor
    CAMERA_MAX_POLAR_ANGLE: Math.PI / 2.1,
    // Camera height at which small details disappear
    LOD_VEGETATION_HIDE_HEIGHT: 100,

    // --- Chunk & World Loading ---
    // Number of villages fetched per load
    CHUNK_SIZE: 50,
    // Padding for floor generation around villages
    BOUNDS_PADDING: 100,

    // --- Spatial Layout & Spiral Math ---
    // Base scale for Fermat's Spiral
    SPIRAL_SCALE: 15,
    // Constant for Fermat's Spiral algorithm (golden angle in radians)
    SPIRAL_ANGLE_CONSTANT: 2.39996,
    // Step for spiral collision check
    SPIRAL_COLLISION_STEP: 0.5,

    // --- Village & House Dimensions ---
    // Minimum empty space between village boundaries
    VILLAGE_PADDING: 4,
    // Additional padding for village radius calculation
    VILLAGE_RADIUS_PADDING: 12,
    // Base radius for house placement
    HOUSE_PLACEMENT_BASE_RADIUS: 5,
    // Footprint size for other houses
    DEFAULT_HOUSE_FOOTPRINT: 5,
    // Padding for houses
    HOUSE_PADDING: 5,
    // Width of paths around villages
    PATH_WIDTH: 1.5,

    // --- Vegetation & Environmental Noise ---
    // Toggle to enable or disable the generation and rendering of small vegetation like grass and flowers
    ENABLE_VEGETATION: true,
    // Higher number = fewer trees (1 / TREE_DENSITY_DIVISOR)
    TREE_DENSITY_DIVISOR: 300,
    // Tree footprint size
    TREE_FOOTPRINT: 5,
    // Tree padding from other elements
    TREE_PADDING: 1,
    // Scale of the noise function for vegetation clumping
    VEGETATION_NOISE_SCALE: 50,
    // Noise value threshold for placing vegetation
    VEGETATION_THRESHOLD: 0.65,
    // Ratio of grass to flowers
    GRASS_TO_FLOWER_RATIO: 0.7,
    // Water noise scale
    WATER_NOISE_SCALE: 40,
    // Noise threshold for lakes
    WATER_LAKE_THRESHOLD: -0.6,

    // --- Lighting & Atmosphere ---
    // Sun light intensity
    SUN_LIGHT_INTENSITY: 1.2,
}
