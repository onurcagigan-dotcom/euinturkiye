"use client";
import { useState, useEffect } from "react";
import { DEMO_ROLES, getDemoRole, setDemoRole, DemoRoleId } from "@/lib/demo-role";

export function DemoRoleModal() {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState("tr");

  useEffect(() => {
    // İlk yüklemede rol seçilmemişse modalı aç
    const saved = getDemoRole();
    if (!saved) {
      setTimeout(() => setOpen(true), 400);
    }
    // locale tespiti
    try {
      const lc = window.localStorage.getItem("eu_locale") || "tr";
      setLocale(lc);
    } catch {}
  }, []);

  const choose = (id: DemoRoleId) => {
    setDemoRole(id);
    setOpen(false);
    // Panel gerektiren roller için sayfa yenile (subscriber context'i yüklemek için)
    const role = DEMO_ROLES.find((r) => r.id === id);
    if (role?.subscriberId) {
      window.location.reload();
    }
  };

  if (!open) return null;

  const isEn = locale === "en";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-eu to-blue-700 px-8 py-7 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🇪🇺</span>
            <span className="text-sm font-semibold text-blue-200 uppercase tracking-widest">Demo Ortamı</span>
          </div>
          <h2 className="text-2xl font-extrabold leading-tight mb-1">
            {isEn ? "Who are you exploring as?" : "Hangi perspektiften keşfediyorsunuz?"}
          </h2>
          <p className="text-blue-100 text-sm">
            {isEn
              ? "Select a role to experience the platform from that perspective. You can change this at any time."
              : "Bir rol seçin ve platformu o perspektiften deneyimleyin. İstediğiniz zaman değiştirebilirsiniz."}
          </p>
        </div>

        {/* Rol listesi */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
          {DEMO_ROLES.filter(r => r.id !== "guest").map((role, idx) => (
            <button
              key={role.id}
              onClick={() => choose(role.id)}
              className={`text-left border-2 rounded-2xl p-4 transition-all group flex gap-3 items-start relative ${
                idx === 0
                  ? "border-eu bg-eu-pale/40 hover:bg-eu-pale/70"
                  : "border-line hover:border-eu hover:bg-eu-pale/30"
              }`}
            >
              {idx === 0 && (
                <span className="absolute -top-2.5 left-4 bg-eu text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {isEn ? "Recommended" : "Önerilen"}
                </span>
              )}
              <span className="text-2xl flex-shrink-0 mt-0.5">{role.icon}</span>
              <div>
                <div className="font-semibold text-sm text-ink group-hover:text-eu transition-colors">
                  {isEn ? role.labelEn : role.label}
                </div>
                <div className="text-xs text-slate mt-0.5 leading-relaxed">
                  {isEn ? role.descEn : role.desc}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Guest — ayrı, alt satır */}
        <div className="px-6 pb-3">
          {DEMO_ROLES.filter(r => r.id === "guest").map((role) => (
            <button
              key={role.id}
              onClick={() => choose(role.id)}
              className="w-full text-left border border-dashed border-line rounded-xl px-4 py-3 hover:border-eu transition-all group flex gap-3 items-center"
            >
              <span className="text-xl flex-shrink-0">{role.icon}</span>
              <div>
                <span className="font-semibold text-sm text-slate group-hover:text-eu transition-colors">
                  {isEn ? role.labelEn : role.label}
                </span>
                <span className="text-xs text-mist ml-2">
                  — {isEn ? role.descEn : role.desc}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 text-center">
          <p className="text-xs text-mist">
            {isEn
              ? "This is a demo environment. No real data is stored."
              : "Bu bir demo ortamıdır. Gerçek veri saklanmaz."}
          </p>
        </div>
      </div>
    </div>
  );
}
