function cloudImage(publicPath, options = {}) {
  const cleanPath = publicPath.replace(/^\/+/, "").replace(/\\/g, "/");
  const segments = cleanPath.split("/").filter(Boolean);
  const fileName = segments.pop() ?? cleanPath;

  const folder =
    segments.length > 0
      ? ["akatech", ...segments].join("/")
      : "akatech/landing-images";

  const baseName = fileName.includes(".") ? fileName.slice(0, fileName.lastIndexOf(".")) : fileName;
  const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase() : "jpg";

  const transforms = ["f_auto", "q_auto"];
  if (options.width) transforms.push(`w_${options.width}`);

  return `https://res.cloudinary.com/gks3f2st/image/upload/${transforms.join(",")}/${folder}/${baseName}.${ext}`;
}

const samples = [
  'landing-images/hero.webp',
  'landing-images/dashboard.webp',
  'brand/logo-mark.png',
  'icons/icon-192.png',
  'favicon.png',
];

console.log("--- Test des URLs Cloudinary (Cloud: gks3f2st) ---");
for (const sample of samples) {
  console.log(`${sample} => ${cloudImage(sample)}`);
}
