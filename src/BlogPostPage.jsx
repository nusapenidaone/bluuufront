import React, { useEffect, useMemo, useRef, useState } from "react";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import SEO from "./components/SEO";
import { schemaArticle, schemaBreadcrumb } from "./lib/schemas";
import { ArrowLeft, BookOpen, Calendar, Clock, ArrowRight, Link2, Check } from "lucide-react";
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

function slugify(str, fallback) {
  const base = (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || fallback || "section";
}

function getSections(post) {
  if (!post || !Array.isArray(post.sections)) return [];
  return post.sections.filter((s) => s && (s.title || s.content));
}

function articleText(post) {
  const sections = getSections(post);
  const sectionsText = sections.map((s) => s.content || "").join(" ");
  const legacyText = HTML_FIELDS.map((f) => post[f] || "").join(" ");
  return `${sectionsText} ${legacyText}`.replace(/<[^>]+>/g, " ");
}

function estimateReadTime(post) {
  const words = articleText(post).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function wordCount(post) {
  return articleText(post).trim().split(/\s+/).filter(Boolean).length;
}

function isMeaningfullyUpdated(post) {
  if (!post?.updated_at || !post?.created_at) return false;
  const diff = Math.abs(new Date(post.updated_at) - new Date(post.created_at));
  return diff > 1000 * 60 * 60 * 24;
}

function imgUrl(img) { return img?.url || img?.path || null; }
function imgThumb(img) { return img?.thumb || img?.url || img?.path || null; }
function imgThumbSmall(img) { return img?.thumb_small || null; }

const PROSE = [
  "text-base leading-relaxed text-secondary-700",
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
        <img src={thumb || src}
          srcSet={imgThumbSmall(images[0]) ? `${imgThumbSmall(images[0])} 400w, ${thumb || src} 800w` : undefined}
          sizes="100vw"
          alt=""
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
              <img src={thumb || src}
                srcSet={imgThumbSmall(img) ? `${imgThumbSmall(img)} 400w, ${thumb || src} 800w` : undefined}
                sizes="50vw"
                alt=""
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
          <img src={firstThumb || firstSrc}
            srcSet={imgThumbSmall(first) ? `${imgThumbSmall(first)} 400w, ${firstThumb || firstSrc} 800w` : undefined}
            sizes="100vw"
            alt=""
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
              <img src={thumb || src}
                srcSet={imgThumbSmall(img) ? `${imgThumbSmall(img)} 400w, ${thumb || src} 800w` : undefined}
                sizes="(max-width: 640px) 50vw, 33vw"
                alt=""
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
      <div className="mx-auto max-w-3xl px-6 pt-16 space-y-4 text-center">
        <div className="mx-auto h-4 w-32 rounded-lg bg-neutral-100" />
        <div className="mx-auto h-10 w-3/4 rounded-lg bg-neutral-100" />
        <div className="mx-auto h-5 w-1/2 rounded-lg bg-neutral-100" />
      </div>
      <div className="mx-auto mt-10 max-w-5xl px-6 lg:px-8">
        <div className="aspect-[16/9] w-full rounded-3xl bg-neutral-200" />
        <div className="mt-10 space-y-3">
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

function useScrollSpy(ids) {
  const [activeId, setActiveId] = useState(null);
  const key = ids.join("|");
  useEffect(() => {
    if (!ids.length) return;
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -65% 0px" }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return activeId;
}

function TableOfContents({ items, activeId }) {
  if (!items.length) return null;
  return (
    <div className="mb-8">
      <p className="mb-3 text-2xs font-black uppercase tracking-widest text-primary-600">In this guide</p>
      <ul className="space-y-0.5 border-l border-neutral-200">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block border-l-2 py-2 pl-4 -ml-px text-sm font-medium leading-snug transition-colors ${
                activeId === item.id
                  ? "border-primary-600 text-primary-600 font-bold"
                  : "border-transparent text-secondary-500 hover:text-secondary-900 hover:no-underline"
              }`}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShareBlock({ title }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  function share(kind) {
    if (kind === "twitter") {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title || "")}`, "_blank", "noopener,noreferrer");
    } else if (kind === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="border-t border-neutral-200 pt-6">
      <p className="mb-3 text-2xs font-black uppercase tracking-widest text-secondary-400">Share this guide</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => share("twitter")}
          aria-label="Share on Twitter"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-secondary-600 transition hover:border-primary-500 hover:text-primary-600"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        </button>
        <button
          type="button"
          onClick={() => share("facebook")}
          aria-label="Share on Facebook"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-secondary-600 transition hover:border-primary-500 hover:text-primary-600"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" /></svg>
        </button>
        <button
          type="button"
          onClick={copyLink}
          aria-label="Copy link"
          className="flex h-9 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 text-xs font-semibold text-secondary-600 transition hover:border-primary-500 hover:text-primary-600"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-primary-600" /> : <Link2 className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

function Breadcrumbs({ post, slug }) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-1.5 px-5 pt-6 text-center text-xs text-secondary-400 lg:px-8">
      <a href="/" className="font-semibold hover:text-primary-600">Home</a>
      <span className="text-secondary-300">/</span>
      <a href="/blog" className="font-semibold hover:text-primary-600">Blog</a>
      {post?.category && (
        <>
          <span className="text-secondary-300">/</span>
          <span className="font-semibold text-secondary-500">{post.category}</span>
        </>
      )}
      <span className="text-secondary-300">/</span>
      <span className="max-w-[220px] truncate font-semibold text-secondary-700 sm:max-w-none">{post?.title}</span>
    </nav>
  );
}

function AuthorCard({ author }) {
  if (!author?.name) return null;
  const initials = author.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <section aria-label="About the author"
      className="flex flex-col items-start gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:p-10">
      {author.avatar ? (
        <img src={author.avatar} alt={author.name} loading="lazy"
          className="h-24 w-24 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary-50 text-2xl font-bold text-primary-600">
          {initials}
        </div>
      )}
      <div className="flex-1">
        <p className="mb-2 text-2xs font-black uppercase tracking-widest text-primary-600">Written by</p>
        <h2 className="mb-1 text-2xl font-bold tracking-tight text-secondary-900">{author.name}</h2>
        {author.title && <p className="mb-3 text-sm text-secondary-500">{author.title}</p>}
        {author.bio && <p className="mb-4 text-[15px] leading-relaxed text-secondary-600">{author.bio}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-semibold text-primary-600">
          <a href="/blog" className="hover:underline">All articles →</a>
          <a href="/private-tour-to-nusa-penida" className="hover:underline">Book a tour →</a>
        </div>
      </div>
    </section>
  );
}

function RelatedCard({ post }) {
  const hasCover = post.cover_thumb || post.cover;
  return (
    <a href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-primary-200">
      <div className="aspect-[16/10] w-full overflow-hidden bg-neutral-100">
        {hasCover && (
          <img src={post.cover_thumb || post.cover}
            srcSet={post.cover_thumb_small ? `${post.cover_thumb_small} 400w, ${post.cover_thumb || post.cover} 800w` : undefined}
            sizes="(max-width: 640px) 100vw, 33vw"
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {post.category && (
          <span className="mb-2 text-2xs font-black uppercase tracking-widest text-primary-600">{post.category}</span>
        )}
        <h3 className="mb-3 text-base font-bold leading-snug text-secondary-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {post.title}
        </h3>
        <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-primary-500">
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

  const sections = useMemo(() => getSections(post), [post]);
  const isSectioned = sections.length > 0;
  const tocItems = useMemo(
    () => sections.map((s, i) => ({ id: slugify(s.title, `section-${i}`) + `-${i}`, title: s.title || `Section ${i + 1}` })),
    [sections]
  );
  const activeTocId = useScrollSpy(useMemo(() => tocItems.map((t) => t.id), [tocItems]));

  const legacyBlocks = post && !isSectioned ? HTML_FIELDS.map((f) => post[f]).filter(Boolean) : [];
  const images = post?.images?.filter((img) => imgUrl(img)) || [];
  const coverSrc = post?.cover || imgUrl(images[0]);
  const coverThumb = post?.cover_thumb || imgThumb(images[0]) || coverSrc;
  const coverThumbSmall = post?.cover_thumb_small || null;
  const readTime = post ? estimateReadTime(post) : 0;
  const { blockImages } = distributeImages(images, legacyBlocks.length);

  const seoTitle = post?.seo_title || post?.title || "Blog | Bluuu Tours";
  const seoDescription = post?.seo_description || post?.description || "";
  const seoImage = post?.cover || null;
  const seoCanonical = slug ? `https://bluuu.tours/blog/${slug}` : undefined;
  const seoSchema = post ? [
    schemaArticle(post, slug, { wordCount: wordCount(post), readTime }),
    schemaBreadcrumb(post, slug),
  ] : undefined;

  return (
    <div className="min-h-screen bg-white text-secondary-900">
      <SEO
        title={seoTitle}
        description={seoDescription}
        image={seoImage}
        canonical={seoCanonical}
        type="article"
        schema={seoSchema}
      />
      <ReadingProgress />
      <Navbar
        variant="fullbar"
        links={SITE_NAV_LINKS}
        cta={{ label: "Check availability", href: "/private-tour-to-nusa-penida" }}
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
          <Breadcrumbs post={post} slug={slug} />

          {/* Article head */}
          <header className="mx-auto max-w-3xl px-5 pb-8 pt-6 text-center lg:px-8">
            {post.category && (
              <span className="mb-4 inline-block text-2xs font-black uppercase tracking-widest text-primary-600">
                {post.category}
              </span>
            )}
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-secondary-900 sm:text-4xl lg:text-5xl lg:leading-[1.05]">
              {post.title}
            </h1>
            {post.description && (
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-secondary-500 sm:text-lg">
                {post.description}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-secondary-400">
              {post.author?.name && (
                <>
                  <span className="inline-flex items-center gap-2">
                    {post.author.avatar && (
                      <img src={post.author.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                    )}
                    <span className="font-semibold text-secondary-900">{post.author.name}</span>
                  </span>
                  <span className="text-secondary-300">·</span>
                </>
              )}
              {post.created_at && <span>{formatDate(post.created_at)}</span>}
              {readTime > 0 && (
                <>
                  <span className="text-secondary-300">·</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {readTime} min read</span>
                </>
              )}
              {isMeaningfullyUpdated(post) && (
                <>
                  <span className="text-secondary-300">·</span>
                  <span>Updated {formatDate(post.updated_at)}</span>
                </>
              )}
            </div>
          </header>

          {/* Hero figure */}
          {coverSrc && (
            <figure className="mx-auto mb-14 max-w-5xl px-5 lg:px-8">
              <div className="aspect-[16/9] overflow-hidden rounded-3xl shadow-xl">
                <img src={coverThumb || coverSrc} alt={post.title}
                  srcSet={coverThumbSmall ? `${coverThumbSmall} 400w, ${coverThumb || coverSrc} 800w` : undefined}
                  sizes="100vw"
                  className="h-full w-full object-cover" />
              </div>
              {post.hero_caption && (
                <figcaption className="mt-3 text-center text-xs italic text-secondary-400">
                  {post.hero_caption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Two-column body */}
          <main className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-5 pb-16 lg:grid-cols-[240px_1fr] lg:gap-16 lg:px-8">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <TableOfContents items={tocItems} activeId={activeTocId} />
              <ShareBlock title={post.title} />
            </aside>

            <article>
              {isSectioned ? (
                sections.map((s, i) => (
                  <div key={i}>
                    <h2 id={tocItems[i].id} className="scroll-mt-28 text-2xl font-bold leading-tight tracking-tight text-secondary-900 sm:text-3xl mt-12 first:mt-0 mb-4">
                      {s.title}
                    </h2>
                    <ProseBlock html={s.content} />
                  </div>
                ))
              ) : legacyBlocks.length > 0 ? (
                <div>
                  {legacyBlocks.map((html, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && (
                        <div className="my-12 flex items-center gap-4">
                          <div className="h-px flex-1 bg-neutral-200" />
                          <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 shadow-sm">
                            <span className="text-2xs font-black uppercase tracking-widest text-secondary-400">Part</span>
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
            </article>
          </main>

          <div className="mx-auto max-w-5xl space-y-16 px-5 pb-16 lg:px-8">
            <AuthorCard author={post.author} />

            {related.length > 0 && (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-neutral-200" />
                  <span className="text-xs font-black uppercase tracking-widest text-secondary-400">More articles</span>
                  <div className="h-px flex-1 bg-neutral-200" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {related.map((p) => <RelatedCard key={p.id} post={p} />)}
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-center text-white shadow-xl">
              <div className="mb-1 text-xs font-black uppercase tracking-widest text-primary-200">Ready to explore?</div>
              <h2 className="mb-2 text-2xl font-bold">Book your Nusa Penida tour</h2>
              <p className="mb-6 text-sm text-primary-100">
                Join thousands of happy guests who've experienced Nusa Penida with Bluuu.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a href="/shared-tour-to-nusa-penida"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-primary-700 transition hover:bg-primary-50">
                  Shared tours
                </a>
                <a href="/private-tour-to-nusa-penida"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                  Private charter
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
