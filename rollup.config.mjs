import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';

export default [
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/snbt.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [typescript()],
  },
  {
    input: 'dist/index.d.ts',
    output: {
      file: 'dist/snbt.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
