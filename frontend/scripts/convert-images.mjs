/**
 * Convert all PNG images in public/images to WebP format.
 * Keeps originals as fallback, generates .webp versions alongside them.
 */
import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const IMAGES_DIR = join(__dirname, '..', 'public', 'images');

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getFiles(fullPath)));
    } else if (/\.(png|jpg|jpeg)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function convert() {
  const files = await getFiles(IMAGES_DIR);
  console.log(`Found ${files.length} images to convert\n`);

  for (const file of files) {
    const ext = extname(file);
    const name = basename(file, ext);
    const dir = dirname(file);
    const webpPath = join(dir, `${name}.webp`);

    const info = await stat(file);
    const originalKB = (info.size / 1024).toFixed(1);

    try {
      await sharp(file)
        .webp({ quality: 80, effort: 6 })
        .toFile(webpPath);

      const webpInfo = await stat(webpPath);
      const webpKB = (webpInfo.size / 1024).toFixed(1);
      const savings = ((1 - webpInfo.size / info.size) * 100).toFixed(0);

      console.log(`✓ ${basename(file)} (${originalKB}KB) → ${name}.webp (${webpKB}KB) — ${savings}% smaller`);
    } catch (err) {
      console.error(`✗ ${basename(file)}: ${err.message}`);
    }
  }

  console.log('\nDone! WebP versions created alongside originals.');
}

convert();
