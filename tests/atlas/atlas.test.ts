import { beforeAll, describe, expect, it } from 'vitest';

import { Atlas } from '../../src/atlas/atlas.js';
import { AtlasConfig } from '../../src/atlas/atlasConfig.js';

describe('Atlas', () => {
  let config: AtlasConfig;

  beforeAll(() => {
    config = {
      name: 'test',
      saveFolder: 'out',
      folders: ['tests/atlas/testFiles'],
      trimmed: true,
      extrude: 1,
    };
  });

  it('Should pack an atlas.', () => {
    const atlas = new Atlas(config);
    const success = atlas.pack();

    expect(success).toBe(true);
    expect(atlas.packedImage?.width).toBe(132);
    expect(atlas.packedImage?.height).toBe(126);
  });

  it('Should add folder names to the file names.', () => {
    config.folderInName = true;

    const atlas = new Atlas(config);
    const success = atlas.pack();

    expect(success).toBe(true);
    for (const rect of atlas.packedRects) {
      expect(rect.name.startsWith('testFiles_')).toBe(true);
    }
  });
});
