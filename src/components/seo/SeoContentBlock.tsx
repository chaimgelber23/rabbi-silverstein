import type { SeoPageContent } from "@/lib/seo/content";

/**
 * Server-rendered SEO content: an indexable intro + a native <details> FAQ
 * accordion (works with zero JS, fully crawlable) + FAQPage JSON-LD for rich
 * results and AI answer-engine citation. Placed on hub pages where the only
 * other content is audio (which search engines cannot read).
 */
export default function SeoContentBlock({
  content,
  variant = "cream",
}: {
  content: SeoPageContent;
  variant?: "cream" | "tan";
}) {
  const { introHeading = "About this series", introParagraphs, faqs } = content;

  const faqLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <section className={`${variant === "tan" ? "bg-tan" : "bg-cream"} py-14 px-6 border-t border-amber/10`}>
      {faqLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      )}
      <div className="max-w-3xl mx-auto">
        {introParagraphs.length > 0 && (
          <div className="mb-12">
            {introHeading ? (
              <h2 className="serif-heading text-brown text-2xl md:text-3xl font-bold mb-5">{introHeading}</h2>
            ) : null}
            <div className="space-y-4">
              {introParagraphs.map((p, i) => (
                <p key={i} className="text-brown/75 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>
        )}

        {faqs.length > 0 && (
          <div>
            <h2 className="serif-heading text-brown text-2xl md:text-3xl font-bold mb-5">Frequently asked questions</h2>
            <div className="divide-y divide-amber/15 border-y border-amber/15">
              {faqs.map((f, i) => (
                <details key={i} className="group py-4">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-brown font-semibold list-none">
                    <span>{f.q}</span>
                    <svg
                      className="w-5 h-5 text-amber shrink-0 transition-transform group-open:rotate-45"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </summary>
                  <p className="text-brown/75 leading-relaxed mt-3">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
