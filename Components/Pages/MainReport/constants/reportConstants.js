import React from "react";
import { CheckCircle2, CheckSquare, Square, ToggleLeft, ToggleRight, XCircle } from "lucide-react";
import { IoWarningOutline } from "react-icons/io5";
import { MdDoNotDisturb } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import { GiReturnArrow } from "react-icons/gi";

export const NO_FOUND_IMG = "./images/noFound.jpg";
export const WARNING_ICON_IMG = "./icons/warning.png";

export const DEFAULT_PAGINATION_MODEL = { page: 0, pageSize: 20 };
export const DEFAULT_OPTIGO_PANEL_WIDTH = 400;
export const PRINT_ITEMS_PER_PAGE = 1000;
export const ACTIVITY_LOG_INTERVAL_MS = 30000;

export const ICON_LIST = [
  { id: "11", name: "Warning", icon: IoWarningOutline },
  { id: "12", name: "DoNot Disturb", icon: MdDoNotDisturb },
  { id: "13", name: "Add Circle", icon: IoMdAddCircleOutline },
  { id: "14", name: "Return Arrow", icon: GiReturnArrow },
];

export const AUTH_ICON_GROUPS = [
  {
    id: 1,
    group: "CheckBox",
    activeIcon: <CheckSquare size={20} color="#22c55e" strokeWidth={2.5} />,
    inactiveIcon: <Square size={20} color="#ef4444" strokeWidth={2.5} />,
  },
  {
    id: 2,
    group: "Toggle Button",
    activeIcon: <ToggleRight size={20} color="#22c55e" strokeWidth={2.5} />,
    inactiveIcon: <ToggleLeft size={20} color="#ef4444" strokeWidth={2.5} />,
  },
  {
    id: 3,
    group: "Status",
    activeIcon: <CheckCircle2 size={20} color="#22c55e" strokeWidth={2.5} />,
    inactiveIcon: <XCircle size={20} color="#ef4444" strokeWidth={2.5} />,
  },
];

/** IsAuthActionIcon ids that have dedicated behaviour in the auth cell. */
export const AUTH_ICON = {
  CHECKBOX: 1,
  TOGGLE: 2,
  STATUS: 3,
  CUSTOM_INPUT: 4,
  DELETE: 5,
  RESTORE: 6,
};
