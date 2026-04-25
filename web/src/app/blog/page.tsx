"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";

const posts = [
  {
    slug: "blog1",
    title: "How to Plan an Effortless Party",
    category: "Planning Tips",
    image: "/images/blog/party.jpg",
    summary:
      "Planning doesn’t have to feel like a full-time job. Here’s how to keep it joyful, not stressful.",
  },
  {
    slug: "save-money-still-party-hard",
    title: "Save Money, Still Party Hard",
    category: "Budgeting",
    image: "/images/blog/budget.jpg",
    summary:
      "Cut costs without cutting fun — here’s how to throw unforgettable events on a budget.",
  },
  {
    slug: "make-it-look-wow-without-stress",
    title: "Make It Look Wow (Without Stress)",
    category: "Decor & Style",
    image: "/images/blog/balloons.jpg",
    summary:
      "Ditch the Pinterest pressure and go for effortlessly stylish vibes instead.",
  },
  {
    slug: "the-only-event-checklist-you-need",
    title: "The Only Event Checklist You’ll Ever Need",
    category: "Checklists",
    image: "/images/blog/checkbox.jpg",
    summary:
      "Plan smarter, not harder — this master checklist keeps everything on track.",
  },
];

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A3B2E]">
      <Header />
      <main className="flex flex-grow flex-col px-6 py-12 md:px-20 md:py-20">
        <section className="max-w-6xl mx-auto w-full">
          <h1 className="text-white mb-12">Eventful Blog</h1>
          <div className="grid md:grid-cols-3 gap-8">
            {posts.map(({ slug, title, category, image, summary }) => (
              <Link href={`/blog/${slug}`} key={slug}>
                <div
                  key={slug}
                  className="bg-white/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <Image
                      src={image}
                      alt={title}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-3 right-3 bg-[--secondary] hover:bg-[--primary] text-white rounded-full w-10 h-10 flex items-center justify-center text-lg transition-colors">
                      <FontAwesomeIcon icon={faArrowRight} />
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h2 className="text-lg font-semibold text-white">
                      {title}
                    </h2>
                    <p className="text-sm text-white/80">{summary}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-[#FEBA12]/20 text-[#FEBA12] font-medium uppercase">
                        {category}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
