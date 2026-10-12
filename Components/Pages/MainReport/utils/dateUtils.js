const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const EN_GB_DATE = { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" };
const EN_GB_TIME = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
};

/** `yyyy-mm-dd` used by the server-side date filter. Empty string for invalid input. */
export const formatServerDate = (d) => {
  if (!d) return "";
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return "";
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/** Milliseconds for a Date column sort comparator; `0` for empty / invalid values. */
export const dateToMs = (val) => {
  if (!val || val === "-" || val == null) return 0;
  const d = new Date(val);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

export const dateSortComparator = (v1, v2) => dateToMs(v1) - dateToMs(v2);

/**
 * Formats a raw Date-column value for display as `dd Mon yyyy` (optionally with
 * `HH:mm:ss`). Returns `"-"` when the value is empty or unparsable.
 */
export const formatDateCellValue = (value, withTime) => {
  if (!value || value === "-" || value == null) return "-";

  if (/^\d{1,2}\s[A-Za-z]{3,9}\s\d{4}$/.test(value)) return value;

  const isoNaiveMatch =
    typeof value === "string" &&
    value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?$/);
  if (isoNaiveMatch) {
    const [, year, month, day, hour, minute, second] = isoNaiveMatch;
    const datePart = `${day} ${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
    return withTime ? `${datePart} ${hour}:${minute}:${second}` : datePart;
  }

  const dateObj = new Date(value);
  if (isNaN(dateObj.getTime())) return "-";
  const datePart = dateObj.toLocaleDateString("en-GB", EN_GB_DATE);
  return withTime ? `${datePart} ${dateObj.toLocaleTimeString("en-GB", EN_GB_TIME)}` : datePart;
};

/**
 * Normalises a cell / filter value to a local-midnight Date so that ranges can
 * be compared day-by-day. Returns an invalid Date when it cannot be parsed.
 */
export const toDateOnly = (d) => {
  if (!d && d !== 0) return new Date(NaN);
  if (d instanceof Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  const str = String(d).trim();
  const formattedMatch = str.match(/^(\d{1,2})\s([A-Za-z]{3,})\s(\d{4})$/);
  if (formattedMatch) {
    const monthIdx = MONTH_NAMES.indexOf(formattedMatch[2]);
    if (monthIdx >= 0) {
      return new Date(+formattedMatch[3], monthIdx, +formattedMatch[1]);
    }
  }
  const dateObj = new Date(str);
  if (!isNaN(dateObj.getTime())) {
    return new Date(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate());
  }
  return new Date(NaN);
};
