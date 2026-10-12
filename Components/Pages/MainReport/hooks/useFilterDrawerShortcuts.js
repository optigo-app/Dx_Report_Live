import { useEffect } from "react";

/** Alt+F opens the side filter drawer, Alt+C closes it. */
export default function useFilterDrawerShortcuts(setSideFilterOpen) {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === "f") {
        e.preventDefault();
        setSideFilterOpen(true);
      } else if (key === "c") {
        e.preventDefault();
        setSideFilterOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [setSideFilterOpen]);
}
