export type AeonyConfig = {
  /**
   * The output directory for the build. Defaults to `export`.
   */
  outDir?: string;

  /**
   * Should the lua file be bundled into a single file. Defaults to false.
   */
  bundle?: boolean;

  /**
   * Should the lua file be minified. Defaults to false.
   */
  minify?: boolean;

  /**
   * Skip packing atlases. Defaults to false.
   */
  noAtlas?: boolean;

  /**
   * Emit hot reload file to output directory for the reload watcher to check. Defaults to false.
   */
  hotReload?: boolean;

  /**
   * The paths to watch for changes. If not specified, `src`, `assets`, and `aeony.toml` are watched.
   */
  watchPaths?: string[];

  /**
   * The Love2D configuration options.
   */
  love?: LoveConfig;
};

export type LoveConfig = {
  /**
   * The name of the save directory.
   */
  identity?: string;

  /**
   * Search files in source directory before save directory. Default is false.
   */
  appendidentity?: boolean;

  /**
   * The LÖVE version this game was made for. Default is '11.4'.
   */
  version?: string;

  /**
   * Attach a console (Windows only). Default is false.
   */
  console?: boolean;

  /**
   * Enable the accelerometer on iOS and Android by exposing it as a Joystick. Default is true.
   */
  accelerometerjoystick?: boolean;

  /**
   * True to save files (and read from the save directory) in external storage on Android. Default is false.
   */
  externalstorage?: boolean;

  /**
   * Enable gamma-correct rendering, when supported by the system. Default is false.
   */
  gammacorrect?: boolean;

  audio?: LoveAudioConfig;
  window?: LoveWindowConfig;
  modules?: LoveModulesConfig;
};

export type LoveAudioConfig = {
  /**
   * Request and use microphone capabilities in Android. Default is false.
   */
  mic?: boolean;

  /**
   * Keep background music playing when opening LOVE (iOS and Android only). Default is true.
   */
  mixwithsystem?: boolean;
};

export type LoveWindowConfig = {
  /**
   * The window title. Default is "Untitled".
   */
  title?: string;

  /**
   * Filepath to an image to use as the window's icon.
   */
  icon?: string;

  /**
   * The window width in pixels. Default is 800.
   */
  width?: number;

  /**
   * The window height in pixels. Default is 600.
   */
  height?: number;

  /**
   * Remove all border visuals from the window. Default is false.
   */
  borderless?: boolean;

  /**
   * Let the window be user-resizable. Default is false.
   */
  resizable?: boolean;

  /**
   * Minimum window width if the window is resizable. Default is 1.
   */
  minwidth?: number;

  /**
   * Minimum window height if the window is resizable. Default is 1.
   */
  minheight?: number;

  /**
   * Enable fullscreen. Default is false.
   */
  fullscreen?: boolean;

  /**
   * Choose between "desktop" fullscreen or "exclusive" fullscreen mode. Default is "desktop".
   */
  fullscreentype?: 'desktop' | 'exclusive';

  /**
   * Vertical sync mode. Default is 1.
   */
  vsync?: number;

  /**
   * The number of samples to use with multi-sampled antialiasing. Default is 0.
   */
  msaa?: number;

  /**
   * The number of bits per sample in the depth buffer.
   */
  depth?: number;

  /**
   * The number of bits per sample in the stencil buffer.
   */
  stencil?: number;

  /**
   * Index of the monitor to show the window in. Default is 1.
   */
  display?: number;

  /**
   * Enable high-dpi mode for the window on a Retina display. Default is false.
   */
  highdpi?: boolean;

  /**
   * Enable automatic DPI scaling when highdpi is set to true as well. Default is true.
   */
  usedpiscale?: boolean;

  /**
   * The x-coordinate of the window's position in the specified display.
   */
  x?: number;

  /**
   * The y-coordinate of the window's position in the specified display.
   */
  y?: number;
};

export type LoveModulesConfig = {
  /**
   * Enable the audio module. Default is true.
   */
  audio?: boolean;

  /**
   * Enable the data module. Default is true.
   */
  data?: boolean;

  /**
   * Enable the event module. Default is true.
   */
  event?: boolean;

  /**
   * Enable the font module. Default is true.
   */
  font?: boolean;

  /**
   * Enable the graphics module. Default is true.
   */
  graphics?: boolean;

  /**
   * Enable the image module. Default is true.
   */
  image?: boolean;

  /**
   * Enable the joystick module. Default is true.
   */
  joystick?: boolean;

  /**
   * Enable the keyboard module. Default is true.
   */
  keyboard?: boolean;

  /**
   * Enable the math module. Default is true.
   */
  math?: boolean;

  /**
   * Enable the mouse module. Default is true.
   */
  mouse?: boolean;

  /**
   * Enable the physics module. Default is true.
   */
  physics?: boolean;

  /**
   * Enable the sound module. Default is true.
   */
  sound?: boolean;

  /**
   * Enable the system module. Default is true.
   */
  system?: boolean;

  /**
   * Enable the thread module. Default is true.
   */
  thread?: boolean;

  /**
   * Enable the timer module. Default is true. Disabling it will result in delta time in love.update.
   */
  timer?: boolean;

  /**
   * Enable the touch module. Default is true.
   */
  touch?: boolean;

  /**
   * Enable the video module. Default is true.
   */
  video?: boolean;

  /**
   * Enable the window module. Default is true.
   */
  window?: boolean;
};
