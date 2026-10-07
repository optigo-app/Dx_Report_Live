import React, { useMemo } from "react";
import "./SummaryCards.scss";

// rd  = field definitions (which fields to show, title, decimals, order, suffix)
// rd1 = data rows (SummaryFilterTitle = card header, other keys = values)
const formatValue = (val, decimal = 0, suffix = "") => {
  const num = Number(val ?? 0);
  const text = num.toLocaleString("en-IN", {
    minimumFractionDigits: decimal,
    maximumFractionDigits: decimal,
  });
  return suffix ? `${text} ${suffix}` : text;
};

const SummaryCards = ({ spData, onValueClick, onCardClick, hideEmpty = false }) => {
  // fields sorted by display order
  const fields = useMemo(
    () =>
      [...(spData?.rd || [])].sort(
        (a, b) =>
          (a.PreFilterSummaryDisplayOrder ?? 0) -
          (b.PreFilterSummaryDisplayOrder ?? 0)
      ),
    [spData]
  );

  // optionally hide cards where every field is 0
  const cards = useMemo(() => {
    const rows = spData?.rd1 || [];
    if (!hideEmpty) return rows;
    return rows.filter((row) =>
      fields.some((f) => Number(row[f.FieldName] || 0) !== 0)
    );
  }, [spData, fields, hideEmpty]);

  if (!cards.length) return <div className="sc-empty">No Data</div>;

  return (
    <div className="sc-grid">
      {cards.map((row, i) => (
        <div
          className={`sc-card${onCardClick ? " is-clickable" : ""}`}
          key={`${row.SummaryFilterTitle}-${i}`}
          onClick={() => onCardClick?.(row)}
        >
          <div className="sc-card__title" title={row.SummaryFilterTitle}>
            {row.SummaryFilterTitle}  
          </div>

          <div className="sc-card__body">
            {fields.map((f) => (
              <div className="sc-line" key={f.ColId || f.FieldName}>
                <span className="sc-line__label">
                  {f.PreFilterSummaryTitle}
                </span>
                <span
                  className="sc-line__value"
                  onClick={() => onValueClick?.(row, f)}
                >
                  {formatValue(
                    row[f.FieldName],
                    f.PreFilterSummaryDecimal,
                    f.PreFilterSummarySuffix
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;

/* ── Usage ───────────────────────────────────────────────
   <SummaryCards
     spData={spData}
     hideEmpty={false}                       // true = 0 wale cards hide
     onValueClick={(row, field) => console.log(row.SummaryFilterTitle, field.FieldName)}
   />
──────────────────────────────────────────────────────── */