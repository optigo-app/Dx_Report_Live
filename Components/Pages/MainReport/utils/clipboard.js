export const copyToClipboard = (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text);
    return;
  }
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
    console.warn("Copied using fallback");
  } catch (err) {
    console.error("Copy failed", err);
  }
  document.body.removeChild(textArea);
};
