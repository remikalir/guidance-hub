// src/components/reviews/ScoreSummary.tsx — Phase 4a: primary sidebar element
import { CRITERIA_LABELS, computeOverallAverage } from "@/lib/utils"
import { StarRating } from "./StarRating"

interface Averages {
  studentAgency: number | null
  biasMitigation: number | null
  dataSecurity: number | null
  accessibility: number | null
  studentLearning: number | null
}

interface ScoreSummaryProps {
  averages: Averages
  reviewCount: number
}

export function ScoreSummary({ averages, reviewCount }: ScoreSummaryProps) {
  const overall = computeOverallAverage(averages)

  if (reviewCount === 0) {
    return (
      <div className="bg-cream rounded-lg p-6">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted mb-2">
          Review Scores
        </h3>
        <p className="text-[13px] text-muted">No reviews yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-rule rounded-lg p-6">
      {/* Eyebrow + count */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
          Review Scores
        </h3>
        <span className="text-[11px] uppercase tracking-[0.12em] text-muted">
          {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
        </span>
      </div>

      {/* Overall — editorial visual anchor */}
      {overall !== null && (
        <div className="flex items-end gap-4 mb-6 pb-6 border-b border-rule">
          <span
            className="font-serif italic text-duke-blue leading-[0.9] tracking-tight"
            style={{ fontSize: "64px" }}
          >
            {overall.toFixed(1)}
          </span>
          <div className="pb-2">
            <StarRating value={Math.round(overall)} readOnly size="lg" />
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted mt-1.5">
              Overall
            </p>
          </div>
        </div>
      )}

      {/* Per-criterion breakdown */}
      <div className="space-y-3.5">
        {CRITERIA_LABELS.map(({ key, label }) => {
          const score = averages[key]
          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-ink flex-1 leading-tight">
                {label}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <StarRating
                  value={score !== null ? Math.round(score) : 0}
                  readOnly
                  size="sm"
                />
                <span className="text-[12px] font-medium text-ink w-7 text-right tabular-nums">
                  {score !== null ? score.toFixed(1) : "—"}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
