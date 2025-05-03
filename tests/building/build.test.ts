import TOML from '@ltd/j-toml';
import { readFileSync } from 'fs';
import { describe, expect, it } from 'vitest';

import { buildConfLua } from '../../src/building/build.js';

describe('build.ts', () => {
  it('Should build the conf.lua file.', () => {
    const expectedLua = `function love.conf(config)
  config.identity = "com.example.aeony"
  config.appendidentity = true
  config.version = "11.4"
  config.console = true
  config.accelerometerjoystick = true
  config.externalstorage = true
  config.gammacorrect = true

  config.audio.mic = true
  config.audio.mixwithsystem = true

  config.window.title = "Aeony"
  config.window.icon = "assets/icon.png"
  config.window.width = 1280
  config.window.height = 720
  config.window.borderless = false
  config.window.resizable = true
  config.window.minwidth = 640
  config.window.minheight = 360
  config.window.fullscreen = false
  config.window.fullscreentype = "desktop"
  config.window.vsync = 0
  config.window.msaa = 1
  config.window.depth = 24
  config.window.stencil = 24
  config.window.display = 1
  config.window.highdpi = true
  config.window.usedpiscale = true
  config.window.x = 100
  config.window.y = 200

  config.modules.audio = true
  config.modules.data = true
  config.modules.event = true
  config.modules.font = true
  config.modules.graphics = true
  config.modules.image = true
  config.modules.joystick = true
  config.modules.keyboard = true
  config.modules.math = true
  config.modules.mouse = true
  config.modules.physics = true
  config.modules.sound = true
  config.modules.system = true
  config.modules.thread = true
  config.modules.timer = true
  config.modules.touch = true
  config.modules.video = true
  config.modules.window = true
end
`;

    const data = readFileSync('tests/building/testFiles/aeony.toml');
    const config = TOML.parse(data.toString(), 1, undefined, false);
    const confLua = buildConfLua(config);
    console.log(confLua);
    expect(confLua).toBe(expectedLua);
  });
});
