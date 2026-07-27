import { Box, CircularProgress, IconButton } from "@mui/material";
import React, { useState } from "react";

const ImageView = ({ filteredRows, sortModel, columns, imageViewData, isLoading }) => {

  const defaultImg = "./images/noFound.jpg";
  const pageSize = 250;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredRows?.length / pageSize);
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

  const sortedImageData = [...imageViewData].sort(
    (a, b) => Number(a.displayorder || 0) - Number(b.displayorder || 0)
  );

  const Loader = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.4)",
          backdropFilter: "blur(2px)",
          zIndex: 9999,
        }}
      >
        <CircularProgress />
      </Box>
    );
  };


  return (
    <div>
      <Loader isLoading={isLoading} />
      <div
        style={{
          position: "fixed",
          width: "100%",
          backgroundColor: "white",
        }}
      >
        <div className="pagination" style={{ marginBottom: 10 }}>
          <IconButton
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            sx={{
              background: "#e8f5e9",
              color: "#2e7d32",
              height: "42px",
              width: "42px",
              borderRadius: "6px",
              transition: "all .2s ease",
              "&:hover": {
                backgroundColor: "#c8e6c9",
              },
            }}
            size="medium"
          >
            Prev
          </IconButton>

          {getPageNumbers().map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={num === currentPage ? "active" : ""}
            >
              {num}
            </button>
          ))}

          <IconButton
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            sx={{
              background: "#e8f5e9",
              color: "#2e7d32",
              height: "42px",
              width: "42px",
              borderRadius: "6px",
              transition: "all .2s ease",
              "&:hover": {
                backgroundColor: "#c8e6c9",
              },
            }}
            size="medium"
          >
            Next
          </IconButton>
        </div>

        <p style={{ textAlign: "center" }}>
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </p>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          paddingTop: "120px",
          paddingBottom: "100px",
        }}
      >
        {[...filteredRows]
          .sort((a, b) => {
            const activeSort = sortModel?.[0];
            if (activeSort) {
              const field = activeSort.field;
              const order = activeSort.sort === "asc" ? 1 : -1;
              const x = a[field];
              const y = b[field];
              if (!isNaN(x) && !isNaN(y)) {
                return (Number(x) - Number(y)) * order;
              }
              return String(x).localeCompare(String(y)) * order;
            }

            const col = columns.find(
              (c) => c.DefaultSort && c.DefaultSort !== "None"
            );

            if (!col) return 0;
            const field = col.field;
            const order =
              col.DefaultSort.toLowerCase() === "ascending" ? 1 : -1;

            const x = a[field];
            const y = b[field];

            if (!isNaN(x) && !isNaN(y)) {
              return (Number(x) - Number(y)) * order;
            }
            return String(x).localeCompare(String(y)) * order;
          })
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map((item, idx) => {
            
            const src = String(item?.ImgUrl ?? "").trim() || defaultImg;
            return (
              <div
                key={idx}
                style={{
                  width: 200,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <img
                  src={src}
                  alt={`record-${idx}`}
                  loading="lazy"
                  onError={(e) => {
                    if (e.target.src !== defaultImg) e.target.src = defaultImg;
                  }}
                  style={{
                    width: "200px",
                    height: "200px",
                    border: "1px solid lightgray",
                    objectFit: "cover",
                    borderRadius: "4px",
                    backgroundColor: "#f9f9f9",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "2px",
                  }}
                >
                  {sortedImageData?.length !== 0 && <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "5px",
                      marginTop: "0px",
                      width: '100%'
                    }}
                  >
                    {sortedImageData.map((iteImage, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          justifyContent: index % 2 === 0 ? "flex-start" : "flex-end",
                        }}
                      >
                        {iteImage.lable &&
                          <span
                            style={{
                              fontSize: `${iteImage.fontsizel}px` || "12px",
                              fontWeight: iteImage.fontweightl || 500,
                              color: "#555",
                            }}
                          >
                            {iteImage.lable}
                          </span>
                        }

                        <span
                          style={{
                            fontSize: `${iteImage.fontsizev}px` || "12px",
                            fontWeight: iteImage.fontweightv || 500,
                            color: "#000",
                          }}
                        >
                          {item?.[iteImage.value] || "-"}
                        </span>
                      </div>
                    ))}
                  </div>}
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        lineHeight: "16px",
                      }}
                    >
                      {item?.designcount !== undefined && (
                        <span>
                          Order: <strong>{item.designcount}</strong>
                        </span>
                      )}
                      {item?.designcount !== undefined &&
                        item?.salescount !== undefined &&
                        ", "}
                      {item?.salescount !== undefined && (
                        <span>
                          Sale: <strong>{item.salescount}</strong>
                        </span>
                      )}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: "12px",
                        lineHeight: "10px",
                      }}
                    >
                      <span>{item?.StockBarcode}</span>
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: "12px",
                        color: "#CF4F7D",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "3px",
                          lineHeight: "10px",
                        }}
                      >
                        <span>{item?.metaltype}</span>
                        <span>{item?.metalpurity}</span>
                      </div>
                      <span>{item?.metalcolor}</span>
                    </p>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      fontSize: "13px",
                      lineHeight: "10px",
                    }}
                  >
                    {item?.designno}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ImageView;
