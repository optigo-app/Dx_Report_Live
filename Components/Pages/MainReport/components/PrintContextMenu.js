import React from "react";

/** Fixed-position "print as…" menu opened from the print column. */
const PrintContextMenu = ({
  menuState,
  menuSearch,
  onSearchChange,
  searchInputRef,
  items,
  onSelect,
  onClose,
}) => {
  if (!menuState.open) return null;

  const needle = menuSearch.toLowerCase();
  const filtered = items.filter((item) => item.printname.toLowerCase().includes(needle));

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 9998 }} onClick={onClose} />
      <div
        style={{
          position: "fixed",
          top: menuState.y,
          left: menuState.x,
          zIndex: 9999,
          backgroundColor: "#fff",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
          borderRadius: "6px",
          minWidth: "200px",
          maxHeight: "240px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>
          <input
            ref={searchInputRef}
            value={menuSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            style={{
              width: "100%",
              padding: "5px 8px",
              fontSize: "13px",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item.printname, menuState.row)}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {item.printname}
            </div>
          ))}

          {filtered.length === 0 && (
            <div
              style={{
                padding: "10px 16px",
                fontSize: "13px",
                color: "#999",
                textAlign: "center",
              }}
            >
              No results
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PrintContextMenu;
