/**
 * PWA Icon Generator Script
 * 
 * Для запуску:
 * 1. npm install sharp
 * 2. node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public/icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons from logo.png...\n');

  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(inputFile)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputFile);
    
    console.log(`✓ Created icon-${size}x${size}.png`);
  }

  // Generate favicon.ico (32x32)
  const faviconPath = path.join(__dirname, '../public/favicon.ico');
  await sharp(inputFile)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(faviconPath.replace('.ico', '.png'));
  
  console.log(`✓ Created favicon.png (rename to favicon.ico or use as-is)`);

  // Generate apple-touch-icon (180x180)
  const appleTouchIcon = path.join(__dirname, '../public/apple-touch-icon.png');
  await sharp(inputFile)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(appleTouchIcon);
  
  console.log(`✓ Created apple-touch-icon.png`);

  console.log('\n✅ All icons generated successfully!');
  console.log('\nNext steps:');
  console.log('1. The icons are in public/icons/');
  console.log('2. favicon.png is in public/ (you may convert to .ico if needed)');
  console.log('3. apple-touch-icon.png is in public/');
}

generateIcons().catch(console.error);
