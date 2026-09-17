const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "gks3f2st";

const FOLDER_MAP: Record<string, string> = {
  "landing-images": "akatech/images",
  brand: "akatech/brand",
  icons: "akatech/icons",
};

export function cloudImage(publicPath: string, options: { width?: number } = {}) {
  const cleanPath = publicPath.replace(/^\/+/, "").replace(/\\/g, "/");
  const segments = cleanPath.split("/");
  const topLevel = segments[0] ?? "";
  const folder = topLevel in FOLDER_MAP ? FOLDER_MAP[topLevel] : "akatech/assets";
  const fileName = segments.pop() ?? cleanPath;
  const baseName = fileName.includes(".") ? fileName.slice(0, fileName.lastIndexOf(".")) : fileName;
  const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase() : "jpg";

  const transforms = ["f_auto", "q_auto"];
  if (options.width) transforms.push(`w_${options.width}`);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(",")}/${folder}/${baseName}.${ext}`;
}
