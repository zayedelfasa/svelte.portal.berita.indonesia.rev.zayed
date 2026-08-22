import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		}),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.svg', 'robots.txt'],
			manifest: {
				name: 'Portal Berita',
				short_name: 'Berita',
				description: 'Portal Berita Indonesia — 11 media lokal',
				theme_color: '#111827',
				background_color: '#ffffff',
				display: 'standalone',
				icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,woff2}'],
				runtimeCaching: [
					{
						urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
						handler: 'NetworkFirst',
						options: {
							cacheName: 'pages',
							networkTimeoutSeconds: 3,
							expiration: { maxEntries: 50, maxAgeSeconds: 86400 }
						}
					}
				]
			}
		})
	]
});
