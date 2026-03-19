const fs = require('fs');
const path = require('path');

// Read cloudinary URLs
const urls = JSON.parse(fs.readFileSync('cloudinary-sneakers-urls.json'));

// Flatten all URLs in order
const allUrls = [];
['nike', 'addidas', 'Asics', 'jordan', 'new-balance', 'puma'].forEach(brand => {
  urls[brand].forEach(img => allUrls.push(img.url));
});

console.log(`Total URLs: ${allUrls.length}`);

// Read current mockShoes
let mock = fs.readFileSync('../frontend/lib/mockShoes.ts', 'utf-8');

// Find all old URLs and replace with new ones
const oldUrlPattern = /'https:\/\/res\.cloudinary\.com\/des0lvjl7\/image\/upload\/v\d+\/sneaker-store\/[^/]+\/[^']+'/g;
const matches = mock.match(oldUrlPattern);

console.log(`Found ${matches ? matches.length : 0} old URLs in mockShoes.ts`);

let replaceIdx = 0;
mock = mock.replace(oldUrlPattern, () => {
  const newUrl = `'${allUrls[replaceIdx]}'`;
  if (replaceIdx < 3) {
    console.log(`Replacing #${replaceIdx}: ${newUrl.substring(0, 80)}...`);
  }
  replaceIdx++;
  return newUrl;
});

// Save updated file
fs.writeFileSync('../frontend/lib/mockShoes.ts', mock);
console.log(`\n✅ Updated ${replaceIdx} image URLs in mockShoes.ts`);
