import fs from 'fs';
import { PNG } from 'pngjs';

import { Color } from './color.js';

/**
 * Represents an image with pixel data and provides methods for manipulation.
 */
export class Image {
  /**
   * Indicates whether the transparent borders of the image have been trimmed.
   */
  readonly trimmed: boolean;

  /**
   * The number of pixels the borders should be extruded by.
   */
  readonly extrude: number;

  /**
   * The x offset of the trimmed image in pixels.
   */
  readonly sourceX: number;

  /**
   * The y offset of the trimmed image in pixels.
   */
  readonly sourceY: number;

  /**
   * The original width of the image before trimming and extruding, in pixels.
   */
  readonly sourceWidth: number;

  /**
   * The original height of the image before trimming and extruding, in pixels.
   */
  readonly sourceHeight: number;

  /**
   * The width of the image in pixels.
   */
  get width(): number {
    return this._pngData.width;
  }

  /**
   * The height of the image in pixels.
   */
  get height(): number {
    return this._pngData.height;
  }

  /**
   * The raw PNG image data.
   */
  get pngData(): PNG {
    return this._pngData;
  }

  /**
   * The raw PNG image data.
   */
  private _pngData: PNG;

  /**
   * Creates an image from a file.
   * @param path The path to the image file.
   * @param trim Whether to trim transparent pixels from the image.
   * @param extrude The number of pixels to extrude the image borders by.
   * @returns The created image instance.
   */
  static fromFile(path: string, trim: boolean, extrude: number): Image {
    const data = fs.readFileSync(path);
    const pngData = PNG.sync.read(data);

    return new Image(pngData.width, pngData.height, pngData, trim, extrude);
  }

  /**
   * Constructs a new image instance.
   * @param width The width of the image in pixels.
   * @param height The height of the image in pixels.
   * @param pngData The raw PNG image data.
   * @param trim Whether to trim transparent pixels from the image.
   * @param extrude The number of pixels to extrude the image borders by.
   */
  constructor(width: number, height: number, pngData: PNG | null = null, trim = false, extrude = 0) {
    this.sourceWidth = width;
    this.sourceHeight = height;
    this.trimmed = trim;
    this.extrude = extrude;

    if (pngData) {
      // Create a blank image.
      this._pngData = new PNG({ width, height });

      // Blit the image data onto the image.
      PNG.bitblt(pngData, this._pngData, 0, 0, width, height, 0, 0);

      if (trim) {
        const [sourceX, sourceY] = this.trimTransparentPixels();
        this.sourceX = sourceX;
        this.sourceY = sourceY;
      } else {
        this.sourceX = 0;
        this.sourceY = 0;
      }

      if (extrude) {
        this.extrudeEdges(extrude);
      }
    } else {
      // No data provided, create a blank image.
      this._pngData = new PNG({ width, height, fill: true });
      this.sourceX = 0;
      this.sourceY = 0;
    }
  }

  /**
   * Returns the image pixels as a byte buffer.
   * @returns A buffer containing the image pixel data.
   */
  getPixels(): Buffer {
    return this._pngData.data;
  }

  /**
   * Gets the color of a pixel at a specific position.
   * @param x The x-coordinate of the pixel.
   * @param y The y-coordinate of the pixel.
   * @returns The color of the pixel.
   */
  getPixel(x: number, y: number): Color {
    const start = (y * this.width + x) * 4;

    return new Color(
      this._pngData.data[start],
      this._pngData.data[start + 1],
      this._pngData.data[start + 2],
      this._pngData.data[start + 3]
    );
  }

  /**
   * Sets the color of a pixel at a specific position.
   * @param x The x-coordinate of the pixel.
   * @param y The y-coordinate of the pixel.
   * @param color The color to set the pixel to.
   */
  setPixel(x: number, y: number, color: Color): void {
    const start = (y * this.width + x) * 4;
    this._pngData.data[start] = color.red;
    this._pngData.data[start + 1] = color.green;
    this._pngData.data[start + 2] = color.blue;
    this._pngData.data[start + 3] = color.alpha;
  }

  /**
   * Extrudes the edges of the image by copying the edge pixels outward.
   * @param amount The number of pixels to extrude.
   */
  extrudeEdges(amount: number): void {
    const original = new Image(this.width, this.height, this._pngData);

    // Total width and height adjusted by the amount to extrude on both sides.
    this._pngData = new PNG({
      width: this.width + amount * 2,
      height: this.height + amount * 2,
      fill: true,
    });
    PNG.bitblt(original._pngData, this._pngData, 0, 0, original.width, original.height, amount, amount);

    let color: Color;
    for (let y = amount; y < original.height + amount; y++) {
      // Extrude left.
      color = this.getPixel(amount, y);
      for (let x = 0; x < amount; x++) {
        this.setPixel(x, y, color);
      }

      // Extrude right.
      color = this.getPixel(this.width - amount - 1, y);
      for (let x = this.width - amount - 1; x < this.width; x++) {
        this.setPixel(x, y, color);
      }
    }

    for (let x = amount; x < original.width + amount; x++) {
      // Extrude up.
      color = this.getPixel(x, amount);
      for (let y = 0; y < amount; y++) {
        this.setPixel(x, y, color);
      }

      // Extrude down.
      color = this.getPixel(x, this.height - amount - 1);
      for (let y = this.height - amount - 1; y < this.height; y++) {
        this.setPixel(x, y, color);
      }
    }
  }

  /**
   * Trims transparent borders from the image.
   * @returns The x and y offsets of the trimmed image.
   */
  private trimTransparentPixels(): readonly [number, number] {
    const temp = new Image(this.width, this.height, this._pngData);

    let leftOffset = 0;
    let rightOffset = 0;
    let topOffset = 0;
    let bottomOffset = 0;

    // From the left side in.
    for (let x = 0; x < this.width; x++) {
      if (!isColumnEmpty(temp, x)) {
        break;
      }
      leftOffset++;
    }

    // From the right side in.
    for (let x = this.width - 1; x > 0; x--) {
      if (!isColumnEmpty(temp, x)) {
        break;
      }
      rightOffset++;
    }

    // From the top in.
    for (let y = 0; y < this.height; y++) {
      if (!isRowEmpty(temp, y)) {
        break;
      }
      topOffset++;
    }

    // From the bottom in.
    for (let y = this.height - 1; y > 0; y--) {
      if (!isRowEmpty(temp, y)) {
        break;
      }
      bottomOffset++;
    }

    const newWidth = temp.width - leftOffset - rightOffset;
    const newHeight = temp.height - topOffset - bottomOffset;

    // Create the data for the image with the new size.
    this._pngData = new PNG({ width: newWidth, height: newHeight, fill: true });

    // Blit the image onto the new data.
    PNG.bitblt(temp._pngData, this._pngData, leftOffset, topOffset, newWidth, newHeight, 0, 0);

    return [leftOffset, topOffset] as const;
  }
}

/**
 * Checks if a column of pixels in an image is empty (fully transparent).
 * @param image The image to check.
 * @param column The column index to check.
 * @returns True if the column is empty.
 */
function isColumnEmpty(image: Image, column: number): boolean {
  for (let y = 0; y < image.height; y++) {
    if (image.getPixel(column, y).alpha !== 0) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if a row of pixels in an image is empty (fully transparent).
 * @param image The image to check.
 * @param row The row index to check.
 * @returns True if the row is empty, false otherwise.
 */
function isRowEmpty(image: Image, row: number): boolean {
  for (let x = 0; x < image.width; x++) {
    if (image.getPixel(x, row).alpha !== 0) {
      return false;
    }
  }

  return true;
}
