/**
 * @file 构建入口
 * @author loongfay
 */
import {defineConfig} from 'vite';
import path from 'path';

export default defineConfig({
    base: './',
    server: {
        host: '0.0.0.0',
    },
    resolve: {
        alias: {
            '@src': path.resolve(__dirname, 'src'),
        },
    },
    plugins: [],
    css: {
        modules: {
            localsConvention: 'camelCaseOnly',
        },
    },
    build: {
        emptyOutDir: false,
        assetsDir: 'static/newapp',
        rollupOptions: {
            cache: true,
        },
        sourcemap: false,
    },
    cacheDir: 'node_modules/.vite',
});
