import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react(), cssInjectedByJsPlugin()],


	build: {
		assetsInlineLimit: 4096,
		outDir: 'dist',
		emptyOutDir: true,
		rollupOptions: {
			input: 'src/index.tsx',
			output: {
				entryFileNames: 'bundle.js',
			},
		},
		minify: false,
	},
	publicDir: 'src/public'
})
