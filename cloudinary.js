// lib/cloudinary.js
// Convertit un chemin d'image local ou relatif en URL CDN Cloudinary optimisée.

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "gks3f2st";
const DEFAULT_LANDING_FOLDER = "landing-images";
const ROOT_ASSETS = new Set(["favicon.png", "favicon.ico", "manifest.json"]);
const VIDEO_EXTENSIONS = new Set(["webm", "mp4", "mov", "m4v", "avi"]);

/**
 * Generates Cloudinary CDN URL for local image paths.
 * @param {string} publicPath - ex: '01-hero-landing.webp', 'landing-images/01-hero-landing.webp', 'brand/logo-mark.png'
 * @param {{ width?: number }} [options]
 * @returns {string}
 */
export function cloudImage(publicPath, options = {}) {
  const cleanPath = publicPath.replace(/^\/+/, "").replace(/\\/g, "/");
  const normalizedPath = cleanPath
    .replace(/^((frontend\/)?public\/|images\/|akatech\/)+/i, "")
    .replace(/^\/+/, "");

  const segments = normalizedPath.split("/").filter(Boolean);
  const fileName = segments.pop() ?? normalizedPath;

  let folder = "";
  if (segments.length > 0) {
    folder = segments.join("/");
  } else if (!ROOT_ASSETS.has(fileName.toLowerCase())) {
    folder = DEFAULT_LANDING_FOLDER;
  }

  const baseName = fileName.includes(".") ? fileName.slice(0, fileName.lastIndexOf(".")) : fileName;
  const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase() : "jpg";
  const resourceType = VIDEO_EXTENSIONS.has(ext) ? "video" : "image";

  const transforms = ["f_auto", "q_auto"];
  if (options.width) transforms.push(`w_${options.width}`);

  const folderPath = folder && folder.trim().length > 0 ? `${folder}/` : "";
  return `https://res.cloudinary.com/${CLOUD_NAME}/${resourceType}/upload/${transforms.join(",")}/${folderPath}${baseName}.${ext}`;
}

export const cld = cloudImage;
