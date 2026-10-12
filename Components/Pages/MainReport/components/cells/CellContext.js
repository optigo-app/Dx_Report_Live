import { createContext, useContext } from "react";

/**
 * Handlers and live state needed by the DataGrid cell / header renderers.
 * Column definitions are memoised, so the renderers subscribe to this context
 * instead of capturing values in closures (which would go stale).
 */
export const CellContext = createContext({});

export const useCellContext = () => useContext(CellContext);
