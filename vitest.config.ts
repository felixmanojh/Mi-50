import { mergeConfig } from 'vitest/config';
import baseConfig from './vite.config';

export default mergeConfig(baseConfig, {
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
