const fs = require('fs');
const path = require('path');

// Read the uploaded URLs from the previous script
const urlsFile = path.join(__dirname, '../cloudinary-sneakers-urls.json');

if (!fs.existsSync(urlsFile)) {
  console.log('❌ cloudinary-sneakers-urls.json not found!');
  console.log('Run: node scripts/uploadFromPublic.js first');
  process.exit(1);
}

const allImages = JSON.parse(fs.readFileSync(urlsFile, 'utf-8'));

// Brand mapping for mockShoes.ts
const brandMapping = {
  nike: 'Nike',
  addidas: 'Adidas',
  Asics: 'Asics',
  jordan: 'Jordan',
  'new-balance': 'New Balance',
  puma: 'Puma'
};

// Generate mockShoes.ts format
let mockShoesContent = `export interface Shoe {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
  description: string;
  category: string;
  gender: string;
  colors: string[];
  sizes: number[];
  rating: number;
  reviews: number;
  stock: number;
}

export const SHOES: Shoe[] = [
`;

let shoeId = 1;

// Create shoes for each brand
for (const [brand, images] of Object.entries(allImages)) {
  if (images.length === 0) continue;

  const brandName = brandMapping[brand] || brand;
  mockShoesContent += `\n  // --- ${brandName.toUpperCase()} (${images.length}) ---\n`;

  for (const img of images) {
    const productName = img.alt.split(' - ')[1] || img.filename;
    mockShoesContent += `  { 
    id: '${brand.charAt(0)}${shoeId}', 
    name: '${productName}', 
    brand: '${brandName}', 
    price: Math.floor(Math.random() * (20000 - 6000) + 6000), 
    originalPrice: Math.floor(Math.random() * (25000 - 8000) + 8000), 
    image: '${img.url}', 
    description: 'Premium ${brandName} sneaker', 
    category: 'Lifestyle', 
    gender: 'Unisex', 
    colors: ['Default'], 
    sizes: [6, 7, 8, 9, 10, 11], 
    rating: 4.5 + Math.random() * 0.5, 
    reviews: Math.floor(Math.random() * 5000), 
    stock: Math.floor(Math.random() * 50) + 5 
  },\n`;
    shoeId++;
  }
}

mockShoesContent += `];
`;

// Save to file
const outputFile = path.join(__dirname, '../generated-mockShoes.ts');
fs.writeFileSync(outputFile, mockShoesContent);

console.log('✅ Generated mockShoes.ts format!');
console.log(`📄 File saved to: backend/generated-mockShoes.ts`);
console.log(`\n📋 Instructions:`);
console.log(`  1. Open backend/generated-mockShoes.ts`);
console.log(`  2. Copy the content`);
console.log(`  3. Paste into frontend/lib/mockShoes.ts`);
console.log(`  4. Update product names, prices, and details as needed`);
console.log(`\n💡 Note: Generated files have placeholder data. Customize:`);
console.log(`  - Product names and descriptions`);
console.log(`  - Prices (prices shown are random)`);
console.log(`  - Colors, sizes, ratings, reviews`);
