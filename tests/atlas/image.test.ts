import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';

import { Color } from '../../src/atlas/color.js';
import { Image } from '../../src/atlas/image.js';

describe('Image', () => {
  it('Should create an empty image.', () => {
    const imageWidth = 64;
    const imageHeight = 32;
    const image = new Image(imageWidth, imageHeight);
    const data = image.getPixels();

    expect(image.width).toBe(64);
    expect(image.height).toBe(32);

    // 4 bytes per pixel.
    expect(data.length).toBe(imageWidth * imageHeight * 4);
    for (let i = 0; i < data.length; i++) {
      expect(data[i]).toBe(0);
    }
  });

  it('Should get and set a pixel.', () => {
    const color = new Color(255, 100, 80, 20);
    const transparentColor = new Color(0, 0, 0, 0);
    const image = new Image(32, 32);

    const currentColor = image.getPixel(10, 10);
    expect(currentColor.equals(transparentColor)).toBe(true);

    image.setPixel(10, 10, color);
    const newColor = image.getPixel(10, 10);
    expect(newColor.equals(color)).toBe(true);
  });

  it('Should construct an image from bytes.', () => {
    const width = 32;
    const height = 32;

    // Light orange.
    const color = new Color(255, 255, 127, 50);

    const png = new PNG({ width: width, height: height, fill: true });
    let pos = 0;

    // Make every pixel orange.
    while (pos < png.data.length - 1) {
      png.data[pos] = color.red;
      png.data[pos + 1] = color.green;
      png.data[pos + 2] = color.blue;
      png.data[pos + 3] = color.alpha;
      pos += 4;
    }

    const image = new Image(width, height, png);
    expect(image.width).toBe(width);
    expect(image.height).toBe(height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = image.getPixel(x, y);
        expect(pixel.equals(color)).toBe(true);
      }
    }
  });

  it('Should return the pixels of an image.', () => {
    const width = 32;
    const height = 32;

    // Light orange.
    const color = new Color(255, 255, 127, 50);
    const png = new PNG({ width: width, height: height, fill: true });
    let pos = 0;

    // Make every pixel orange.
    while (pos < png.data.length - 1) {
      png.data[pos] = color.red;
      png.data[pos + 1] = color.green;
      png.data[pos + 2] = color.blue;
      png.data[pos + 3] = color.alpha;
      pos += 4;
    }

    const image = new Image(width, height, png);
    expect(image.width).toBe(width);
    expect(image.height).toBe(height);

    const pixels = image.getPixels();

    for (let i = 0; i < png.data.length; i++) {
      expect(png.data[i]).toBe(pixels[i]);
    }
  });

  it('Should construct an image from a file.', () => {
    const path = 'tests/atlas/testFiles/blue_box.png';
    const image = Image.fromFile(path, false, 0);
    const darkBlue = new Color(68, 132, 159, 255);

    expect(image.width).toBe(48);
    expect(image.height).toBe(46);

    let pixel = image.getPixel(6, 5);
    expect(pixel.equals(darkBlue)).toBe(true);

    pixel = image.getPixel(41, 40);
    expect(pixel.equals(darkBlue)).toBe(true);
  });

  it('Should trim an image.', () => {
    const path = 'tests/atlas/testFiles/purple_box.png';
    const image = Image.fromFile(path, true, 0);

    expect(image.width).toBe(48);
    expect(image.height).toBe(12);
    expect(image.sourceWidth).toBe(66);
    expect(image.sourceHeight).toBe(34);
  });

  it('Should extrude an image.', () => {
    const path = 'tests/atlas/testFiles/purple_box.png';
    const image = Image.fromFile(path, true, 1);
    const darkPurple = new Color(142, 68, 159, 255);
    const normalPurple = new Color(203, 97, 227, 255);
    const transparent = new Color(0, 0, 0, 0);

    expect(image.width).toBe(50);
    expect(image.height).toBe(14);

    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const color = image.getPixel(x, y);
        // Transparent corners when extruding 1 pixel.
        if (
          (x === 0 && (y === 0 || y === image.height - 1)) ||
          (x === image.width - 1 && (y === 0 || y === image.height - 1))
        ) {
          expect(color.equals(transparent)).toBe(true);
          // Dark borders 2 pixels wide because of the extrusion.
        } else if (
          x === 0 ||
          x === 1 ||
          x === image.width - 1 ||
          x === image.width - 2 ||
          y === 0 ||
          y === 1 ||
          y === image.height - 1 ||
          y === image.height - 2
        ) {
          expect(color.equals(darkPurple)).toBe(true);
          // The rest is the normal purple color.
        } else {
          expect(color.equals(normalPurple)).toBe(true);
        }
      }
    }
  });
});
