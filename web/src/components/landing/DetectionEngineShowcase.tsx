const CHECKS = [
  { title: "Wrong price", detail: "Invoice rates above the agreed purchase order." },
  { title: "Missing goods", detail: "Invoices for more than the quantity received." },
  { title: "Missed penalties", detail: "Late deliveries without the agreed deduction." },
  { title: "Unsupported invoices", detail: "Charges without a matching order or receipt." },
];

export function DetectionEngineShowcase() {
  return (
    <section id="features" className="py-16 border-b border-border/50 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-8">What Mistake catches</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CHECKS.map((check) => (
            <div key={check.title} className="rounded-xl border border-border bg-card p-5 space-y-2">
              <h3 className="font-semibold text-foreground">{check.title}</h3>
              <p className="text-sm text-muted-foreground">{check.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
