const STEPS = [
  { title: "Bring your records", detail: "Upload purchase orders, receipts, and invoices." },
  { title: "Review the differences", detail: "See each mismatch alongside its source documents." },
  { title: "Resolve before payment", detail: "Investigate findings and share the evidence with your team." },
];

export function EnterpriseArchitectureSection() {
  return (
    <section id="architecture" className="py-16 border-b border-border/50 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-8">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, index) => (
            <div key={step.title} className="space-y-2">
              <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
              <h3 className="font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
