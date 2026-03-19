const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const BRANDS = ['nike', 'addidas', 'Asics', 'jordan', 'new-balance', 'puma'];
const SNEAKERS_PATH = path.join(__dirname, '../../frontend/public/images/sneakers');

async function uploadAllImages() {
  console.log('🚀 Starting Cloudinary upload...\n');

  const allImages = {};

  for (const brand of BRANDS) {
    const brandPath = path.join(SNEAKERS_PATH, brand);

    // Check if brand folder exists
    if (!fs.existsSync(brandPath)) {
      console.log(`⚠️  Folder not found: sneakers/${brand}/`);
      allImages[brand] = [];
      continue;
    }

    const files = fs.readdirSync(brandPath).filter(f => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
    );

    if (files.length === 0) {
      console.log(`⚠️  No images in: sneakers/${brand}/`);
      allImages[brand] = [];
      continue;
    }

    console.log(`📤 Uploading ${files.length} images for ${brand.toUpperCase()}...`);
    allImages[brand] = [];

    for (const file of files) {
      try {
        const filePath = path.join(brandPath, file);
        const nameOnly = file.replace(/\.[^.]+$/, '').toLowerCase();

        const result = await cloudinary.uploader.upload(filePath, {
          public_id: `sneaker-store/${brand}/${nameOnly}`,
          folder: `sneaker-store/${brand}`,
          resource_type: 'auto'
        });

        allImages[brand].push({
          filename: file,
          url: result.secure_url,
          public_id: result.public_id,
          alt: `${brand} - ${nameOnly}`
        });

        console.log(`  ✅ ${file}`);
      } catch (error) {
        console.log(`  ❌ ${file}: ${error.message}`);
      }
    }
  }

  // Save all URLs to file
  const outputPath = path.join(__dirname, '../cloudinary-sneakers-urls.json');
  fs.writeFileSync(outputPath, JSON.stringify(allImages, null, 2));

  console.log(`\n✅ Upload complete!`);
  console.log(`📊 Summary:`);
  
  let totalUploaded = 0;
  for (const [brand, images] of Object.entries(allImages)) {
    console.log(`  ${brand.toUpperCase()}: ${images.length} images`);
    totalUploaded += images.length;
  }
  
  console.log(`\n📁 Total uploaded: ${totalUploaded} images`);
  console.log(`📄 Results saved to: backend/cloudinary-sneakers-urls.json`);
  console.log(`\n📋 Next steps:`);
  console.log(`  1. Check the generated JSON file`);
  console.log(`  2. Copy URLs and update mockShoes.ts`);
  console.log(`  3. Restart your dev server`);
}

uploadAllImages().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
