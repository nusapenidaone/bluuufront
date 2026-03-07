import { apiUrl } from "./base";

export async function fetchBlogPosts() {
  const res = await fetch(apiUrl("blog"));
  if (!res.ok) throw new Error("Failed to fetch blog posts");
  return res.json();
}

export async function fetchBlogPost(slug) {
  const res = await fetch(apiUrl(`blog/${slug}`));
  if (!res.ok) throw new Error("Failed to fetch blog post");
  return res.json();
}
