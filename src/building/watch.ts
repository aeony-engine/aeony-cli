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

  const outPath = getOutPath(projectPath, config);

  buildProject(options);
  spawn('love', [outPath], { stdio: 'inherit' });

  const watcher = new Watcher([
    path.join(projectPath, 'src/'),
    path.join(projectPath, 'assets/'),
    path.join(projectPath, 'aeony.toml'),
  ]);

  watcher.on('all', (event) => {
    process.stdout.write(`\n${event} detected. Rebuilding...\n`);
    if (event === 'ready') {
      process.stdout.write('Watching for changes...\n');
    } else {
      buildProject(options);
    }
  });
}
