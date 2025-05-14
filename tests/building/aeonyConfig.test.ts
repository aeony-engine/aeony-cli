import TOML from '@ltd/j-toml';
import { readFileSync } from 'fs';
import { describe, expect, it } from 'vitest';

import { AeonyConfig } from '../../src/building/aeonyConfig.js';

describe('AeonyConfig', () => {
  it('should load the config', () => {
    const data = readFileSync('tests/building/testFiles/aeony.toml');
    const config = TOML.parse(data.toString(), 1, undefined, false) as AeonyConfig;

    expect(config).toBeDefined();

    expect(config.outDir).toBe('export');
    expect(config.bundle).toBe(true);
    expect(config.minify).toBe(true);
    expect(config.noAtlas).toBe(false);
    expect(config.hotReload).toBe(true);
    expect(config.watchPaths).toEqual(['src', 'assets']);

    expect(config.love).toBeDefined();
    expect(config.love?.identity).toBe('com.example.aeony');
    expect(config.love?.appendidentity).toBe(true);
    expect(config.love?.version).toBe('11.4');
    expect(config.love?.console).toBe(true);
    expect(config.love?.accelerometerjoystick).toBe(true);
    expect(config.love?.externalstorage).toBe(true);
    expect(config.love?.gammacorrect).toBe(true);

    expect(config.love?.audio).toBeDefined();
    expect(config.love?.audio?.mic).toBe(true);
    expect(config.love?.audio?.mixwithsystem).toBe(true);

    expect(config.love?.window).toBeDefined();
    expect(config.love?.window?.title).toBe('Aeony');
    expect(config.love?.window?.icon).toBe('assets/icon.png');
    expect(config.love?.window?.width).toBe(1280);
    expect(config.love?.window?.height).toBe(720);
    expect(config.love?.window?.borderless).toBe(false);
    expect(config.love?.window?.resizable).toBe(true);
    expect(config.love?.window?.minwidth).toBe(640);
    expect(config.love?.window?.minheight).toBe(360);
    expect(config.love?.window?.fullscreen).toBe(false);
    expect(config.love?.window?.fullscreentype).toBe('desktop');
    expect(config.love?.window?.vsync).toBe(0);
    expect(config.love?.window?.msaa).toBe(1);
    expect(config.love?.window?.depth).toBe(24);
    expect(config.love?.window?.stencil).toBe(24);
    expect(config.love?.window?.display).toBe(1);
    expect(config.love?.window?.highdpi).toBe(true);
    expect(config.love?.window?.usedpiscale).toBe(true);
    expect(config.love?.window?.x).toBe(100);
    expect(config.love?.window?.y).toBe(200);

    expect(config.love?.modules).toBeDefined();
    expect(config.love?.modules?.audio).toBe(true);
    expect(config.love?.modules?.data).toBe(true);
    expect(config.love?.modules?.event).toBe(true);
    expect(config.love?.modules?.font).toBe(true);
    expect(config.love?.modules?.graphics).toBe(true);
    expect(config.love?.modules?.image).toBe(true);
    expect(config.love?.modules?.joystick).toBe(true);
    expect(config.love?.modules?.keyboard).toBe(true);
    expect(config.love?.modules?.mouse).toBe(true);
    expect(config.love?.modules?.physics).toBe(true);
    expect(config.love?.modules?.sound).toBe(true);
    expect(config.love?.modules?.system).toBe(true);
    expect(config.love?.modules?.timer).toBe(true);
    expect(config.love?.modules?.touch).toBe(true);
    expect(config.love?.modules?.window).toBe(true);
  });
});
