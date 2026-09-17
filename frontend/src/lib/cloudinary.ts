const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "gks3f2st";

const DEFAULT_FOLDER = "akatech/landing-images";

export function cloudImage(publicPath: string, options: { width?: number } = {}) {
  const cleanPath = publicPath.replace(/^\/+/, "").replace(/\\/g, "/");
  const normalizedPath = cleanPath
    .replace(/^((frontend\/)?public\/|images\/|akatech\/)+/i, "")
    .replace(/^\/+/, "");

  const segments = normalizedPath.split("/").filter(Boolean);
  const fileName = segments.pop() ?? normalizedPath;

  const folder =
    segments.length > 0
      ? ["akatech", ...segments].join("/")
      : DEFAULT_FOLDER;

  const baseName = fileName.includes(".") ? fileName.slice(0, fileName.lastIndexOf(".")) : fileName;
  const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase() : "jpg";

  const transforms = ["f_auto", "q_auto"];
  if (options.width) transforms.push(`w_${options.width}`);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(",")}/${folder}/${baseName}.${ext}`;
}
