/** Keeps a fixed-position context menu inside the viewport. */
export const getMenuPosition = (x, y, menuWidth = 200, menuHeight = 200) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  return {
    top: y + menuHeight > viewportHeight - 8 ? y - menuHeight : y,
    left: x + menuWidth > viewportWidth - 8 ? x - menuWidth : x,
  };
};
