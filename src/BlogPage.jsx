import React, { useEffect, useState } from "react";
import { useSEO } from "./hooks/useSEO";
import { ArrowRight, BookOpen, Calendar, Clock, ChevronLeft } from "lucide-react";
import Footer from "./components/common/Footer";
import Navbar, { SITE_NAV_LINKS } from "./components/common/Navbar";
import { fetchBlogPosts } from "./api/blog";

const CARD_COLORS = [
  { from: "#1d4ed8", to: "#0ea5e9" },
  { from: "#4f46e5", to: "#818cf8" },
  { from: "#0d9488", to: "#34d399" },
  { from: "#0369a1", to: "#38bdf8" },
  { from: "#7c3aed", to: "#a78bfa" },
  { from: "#0891b2", to: "#22d3ee" },
];

function formatDate(str) {
  if (!str) return "";
  return new Date(str).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function estReadTime(post) {
  const fields = ["content", "content1", "content2", "content3", "content4"];
  const text = fields.map((f) => post[f] || "").join(" ").replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function FeaturedCard({ post }) {
  const readTime = estReadTime(post);
  const { from, to } = CARD_COLORS[0];

  return (
    <a
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5 sm:flex-row"
      style={{ minHeight: 340 }}
    >
      <div
        className="relative w-full shrink-0 overflow-hidden sm:w-[55%]"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})`, minHeight: 280 }}
      >
        {post.cover_thumb || post.cover ? (
          <img
            src={post.cover_thumb || post.cover}
            srcSet={post.cover_thumb_small ? `${post.cover_thumb_small} 400w, ${post.cover_thumb || post.cover} 800w` : undefined}
            sizes="(max-width: 640px) 100vw, 55vw"
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-14 w-14 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
      </div>

      <div className="flex flex-1 flex-col justify-center bg-white p-8 lg:p-10">
        <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-primary-600">
          Featured
        </div>

        <h2 className="mb-3 text-2xl font-bold leading-snug text-secondary-900 group-hover:text-primary-600 transition-colors duration-200 lg:text-3xl">
          {post.title}
        </h2>

        {post.description && (
          <p className="mb-5 text-sm leading-relaxed text-secondary-500 line-clamp-3">
            {post.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-4 text-xs text-secondary-400">
          {post.created_at && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary-400" />
              {formatDate(post.created_at)}
            </span>
          )}
          {readTime > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary-400" />
              {readTime} min read
            </span>
          )}
        </div>

        <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary-600">
          Read article
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </a>
  );
}

function BlogCard({ post, index }) {
  const color = CARD_COLORS[index % CARD_COLORS.length];

  return (
    <a
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary-200"
    >
      <div
        className="relative aspect-[16/9] w-full overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
      >
        {post.cover_thumb || post.cover ? (
          <img
            src={post.cover_thumb || post.cover}
            srcSet={post.cover_thumb_small ? `${post.cover_thumb_small} 400w, ${post.cover_thumb || post.cover} 800w` : undefined}
            sizes="(max-width: 640px) 100vw, 33vw"
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-white/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {post.created_at && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-secondary-700 backdrop-blur-sm shadow-sm">
            <Calendar className="h-3 w-3 text-primary-500" />
            {formatDate(post.created_at)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="mb-3 text-base font-bold leading-snug text-secondary-900 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
          {post.title}
        </h2>

        {post.description ? (
          <p className="mb-4 flex-1 text-sm leading-relaxed text-secondary-400 line-clamp-2">
            {post.description}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-primary-600">
          Read article
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </a>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="aspect-[16/9] w-full animate-pulse bg-neutral-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-3/4 animate-pulse rounded-lg bg-neutral-100" />
        <div className="h-4 w-full animate-pulse rounded-lg bg-neutral-100" />
        <div className="h-3 w-1/3 animate-pulse rounded-lg bg-neutral-100" />
      </div>
    </div>
  );
}

export default function BlogPage() {
  useSEO({
    title: "Blog | Nusa Penida Travel Guide — Bluuu Tours",
    description: "Discover tips, guides and stories about Nusa Penida. Plan your perfect trip with expert advice from the Bluuu Tours team.",
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogPosts()
      .then(setPosts)
      .catch(() => setError("Failed to load articles"))
      .finally(() => setLoading(false));
  }, []);

  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-neutral-50 text-secondary-900">
      <Navbar
        variant="fullbar"
        links={SITE_NAV_LINKS}
        cta={{ label: "Check availability", href: "/private-tour-to-nusa-penida#booking" }}
      />

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#eef4ff] to-neutral-50 border-b border-neutral-100">
        <div className="container py-10 sm:py-14">
          <a
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-400 transition hover:text-primary-600"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to home
          </a>

          <div className="flex items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-600 shadow-sm">
              <BookOpen className="h-3 w-3" />
              Travel Blog
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-secondary-900 sm:text-5xl">
            Nusa Penida Guide
          </h1>
          <p className="mt-3 max-w-lg text-base leading-relaxed text-secondary-500">
            Tips, travel guides and local stories to help you plan the perfect Nusa Penida experience.
          </p>
        </div>
      </div>

      <main className="container py-10">
        {loading ? (
          <>
            <div className="mb-8 h-80 animate-pulse rounded-3xl bg-neutral-200" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => <BlogCardSkeleton key={i} />)}
            </div>
          </>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-secondary-400">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-secondary-400">
            No articles yet. Check back soon.
          </div>
        ) : (
          <>
            {featured && (
              <div className="mb-8">
                <FeaturedCard post={featured} />
              </div>
            )}

            {rest.length > 0 && (
              <>
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-neutral-200" />
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary-400">
                    More articles
                  </span>
                  <div className="h-px flex-1 bg-neutral-200" />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post, i) => (
                    <BlogCard key={post.id} post={post} index={i + 1} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
