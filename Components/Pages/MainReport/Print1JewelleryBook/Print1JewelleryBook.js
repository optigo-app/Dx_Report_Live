import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import "./Print1JewelleryBook.css";
import { Box, Card, Stack, Typography } from "@mui/material";

export default function Print1JewelleryBook({
  visibleItemsMain,
  onPrintClick,
  preparingPrint,
  currentPrintPage,
  printViewData,
  selectionModel, // ✅ new
}) {
  const img = "./images/noFound.jpg";
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(false);
  const [withImage, setWithImage] = useState(true);
  const itemsPerPage = 1000;
  const [currentPage, setCurrentPage] = useState(1);
  const preloadedImages = useRef(new Set());
  const [hideShowFields, setHideShowFields] = useState({});

  // ✅ If any rows are checkbox-selected, restrict to those; otherwise show all
  const effectiveItems = useMemo(() => {
    if (Array.isArray(selectionModel) && selectionModel.length > 0) {
      return (visibleItemsMain || []).filter((item) =>
        selectionModel.includes(item.id)
      );
    }
    return visibleItemsMain || [];
  }, [visibleItemsMain, selectionModel]);


  const visibleItems = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return effectiveItems?.slice(startIdx, endIdx) || [];
  }, [effectiveItems, currentPage, itemsPerPage]);

  const itemsToPrint = useMemo(() => {
    if (preparingPrint) {
      const startIdx = (currentPrintPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      return effectiveItems?.slice(startIdx, endIdx) || [];
    }
    return visibleItems;
  }, [
    preparingPrint,
    currentPrintPage,
    effectiveItems,
    visibleItems,
    itemsPerPage,
  ]);

  // Preload images for next page in background

  useEffect(() => {
    if (Array.isArray(printViewData)) {
      const initialState = {};

      printViewData.forEach((item) => {
        if (item.IsHideShowOption) {
          initialState[item.value] = true;
        }
      });

      setHideShowFields(initialState);
    }
  }, [printViewData]);

  useEffect(() => {
    const preloadNextPageImages = () => {
      const nextPage = currentPage + 1;
      const totalPages = Math.ceil(
        (effectiveItems?.length || 0) / itemsPerPage
      );
      

      if (nextPage <= totalPages) {
        const startIdx = (nextPage - 1) * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        const nextPageItems = effectiveItems?.slice(startIdx, endIdx) || [];

        nextPageItems.forEach((item) => {
          if (item?.ImgUrl && !preloadedImages.current.has(item.ImgUrl)) {
            const img = new Image();
            img.src = item.ImgUrl;
            preloadedImages.current.add(item.ImgUrl);
          }
        });
      }
    };

    const timer = setTimeout(preloadNextPageImages, 500);
    return () => clearTimeout(timer);
  }, [currentPage, effectiveItems, itemsPerPage]);

  const handleHideShowChange = (field) => {
    setHideShowFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getPageNumbers = () => {
    const pages = [];
    const totalPageCount = totalPages;
    const maxVisible = 5;

    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + maxVisible - 1, totalPageCount);
    if (end - start < maxVisible - 1) {
      start = Math.max(end - maxVisible + 1, 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const totalPages = Math.ceil((effectiveItems?.length || 0) / itemsPerPage);

  const fixedValues = (value, zeroes) =>
    typeof value === "number"
      ? value?.toFixed(zeroes)
      : (+value)?.toFixed(zeroes);

  const handleImageError = (e) => {
    e.target.src = img;
  };

  const handleImageHideShow = useCallback(() => {
    setWithImage(!withImage);
  }, [withImage]);

  const handlePrintCurrentPage = () => {
    onPrintClick(visibleItems, currentPage);
  };

  const sortedPrintData = Array.isArray(printViewData)
    ? [...printViewData].sort(
      (a, b) => Number(a.displayorder || 0) - Number(b.displayorder || 0)
    )
    : [];

  const filteredData = sortedPrintData.filter((item) => {
    if (!item.IsHideShowOption) return true;
    return hideShowFields[item.value];
  });

  const rows = [];

  for (let i = 0; i < filteredData.length; i += 2) {
    rows.push({
      left: filteredData[i],
      right: filteredData[i + 1],
    });
  }

  const renderCard = (e, i, isPrint = false) => (
    <div key={i} className="col1 pagBrkIns" style={{ width: '18%' }}>
      <div className="brbxAll spfntbH">
        {e?.Customer ? (
          <div className="w-100 brBtom spaclftTpm spacBtom spfntHead">
            {e?.Customer}
          </div>
        ) : (
          <div className="minheit brBtom"></div>
        )}
        {withImage && e?.ImageName !== "" && (
          <div className="w-100 brBtom imgwdtheit">
            <img
              src={`${e?.ImgUrl}`}
              loading="eager"
              alt="Design_Image"
              onError={handleImageError}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{width: '99%'}}>
            {rows.map((row, index) => {
              const leftVal = e?.[row.left?.value];
              const rightVal = row.right ? e?.[row.right?.value] : undefined;
              const isZeroValue = (val) =>
                val === 0 ||
                val === "0" ||
                val === 0.0 ||
                val === null ||
                val === undefined ||
                val === "";
              const showLeft = row.left && !isZeroValue(leftVal);
              const showRight = row.right && !isZeroValue(rightVal);

              return (
                <div
                  key={index}
                  style={{ padding: '2px', display: 'flex', justifyContent: 'space-between', gap: '6px' }}
                >
                  {/* Left */}
                  <div style={{ width: '50%', minWidth: 0 }}>
                    {showLeft && (
                      <div style={{ display: 'block', lineHeight: '1.3' }}>
                        <span
                          className="printLabelData"
                          style={{
                            fontSize: `${row.left?.fontsizel}px` || "12px",
                            fontWeight: row.left?.fontweightl || 500,
                            color: "#555",
                          }}
                        >
                          {row.left?.lable}
                        </span>
                        <span
                          className="printLabelData"
                          style={{
                            fontSize: `${row.left?.fontsizev}px` || "12px",
                            fontWeight: row.left?.fontweightv || 500,
                            color: "#000",
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {leftVal}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right */}
                  <div style={{ width: '50%', minWidth: 0, textAlign: 'right' }}>
                    {showRight && (
                      <div style={{ display: 'block', lineHeight: '1.3' }}>
                        <span
                          className="printLabelData"
                          style={{
                            fontSize: `${row.right?.fontsizel}px` || "12px",
                            fontWeight: row.right?.fontweightl || 500,
                            color: "#555",
                          }}
                        >
                          {row.right?.lable}
                        </span>
                        <span
                          className="printLabelData"
                          style={{
                            fontSize: `${row.right?.fontsizev}px` || "12px",
                            fontWeight: row.right?.fontweightv || 500,
                            color: "#000",
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {rightVal}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {(e?.designcount !== undefined || e?.salescount !== undefined) && (
            <div
              className="w-100 spaclftTpm d-flex"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginInline: "5px",
              }}
            >
              <p style={{ margin: 0, fontSize: "13px", lineHeight: "16px" }}>
                {e?.designcount !== undefined && (
                  <span style={{ color: "rgb(85, 85, 85)" }}>
                    Order: <strong>{e.designcount}</strong>
                  </span>
                )}

                {e?.designcount !== undefined && e?.salescount !== undefined && ", "}

                {e?.salescount !== undefined && (
                  <span style={{ color: "rgb(85, 85, 85)" }}>
                    Sale: <strong>{e.salescount}</strong>
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return loader ? (
    <p>Loading...</p>
  ) : msg !== "" ? (
    <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
      {msg}
    </p>
  ) : (
    <>
      <div className="screen-view no-print" style={{ width: "100%" }}>
        <div
          style={{
            position: "fixed",
            top: "70px",
            width: "100%",
            backgroundColor: "white",
            zIndex: 999,
            paddingBottom: "10px",
          }}
          className="hideData"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              flexWrap: "wrap",
              gap: "15px",
              paddingTop: "5px",
              width: '80%'
            }}
          >
            <label
              htmlFor="WithImage"
              className="inline-flex items-center cursor-pointer gap-2 fil_sec"
            >
              <input
                type="checkbox"
                checked={withImage}
                onChange={handleImageHideShow}
                name="WithImage"
                id="WithImage"
              />
              With Image
            </label>

            {/* Dynamic Hide/Show Fields */}
            {sortedPrintData
              ?.filter((x) => x.IsHideShowOption)
              ?.map((item, index) => (
                <label
                  key={index}
                  className="inline-flex items-center cursor-pointer gap-2 fil_sec"
                >
                  <input
                    type="checkbox"
                    checked={hideShowFields[item.value] ?? true}
                    onChange={() => handleHideShowChange(item.value)}
                  />
                  {item.lable?.replace(/-$/, "")}
                </label>
              ))}
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {getPageNumbers().map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={num === currentPage ? "active" : ""}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>

          <p
            className="hideData"
            style={{ textAlign: "center", margin: "5px 0" }}
          >
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </p>
        </div>

        <div
          style={{
            marginTop: "20px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div className="container disflx">
            {visibleItems.map((e, i) => renderCard(e, i, false))}
          </div>
        </div>
      </div>

      {preparingPrint && (
        <div className="print-content print-only" style={{ display: "none" }}>
          <div className="container disflx">
            {itemsToPrint.map((e, i) => renderCard(e, i, true))}
          </div>
        </div>
      )}
    </>
  );
}
