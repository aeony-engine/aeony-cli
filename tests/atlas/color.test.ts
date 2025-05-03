import { describe, expect, it } from 'vitest';

import { Color } from '../../src/atlas/color.js';

describe('Color', () => {
  it('Should create a new color.', () => {
    const color = new Color(20, 40, 60, 200);

    expect(color.red).toBe(20);
    expect(color.green).toBe(40);
    expect(color.blue).toBe(60);
    expect(color.alpha).toBe(200);
  });

  it('Should compare two colors.', () => {
    const color1 = new Color(20, 40, 60, 200);
    const color2 = new Color(20, 40, 60, 200);
    const color3 = new Color(70, 90, 60, 220);

    expect(color1.equals(color2)).toBe(true);
    expect(color1.equals(color3)).toBe(false);
  });
});
