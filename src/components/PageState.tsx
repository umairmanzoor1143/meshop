"use client";

export function PageLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div
        className="w-8 h-8 rounded-full border-2 border-brand-ink/15 border-t-brand-ink animate-spin"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

export function PageError({ message }: { message?: string }) {
  return (
    <section className="max-w-2xl mx-auto px-6 py-32 text-center">
      <h1 className="font-serif text-3xl text-brand-ink mb-3">
        {message ?? "Shop momentan nicht verfügbar"}
      </h1>
      <p className="text-sm text-brand-gray">Bitte versuchen Sie es in Kürze erneut.</p>
    </section>
  );
}
