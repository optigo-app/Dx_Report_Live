import { useRef, useState } from "react";
import { PRINT_ITEMS_PER_PAGE } from "../constants/reportConstants";

const preloadImages = (urls) =>
  Promise.all(
    urls.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve; // don't block on broken images
          img.src = src;
        }),
    ),
  );

const waitForImages = (container) =>
  Promise.all(
    Array.from(container.querySelectorAll("img")).map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) resolve();
          else {
            img.onload = resolve;
            img.onerror = resolve;
          }
        }),
    ),
  );

/** Jewellery-book print view: preloads the printed page's images, then prints. */
export default function usePrintView() {
  const [showPrintView, setShowPrintView] = useState(false);
  const [printData, setPrintData] = useState([]);
  const [preparingPrint, setPreparingPrint] = useState(false);
  const [currentPrintPage, setCurrentPrintPage] = useState(1);
  const printRef = useRef();

  const triggerPrint = () => {
    setPreparingPrint(false);
    setTimeout(() => window.print(), 300);
  };

  const waitForPrintReady = () => {
    const container = printRef.current;
    if (!container) return;
    const printSection = container.querySelector(".print-content");
    if (!printSection) return triggerPrint();
    waitForImages(printSection).then(triggerPrint);
  };

  const handlePrintNow = (currentPageItems, currentPage) => {
    const page = currentPage ?? 1;
    setPreparingPrint(true);
    setCurrentPrintPage(page);

    // Only preload the images for the page that is actually printed
    // (must match itemsPerPage in Print1JewelleryBook), not the whole dataset.
    const startIdx = (page - 1) * PRINT_ITEMS_PER_PAGE;
    const items = currentPageItems
      ? currentPageItems
      : printData.slice(startIdx, startIdx + PRINT_ITEMS_PER_PAGE);

    const imageUrls = [...new Set(items.map((row) => row?.ImgUrl).filter(Boolean))];

    preloadImages(imageUrls).then(() => {
      requestAnimationFrame(waitForPrintReady);
    });
  };

  return {
    showPrintView,
    setShowPrintView,
    printData,
    setPrintData,
    preparingPrint,
    currentPrintPage,
    printRef,
    handlePrintNow,
  };
}
