let filters = document.querySelectorAll("ul li input");
let saturate = document.getElementById("saturate");
let contrast = document.getElementById("contrast");
let brightness = document.getElementById("brightness");
let sepia = document.getElementById("sepia");
let grayscale = document.getElementById("grayscale");
let blur = document.getElementById("blur");
let HueRotate = document.getElementById("Hue-Rotate");
let upload = document.getElementById("upload");
let download = document.getElementById("download");
let image = document.getElementById("image");
let reset = document.getElementById("reset");
let canvas = document.querySelector("canvas");
let imageBox = document.querySelector(".image-box");
const ctx = canvas.getContext("2d");

let originalImage = null;
let currentImage = null;
let isCropping = false;
let startX = 0,
  startY = 0,
  endX = 0,
  endY = 0;

function getFilterString() {
  return `
    saturate(${saturate.value}%)
    hue-rotate(${HueRotate.value}deg)
    blur(${blur.value}px)
    grayscale(${grayscale.value})
    sepia(${sepia.value}%)
    brightness(${brightness.value}%)
    contrast(${contrast.value}%)
  `;
}

function drawCurrent() {
  if (!currentImage) return;
  if (!canvas.width || !canvas.height) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.filter = getFilterString();
  ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
}
window.onload = function () {
  download.style.display = "none";
  reset.style.display = "none";
  imageBox.style.display = "none";
};

upload.addEventListener("change", () => {
  if (!upload.files || !upload.files[0]) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    originalImage = new Image();
    originalImage.src = ev.target.result;
    originalImage.onload = () => {
      canvas.width = originalImage.naturalWidth;
      canvas.height = originalImage.naturalHeight;
      currentImage = originalImage;
      drawCurrent();
      download.style.display = "inline-block";
      reset.style.display = "inline-block";
      imageBox.style.display = "block";
      image.style.display = "none";
    };
  };
  reader.readAsDataURL(upload.files[0]);
});

document.addEventListener("contextmenu", (e) => e.preventDefault());

canvas.addEventListener("mousedown", (e) => {
  if (e.button !== 2) return;
  if (!currentImage) return;
  startX = e.offsetX;
  startY = e.offsetY;
  isCropping = true;
});
canvas.addEventListener("mousemove", (e) => {
  if (!isCropping) return;
  endX = e.offsetX;
  endY = e.offsetY;

  drawCurrent();

  ctx.save();
  ctx.filter = "none";

  let x = Math.min(startX, endX);
  let y = Math.min(startY, endY);
  let w = Math.abs(endX - startX);
  let h = Math.abs(endY - startY);

  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.setLineDash([6]);
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "rgba(255,0,0,0.2)";
  ctx.fillRect(x, y, w, h);
  ctx.setLineDash([]);

  ctx.restore();
});
canvas.addEventListener("mouseup", (e) => {
  if (!isCropping) return;
  isCropping = false;
  endX = e.offsetX;
  endY = e.offsetY;

  let x = Math.min(startX, endX);
  let y = Math.min(startY, endY);
  let width = Math.abs(endX - startX);
  let height = Math.abs(endY - startY);
  if (width === 0 || height === 0) return;
  let scaleX = originalImage.naturalWidth / canvas.width;
  let scaleY = originalImage.naturalHeight / canvas.height;

  let srcX = x * scaleX;
  let srcY = y * scaleY;
  let srcW = width * scaleX;
  let srcH = height * scaleY;
  let temp = document.createElement("canvas");
  let tctx = temp.getContext("2d");
  temp.width = srcW;
  temp.height = srcH;

  tctx.drawImage(originalImage, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

  let newImg = new Image();
  newImg.src = temp.toDataURL();
  newImg.onload = () => {
    currentImage = newImg;
    canvas.width = srcW;
    canvas.height = srcH;
    drawCurrent();
  };
});
canvas.addEventListener("click", (e) => {
  if (isCropping) return;
  if (!currentImage) return;
  let text = prompt("اكتب النص:");
  if (!text) return;

  let tmp = document.createElement("canvas");
  let tctx = tmp.getContext("2d");
  tmp.width = canvas.width;
  tmp.height = canvas.height;

  tctx.filter = getFilterString();
  tctx.drawImage(currentImage, 0, 0, tmp.width, tmp.height);

  tctx.filter = "none";
  let color = document.getElementById("txtColor").value || "#000";
  let fontSize = parseInt(document.getElementById("font").value || 20, 10);
  let stroke = document.getElementById("check").checked;
  tctx.fillStyle = color;
  tctx.font = `${fontSize}px Arial`;
  if (stroke) tctx.strokeText(text, e.offsetX, e.offsetY);
  tctx.fillText(text, e.offsetX, e.offsetY);

  let merged = new Image();
  merged.src = tmp.toDataURL();
  merged.onload = () => {
    currentImage = merged;
    drawCurrent();
  };
});

function applyFilters() {
  if (!currentImage) return;
  drawCurrent();
}
filters.forEach((el) => el.addEventListener("input", applyFilters));

reset.addEventListener("click", () => {
  if (!originalImage) return;
  currentImage = originalImage;
  canvas.width = originalImage.naturalWidth;
  canvas.height = originalImage.naturalHeight;

  saturate.value = 100;
  contrast.value = 100;
  brightness.value = 100;
  sepia.value = 0;
  grayscale.value = 0;
  blur.value = 0;
  HueRotate.value = 0;

  drawCurrent();
});

download.addEventListener("click", () => {
  download.href = canvas.toDataURL("image/png");
});
