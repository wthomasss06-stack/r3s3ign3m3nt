function cloudImage(publicPath, options = {}) {
  const cleanPath = publicPath.replace(/^\/+/, '').replace(/\\/g, '/');
  const normalizedPath = cleanPath
    .replace(/^((frontend\/)?public\/|images\/|akatech\/)+/i, '')
    .replace(/^\/+/, '');

  const segments = normalizedPath.split('/').filter(Boolean);
  const fileName = segments.pop() ?? normalizedPath;
  const DEFAULT_FOLDER = 'landing-images';
  const folder = segments.length > 1 ? segments.slice(0, -1).join('/') : segments.length === 1 ? segments[0] : DEFAULT_FOLDER;
  const baseName = fileName.includes('.') ? fileName.slice(0, fileName.lastIndexOf('.')) : fileName;
  const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase() : 'jpg';
  const transforms = ['f_auto', 'q_auto'];
  if (options.width) transforms.push('w_' + options.width);
  const folderPath = folder && folder.trim().length > 0 ? `${folder}/` : '';
  return `https://res.cloudinary.com/gks3f2st/image/upload/${transforms.join(',')}/${folderPath}${baseName}.${ext}`;
}

const samples = [
  '01-hero-landing.webp',
  'brand/logo-mark.png',
  'akatech/landing-images/01-hero-landing.webp',
  '/images/01-hero-landing.webp',
  'frontend/public/landing-images/01-hero-landing.webp'
];

for (const sample of samples) {
  console.log(sample + ' => ' + cloudImage(sample));
}
