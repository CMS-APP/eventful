"use client";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const posts = [
  {
    blogId: "blog1",
    title: "How to Plan an Effortless Party",
    category: "Planning Tips",
    image: "/images/blog/party.jpg",
    content: [
      "Planning a party shouldn’t feel like a full-time job. Whether you’re hosting a big birthday bash, a casual dinner party, or something in between, it should feel fun and exciting — not overwhelming. That’s why we built Eventful: to make organising any event the easiest and most satisfying thing you do all month.",
      "But whether you use Eventful or not (though… we’d obviously recommend it 💛), here are our top tips for keeping the planning process chill:",
      "1. Make a list for everything. Think to-dos, shopping, outfits, and decorations. You don’t have to do it all at once — but having it all in one place helps you stay calm and in control.",
      "2. Don’t overthink it. People remember how a party *felt*, not whether the paper plates matched the napkins. Focus on fun, not perfection.",
      "3. Start earlier than you think. Even if it’s just a rough outline of who you’re inviting and what food you want to serve — early planning means less panic later on.",
      "4. Give people something to do. An activity (even a silly one) helps ease pressure, especially if guests don’t know each other well.",
      "5. Ask for help. If someone offers to bring a bottle, a speaker, or their playlist — say yes.",
      "Hosting doesn’t have to be stressful. Keep it simple, keep it joyful, and remember that the best events are the ones where everyone (including you) actually has fun.",
    ],
  },
  {
    blogId: "save-money-still-party-hard",
    title: "Save Money, Still Party Hard",
    category: "Budgeting",
    image: "/images/blog/budget.jpg",
    content: [
      "Throwing a party doesn’t have to mean throwing your money away. Whether you’re planning a birthday bash, baby shower, or a just-because gathering, here are some easy ways to save money—without skimping on the fun.",
      "1. Set a Budget (and Actually Use It)",
      "Start with how much you can realistically spend, then break that down: food, drinks, decorations, etc. Apps like Eventful (👋 hey!) can help you track everything in one place, so you don’t get surprised later.",
      "2. Keep It Cozy",
      "More people = more money. Trim your guest list to those you truly want to celebrate with. Smaller parties often feel more meaningful anyway.",
      "3. DIY Where You Can",
      "Homemade decorations, playlists, and even party favors can add a personal touch and save serious cash. Pinterest is your friend. So is a glue gun.",
      "4. Ask for Help (It’s Okay!)",
      "Don't be afraid to ask for help, ask your gests to bring along a side plate or dessert to help cut the cost down. BYOB works too.",
      "5. Skip the Fancy Venue",
      "Your living room, a local park, or even your backyard can be the perfect spot. Add some string lights and good music, and you’re golden.",
      "6. Shop Smart",
      "Buy in bulk, check discount stores, and don’t be afraid to compare prices. And pro tip: party supplies are way cheaper outside of peak holiday seasons.",
      "⸻",
      "The bottom line?",
      "A good party isn’t about how much you spend—it’s about how people feel. So plan smart, get creative, and focus on what matters: bringing people together.",
    ],
  },
  {
    blogId: "make-it-look-wow-without-stress",
    title: "Make It Look Wow (Without Stress)",
    category: "Decor & Style",
    image: "/images/blog/balloons.jpg",
    content: [
      "Let’s ditch Pinterest pressure and keep it real. You don’t need balloon arches and flower walls for it to feel special.",
      "A few statement touches, a consistent colour palette, and some music that fits the vibe — that’s all it takes.",
    ],
  },
  {
    blogId: "the-only-event-checklist-you-need",
    title: "The Only Event Checklist You’ll Ever Need",
    category: "Checklists",
    image: "/images/blog/checkbox.jpg",
    content: [
      "We made a checklist that works for any type of event. From planning to packing up, you’ll never miss a step again.",
      "Use it in the Eventful app and enjoy the power of ticking things off — it’s satisfying and efficient.",
    ],
  },
];

export default function BlogPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = Array.isArray(params?.blogId)
    ? params.blogId[0]
    : params?.blogId;
  const [likes, setLikes] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedLikes = localStorage.getItem(`likes-${blogId}`);
    if (savedLikes) {
      setLikes(parseInt(savedLikes, 10));
    }
  }, [blogId]);

  if (!blogId) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-black">Loading post...</p>
      </div>
    );
  }
  const post = posts.find((p) => p.blogId === blogId);

  if (!post) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-semibold text-gray-700">Blog not found</h1>
      </div>
    );
  }

  const handleLike = () => {
    setLikes((prev) => {
      const updated = prev + 1;
      localStorage.setItem(`likes-${blogId}`, updated.toString());
      return updated;
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow px-6 py-12 md:px-20 md:py-20 bg-white">
        <button
          onClick={() => router.back()}
          className="text-sm text-[--primary] hover:underline mb-6 flex items-center"
        >
          ← Back
        </button>
        <article className="max-w-3xl mx-auto space-y-12">
          <header>
            <Image
              src={post.image}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-64 object-cover rounded-xl mb-6"
            />
            <h1 className="text-4xl font-bold text-[--primary] mb-2 leading-tight">
              {post.title}
            </h1>
            <p className="text-sm text-gray-500">Category: {post.category}</p>
          </header>

          <section className="space-y-6 text-lg text-black leading-relaxed">
            {post.content.map((paragraph, index) => (
              <p key={index} className="text-black">
                {paragraph}
              </p>
            ))}
          </section>
          <div className="pt-12 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex gap-3 sm:gap-4 flex-wrap">
                <button
                  onClick={handleLike}
                  className="bg-[--primary] hover:bg-[--secondary] text-white font-semibold text-sm px-5 py-2 rounded-full shadow-sm transition"
                >
                  Likes ({likes})
                </button>
                <button
                  onClick={handleShare}
                  className="bg-gray-100 hover:bg-gray-200 text-[--primary] font-semibold text-sm px-5 py-2 rounded-full shadow-sm transition"
                >
                  Share
                </button>
              </div>
              {copied && (
                <span className="text-sm text-gray-600 font-medium transition-opacity duration-300">
                  Link copied to clipboard!
                </span>
              )}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
