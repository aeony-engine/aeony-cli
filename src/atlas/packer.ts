import { PackMethod } from './atlasConfig.js';
import { Rectangle } from './rectangle.js';

/**
 * Packs rectangles into bounds using either a basic or optimal packing method.
 * The optimal option is based on this post.
 * https://www.codeproject.com/Articles/210979/Fast-optimizing-rectangle-packing-algorithm-for-bu
 *
 * Sort the rectangles by height, highest first.
 *
 * Make the bounds the width of the total width of all rectangles and the height the height of the highest rectangle.
 *
 * There is a dynamic grid with booleans of where the placed rectangles are.
 *
 * There is a separate array with all column widths and one with a row heights in the grid.
 *
 * Each rectangle is inserted at the left most possible position.
 *
 * The grid column and row that overlap the ends of the inserted rectangle get divided by the space left empty.
 *
 * This is repeated until all rectangles are placed or one doesn't fit.
 *
 * If one doesn't fit, increase the height of the bounds by the height of the rectangle that didn't fit and restart
 * the process.
 *
 * If all fit make the bounds width smaller until it fits the rectangle exactly. If the area of the bounds this pass
 * is smaller that the current smallest bounds save it and the rectangle positions.
 *
 * Subtract 1 pixels from the bounds width. if it is smaller than the width of the widest rectangle the process is
 * done. If not restart the process with the new bounds.
 */
export class Packer {
  /**
   * The current smallest bounds of the packed rectangles.
   */
  smallestBounds: Rectangle | undefined;

  /**
   * The layout of rectangles for the smallest bounds.
   */
  smallestLayout: Rectangle[] = [];

  /**
   * All rectangles that need to be packed.
   */
  private rectangles: Rectangle[];

  /**
   * The current bounds of the packer image.
   */
  private bounds: Rectangle;

  /**
   * A list of rectangles that have been placed on this pass.
   */
  private placedRects: Rectangle[] = [];

  /**
   * A list of row sizes for the dynamic grid in pixels.
   */
  private gridRows: number[] = [];

  /**
   * A list of column sizes for the dynamic grid in pixels.
   */
  private gridColumns: number[] = [];

  /**
   * Dynamic grid that has the filled and empty positions in the grid.
   */
  private grid: boolean[][] = [];

  /**
   * The number of placed rectangles in the grid.
   */
  private placed = 0;

  /**
   * The width of the widest rectangle.
   */
  private biggestWidth = 0;

  /**
   * The maximum width the bounds can be.
   */
  private readonly maxWidth;

  /**
   * The maximum height the bounds can be.
   */
  private readonly maxHeight;

  /**
   * Simple or optimal packing method depending on the atlas config.
   */
  private readonly packMethod: PackMethod;

  /**
   * @param rectangles The rectangles to pack in the atlas.
   * @param packMethod The method to use for the packing.
   * @param maxWidth The maximum width of the atlas in pixels.
   * @param maxHeight The maximum height of the atlas in pixels.
   */
  constructor(rectangles: Rectangle[], packMethod: PackMethod, maxWidth: number, maxHeight: number) {
    this.rectangles = rectangles;
    this.packMethod = packMethod;
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;

    this.sortRects();
    this.bounds = this.setStartBounds();
    this.resetPlacements();
  }

  /**
   * Calculate the image positions.
   */
  pack(): boolean {
    if (this.packMethod === 'basic') {
      if (!this.packRectangles()) {
        process.stdout.write('Error: Unable to fit the images inside the bounds.\n');
        return false;
      }
      return true;
    } else {
      let success = true;
      let done = false;
      while (!done) {
        if (this.packRectangles()) {
          this.bounds.width -= 1;
          if (this.bounds.width < this.biggestWidth) {
            done = true;
          } else {
            this.resetPlacements();
          }
        } else {
          if (!this.smallestBounds) {
            process.stdout.write('Error: Unable to fit the images inside the bounds.\n');
            success = false;
          }
          done = true;
        }
      }

      return success;
    }
  }

  /**
   * Set the bounds for the first pass. This will be the height of the tallest image and the width of all
   * of them combined or max width if that is smaller.
   */
  private setStartBounds(): Rectangle {
    let boundsWidth = 0;
    let boundsHeight = 0;
    for (const rect of this.rectangles) {
      if (boundsHeight === 0 || rect.height > boundsHeight) {
        boundsHeight = rect.height;
      }
      boundsWidth += rect.width;
      if (this.biggestWidth === 0 || rect.width > this.biggestWidth) {
        this.biggestWidth = rect.width;
      }
    }

    if (boundsWidth > this.maxWidth) {
      boundsWidth = this.maxWidth;
    }

    return new Rectangle(0, 0, boundsWidth, boundsHeight);
  }

  /**
   * Run a packing pass.
   * @returns True if all rectangles fit.
   */
  private packRectangles(): boolean {
    while (this.placed < this.rectangles.length) {
      const rect = this.rectangles[this.placed];
      if (this.placeRect(rect)) {
        this.placedRects.push(rect);
        this.placed++;
      } else {
        this.bounds.height += rect.height;
        if (this.bounds.height > this.maxHeight) {
          return false;
        }
        this.resetPlacements();
      }
    }

    // Find the width of of the packed rectangles to decrease the bounds width.
    let totalWidth = 0;
    for (let x = 0; x < this.gridColumns.length; x++) {
      for (let y = 0; y < this.gridRows.length; y++) {
        if (this.grid[y][x]) {
          totalWidth += this.gridColumns[x];
          break;
        }
      }
    }

    // Update the smallest bounds.
    this.bounds.width = totalWidth;
    if (!this.smallestBounds || this.bounds.area() < this.smallestBounds.area()) {
      this.smallestBounds = this.bounds.clone();
      this.smallestLayout = [];
      for (const rect of this.placedRects) {
        this.smallestLayout.push(rect.clone());
      }
    }

    return true;
  }

  /**
   * Reset for a new pass.
   */
  private resetPlacements(): void {
    this.placedRects = [];
    this.placed = 0;
    this.grid = [[false]];
    this.gridColumns = [this.bounds.width];
    this.gridRows = [this.bounds.height];
  }

  /**
   * Add a rectangle into the grid.
   * @param rect The rectangle to add.
   * @returns True if the the rectangle got placed.
   */
  private placeRect(rect: Rectangle): boolean {
    if (this.packMethod === 'basic') {
      for (let row = 0; row < this.gridRows.length; row++) {
        for (let column = 0; column < this.gridColumns.length; column++) {
          if (!this.grid[row][column]) {
            if (this.findPlace(column, row, rect)) {
              return true;
            }
          }
        }
      }
    } else {
      for (let column = 0; column < this.gridColumns.length; column++) {
        for (let row = 0; row < this.gridRows.length; row++) {
          if (!this.grid[row][column]) {
            if (this.findPlace(column, row, rect)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Find an empty spot for the rectangle as much left as possible.
   * @param startColumn The column to start checking.
   * @param startRow The row to start checking.
   * @param rectangle The rectangle to place.
   * @returns True if the rectangle got placed.
   */
  private findPlace(startColumn: number, startRow: number, rectangle: Rectangle): boolean {
    let endColumn = startColumn;
    let endRow = startRow;
    let totalWidth = this.gridColumns[startColumn];
    let totalHeight = this.gridRows[startRow];

    // Check the rows down adding to the total height until the rectangle fits.
    while (endRow < this.gridRows.length) {
      // Cell not empty. The rectangle won't fit here.
      if (this.grid[endRow][endColumn]) {
        return false;
      }

      // The total height fits the rectangle.
      if (totalHeight >= rectangle.height) {
        break;
      }

      endRow++;
      if (endRow < this.gridRows.length) {
        totalHeight += this.gridRows[endRow];
      }
    }

    // End row out of range of the rows. Rectangle doesn't fit here.
    if (endRow >= this.gridRows.length) {
      return false;
    }

    // Check the columns right of the start adding to the total width until the rectangle fits.
    while (endColumn < this.gridColumns.length) {
      for (let y = startRow; y < endRow + 1; y++) {
        if (this.grid[y][endColumn]) {
          return false;
        }
      }

      if (totalWidth >= rectangle.width) {
        break;
      }

      endColumn++;
      if (endColumn < this.gridColumns.length) {
        totalWidth += this.gridColumns[endColumn];
      }
    }

    if (endColumn >= this.gridColumns.length) {
      return false;
    }

    this.insertRect(totalWidth, totalHeight, startColumn, startRow, endColumn, endRow, rectangle);

    return true;
  }

  /**
   * Insert a rectangle into the grid.
   * @param totalWidth The width from the start column until the end column inclusive.
   * @param totalHeight The height from the start row until the end row inclusive.
   * @param startColumn The start column index.
   * @param startRow Then start row index.
   * @param endColumn The end column index.
   * @param endRow The end row index.
   * @param rectangle The rectangle to insert.
   */
  private insertRect(
    totalWidth: number,
    totalHeight: number,
    startColumn: number,
    startRow: number,
    endColumn: number,
    endRow: number,
    rectangle: Rectangle
  ): void {
    const widthLeft = totalWidth - rectangle.width;
    const heightLeft = totalHeight - rectangle.height;

    // Divide the grid row that contains the last part of the new rect.
    if (heightLeft > 0) {
      this.gridRows[endRow] = this.gridRows[endRow] - heightLeft;
      this.gridRows.splice(endRow + 1, 0, heightLeft);
      this.insertRow(endRow + 1);
    }

    // Divide the grid column that contains the last part of the new rect.
    if (widthLeft > 0) {
      this.gridColumns[endColumn] = this.gridColumns[endColumn] - widthLeft;
      this.gridColumns.splice(endColumn + 1, 0, widthLeft);
      this.insertColumn(endColumn + 1);
    }

    for (let y = startRow; y < endRow + 1; y++) {
      for (let x = startColumn; x < endColumn + 1; x++) {
        this.grid[y][x] = true;
      }
    }

    let xPos = 0;
    for (let col = 0; col < startColumn; col++) {
      xPos += this.gridColumns[col];
    }

    let yPos = 0;
    for (let row = 0; row < startRow; row++) {
      yPos += this.gridRows[row];
    }

    rectangle.x = xPos;
    rectangle.y = yPos;
  }

  /**
   * Insert a row into the packer grid.
   * @param index The position where you want to insert the row.
   */
  private insertRow(index: number): void {
    const copy = [...this.grid[index - 1]];
    this.grid.splice(index, 0, copy);
  }

  /**
   * Insert a column into the packer grid.
   * @param index The position where you want to insert the column.
   */
  private insertColumn(index: number): void {
    for (const row of this.grid) {
      row.splice(index, 0, row[index - 1]);
    }
  }

  /**
   * Sort the rectangles based on name or height depending on the pack method.
   */
  private sortRects(): void {
    if (this.packMethod === 'basic') {
      this.sortByName();
    } else {
      this.sortByHeight();
    }
  }

  /**
   * Sorts the rectangles by height in descending order.
   */
  private sortByHeight(): void {
    this.rectangles.sort((a, b) => {
      if (a.height > b.height) {
        return -1;
      } else if (a.height < b.height) {
        return 1;
      }

      return 0;
    });
  }

  /**
   * Sorts the rectangles by name in ascending order.
   */
  private sortByName(): void {
    this.rectangles.sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      } else if (a.name < b.name) {
        return -1;
      }

      return 0;
    });
  }
}
