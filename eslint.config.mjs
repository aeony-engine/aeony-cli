import { defineConfig, globalIgnores } from 'eslint/config';
import aeonyConfig from '@aeony/eslint-config';

export default defineConfig([globalIgnores(['./dist/**', 'node_modules/**', 'eslint.config.mjs']), ...aeonyConfig]);
