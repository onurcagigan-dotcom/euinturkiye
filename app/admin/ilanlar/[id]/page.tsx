"use client";
import { use } from "react";
import { useAdmin } from "@/lib/admin/store";
import { ListingForm } from "@/components/admin/ListingForm";
export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { listings } = useAdmin();
  const item = listings.find((l) => l.id === id);
  if (!item) return <p className="text-slate">İlan bulunamadı.</p>;
  return <ListingForm existing={item} />;
}
