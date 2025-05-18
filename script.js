const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const filterButtons = document.querySelectorAll('.filter-btn');
const downloadBtn = document.getElementById('download');

let originalImage = null;

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
    img.src = event.target.result;
  };

  if (file) {
    reader.readAsDataURL(file);
  }
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    applyFilterPixels(button.dataset.filter);
  });
});

function applyFilterPixels(type) {
  if (!originalImage) return;

  const imageData = ctx.createImageData(originalImage);
  for (let i = 0; i < originalImage.data.length; i += 4) {
    let r = originalImage.data[i];
    let g = originalImage.data[i + 1];
    let b = originalImage.data[i + 2];
    let a = originalImage.data[i + 3];

    switch (type) {
      case 'grayscale':
        const avg = (r + g + b) / 3;
        r = g = b = avg;
        break;
      case 'sepia':
        const r1 = r, g1 = g, b1 = b;
        r = r1 * 0.393 + g1 * 0.769 + b1 * 0.189;
        g = r1 * 0.349 + g1 * 0.686 + b1 * 0.168;
        b = r1 * 0.272 + g1 * 0.534 + b1 * 0.131;
        break;
      case 'brightness':
        r *= 1.3;
        g *= 1.3;
        b *= 1.3;
        break;
      case 'contrast':
        const factor = (259 * (128 + 100)) / (255 * (259 - 100));
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;
        break;
      case 'none':
        // restaurar los valores originales
        r = originalImage.data[i];
        g = originalImage.data[i + 1];
        b = originalImage.data[i + 2];
        a = originalImage.data[i + 3];
        break;
    }

    imageData.data[i] = Math.min(255, r);
    imageData.data[i + 1] = Math.min(255, g);
    imageData.data[i + 2] = Math.min(255, b);
    imageData.data[i + 3] = a;
  }

  ctx.putImageData(imageData, 0, 0);
}

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'imagen-editada.png';
  link.href = canvas.toDataURL();
  link.click();
});
