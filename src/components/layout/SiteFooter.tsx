import Link from "next/link"
import Image from "next/image"

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-xl">
          <Link
            href="/"
            aria-label="Duke Center for Teaching and Learning"
            className="inline-block"
          >
            <Image
              src="/brand/ctl-mark.png"
              alt="Duke Center for Teaching and Learning"
              height={80}
              width={480}
              className="h-10 w-auto object-contain"
            />
          </Link>
          <p className="mt-5 text-sm text-muted leading-relaxed">
            The AI &amp; Education Guidance Hub is a project of the Duke Center
            for Teaching and Learning, developed in collaboration with{" "}
            <a
              href="https://ai.duke.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-duke-blue border-b border-rule hover:border-duke-blue transition-colors"
            >
              AI at Duke
            </a>
            .
          </p>
        </div>

        <div className="border-t border-rule mt-10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted">
          <span>© {new Date().getFullYear()} Duke University.</span>
          <span>Shared under educational use.</span>
        </div>
      </div>
    </footer>
  )
}
