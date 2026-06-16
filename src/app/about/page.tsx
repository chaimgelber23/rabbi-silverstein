import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SeoContentBlock from "@/components/seo/SeoContentBlock";
import { getSeoContent } from "@/lib/seo/content";
import { SITE_URL } from "@/lib/site";

export const revalidate = 86400;

const about = getSeoContent("about");

const SPOTIFY = "https://open.spotify.com/show/1YHYBjDG0AbKzkOftmrZz1";
const APPLE = "https://podcasts.apple.com/podcast/id1589293461";
const JEWISH_PODCASTS = "https://listen.jewishpodcasts.fm/rabbiodomsilverstein";
const AMAZON = "https://music.amazon.com/podcasts/2255e3e2-656b-4ca0-b72f-117d5db06316";

export const metadata: Metadata = about
  ? {
      title: { absolute: about.titleTag },
      description: about.metaDescription,
      alternates: { canonical: "/about" },
      openGraph: {
        title: about.titleTag,
        description: about.metaDescription,
        url: `${SITE_URL}/about`,
        type: "profile",
      },
      twitter: { card: "summary", title: about.titleTag, description: about.metaDescription },
    }
  : {};

// Person schema — only publicly verifiable facts (name, the podcast, the
// platforms it is published on, contact email). No semicha, title, institution,
// or biographical claim that is not documented.
const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Rabbi Odom Silverstein",
  alternateName: ["Rabbi Adam Silverstein", "Rabbi Adom Silverstein", "Rabbi Odem Silverstein", "Adam Silverstein"],
  jobTitle: "Torah teacher",
  description:
    "Teacher of short daily Torah audio shiurim on Tanya, Nefesh HaChaim, and Bitachon.",
  url: `${SITE_URL}/about`,
  email: "odsilverstein@gmail.com",
  sameAs: [SPOTIFY, APPLE, JEWISH_PODCASTS, AMAZON],
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />

      <section className="bg-brown py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Image
            src="/rabbi-silverstein.jpg"
            alt="Rabbi Odom Silverstein"
            width={128}
            height={128}
            className="rounded-full mx-auto mb-6 ring-2 ring-amber/40 shadow-lg shadow-black/30 object-cover"
            priority
          />
          <h1 className="serif-heading text-amber text-4xl md:text-5xl font-bold mb-4">About Rabbi Odom Silverstein</h1>
          <p className="text-white/70 text-lg">
            Short daily Torah shiurim on Tanya, Nefesh HaChaim, and Bitachon.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <a href={SPOTIFY} target="_blank" rel="noopener noreferrer"
              className="bg-amber text-brown font-bold px-6 py-2.5 rounded-xl hover:bg-amber-light transition-colors text-sm">Spotify</a>
            <a href={APPLE} target="_blank" rel="noopener noreferrer"
              className="border border-amber/40 text-amber font-bold px-6 py-2.5 rounded-xl hover:bg-amber/10 transition-colors text-sm">Apple Podcasts</a>
            <a href={JEWISH_PODCASTS} target="_blank" rel="noopener noreferrer"
              className="border border-amber/40 text-amber font-bold px-6 py-2.5 rounded-xl hover:bg-amber/10 transition-colors text-sm">JewishPodcasts.fm</a>
          </div>
        </div>
      </section>

      <section className="bg-cream pt-12 px-6">
        <div className="max-w-3xl mx-auto">
          <figure className="border-l-4 border-amber/40 pl-5 py-1">
            <blockquote className="text-brown/80 text-lg leading-relaxed italic">
              &ldquo;Join R&rsquo; Odom Silverstein on an illuminating journey as we dive into a text that
              has transformed the lives of countless yidden over the last two centuries. Sefer HaTanya:
              Clear and Concise. Podcasts will be published three times a week, each in 5 min segments
              highlighting the main themes and takeaways of each perek. Bitachon Weekly: 7 minute chizuk
              on Bitachon drawn from the Parsha and Moadei Hashono.&rdquo;
            </blockquote>
            <figcaption className="text-amber-text text-sm font-semibold mt-3">
              From the Rabbi Odom Silverstein Podcast
            </figcaption>
          </figure>
        </div>
      </section>

      {about && <SeoContentBlock content={about} />}

      <section className="bg-cream px-6 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <Link
            href="/"
            className="inline-block bg-brown text-amber font-semibold px-8 py-3 rounded-xl hover:bg-brown-light transition-colors"
          >
            Browse all shiurim
          </Link>
        </div>
      </section>
    </main>
  );
}
