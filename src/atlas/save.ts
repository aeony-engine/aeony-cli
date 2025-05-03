import { existsSync, mkdirSync, writeFileSync } from 'fs';
import Path from 'path';
import { PNG } from 'pngjs';

import { Atlas } from './atlas.js';
import { Frame } from './frame.js';

/**
 * Saves the atlas image to a PNG file.
 * @param name The name of the file (without extension).
 * @param saveFolder The folder where the file will be saved.
 * @param atlas The created atlas containing the packed image.
 * @throws Will throw an error if the atlas image is undefined.
 */
export function saveAtlasImage(name: string, saveFolder: string, atlas: Atlas): void {
  // Ensure the save folder exists.
  if (!existsSync(saveFolder)) {
    mkdirSync(saveFolder, { recursive: true });
  }

  const path = Path.join(saveFolder, `${name}.png`);
  if (atlas.packedImage) {
    try {
      const buffer = PNG.sync.write(atlas.packedImage.pngData, {
        colorType: 6,
      });
      writeFileSync(path, buffer);
      process.stdout.write(`Atlas image saved to: ${path}\n`);
    } catch (error) {
      throw new Error(`Failed to save atlas image: ${(error as Error).message}`);
    }
  } else {
    throw new Error('Atlas image is undefined. Cannot save.');
  }
}

/**
 * Saves the JSON data to a file.
 * @param name The name of the file (without extension).
 * @param saveFolder The folder where the file will be saved.
 * @param atlas The created atlas containing the packed rectangles and image data.
 * @throws Will throw an error if writing fails.
 */
export function saveJsonData(name: string, saveFolder: string, atlas: Atlas): void {
  // Ensure the save folder exists.
  if (!existsSync(saveFolder)) {
    mkdirSync(saveFolder, { recursive: true });
  }

  const frames: Frame[] = [];

  for (const rect of atlas.packedRects) {
    const image = atlas.images.get(rect.name);
    if (image) {
      frames.push({
        filename: rect.name,
        frame: {
          x: rect.x + Number(image.extrude),
          y: rect.y + Number(image.extrude),
          width: rect.width - Number(image.extrude) * 2,
          height: rect.height - Number(image.extrude) * 2,
        },
        trimmed: image.trimmed,
        spriteSourceSize: {
          x: image.sourceX,
          y: image.sourceY,
          width: image.sourceWidth,
          height: image.sourceHeight,
        },
      });
    }
  }

  const path = Path.join(saveFolder, `${name}.json`);
  const content = JSON.stringify({ frames: frames }, null, 2);

  try {
    writeFileSync(path, content);
    process.stdout.write(`JSON data saved to: ${path}\n`);
  } catch (error) {
    throw new Error(`Failed to save JSON data: ${(error as Error).message}`);
  }
}
