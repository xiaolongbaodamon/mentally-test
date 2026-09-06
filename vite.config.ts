import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

// Case-insensitive module resolver to prevent Linux / Docker / Railway deployment failures
// when importing files whose casing might differ between Git index, Windows/macOS, and Linux.
function caseInsensitiveResolver(): Plugin {
  return {
    name: 'case-insensitive-resolver',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer || !source.startsWith('.')) return null;

      try {
        const cleanImporter = importer.split('?')[0].split('#')[0];
        const importerDir = path.dirname(cleanImporter);

        // Resolve directory parts case-insensitively
        const relativeParts = source.split(/[/\\]/);
        let currentDir = importerDir;
        for (let i = 0; i < relativeParts.length - 1; i++) {
          const part = relativeParts[i];
          if (part === '.' || part === '') continue;
          if (part === '..') {
            currentDir = path.dirname(currentDir);
            continue;
          }
          if (!fs.existsSync(currentDir)) return null;
          const dirEntries = fs.readdirSync(currentDir);
          const matchedDir = dirEntries.find((e) => e.toLowerCase() === part.toLowerCase());
          if (matchedDir) {
            currentDir = path.join(currentDir, matchedDir);
          } else {
            return null;
          }
        }

        const targetBase = relativeParts[relativeParts.length - 1];
        if (!fs.existsSync(currentDir)) return null;
        const entries = fs.readdirSync(currentDir);

        const extensions = ['', '.tsx', '.ts', '.jsx', '.js', '.json', '.mjs'];
        for (const ext of extensions) {
          const candidate = targetBase + ext;
          if (entries.includes(candidate)) {
            // Exact casing match found: let Vite's native resolver handle it directly
            return null;
          }
          const found = entries.find(
            (entry) => entry.toLowerCase() === candidate.toLowerCase()
          );
          if (found) {
            return path.resolve(currentDir, found);
          }
        }
      } catch {
        return null;
      }
      return null;
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [caseInsensitiveResolver(), react(), tailwindcss()],
    optimizeDeps: {
      include: [
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'lucide-react',
      ],
    },
    resolve: {
      dedupe: [
        '@firebase/app',
        'firebase/app',
        '@firebase/auth',
        'firebase/auth',
        '@firebase/firestore',
        'firebase/firestore',
        'react',
        'react-dom',
      ],
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
