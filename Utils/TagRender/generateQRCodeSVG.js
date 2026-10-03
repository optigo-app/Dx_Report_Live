import QRCode from "qrcode";

function generateQRCodeSVG(value) {
  const qrData = QRCode.create(value || "dummy", {
    errorCorrectionLevel: "M",
  });

  const modules = qrData.modules;
  const size = modules.size;
  const data = modules.data;

  let path = "";
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (data[row * size + col]) {
        path += `M${col},${row}h1v1h-1z`;
      }
    }
  }

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" style="display:block;shape-rendering:crispEdges;"><rect width="${size}" height="${size}" fill="#ffffff"/><path d="${path}" fill="#000000"/></svg>`;

  return svgString.replace(/"/g, "'");
}

export default generateQRCodeSVG;