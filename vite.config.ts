import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({plugins:[react()],build:{target:'ES2020',minify:'terser',sourcemap:false,outDir:'dist'},server:{port:3000}})
