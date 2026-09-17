const { cloudImage } = require('./cloudinary.js');

const samples = [
  '01-hero-landing.webp',
  'landing-images/01-hero-landing.webp',
  'brand/logo-mark.png',
  'icons/icon-192.png',
  'favicon.png',
  'frontend/public/landing-images/01-hero-landing.webp'
];

console.log("--- Test des URLs Cloudinary ---");
for (const sample of samples) {
  console.log(`${sample} => ${cloudImage(sample)}`);
}
