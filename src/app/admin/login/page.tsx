"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const next = new URLSearchParams(window.location.search).get("next");
    const callback = new URL("/admin/callback", window.location.origin);
    if (next?.startsWith("/") && !next.startsWith("//")) {
      callback.searchParams.set("next", next);
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callback.toString(),
        shouldCreateUser: false,
      },
    });

    if (error) {
      setMessage("Connexion impossible. Vérifie l'adresse saisie.");
      setStatus("error");
      return;
    }

    setMessage("Lien de connexion envoyé — regarde ta boîte mail.");
    setStatus("sent");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl">Administration</h1>
        <p className="mt-2 text-sm text-muted">
          Un lien de connexion à usage unique sera envoyé par e-mail.
        </p>

        <form onSubmit={onSubmit} className="mt-10">
          <label className="sr-only" htmlFor="email">
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="adresse@exemple.fr"
            className="w-full border-b border-line bg-transparent py-2.5 text-sm text-paper outline-none transition-colors placeholder:text-faint focus:border-accent"
          />

          <button
            type="submit"
            disabled={status === "sending" || status === "sent"}
            className="mt-6 flex w-full items-center justify-center gap-2 border border-line py-3 text-xs tracking-editorial text-paper transition-colors hover:border-accent/60 disabled:opacity-50"
          >
            <Mail size={14} />
            {status === "sending" ? "Envoi…" : "Recevoir le lien"}
          </button>
        </form>

        {message && (
          <p
            role="status"
            className={`mt-5 text-xs ${
              status === "error" ? "text-red-400" : "text-accent"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
