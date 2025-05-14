import { writeFileSync } from 'fs';
import * as path from 'path';
import * as tstl from 'typescript-to-lua';

/**
 * This plugin is used to emit a hot reload file to the output directory for the reload watcher in aeony to check.
 */
const plugin: tstl.Plugin = {
  afterEmit(_program, options, _emitHost, _result) {
    if (options.outDir) {
      const filePath = path.join(options.outDir, 'hotReload.dat');
      writeFileSync(filePath, new Date().toTimeString());
    }
  },
};

export default plugin;
