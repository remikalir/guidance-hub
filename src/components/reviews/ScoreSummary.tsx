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
      <div className="bg-gray-50 rounded-xl p-5 text-center">
        <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Review Scores</h3>
        <span className="text-sm text-gray-500">{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>
      </div>

      {overall !== null && (
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
          <span className="text-3xl font-bold text-duke-blue">{overall.toFixed(1)}</span>
          <div>
            <StarRating value={Math.round(overall)} readOnly size="lg" />
            <p className="text-xs text-gray-500 mt-0.5">Overall average</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {CRITERIA_LABELS.map(({ key, label }) => {
          const score = averages[key]
          return (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 w-36">{label}</span>
              <div className="flex items-center gap-2">
                <StarRating
                  value={score !== null ? Math.round(score) : 0}
                  readOnly
                  size="sm"
                />
                <span className="text-sm font-medium text-gray-700 w-8 text-right">
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
