import { Box, CircularProgress, IconButton } from "@mui/material";
import { CheckCircle2 } from "lucide-react";
import React, { useState } from "react";

const ImageView = ({
  filteredRows,
  sortModel,
  columns,
  imageViewData,
  isLoading,
  masterKeyData,
  selectionModel = [],
  setSelectionModel,
}) => {
  const defaultImg = "./images/noFound.jpg";
  const pageSize = 250;
  const [currentPage, setCurrentPage] = useState(1);
  const isSelectionMode = masterKeyData?.ImageViewSelection === "True";
  // const isSelectionMode = "True";

  const totalPages = Math.ceil(filteredRows?.length / pageSize);
  const getPageNumbers = () => {
    const pages = [];
    const totalPageCount = totalPages;
    const maxVisible = 5;
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + maxVisible - 1, totalPageCount);
    if (end - start < maxVisible - 1) start = Math.max(end - maxVisible + 1, 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const sortedImageData = [...imageViewData].sort(
    (a, b) => Number(a.displayorder || 0) - Number(b.displayorder || 0)
  );

  const handleImageSelect = (id) => {
    if (!isSelectionMode || !setSelectionModel) return;
    setSelectionModel((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

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
          position: "sticky",
          top: 0,
          width: "100%",
          backgroundColor: "white",
          zIndex: 2,
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
              "&:hover": { backgroundColor: "#c8e6c9" },
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
              "&:hover": { backgroundColor: "#c8e6c9" },
            }}
            size="medium"
          >
            Next
          </IconButton>
        </div>

        <p style={{ textAlign: "center" }}>
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          {isSelectionMode && selectionModel.length > 0 && (
            <span style={{ marginLeft: 10, color: "#7367F0", fontWeight: 600 }}>
              ({selectionModel.length} selected)
            </span>
          )}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          paddingTop: "10px",
          paddingBottom: "100px",
        }}
      >
        {filteredRows
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map((item, idx) => {
            const src = String(item?.ImgUrl ?? "").trim() || defaultImg;
            const isSelected = selectionModel.includes(item.id);

            return (
              <div
                key={idx}
                style={{ width: 200, display: "flex", flexDirection: "column" }}
              >
                <div
                  style={{
                    position: "relative",
                    cursor: isSelectionMode ? "pointer" : "default",
                  }}
                  onClick={() => handleImageSelect(item.id)}
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
                      border: isSelected
                        ? "2px solid #7367F0"
                        : "1px solid lightgray",
                      objectFit: "cover",
                      borderRadius: "4px",
                      backgroundColor: "#f9f9f9",
                      boxShadow: isSelected
                        ? "0 0 0 3px rgba(115,103,240,0.25)"
                        : "none",
                    }}
                  />

                  {isSelectionMode && (
                    <div
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        background: isSelected ? "#7367F0" : "rgba(255,255,255,0.85)",
                        borderRadius: "50%",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                      }}
                    >
                      {isSelected ? (
                        <CheckCircle2 size={16} color="#fff" />
                      ) : (
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            border: "2px solid #999",
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "-5px",
                  }}
                >
                  {sortedImageData?.length !== 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "5px",
                        marginTop: "0px",
                        width: "100%",
                      }}
                    >
                      {sortedImageData.map((iteImage, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            justifyContent:
                              index % 2 === 0 ? "flex-start" : "flex-end",
                          }}
                        >
                          {iteImage.lable && (
                            <span
                              style={{
                                fontSize: `${iteImage.fontsizel}px` || "12px",
                                fontWeight: iteImage.fontweightl || 500,
                                color: "#555",
                              }}
                            >
                              {iteImage.lable}
                            </span>
                          )}
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
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ImageView;