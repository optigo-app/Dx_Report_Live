import JsBarcode from "jsbarcode";

function generateBarcodeSVG(value, widthMM, heightMM) {
  const svgNode = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );

  const mmToPx = (mm) => (mm * 96) / 25.4;

  JsBarcode(svgNode, value, {
    format: "CODE128",
    width: 1.5,
    height: mmToPx(heightMM),
    displayValue: false,
    margin: 0,
  });

  // ✅ Use the SVG's own natural viewBox/size (correct bar proportions for THIS value)
  // instead of force-stretching it to a fixed widthMM box.
  const naturalWidth = svgNode.getAttribute('width');
  const naturalHeight = svgNode.getAttribute('height');
  svgNode.setAttribute('viewBox', `0 0 ${naturalWidth} ${naturalHeight}`);
  svgNode.setAttribute('preserveAspectRatio', 'none');

  // Now it's safe to size the box to the configured mm dimensions —
  // the viewBox handles correct internal bar scaling instead of raw CSS stretch.
  svgNode.style.width = `${widthMM}mm`;
  svgNode.style.height = `${heightMM}mm`;
  svgNode.removeAttribute('width');
  svgNode.removeAttribute('height');

  return svgNode.outerHTML.replace(/"/g, "'");
}

export default generateBarcodeSVG;