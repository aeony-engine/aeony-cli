/**
 * This is a frame in the JSON data.
 */
export type Frame = {
  /**
   * The name of the frame, used to reference it in the atlas.
   */
  filename: string;

  /**
   * The rectangle position and size of the frame in the atlas image.
   */
  frame: {
    /**
     * The x position of the frame in pixels.
     */
    x: number;

    /**
     * The y position of the frame in pixels.
     */
    y: number;

    /**
     * The width of the frame in pixels.
     */
    width: number;

    /**
     * The height of the frame in pixels.
     */
    height: number;
  };

  /**
   * Indicates whether the transparent parts of the image have been trimmed off.
   * Trimming reduces the size of the atlas by removing unnecessary transparent pixels.
   */
  trimmed: boolean;

  /**
   * The position of the trimmed sprite within the original untrimmed image and the untrimmed size.
   */
  spriteSourceSize: {
    /**
     * The x offset of the trimmed sprite in pixels.
     */
    x: number;

    /**
     * The y offset of the trimmed sprite in pixels.
     */
    y: number;

    /**
     * The width of the untrimmed sprite in pixels.
     */
    width: number;

    /**
     * The height of the untrimmed sprite in pixels.
     */
    height: number;
  };
};
