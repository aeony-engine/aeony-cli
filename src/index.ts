import { Command } from 'commander';

import { packAtlas } from './atlas/main.js';
import { buildAndRun, buildProject, BuildProjectOptions, packLove } from './building/build.js';
import { watchForChanges } from './building/watch.js';

type PackAtlasOptions = {
  project?: string;
};

const program = new Command();
program.name('Aeony CLI').description('Command line tools for Aeony').version('0.1.0');

const atlas = program.command('atlas');

atlas
  .command('pack')
  .description('Pack images into an atlas')
  .option('-p, --project <string>')
  .action(({ project }: PackAtlasOptions) => {
    packAtlas(project);
  });

program
  .command('.love')
  .description('Create a .love file from a folder.')
  .option('-n --name <string>', 'The name of the .love file.')
  .option('-p, --project <string>', 'The input folder. Defaults to export.')
  .action(packLove);

program
  .command('build')
  .description('Build the Aeony project')
  .option('-c --clean', 'Clean the output folder before building.')
  .option('-p --project <string>', 'The project folder.')
  .action((options: BuildProjectOptions) => {
    buildProject(options);
  });

program
  .command('run')
  .description('Build and run the Aeony project.')
  .option('-c --clean', 'Clean the output folder before building.')
  .option('-p --project <string>', 'The project folder.')
  .action((options: BuildProjectOptions) => {
    buildAndRun(options);
  });

program
  .command('watch')
  .description('Watch for changes and rebuild the project.')
  .option('-c --clean', 'Clean the output folder before building.')
  .option('-p --project <string>', 'The project folder.')
  .action((options: BuildProjectOptions) => {
    watchForChanges(options);
  });

program.parse();
