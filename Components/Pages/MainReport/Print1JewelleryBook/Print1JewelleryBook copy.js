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
  printViewData
}) {
  const img = "./images/noFound.jpg";
  const [msg, setMsg] = useState("");
  const [loader, setLoader] = useState(false);
  const [withImage, setWithImage] = useState(true);
  const itemsPerPage = 1000;
  const [currentPage, setCurrentPage] = useState(1);
  const preloadedImages = useRef(new Set());
  const [hideShowFields, setHideShowFields] = useState({});

  const visibleItems = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return visibleItemsMain?.slice(startIdx, endIdx) || [];
  }, [visibleItemsMain, currentPage, itemsPerPage]);

  const itemsToPrint = useMemo(() => {
    if (preparingPrint) {
      const startIdx = (currentPrintPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      return visibleItemsMain?.slice(startIdx, endIdx) || [];
    }
    return visibleItems;
  }, [
    preparingPrint,
    currentPrintPage,
    visibleItemsMain,
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
        (visibleItemsMain?.length || 0) / itemsPerPage
      );

      if (nextPage <= totalPages) {
        const startIdx = (nextPage - 1) * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        const nextPageItems = visibleItemsMain?.slice(startIdx, endIdx) || [];

        nextPageItems.forEach((item) => {
          if (item?.ImgUrl && !preloadedImages.current.has(item.ImgUrl)) {
            const img = new Image();
            img.src = item.ImgUrl;
            preloadedImages.current.add(item.ImgUrl);
          }
        });
      }
    };

    // Preload after a short delay to not block current rendering
    const timer = setTimeout(preloadNextPageImages, 500);
    return () => clearTimeout(timer);
  }, [currentPage, visibleItemsMain, itemsPerPage]);

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

  const totalPages = Math.ceil((visibleItemsMain?.length || 0) / itemsPerPage);

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

        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div>
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

          <div className="w-100 spaclftTpm d-flex" style={{ display: 'flex', justifyContent: 'space-between', marginInline: '5px' }}>
            {/* <div className="spfntBld spbrWord spfntHead">{e?.designno}</div> */}
            <p style={{ margin: 0, fontSize: "13px", lineHeight: "16px" }}>
              {e?.designcount !== undefined && (
                <span style={{color: 'rgb(85, 85, 85)'}}>Order: <strong>{e.designcount}</strong></span>
              )}
              {e?.designcount !== undefined && e?.salescount !== undefined && ", "}
              {e?.salescount !== undefined && (
                <span style={{color: 'rgb(85, 85, 85)'}}>Sale: <strong>{e.salescount}</strong></span>
              )}
            </p>
          </div>
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




// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
//   useRef,
// } from "react";
// import "./Print1JewelleryBook.css";
// import { Box, Card, Stack, Typography } from "@mui/material";

// export default function Print1JewelleryBook({
//   visibleItemsMain,
//   onPrintClick,
//   preparingPrint,
//   currentPrintPage,
//   printViewData
// }) {
//   const img = "./images/noFound.jpg";
//   const [msg, setMsg] = useState("");
//   const [loader, setLoader] = useState(false);
//   const [withImage, setWithImage] = useState(true);
//   const itemsPerPage = 1000;
//   const [currentPage, setCurrentPage] = useState(1);
//   const preloadedImages = useRef(new Set());
//   const [hideShowFields, setHideShowFields] = useState({});
//   const visibleItems = useMemo(() => {
//     const startIdx = (currentPage - 1) * itemsPerPage;
//     const endIdx = startIdx + itemsPerPage;
//     return visibleItemsMain?.slice(startIdx, endIdx) || [];
//   }, [visibleItemsMain, currentPage, itemsPerPage]);
//   const itemsToPrint = useMemo(() => {
//     if (preparingPrint) {
//       const startIdx = (currentPrintPage - 1) * itemsPerPage;
//       const endIdx = startIdx + itemsPerPage;
//       return visibleItemsMain?.slice(startIdx, endIdx) || [];
//     }
//     return visibleItems;
//   }, [
//     preparingPrint,
//     currentPrintPage,
//     visibleItemsMain,
//     visibleItems,
//     itemsPerPage,
//   ]);

//   // Preload images for next page in background

//   useEffect(() => {
//     if (Array.isArray(printViewData)) {
//       const initialState = {};

//       printViewData.forEach((item) => {
//         if (item.IsHideShowOption) {
//           initialState[item.value] = true;
//         }
//       });

//       setHideShowFields(initialState);
//     }
//   }, [printViewData]);

//   useEffect(() => {
//     const preloadNextPageImages = () => {
//       const nextPage = currentPage + 1;
//       const totalPages = Math.ceil(
//         (visibleItemsMain?.length || 0) / itemsPerPage
//       );

//       if (nextPage <= totalPages) {
//         const startIdx = (nextPage - 1) * itemsPerPage;
//         const endIdx = startIdx + itemsPerPage;
//         const nextPageItems = visibleItemsMain?.slice(startIdx, endIdx) || [];

//         nextPageItems.forEach((item) => {
//           if (item?.ImgUrl && !preloadedImages.current.has(item.ImgUrl)) {
//             const img = new Image();
//             img.src = item.ImgUrl;
//             preloadedImages.current.add(item.ImgUrl);
//           }
//         });
//       }
//     };

//     // Preload after a short delay to not block current rendering
//     const timer = setTimeout(preloadNextPageImages, 500);
//     return () => clearTimeout(timer);
//   }, [currentPage, visibleItemsMain, itemsPerPage]);

//   const handleHideShowChange = (field) => {
//     setHideShowFields((prev) => ({
//       ...prev,
//       [field]: !prev[field],
//     }));
//   };

//   const getPageNumbers = () => {
//     const pages = [];
//     const totalPageCount = totalPages;
//     const maxVisible = 5;

//     let start = Math.max(currentPage - 2, 1);
//     let end = Math.min(start + maxVisible - 1, totalPageCount);
//     if (end - start < maxVisible - 1) {
//       start = Math.max(end - maxVisible + 1, 1);
//     }
//     for (let i = start; i <= end; i++) {
//       pages.push(i);
//     }

//     return pages;
//   };

//   const totalPages = Math.ceil((visibleItemsMain?.length || 0) / itemsPerPage);

//   const fixedValues = (value, zeroes) =>
//     typeof value === "number"
//       ? value?.toFixed(zeroes)
//       : (+value)?.toFixed(zeroes);

//   const handleImageError = (e) => {
//     e.target.src = img;
//   };

//   const handleImageHideShow = useCallback(() => {
//     setWithImage(!withImage);
//   }, [withImage]);

//   const handlePrintCurrentPage = () => {
//     onPrintClick(visibleItems, currentPage);
//   };

//   const sortedPrintData = Array.isArray(printViewData)
//     ? [...printViewData].sort(
//       (a, b) => Number(a.displayorder || 0) - Number(b.displayorder || 0)
//     )
//     : [];

//   const filteredData = sortedPrintData.filter((item) => {
//     if (!item.IsHideShowOption) return true;
//     return hideShowFields[item.value];
//   });

//   const rows = [];
//   for (let i = 0; i < filteredData.length; i += 2) {
//     rows.push({
//       left: filteredData[i],
//       right: filteredData[i + 1],
//     });
//   }

//   const renderCard = (e, i, isPrint = false) => (
//     <div key={i} className="col1" style={{ width: '18%' }}>
//       <div className="brbxAll spfntbH pagBrkIns">
//         {e?.Customer ? (
//           <div className="w-100 brBtom spaclftTpm spacBtom spfntHead">
//             {e?.Customer}
//           </div>
//         ) : (
//           <div className="minheit brBtom"></div>
//         )}
//         {withImage && e?.ImageName !== "" && (
//           <div className="w-100 brBtom imgwdtheit">
//             <img
//               src={`${e?.ImgUrl}`}
//               // loading={isPrint ? "eager" : "lazy"}
//                loading="eager"
//               alt="Design_Image"
//               onError={handleImageError}
//             />
//           </div>
//         )}


//         <Stack>
//           {rows.map((row, index) => (
//             <Stack
//               key={index}
//               direction="row"
//               justifyContent="space-between"
//               style={{ padding: '2px', display: 'flex', justifyContent: 'space-between', gap: '6px' }}
//             >
//               {/* Left */}
//               <Box sx={{
//                 width: '50%',
//                 minWidth: 0,
//               }}>
//                 <div style={{ display: 'block', lineHeight: '1.3' }}>
//                   <span
//                     className="printLabelData"
//                     style={{
//                       fontSize: `${row.left?.fontsizel}px` || "12px",
//                       fontWeight: row.left?.fontweightl || 500,
//                       color: "#555",
//                     }}
//                   >
//                     {row.left?.lable}
//                   </span>
//                   {/* ← inline, no space/gap, value flows right after label */}
//                   <span
//                     className="printLabelData"
//                     style={{
//                       fontSize: `${row.left?.fontsizev}px` || "12px",
//                       fontWeight: row.left?.fontweightv || 500,
//                       color: "#000",
//                       wordBreak: 'break-word',
//                       overflowWrap: 'anywhere',
//                     }}
//                   >
//                     {e?.[row.left?.value]}
//                   </span>
//                 </div>
//               </Box>

//               {/* Right */}
//               <Box sx={{
//                 width: '50%',
//                 minWidth: 0,
//                 textAlign: 'right',
//               }}>
//                 {row.right && (
//                   <div style={{ display: 'block', lineHeight: '1.3' }}>
//                     <span
//                       className="printLabelData"
//                       style={{
//                         fontSize: `${row.right?.fontsizel}px` || "12px",
//                         fontWeight: row.right?.fontweightl || 500,
//                         color: "#555",
//                       }}
//                     >
//                       {row.right?.lable}
//                     </span>
//                     <span
//                       className="printLabelData"
//                       style={{
//                         fontSize: `${row.right?.fontsizev}px` || "12px",
//                         fontWeight: row.right?.fontweightv || 500,
//                         color: "#000",
//                         wordBreak: 'break-word',
//                         overflowWrap: 'anywhere',
//                       }}
//                     >
//                       {e?.[row.right?.value]}
//                     </span>
//                   </div>
//                 )}
//               </Box>
//             </Stack>
//           ))}
//         </Stack>


//         {/* <Stack>
//           {rows.map((row, index) => (
//             <Stack
//               key={index}
//               direction="row"
//               justifyContent="space-between"
//               style={{ padding: '2px', display: 'flex', justifyContent: 'space-between' }}
//             >
//               <Box sx={{
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 whiteSpace: "nowrap",
//               }}>
//                 <Stack direction="row" justifyContent="space-between">
//                   <span
//                     style={{
//                       fontSize: `${row.left?.fontsizel}px` || "12px",
//                       fontWeight: row.left?.fontweightl || 500,
//                       color: "#555",
//                       whiteSpace: "nowrap",
//                     }}
//                     className="printLabelData"
//                   >
//                     {row.left?.lable}
//                   </span>
//                   <span
//                     style={{
//                       fontSize: `${row.left?.fontsizev}px` || "12px",
//                       fontWeight: row.left.fontweightv || 500,
//                       color: "#000",
//                       whiteSpace: "nowrap",
//                     }}
//                     className="printLabelData"
//                   >
//                     {e?.[row.left?.value]}
//                   </span>
//                 </Stack>
//               </Box>

//               <Box sx={{
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 whiteSpace: "nowrap",
//               }}>
//                 {row.right && (
//                   <Stack direction="row" justifyContent="space-between">
//                     <span
//                       style={{
//                         fontSize: `${row.right.fontsizel}px` || "12px",
//                         fontWeight: row.right.fontweightl || 500,
//                         color: "#555",
//                         whiteSpace: "nowrap",
//                       }}
//                       className="printLabelData">{row.right?.lable}</span>
//                     <span
//                       style={{
//                         fontSize: `${row.fontsizel}px` || "12px",
//                         fontWeight: row.fontweightl || 500,
//                         color: "#555",
//                         whiteSpace: "nowrap",
//                       }}
//                       className="printLabelData">{e?.[row.right?.value]}</span>
//                   </Stack>
//                 )}
//               </Box>
//             </Stack>
//           ))}
//         </Stack>  */}

//         <div className="w-100 spaclftTpm d-flex" style={{ display: 'flex', justifyContent: 'space-between', marginInline: '5px' }}>
//           <div className=" spfntBld spbrWord spfntHead">{e?.designno}</div>
//           <p
//             style={{
//               margin: 0,
//               fontSize: "13px",
//               lineHeight: "16px",
//             }}
//           >
//             {e?.designcount !== undefined && (
//               <span>
//                 Order: <strong>{e.designcount}</strong>
//               </span>
//             )}
//             {e?.designcount !== undefined && e?.salescount !== undefined && ", "}
//             {e?.salescount !== undefined && (
//               <span>
//                 Sale: <strong>{e.salescount}</strong>
//               </span>
//             )}
//           </p>
//         </div>

//         {/* Status | Manufacturer */}
//         {(e?.Status || e?.Manufacturer) && (
//           <div className="w-100 disflxCen spaclftTpm">
//             <div className="wdth_45 spbrWord">{e?.Status}</div>
//             {e?.Manufacturer ? <div className="spfntBld">|</div> : null}
//             <div className="wdth_55 spacrighTpm spbrWord">{e?.Manufacturer}</div>
//           </div>
//         )}

//         {/* Metal Type | Job No */}
//         {(e?.Metal_Type || e?.Sr_JobNo) && (
//           <div className="w-100 disflxCen spaclftTpm">
//             {e?.Metal_Type && (
//               <div className="wdth_45 spbrWord">{e?.Metal_Type}</div>
//             )}
//             {e?.Metal_Type && e?.Sr_JobNo ? <div>|</div> : null}
//             <div className={`${e?.Metal_Type ? "wdth_55 spacrighTpm" : "w-100 spfntlft"} spbrWord`}>
//               {e?.Sr_JobNo}
//             </div>
//           </div>
//         )}

//         {/* Metal Color | Gross Wt */}
//         {(e?.Metal_Color || e?.Gross_Wt) && (
//           <div className="w-100 disflxCen spaclftTpm">
//             {e?.Metal_Color && (
//               <div className="wdth_45 spbrWord">{e?.Metal_Color}</div>
//             )}
//             {e?.Metal_Color && e?.Gross_Wt ? <div>|</div> : null}
//             {e?.Gross_Wt !== undefined && e?.Gross_Wt !== null && (
//               <div className={`${e?.Metal_Color ? "wdth_55 spacrighTpm" : "w-100 spfntlft"} spbrWord`}>
//                 G.WT: {fixedValues(e?.Gross_Wt, 3)} gm
//               </div>
//             )}
//           </div>
//         )}

//         {/* Diamond CTW | Net Weight */}
//         {(e?.Diam_Ctw || e?.Metal_Wt) && (
//           <div className="w-100 disflxCen spaclftTpm">
//             {e?.Diam_Ctw ? (
//               <div className="wdth_45 spbrWord">
//                 DIA: {fixedValues(e?.Diam_Ctw, 3)}
//               </div>
//             ) : <div className="wdth_45 spbrWord"></div>}
//             {e?.Diam_Ctw && e?.Metal_Wt ? <div>|</div> : null}
//             {e?.Metal_Wt !== undefined && e?.Metal_Wt !== null && (
//               <div className="wdth_55 spacrighTpm spbrWord">
//                 N.WT: {fixedValues(e?.Metal_Wt, 3)} gm
//               </div>
//             )}
//           </div>
//         )}

//         {/* Misc CTW | CS CTW */}
//         {(e?.Misc_Ctw || e?.CS_Ctw) && (
//           <div className="w-100 disflxCen spaclftTpm">
//             {e?.Misc_Ctw ? (
//               <div className="wdth_45 spbrWord">
//                 MISC: {fixedValues(e?.Misc_Ctw, 3)}
//               </div>
//             ) : <div className="wdth_45"></div>}
//             {e?.Misc_Ctw && e?.CS_Ctw ? <div>|</div> : null}
//             {e?.CS_Ctw ? (
//               <div className="wdth_55 spacrighTpm spbrWord">
//                 CS: {fixedValues(e?.CS_Ctw, 3)}
//               </div>
//             ) : null}
//           </div>
//         )}

//         {/* Inward No */}
//         {e?.Inwardno && (
//           <div className="w-100 disflx spaclftTpm spbrWord">
//             Inward: {e?.Inwardno}
//           </div>
//         )}

//         {/* Sale Invoice */}
//         {e?.Status === "Sold" && e?.InvoiceNo && (
//           <div className="w-100 spbrWord disflx spaclftTpm">
//             Sale: {e?.InvoiceNo}
//           </div>
//         )}

//         {/* Memo Invoice */}
//         {e?.Status === "In Memo" && e?.InvoiceNo && (
//           <div className="w-100 disflx spbrWord spaclftTpm">
//             Memo: {e?.InvoiceNo}
//           </div>
//         )}

//         {/* Repair Invoice */}
//         {e?.Status === "In Repair" && e?.InvoiceNo && (
//           <div className="w-100 disflx spaclftTpm spbrWord">
//             Repair: {e?.InvoiceNo}
//           </div>
//         )}

//         {/* Purchase Return Invoice */}
//         {e?.Status === "Purchase Return" && e?.InvoiceNo && (
//           <div className="w-100 disflx spaclftTpm spbrWord">
//             Pur. Return: {e?.InvoiceNo}
//           </div>
//         )}
//       </div >
//     </div >
//   );

//   return loader ? (
//     <p>Loading...</p>
//   ) : msg !== "" ? (
//     <p className="text-danger fs-2 fw-bold mt-5 text-center w-50 mx-auto">
//       {msg}
//     </p>
//   ) : (
//     <>
//       <div className="screen-view no-print" style={{ width: "100%" }}>
//         <div
//           style={{
//             position: "fixed",
//             top: "70px",
//             width: "100%",
//             backgroundColor: "white",
//             zIndex: 999,
//             paddingBottom: "10px",
//           }}
//           className="hideData"
//         >
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "flex-end",
//               flexWrap: "wrap",
//               gap: "15px",
//               paddingTop: "5px",
//               width: '70%'
//             }}
//           >
//             <label
//               htmlFor="WithImage"
//               className="inline-flex items-center cursor-pointer gap-2 fil_sec"
//             >
//               <input
//                 type="checkbox"
//                 checked={withImage}
//                 onChange={handleImageHideShow}
//                 name="WithImage"
//                 id="WithImage"
//               />
//               With Image
//             </label>

//             {/* Dynamic Hide/Show Fields */}
//             {sortedPrintData
//               ?.filter((x) => x.IsHideShowOption)
//               ?.map((item, index) => (
//                 <label
//                   key={index}
//                   className="inline-flex items-center cursor-pointer gap-2 fil_sec"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={hideShowFields[item.value] ?? true}
//                     onChange={() => handleHideShowChange(item.value)}
//                   />
//                   {item.lable?.replace(/-$/, "")}
//                 </label>
//               ))}
//           </div>

//           <div className="pagination">
//             <button
//               onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//               disabled={currentPage === 1}
//             >
//               Prev
//             </button>

//             {getPageNumbers().map((num) => (
//               <button
//                 key={num}
//                 onClick={() => setCurrentPage(num)}
//                 className={num === currentPage ? "active" : ""}
//               >
//                 {num}
//               </button>
//             ))}

//             <button
//               onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//               disabled={currentPage === totalPages}
//             >
//               Next
//             </button>
//           </div>

//           <p
//             className="hideData"
//             style={{ textAlign: "center", margin: "5px 0" }}
//           >
//             Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
//           </p>
//         </div>

//         {/* Display current page items */}
//         <div
//           style={{
//             marginTop: "20px",
//             width: "100%",
//             display: "flex",
//             justifyContent: "center",
//           }}
//         >
//           <div className="container disflx">
//             {visibleItems.map((e, i) => renderCard(e, i, false))}
//           </div>
//         </div>
//       </div>

//       <div className="print-content print-only" style={{ display: "none" }}>
//         <div className="container disflx">
//           {itemsToPrint.map((e, i) => renderCard(e, i, true))}
//         </div>
//       </div>
//     </>
//   );
// }