import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
	input: 'src/db.js',
	output: {
		file: 'bundle.js',
		format: 'es'
	},
    plugins: [nodeResolve()]
};