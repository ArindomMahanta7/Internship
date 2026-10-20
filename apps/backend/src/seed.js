/* Seeds the product catalog: downloads freely-licensed phone photos from
 * Wikimedia Commons into apps/frontend/public/products/ and upserts the
 * matching MongoDB documents (images[] = origin-relative paths, so Next
 * serves them straight from /public with no CORS involved).
 *
 *   node src/seed.js
 *
 * Idempotent - re-running refreshes the image files and updates rows in
 * place instead of duplicating them. */

import "dotenv/config";
import mongoose from "mongoose";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import connectdb from "./config/db.js";
import Product from "./models/productModel.js";

const PUBLIC_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "frontend",
  "public",
  "products"
);

/* `file` is the Wikimedia Commons filename; `slug` becomes both the filename
 * on disk and the image path stored in Mongo. */
const CATALOG = [
  {
    brandName: "Samsung",
    modelName: "Galaxy S25 Ultra",
    tagline: "Galaxy AI is here",
    price: 119999,
    oldPrice: 134999,
    badge: "Flagship",
    color: "#2563eb",
    stock: 12,
    file: "Samsung_Galaxy_S25_Ultra_Titanium_Silverblue.jpg",
    slug: "galaxy-s25-ultra",
    description:
      "6.9-inch QHD+ AMOLED, Snapdragon 8 Elite, 200MP quad camera with Galaxy AI photo tools and a built-in S Pen.",
  },
  {
    brandName: "Samsung",
    modelName: "Galaxy S24 Ultra",
    tagline: "Galaxy AI is here",
    price: 109999,
    oldPrice: 129999,
    badge: "Flagship",
    color: "#1d4ed8",
    stock: 8,
    file: "Samsung_S24_Ultra_Phone.png",
    slug: "galaxy-s24-ultra",
    description:
      "Titanium frame, 6.8-inch QHD+ AMOLED, Snapdragon 8 Gen 3 and a 200MP camera with 5x optical zoom.",
  },
  {
    brandName: "OnePlus",
    modelName: "OnePlus 13",
    tagline: "Every shot a masterpiece",
    price: 69999,
    oldPrice: 72999,
    badge: "Hot",
    color: "#0f172a",
    stock: 15,
    file: "OnePlus_13_back.jpg",
    slug: "oneplus-13",
    description:
      "Snapdragon 8 Elite, 6.82-inch 2K ProXmoion display, 6000mAh silicon-carbon battery and Hasselblad-tuned cameras.",
  },
  {
    brandName: "Redmi",
    modelName: "Note 14 Pro+ 5G",
    tagline: "200MP pro-grade camera",
    price: 30999,
    oldPrice: 34999,
    badge: "Best value",
    color: "#a855f7",
    stock: 30,
    file: "Redmi_Note_14_Pro%2B_(1).jpg",
    slug: "redmi-note-14-pro-plus",
    description:
      "200MP main camera, 6.67-inch 1.5K AMOLED with 120Hz refresh and 120W HyperCharge.",
  },
  {
    brandName: "realme",
    modelName: "14 Pro+ 5G",
    tagline: "World's first cold-sensitive color",
    price: 27999,
    oldPrice: 32999,
    badge: null,
    color: "#f59e0b",
    stock: 24,
    file: "Realme_14_Pro_Plus_back.jpg",
    slug: "realme-14-pro-plus",
    description:
      "50MP periscope telephoto, 6.7-inch 120Hz AMOLED and 6000mAh battery in a slim curved-body design.",
  },
  {
    brandName: "Nokia",
    modelName: "G42 5G",
    tagline: "Built to last",
    price: 12499,
    oldPrice: 14999,
    badge: null,
    color: "#14b8a6",
    stock: 40,
    file: "Nokia_4-2_back.jpg",
    slug: "nokia-g42-5g",
    description:
      "5G-ready daily driver with a 6.6-inch HD+ display, 50MP camera and three years of Android upgrades.",
  },
  {
    brandName: "Micromax",
    modelName: "Bharath 1",
    tagline: "Desi smartphone",
    price: 5999,
    oldPrice: 7499,
    badge: "Budget",
    color: "#ef4444",
    stock: 55,
    file: "Micromax_Bharath_1_2017.jpg",
    slug: "micromax-bharath-1",
    description:
      "Entry-level dual-SIM smartphone with a 5-inch display, 2000mAh battery and stock Android.",
  },
  {
    brandName: "Apple",
    modelName: "iPhone 15 Pro",
    tagline: "Titanium. So strong. So light.",
    price: 134900,
    oldPrice: 144900,
    badge: "Flagship",
    color: "#94a3b8",
    stock: 6,
    file: "Back_view_of_iPhone_15_Pro_Natural_titanium.jpg",
    slug: "iphone-15-pro",
    description:
      "A17 Pro chip, titanium design, 48MP main camera with 7x telephoto range and USB-C.",
  },
  {
    brandName: "Google",
    modelName: "Pixel 8",
    tagline: "Ask more of your phone",
    price: 59999,
    oldPrice: 69999,
    badge: null,
    color: "#ec4899",
    stock: 11,
    file: "Google_Pixel_8_Rose_front.jpg",
    slug: "pixel-8",
    description:
      "Google Tensor G3, 6.2-inch Actua display and the best-in-class camera with seven years of OS updates.",
  },
];

const SOURCE = "https://commons.wikimedia.org/wiki/Special:FilePath/";

async function fetchImage(file) {
  const url = `${SOURCE}${file}?width=900`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status} for ${file}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 3000) throw new Error(`Suspiciously small image: ${file}`);
  return buf;
}

async function seed() {
  await connectdb();
  // connectdb() swallows its own errors, so confirm before writing.
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Could not connect to MongoDB - check MONGODB_URL");
  }

  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  for (const item of CATALOG) {
    const ext = item.file.toLowerCase().endsWith(".png") ? ".png" : ".jpg";
    const imageName = `${item.slug}${ext}`;

    try {
      const buf = await fetchImage(item.file);
      await fs.writeFile(path.join(PUBLIC_DIR, imageName), buf);
      console.log(`  image  ${imageName}  (${buf.length} bytes)`);
    } catch (err) {
      // A missing photo must not abort the seed - the UI falls back to the
      // generated phone art when images[] is empty.
      console.warn(`  image  ${item.slug} FAILED: ${err.message}`);
    }

    const { file, slug, ...doc } = item;

    const existing = await Product.findOne({ modelName: doc.modelName, brandName: doc.brandName });
    const images = [`/products/${imageName}`];

    if (existing) {
      Object.assign(existing, doc, { images });
      await existing.save();
      console.log(`  update ${doc.brandName} ${doc.modelName}`);
    } else {
      await Product.create({ ...doc, images });
      console.log(`  create ${doc.brandName} ${doc.modelName}`);
    }
  }

  const total = await Product.countDocuments();
  console.log(`\nDone - catalog now has ${total} products.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
