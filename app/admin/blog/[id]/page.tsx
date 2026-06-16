"use client";
import { use } from "react";
import { useAdmin } from "@/lib/admin/store";
import { BlogForm } from "@/components/admin/BlogForm";
export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { blogPosts } = useAdmin();
  const item = blogPosts.find((b) => b.id === id);
  if (!item) return <p className="text-slate">Yazı bulunamadı.</p>;
  return <BlogForm existing={item} />;
}
