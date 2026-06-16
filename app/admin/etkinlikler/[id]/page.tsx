"use client";
import { use } from "react";
import { useAdmin } from "@/lib/admin/store";
import { EventForm } from "@/components/admin/EventForm";
export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { events } = useAdmin();
  const item = events.find((e) => e.id === id);
  if (!item) return <p className="text-slate">Etkinlik bulunamadı.</p>;
  return <EventForm existing={item} />;
}
