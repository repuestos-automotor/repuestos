const CLOUDINARY_CLOUD  = 'dljdwhnu7';
const CLOUDINARY_PRESET = 'repuestos';
const CLOUDINARY_FOLDER = 'repuestos-automotor';

async function subirImagenCloudinary(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_PRESET);
  formData.append('folder', CLOUDINARY_FOLDER);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded/e.total*100)); };
    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText);
      if (res.secure_url) resolve(res.secure_url);
      else reject(new Error(res.error?.message || 'Error Cloudinary'));
    };
    xhr.onerror = () => reject(new Error('Error de red'));
    xhr.send(formData);
  });
}
window.subirImagenCloudinary = subirImagenCloudinary;
