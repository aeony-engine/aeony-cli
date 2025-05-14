import TOML from '@ltd/j-toml';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

import { AeonyConfig } from './aeonyConfig.js';

export function loadConfig(projectPath: string): AeonyConfig | undefined {
  process.chdir(projectPath);

  const configPath = path.join(projectPath, 'aeony.toml');

  if (!existsSync(configPath)) {
    process.stdout.write(`Error: aeony.toml not found in ${projectPath}\n`);
    return;
  }

  const data = readFileSync(configPath);
  return TOML.parse(data.toString(), 1, undefined, false) as AeonyConfig;
}

export function getProjectPath(project?: string): string {
  let projectPath = process.cwd();
  if (project) {
    if (path.isAbsolute(project)) {
      projectPath = project;
    } else {
      projectPath = path.join(process.cwd(), project);
    }
  }

  return projectPath;
}

export function getOutPath(projectPath: string, config: AeonyConfig): string {
  return path.join(projectPath, config.outDir ? config.outDir : 'export');
}
