import React, { useEffect, useRef, useState } from "react";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { useSEO } from "./hooks/useSEO";
import { ArrowLeft, BookOpen, Calendar, Clock, ArrowRight } from "lucide-react";
import Footer from "./components/common/Footer";
import Navbar, { SITE_NAV_LINKS } from "./components/common/Navbar";
import { fetchBlogPost, fetchBlogPosts } from "./api/blog";

const HTML_FIELDS = ["content", "content1", "content2", "content3", "content4"];

function formatDate(str) {
  if (!str) return "";
  return new Date(str).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function estimateReadTime(post) {
  const text = HTML_FIELDS.map((f) => post[f] || "")
    .join(" ")
    .replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function imgUrl(img) { return img?.url || img?.path || null; }
function imgThumb(img) { return img?.thumb || img?.url || img?.path || null; }

const PROSE = [
  "text-[16px] leading-[1.85] text-secondary-700",
  "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-secondary-900 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:leading-tight",
  "[&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-secondary-900 [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:leading-tight",
  "[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-secondary-900 [&_h4]:mt-6 [&_h4]:mb-2",
  "[&_p]:mb-5 [&_p:last-child]:mb-0",
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:space-y-2",
  "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:space-y-2",
  "[&_li]:text-secondary-600 [&_li]:leading-relaxed",
  "[&_strong]:font-semibold [&_strong]:text-secondary-800",
  "[&_em]:italic [&_em]:text-secondary-600",
  "[&_a]:text-primary-600 [&_a]:underline [&_a:hover]:text-primary-700",
  "[&_blockquote]:border-l-4 [&_blockquote]:border-primary-300 [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:text-secondary-500 [&_blockquote]:my-6 [&_blockquote]:bg-primary-50 [&_blockquote]:rounded-r-xl",
  "[&_img]:rounded-xl [&_img]:w-full [&_img]:my-6 [&_img]:shadow-md [&_img]:block [&_img]:cursor-zoom-in",
  "[&_hr]:my-8 [&_hr]:border-neutral-200",
].join(" ");

function ProseBlock({ html }) {
  const fixed = (html || "")
    .replace(/src="\/storage\//g, 'src="https://bluuu.tours/storage/')
    .replace(/src='\/storage\//g, "src='https://bluuu.tours/storage/");
  return (
    <div className={`prose-content ${PROSE}`} dangerouslySetInnerHTML={{ __html: fixed }} />
  );
}

function PhotoGallery({ images }) {
  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    const src = imgUrl(images[0]);
    const thumb = imgThumb(images[0]);
    if (!src) return null;
    return (
      <a href={src} data-fancybox="gallery"
        className="my-10 block overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 cursor-zoom-in">
        <img src={thumb || src} alt=""
          className="w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
          style={{ maxHeight: 500 }} />
      </a>
    );
  }

  if (images.length === 2) {
    return (
      <div className="my-10 grid grid-cols-2 gap-3">
        {images.map((img) => {
          const src = imgUrl(img), thumb = imgThumb(img);
          if (!src) return null;
          return (
            <a key={img.id} href={src} data-fancybox="gallery"
              className="group overflow-hidden rounded-xl shadow-md ring-1 ring-black/5 cursor-zoom-in">
              <img src={thumb || src} alt=""
                className="aspect-[4/3] w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </a>
          );
        })}
      </div>
    );
  }

  const [first, ...rest] = images;
  const firstSrc = imgUrl(first), firstThumb = imgThumb(first);
  const cols = rest.length <= 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className="my-10 space-y-3">
      {firstSrc && (
        <a href={firstSrc} data-fancybox="gallery"
          className="group block overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5 cursor-zoom-in">
          <img src={firstThumb || firstSrc} alt=""
            className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            style={{ maxHeight: 420 }} />
        </a>
      )}
      <div className={`grid gap-3 ${cols}`}>
        {rest.map((img) => {
          const src = imgUrl(img), thumb = imgThumb(img);
          if (!src) return null;
          return (
            <a key={img.id} href={src} data-fancybox="gallery"
              className="group overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 cursor-zoom-in">
              <img src={thumb || src} alt=""
                className="aspect-[4/3] w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-72 w-full bg-neutral-200 sm:h-96 lg:h-[480px]" />
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8 space-y-4">
        <div className="h-10 w-3/4 rounded-lg bg-neutral-100" />
        <div className="h-5 w-1/2 rounded-lg bg-neutral-100" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={`h-4 rounded-lg bg-neutral-100 ${i % 4 === 3 ? "w-2/3" : "w-full"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function distributeImages(images, blockCount) {
  if (!images || images.length === 0 || blockCount === 0) return { blockImages: Array(blockCount).fill([]) };
  const rest = images.slice(1);
  if (rest.length === 0) return { blockImages: Array(blockCount).fill([]) };
  const perBlock = Math.ceil(rest.length / blockCount);
  const blockImages = Array.from({ length: blockCount }, (_, i) => rest.slice(i * perBlock, (i + 1) * perBlock));
  return { blockImages };
}

function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setPct(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 z-[9999] h-[3px] w-full bg-neutral-200/50">
      <div className="h-full bg-gradient-to-r from-primary-500 to-sky-400 transition-[width] duration-75"
        style={{ width: `${pct}%` }} />
    </div>
  );
}

function RelatedCard({ post }) {
  const hasCover = post.cover_thumb || post.cover;
  return (
    <a href={`/blog/${post.slug}`}
      className="group flex gap-4 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-primary-200">
      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {hasCover && (
          <img src={post.cover_thumb || post.cover} alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        )}
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-sm font-bold leading-snug text-secondary-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {post.title}
        </p>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary-500">
          Read <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </a>
  );
}

export default function BlogPostPage({ slug }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState([]);
  const articleRef = useRef(null);

  useSEO({
    title: post?.seo_title || post?.title || "Blog | Bluuu Tours",
    description: post?.seo_description || post?.description || "",
  });

  useEffect(() => {
    setLoading(true); setPost(null); setNotFound(false);
    fetchBlogPost(slug)
      .then((data) => { if (!data) setNotFound(true); else setPost(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    fetchBlogPosts()
      .then((all) => setRelated(all.filter((p) => p.slug !== slug).slice(0, 3)))
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!articleRef.current || !post) return;
    articleRef.current.querySelectorAll(".prose-content img").forEach((img) => {
      if (img.closest("a[data-fancybox]")) return;
      const src = img.getAttribute("src");
      if (!src) return;
      const a = document.createElement("a");
      a.href = src;
      a.setAttribute("data-fancybox", "gallery");
      a.style.display = "block";
      a.className = "cursor-zoom-in";
      img.parentNode.insertBefore(a, img);
      a.appendChild(img);
    });
    Fancybox.bind('[data-fancybox="gallery"]', { animated: true, groupAll: false });
    return () => { Fancybox.destroy(); };
  }, [post]);

  const htmlBlocks = post ? HTML_FIELDS.map((f) => post[f]).filter(Boolean) : [];
  const images = post?.images?.filter((img) => imgUrl(img)) || [];
  const coverSrc = post?.cover || imgUrl(images[0]);
  const coverThumb = post?.cover_thumb || imgThumb(images[0]) || coverSrc;
  const readTime = post ? estimateReadTime(post) : 0;
  const { blockImages } = distributeImages(images, htmlBlocks.length);

  return (
    <div className="min-h-screen bg-white text-secondary-900">
      <ReadingProgress />
      <Navbar
        variant="fullbar"
        links={SITE_NAV_LINKS}
        cta={{ label: "Check availability", href: "/private#booking" }}
      />

      {loading ? <Skeleton /> : notFound ? (
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
          <p className="text-lg font-semibold text-secondary-500">Article not found.</p>
          <a href="/blog" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to blog
          </a>
        </div>
      ) : (
        <div ref={articleRef}>
          {/* Hero */}
          <div className="relative w-full overflow-hidden bg-neutral-900" style={{ minHeight: 460 }}>
            {coverSrc ? (
              <img src={coverThumb || coverSrc} alt={post.title}
                className="absolute inset-0 h-full w-full object-cover opacity-60" />
            ) : (
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#1d4ed8,#0ea5e9)" }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

            <div className="relative mx-auto flex h-full max-w-5xl flex-col justify-end px-5 pb-12 pt-28 lg:px-8"
              style={{ minHeight: 460 }}>
              <a href="/blog"
                className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
                <ArrowLeft className="h-3.5 w-3.5" /> All articles
              </a>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                {post.created_at && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    <Calendar className="h-3 w-3" /> {formatDate(post.created_at)}
                  </span>
                )}
                {readTime > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    <Clock className="h-3 w-3" /> {readTime} min read
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white drop-shadow sm:text-4xl lg:text-5xl">
                {post.title}
              </h1>

              {post.description && (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75">
                  {post.description}
                </p>
              )}
            </div>
          </div>

          {/* Article body */}
          <main className="mx-auto w-full max-w-5xl px-5 py-12 lg:px-8">
            {htmlBlocks.length > 0 ? (
              <div>
                {htmlBlocks.map((html, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <div className="my-12 flex items-center gap-4">
                        <div className="h-px flex-1 bg-neutral-200" />
                        <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 shadow-sm">
                          <span className="text-[10px] font-black uppercase tracking-widest text-secondary-400">Part</span>
                          <span className="text-sm font-black text-primary-500">{String(i + 1).padStart(2, "0")}</span>
                        </div>
                        <div className="h-px flex-1 bg-neutral-200" />
                      </div>
                    )}
                    <ProseBlock html={html} />
                    <PhotoGallery images={blockImages[i]} />
                  </React.Fragment>
                ))}
              </div>
            ) : (
              images.length > 1 && <PhotoGallery images={images.slice(1)} />
            )}

            {/* Related articles */}
            {related.length > 0 && (
              <div className="mt-16">
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-neutral-200" />
                  <span className="text-xs font-black uppercase tracking-widest text-secondary-400">More articles</span>
                  <div className="h-px flex-1 bg-neutral-200" />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {related.map((p) => <RelatedCard key={p.id} post={p} />)}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-center text-white shadow-xl">
              <div className="mb-1 text-xs font-black uppercase tracking-widest text-primary-200">Ready to explore?</div>
              <h2 className="mb-2 text-2xl font-bold">Book your Nusa Penida tour</h2>
              <p className="mb-6 text-sm text-primary-100">
                Join thousands of happy guests who've experienced Nusa Penida with Bluuu.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a href="/shared"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-primary-700 transition hover:bg-primary-50">
                  Shared tours
                </a>
                <a href="/private"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                  Private charter
                </a>
              </div>
            </div>
          </main>
        </div>
      )}

      <Footer />
    </div>
  );
}
