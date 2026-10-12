import { useCallback, useEffect, useState } from "react";

/**
 * Derives the column master, raw rows and group-checkbox defaults from the
 * `OtherKeyData` payload (rd / rd1 / rd2 / rd3). `syncFromSource` can be
 * called again to re-derive (this also resets the group checkboxes).
 */
export default function useReportSource(OtherKeyData) {
  const [allRowData, setAllRowData] = useState();
  const [allColumIdWiseName, setAllColumIdWiseName] = useState();
  const [masterKeyData, setMasterKeyData] = useState();
  const [allColumData, setAllColumData] = useState();
  const [allColumDataBack, setAllColumDataBack] = useState();
  const [grupEnChekBox, setGrupEnChekBox] = useState({});
  const [grupEnChekBoxImage, setGrupEnChekBoxImage] = useState([]);
  const [status500, setStatus500] = useState(false);

  const syncFromSource = useCallback(() => {
    try {
      if (OtherKeyData == null) return;

      setAllRowData(OtherKeyData?.rd3);
      setAllColumIdWiseName(OtherKeyData?.rd2);
      setMasterKeyData(OtherKeyData?.rd[0]);

      const rd1 = OtherKeyData?.rd1 ? [...OtherKeyData.rd1] : [];
      rd1.sort((a, b) => (a.DisplayOrder ?? 999) - (b.DisplayOrder ?? 999));

      setAllColumData((prevColumData) => {
        if (!prevColumData?.length) return rd1;
        // keep the user's visibility / order choices across refetches
        return rd1.map((col) => {
          const prevCol = prevColumData.find((p) => p.FieldName === col.FieldName);
          return prevCol
            ? { ...col, IsVisible: prevCol.IsVisible, DisplayOrder: prevCol.DisplayOrder }
            : col;
        });
      });
      setAllColumDataBack(rd1);

      setGrupEnChekBox(
        rd1
          .filter((col) => col?.GrupChekBox == "True")
          .reduce((acc, col) => {
            acc[col.FieldName] = col.DefaultGrupChekBox == "True";
            return acc;
          }, {}),
      );
      setGrupEnChekBoxImage(
        rd1
          .filter((col) => col?.GroupColumnImageView == "True")
          .map((col) => ({
            FieldName: col.FieldName,
            DefaultGrupChekBox: col.DefaultGrupChekBox == "True",
          })),
      );
      setStatus500(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setStatus500(true);
    }
  }, [OtherKeyData]);

  // allColumData / grupEnChekBox are user-editable copies seeded from the
  // OtherKeyData prop, so they have to be (re)initialised when it changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncFromSource();
  }, [syncFromSource]);

  return {
    allRowData,
    allColumIdWiseName,
    masterKeyData,
    allColumData,
    setAllColumData,
    allColumDataBack,
    setAllColumDataBack,
    grupEnChekBox,
    setGrupEnChekBox,
    grupEnChekBoxImage,
    setGrupEnChekBoxImage,
    status500,
    syncFromSource,
  };
}
