const fs = require('fs');
const path = require('path');

// Read all the URLs
const data = JSON.parse(fs.readFileSync('cloudinary-sneakers-urls.json'));

const descriptions = {
  nike: 'Premium Nike sneaker performance shoe',
  addidas: 'High-quality Adidas sports footwear',
  Asics: 'Durable Asics running and lifestyle sneaker',
  jordan: 'Iconic Jordan Brand basketball sneaker',
  'new-balance': 'Comfortable New Balance athletic shoe',
  puma: 'Stylish Puma sports and lifestyle sneaker'
};

// Build TypeScript interface and data
let ts = `export interface Shoe {
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

export const SHOES: Shoe[] = [\n`;

// Fixed prices per product
const prices = [
  8295,9695,8995,13995,11895,14500,9295,12495,20695,13500, // Nike
  12999,11999,17999,21999,9999,9500,10500,9999,8500,17999,  // Adidas
  9999,9500,15999,10999,18999,13500,16999,14999,11500,14500, // Asics
  16995,17995,16995,19995,18500,18995,17500,13995,14500,12500, // Jordan
  15500,14500,9500,11999,15999,23999,9500,16500,16500,22000,   // New Balance
  13500,8500,15999,8999,7999,9500,9500,6999,8999,11999          // Puma
];

let id = 1;
let priceIdx = 0;
for (const [brand, items] of Object.entries(data)) {
  ts += `  // ${brand.toUpperCase()}\n`;
  items.forEach((item, idx) => {
    const price = prices[priceIdx];
    const origPrice = Math.floor(price * 1.3);
    ts += `  {id:'${brand[0]}${id}',name:'${item.filename.split('.')[0]}',brand:'${brand}',price:${price},originalPrice:${origPrice},image:'${item.url}',description:'${descriptions[brand]}',category:'Sneaker',gender:'Unisex',colors:['Black','White'],sizes:[6,7,8,9,10,11],rating:4.5,reviews:100,stock:25},\n`;
    priceIdx++;
    id++;
  });
}
ts += `];\n`;

fs.writeFileSync('../frontend/lib/mockShoes.ts', ts);
console.log('✅ Created new mockShoes.ts with correct Cloudinary URLs');
