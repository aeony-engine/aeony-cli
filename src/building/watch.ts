import { spawn } from 'child_process';
import path from 'path';
import Watcher from 'watcher';

import { buildProject, BuildProjectOptions } from './build.js';
import { getOutPath, getProjectPath, loadConfig } from './configLoader.js';

export function watchForChanges(options: BuildProjectOptions): void {
  const projectPath = getProjectPath(options.project);
  const config = loadConfig(projectPath);

  if (!config) {
    return;
  }

  if (config.watchPaths) {
    config.watchPaths.forEach((watchPath) => {
      if (!path.isAbsolute(watchPath)) {
        watchPath = path.join(projectPath, watchPath);
      }
    });
  } else {
    // Default watch paths.
    config.watchPaths = [
      path.join(projectPath, 'src'),
      path.join(projectPath, 'assets'),
      path.join(projectPath, 'aeony.toml'),
    ];
  }

  const outPath = getOutPath(projectPath, config);

  buildProject(options);
  spawn('love', [outPath], { stdio: 'inherit' });

  const watcher = new Watcher(config.watchPaths, { recursive: true });

  watcher.on('all', (event) => {
    process.stdout.write(`\n${event} detected. Rebuilding...\n`);
    if (event === 'ready') {
      process.stdout.write('Watching for changes...\n');
    } else {
      buildProject(options);
    }
  });
}
