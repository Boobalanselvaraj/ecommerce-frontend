const fs = require('fs');
const path = require('path');

const makeSVG = (size, fontSize) => [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`,
  `<defs>`,
  `<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">`,
  `<stop offset="0%" stop-color="#8b5cf6"/>`,
  `<stop offset="100%" stop-color="#6d28d9"/>`,
  `</linearGradient>`,
  `</defs>`,
  `<rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#g)"/>`,
  `<text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-weight="900" font-size="${fontSize}">N</text>`,
  `</svg>`,
].join('');

fs.writeFileSync(path.join('public', 'pwa-192.svg'), makeSVG(192, 120));
fs.writeFileSync(path.join('public', 'pwa-512.svg'), makeSVG(512, 320));
console.log('SVG icons created successfully');
