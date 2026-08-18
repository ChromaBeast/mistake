import opentype from "opentype.js";
import fs from "fs";
import path from "path";

async function generate() {
  const fontPath = path.resolve("node_modules/@fontsource/fraunces/files/fraunces-latin-700-normal.woff");
  const buffer = fs.readFileSync(fontPath);
  const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));

  // Helper to center a string inside W x H
  function getCenteredPath(text, targetW, targetH, fontSize, pad = 0) {
    const rawPath = font.getPath(text, 0, 0, fontSize);
    const box = rawPath.getBoundingBox();
    const w = box.x2 - box.x1;
    const h = box.y2 - box.y1;

    // Calculate baseline position to center bounding box in [targetW, targetH]
    const x = (targetW - w) / 2 - box.x1;
    const y = (targetH - h) / 2 + h - box.y2; // since y increases downwards in SVG

    const path = font.getPath(text, x, y, fontSize);
    const finalBox = path.getBoundingBox();
    console.log(`Text "${text}" [${fontSize}px] centered in ${targetW}x${targetH} -> bbox:`, finalBox);
    return path.toPathData(2);
  }

  // 1. Favicon 32x32
  const faviconPathData = getCenteredPath("M", 32, 32, 20);
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="7" fill="#0f172a"/>
  <path d="${faviconPathData}" fill="#ffffff"/>
</svg>`;

  fs.writeFileSync("public/favicon.svg", faviconSvg);
  fs.writeFileSync("src/app/icon.svg", faviconSvg);

  // 2. Full Text Logo "Mistake"
  const rawWordPath = font.getPath("Mistake", 0, 0, 28);
  const wordBox = rawWordPath.getBoundingBox();
  const wordW = Math.ceil(wordBox.x2 - wordBox.x1);
  const wordH = Math.ceil(wordBox.y2 - wordBox.y1);
  const padX = 4;
  const padY = 4;
  const logoW = wordW + padX * 2;
  const logoH = wordH + padY * 2;

  const wordPathData = getCenteredPath("Mistake", logoW, logoH, 28);

  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${logoW} ${logoH}" width="${logoW}" height="${logoH}">
  <path d="${wordPathData}" fill="#0f172a"/>
</svg>`;

  const logoSvgDark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${logoW} ${logoH}" width="${logoW}" height="${logoH}">
  <path d="${wordPathData}" fill="#f8fafc"/>
</svg>`;

  fs.writeFileSync("public/logo.svg", logoSvg);
  fs.writeFileSync("public/logo-dark.svg", logoSvgDark);

  // 3. Logo Mark + Text Combo
  const markSize = 28;
  const radius = 6;
  const gap = 10;
  const comboW = markSize + gap + logoW;
  const comboH = Math.max(markSize, logoH);

  const markPathData = getCenteredPath("M", markSize, markSize, 18);

  const comboSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${comboW} ${comboH}" width="${comboW}" height="${comboH}">
  <g transform="translate(0, ${(comboH - markSize) / 2})">
    <rect width="${markSize}" height="${markSize}" rx="${radius}" fill="#0f172a"/>
    <path d="${markPathData}" fill="#ffffff"/>
  </g>
  <g transform="translate(${markSize + gap}, ${(comboH - logoH) / 2})">
    <path d="${wordPathData}" fill="#0f172a"/>
  </g>
</svg>`;

  const comboSvgDark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${comboW} ${comboH}" width="${comboW}" height="${comboH}">
  <g transform="translate(0, ${(comboH - markSize) / 2})">
    <rect width="${markSize}" height="${markSize}" rx="${radius}" fill="#f8fafc"/>
    <path d="${markPathData}" fill="#090d16"/>
  </g>
  <g transform="translate(${markSize + gap}, ${(comboH - logoH) / 2})">
    <path d="${wordPathData}" fill="#f8fafc"/>
  </g>
</svg>`;

  fs.writeFileSync("public/logo-full.svg", comboSvg);
  fs.writeFileSync("public/logo-full-dark.svg", comboSvgDark);
  console.log("✓ All SVG assets generated with exact optical centering and vector Fraunces contours!");
}

generate().catch(console.error);
