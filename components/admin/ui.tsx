"use client";

import Link from "next/link";
import { ReactNode } from "react";

/* Sayfa başlığı + sağda aksiyon */
export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-ink">{title}</h1>
      {action}
    </div>
  );
}

/* Birincil buton (link veya tıklama) */
export function Button({
  children, href, onClick, variant = "primary", type = "button",
}: {
  children: ReactNode; href?: string; onClick?: () => void;
  variant?: "primary" | "ghost" | "danger"; type?: "button" | "submit";
}) {
  const cls = {
    primary: "bg-eu text-white hover:bg-eu/90",
    ghost: "border border-line text-ink hover:bg-line/40",
    danger: "text-tr hover:bg-tr/10",
  }[variant];
  const base = `inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition ${cls}`;
  if (href) return <Link href={href} className={base}>{children}</Link>;
  return <button type={type} onClick={onClick} className={base}>{children}</button>;
}

/* Kart kabı */
export function Card({ children }: { children: ReactNode }) {
  return <div className="bg-white border border-line rounded-xl p-5">{children}</div>;
}

/* Tablo */
export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="bg-white border border-line rounded-xl overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-[#f4f6fa] text-left">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold text-slate text-xs uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

/* Form alanları */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-eu/30 focus:border-eu";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={inputCls + " min-h-[90px]"} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={inputCls} />;
}

/* Boş durum */
export function EmptyState({ text }: { text: string }) {
  return <p className="text-slate text-sm py-8 text-center">{text}</p>;
}
