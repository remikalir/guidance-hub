export function SiteFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <span className="text-sm text-gray-600">
              <strong>Guidance Hub</strong>
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Shared under educational use. Contact your institution for licensing questions.
          </p>
        </div>
      </div>
    </footer>
  )
}
