import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLegalDocSlugs, renderLegalDoc } from "@/lib/legal";
import { ArrowLeft } from "lucide-react";

export function generateStaticParams() {
  return getLegalDocSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export default async function LegalDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = renderLegalDoc(slug);
  if (!doc) notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-foreground text-background flex items-center justify-center font-serif font-bold text-xs">
              M
            </div>
            <span className="font-bold tracking-tight text-sm font-serif">Mistake</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to site
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 legal-doc">
        <h1 className="text-3xl font-bold font-serif tracking-tight mb-8">{doc.title}</h1>
        <div
          className={[
            "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3",
            "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2",
            "[&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:my-3",
            "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3",
            "[&_li]:text-sm [&_li]:text-muted-foreground [&_li]:leading-relaxed [&_li]:my-1",
            "[&_strong]:text-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2",
            "[&_hr]:my-6 [&_hr]:border-border",
            "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic",
            "[&_table]:w-full [&_table]:text-xs [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1",
            "[&_code]:bg-secondary [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs",
          ].join(" ")}
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />
      </main>

      <footer className="border-t border-border/40 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span>© 2026 Mistake Platform</span>
          <span>Questions? hello@sheershjaiswal.in</span>
        </div>
      </footer>
    </div>
  );
}
