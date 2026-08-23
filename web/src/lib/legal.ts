import fs from "fs";
import path from "path";
import { marked } from "marked";

export interface LegalDoc {
  slug: string;
  title: string;
  sourcePath: string;
}

const DOCS_DIR = path.join(process.cwd(), "..", "docs");

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  "privacy-policy": {
    slug: "privacy-policy",
    title: "Privacy Policy",
    sourcePath: path.join(DOCS_DIR, "04-privacy", "privacy-policy.md"),
  },
  "terms-of-service": {
    slug: "terms-of-service",
    title: "Terms of Service",
    sourcePath: path.join(DOCS_DIR, "05-legal", "terms-of-service.md"),
  },
  "data-processing-agreement": {
    slug: "data-processing-agreement",
    title: "Data Processing Agreement",
    sourcePath: path.join(DOCS_DIR, "05-legal", "data-processing-agreement.md"),
  },
};

export function getLegalDocSlugs(): string[] {
  return Object.keys(LEGAL_DOCS);
}

export function renderLegalDoc(slug: string): { title: string; html: string } | null {
  const doc = LEGAL_DOCS[slug];
  if (!doc) return null;
  try {
    const raw = fs.readFileSync(doc.sourcePath, "utf8");
    return { title: doc.title, html: marked.parse(raw, { async: false }) };
  } catch {
    return null;
  }
}
