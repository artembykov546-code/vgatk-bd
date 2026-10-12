import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Мини-плагин: копирует папки из frontend/ в dist/ как есть.
// Vite сам копирует только то, что импортируется из JS/CSS,
// а наши <script src="/js/..."> и <link href="/css/..."> — не модули.
function copyStaticFolders() {
  const folders = ['js', 'css', 'images', 'fonts', 'shared'];

  return {
    name: 'copy-static-folders',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      for (const folder of folders) {
        const src = path.resolve(__dirname, 'frontend', folder);
        const dest = path.resolve(outDir, folder);
        if (fs.existsSync(src)) {
          fs.cpSync(src, dest, { recursive: true });
        }
      }
    },
  };
}

export default defineConfig({
  root: path.resolve(__dirname, 'frontend'),

  // Для GitHub Pages: сайт живёт по адресу
  // https://artembykov546-code.github.io/vgatk-bd/
  base: '/vgatk-bd/',

  // Отключаем дефолтный publicDir (он копировал HTML лишний раз).
  publicDir: false,

  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'frontend/index.html'),
        dashboard: path.resolve(__dirname, 'frontend/dashboard.html'),

        admin: path.resolve(__dirname, 'frontend/admin/index.html'),
        adminLogs: path.resolve(__dirname, 'frontend/admin/logs.html'),
        adminPositions: path.resolve(__dirname, 'frontend/admin/positions.html'),
        adminSettings: path.resolve(__dirname, 'frontend/admin/settings.html'),

        students: path.resolve(__dirname, 'frontend/students/index.html'),
        studentsCreateGroup: path.resolve(__dirname, 'frontend/students/create-group.html'),
        studentsAddStudent: path.resolve(__dirname, 'frontend/students/add-student.html'),
        studentsEditStudent: path.resolve(__dirname, 'frontend/students/edit-student.html'),
        studentsGroup: path.resolve(__dirname, 'frontend/students/group.html'),
        studentsProfile: path.resolve(__dirname, 'frontend/students/profile.html'),
        studentsAddParent: path.resolve(__dirname, 'frontend/students/add-parent.html'),
        studentsAddSibling: path.resolve(__dirname, 'frontend/students/add-sibling.html'),
        studentsGraduateDistribution: path.resolve(__dirname, 'frontend/students/graduate-distribution.html'),

        graduates: path.resolve(__dirname, 'frontend/graduates/index.html'),
        graduatesGroup: path.resolve(__dirname, 'frontend/graduates/group.html'),
        graduatesDistribution: path.resolve(__dirname, 'frontend/graduates/distribution.html'),
        graduatesExpelled: path.resolve(__dirname, 'frontend/graduates/expelled.html'),
        graduatesAcademic: path.resolve(__dirname, 'frontend/graduates/academic.html'),

        employees: path.resolve(__dirname, 'frontend/employees/index.html'),
        reports: path.resolve(__dirname, 'frontend/reports/index.html'),
        profile: path.resolve(__dirname, 'frontend/profile/index.html'),
        invites: path.resolve(__dirname, 'frontend/invites/index.html'),
        register: path.resolve(__dirname, 'frontend/register/index.html'),
      },
    },
  },

  plugins: [
    copyStaticFolders(),
    {
      name: 'copy-redirects',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: '_redirects',
          source: '/*    /index.html    200\n',
        });
      },
    },
  ],

  server: {
    port: 3000,
    host: true,
    open: '/vgatk-bd/',
  },
});