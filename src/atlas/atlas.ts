import { existsSync, lstatSync, readdirSync } from 'fs';
import Path from 'path';
import { PNG } from 'pngjs';

import { AtlasConfig } from './atlasConfig.js';
import { Image } from './image.js';
import { Packer } from './packer.js';
import { Rectangle } from './rectangle.js';

/**
 * The sprite atlas class holds the image and position data of the individual sprites.
 */
export class Atlas {
  /**
   * The final packed image.
   */
  packedImage: Image | undefined;

  /**
   * The final packed image positions inside the atlas.
   */
  packedRects: Rectangle[] = [];

  /**
   * The images that are in the atlas.
   */
  images = new Map<string, Image>();

  /**
   * The start rectangles.
   */
  rects: Rectangle[] = [];

  /**
   * The file paths to the images.
   */
  private imagePaths: ImagePath[] = [];

  /**
   * The atlas configuration.
   */
  private config: AtlasConfig;

  /**
   * Indicates whether an error was found during initialization.
   * If true, the atlas cannot be packed.
   */
  private errorFound = false;

  /**
   * Creates a new atlas instance.
   * @param config The configuration object for the atlas.
   */
  constructor(config: AtlasConfig) {
    this.config = config;

    // Validate the configuration.
    if (!this.validateConfig()) {
      this.errorFound = true;
      process.stdout.write('Error: Invalid config.\n');
      return;
    }

    // Get all the PNG images from the folders in the config. This is not recursive.
    if (config.folders) {
      for (const folder of config.folders) {
        const fullPath = Path.join(process.cwd(), folder);
        if (existsSync(fullPath) && lstatSync(fullPath).isDirectory()) {
          const paths = this.getAllImagesPathsFromFolder(fullPath);
          this.imagePaths = this.imagePaths.concat(paths);
        } else {
          process.stdout.write(`Error: folder "${fullPath}" does not exist.\n`);
        }
      }
    }

    // Get all the PNG images from the files in the config.
    if (config.files) {
      for (const file of config.files) {
        const fullPath = Path.join(process.cwd(), file);
        const imagePath = this.getFullImagePath(fullPath);
        if (imagePath) {
          this.imagePaths.push(imagePath);
        }
      }
    }

    if (this.imagePaths.length === 0) {
      this.errorFound = true;
      process.stdout.write('No images to pack.\n');
      return;
    }

    let duplicates = false;
    const names: string[] = [];
    for (const path of this.imagePaths) {
      const name = config.folderInName ? `${path.folderName}_${path.fileName}` : path.fileName;

      // Check for duplicates.
      if (names.includes(name)) {
        duplicates = true;
        process.stdout.write(`Error: Duplicate name "${name}" found. Cannot have duplicate names.\n`);
        continue;
      } else {
        names.push(name);
      }

      // Load the image and create the rectangle.
      const image = Image.fromFile(path.fullPath, config.trimmed ?? true, config.extrude ?? 0);
      this.images.set(name, image);
      this.rects.push(new Rectangle(0, 0, image.width, image.height, name));
    }

    if (duplicates) {
      process.stdout.write('Error: Duplicate image names found. Try using the "folderInName" config option.\n');
      this.errorFound = true;
    }
  }

  /**
   * Packs all the images into one image.
   * @returns True if the packing was successful.
   */
  pack(): boolean {
    if (this.errorFound) {
      return false;
    }

    // Perform the actual packing.
    const packer = new Packer(
      this.rects,
      this.config.packMethod ?? 'optimal',
      this.config.maxWidth ?? 4096,
      this.config.maxHeight ?? 4096
    );

    if (!packer.pack()) {
      return false;
    }

    if (!packer.smallestBounds) {
      return false;
    }

    // Create the final blank image with the correct size.
    this.packedImage = new Image(packer.smallestBounds.width, packer.smallestBounds.height);

    // Add all images into the final image.
    for (const rect of packer.smallestLayout) {
      const img = this.images.get(rect.name);
      if (img) {
        PNG.bitblt(img.pngData, this.packedImage.pngData, 0, 0, img.width, img.height, rect.x, rect.y);
      }
    }
    this.packedRects = packer.smallestLayout;

    process.stdout.write(`Atlas "${this.config.name}" has been packed successfully.\n`);

    return true;
  }

  /**
   * Loops through a folder and gets all PNG file paths. This is not recursive.
   * @param path The folder path to search for PNG files.
   * @returns A list of image paths.
   */
  private getAllImagesPathsFromFolder(path: string): ImagePath[] {
    const imagePaths: ImagePath[] = [];
    for (const file of readdirSync(path)) {
      const fullPath = Path.join(path, file);
      if (lstatSync(fullPath).isFile()) {
        const imagePath = this.getFullImagePath(fullPath);
        if (imagePath) {
          imagePaths.push(imagePath);
        }
      }
    }

    return imagePaths;
  }

  /**
   * Creates a path with the direct parent folder name and file name for easy use later.
   * @param path The full path to the image file.
   * @returns The created ImagePath object, or null if the file is not a PNG.
   */
  private getFullImagePath(path: string): ImagePath | null {
    if (Path.extname(path) === '.png') {
      const folders = Path.dirname(path).split(Path.sep);
      const folder = folders[folders.length - 1];

      return {
        fullPath: path,
        folderName: folder,
        fileName: Path.basename(path, Path.extname(path)),
      };
    } else {
      process.stdout.write(`Warning: "${path}" is not a PNG image.\n`);
      return null;
    }
  }

  /**
   * Validates the configuration object.
   * @returns True if the configuration is valid, false otherwise.
   */
  private validateConfig(): boolean {
    if (!this.config.name) {
      process.stdout.write('Error: Config must have a name.\n');
      return false;
    }
    return true;
  }
}

/**
 * Helper type that stores the direct parent folder name,
 * the file name without extension, and the full path of an image.
 */
export type ImagePath = {
  folderName: string;
  fileName: string;
  fullPath: string;
};
