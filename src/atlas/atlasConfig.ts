/**
 * Configuration options that are read from the toml file.
 */
export type AtlasConfig = {
  /**
   * The name of the image and data files.
   */
  name: string;

  /**
   * The folder to store the atlas in, relative to the config file.
   */
  saveFolder: string;

  /**
   * An array of folders containing images to include in the atlas, relative to the config file.
   * Not recursive.
   * Example: ["assets/sprites", "assets/icons"]
   */
  folders?: string[];

  /**
   * An array of image files to include in the atlas, relative to the config file.
   * Example: ["assets/sprites/player.png", "assets/icons/star.png"]
   */
  files?: string[];

  /**
   * Removes transparent pixels around the images to save space in the atlas.
   * This is useful for optimizing the atlas size.
   */
  trimmed?: boolean;

  /**
   * The number of pixels to extend outward from the edges of the images.
   * This helps prevent visual artifacts, such as flickering, at the edges of sprites.
   * Especially useful in tilemaps.
   */
  extrude?: number;

  /**
   * The method to use for packing the sprites.
   * Options:
   * - "optimal" - The smallest atlas possible.
   * - "basic" - Sort alphabetically and add them in the fastest way.
   * Default: "basic"
   */
  packMethod?: PackMethod;

  /**
   * Whether to include the folder name in the sprite name in the data file.
   * Useful when using duplicate names in separate folders.
   */
  folderInName?: boolean;

  /**
   * The maximum width of the atlas image in pixels.
   * Must be a positive integer.
   */
  maxWidth?: number;

  /**
   * The maximum height of the atlas image in pixels.
   * Must be a positive integer.
   */
  maxHeight?: number;

  /**
   * If true, only the image file will be exported.
   */
  noData?: boolean;
};

/**
 * Helper to load the configs.
 */
export type AtlasConfigList = {
  atlases: AtlasConfig[];
};

/**
 * Packing options.
 * - "basic" - Tries one time to fit everything.
 * - "optimal" - Tries to fit the images in the smallest space.
 */
export type PackMethod = 'basic' | 'optimal';
