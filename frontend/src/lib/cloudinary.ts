const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "gks3f2st";

const DEFAULT_LANDING_FOLDER = "landing-images";
const ROOT_ASSETS = new Set(["favicon.png", "favicon.ico", "manifest.json"]);

export function cloudImage(publicPath: string, options: { width?: number } = {}) {
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

  const transforms = ["f_auto", "q_auto"];
  if (options.width) transforms.push(`w_${options.width}`);

  const folderPath = folder && folder.trim().length > 0 ? `${folder}/` : "";
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(",")}/${folderPath}${baseName}.${ext}`;
}
