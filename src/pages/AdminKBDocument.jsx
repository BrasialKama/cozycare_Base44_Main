import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import DraftBanner from '@/components/admin/kb/DraftBanner';
import KBSidebar from '@/components/admin/kb/KBSidebar';
import ScenarioHeader from '@/components/admin/kb/ScenarioHeader';
import PolicyMarkdownRenderer from '@/components/admin/kb/PolicyMarkdownRenderer';

export default function AdminKBDocument() {
  const { slug } = useParams();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['policyDocuments'],
    queryFn: () => base44.entities.PolicyDocument.list('display_order', 200),
  });

  const sorted = useMemo(
    () => [...docs].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
    [docs]
  );
  const idx = sorted.findIndex(d => d.slug === slug);
  const doc = idx >= 0 ? sorted[idx] : null;
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;

  const relatedDocs = useMemo(() => {
    if (!doc?.related_slugs?.length) return [];
    return sorted.filter(d => doc.related_slugs.includes(d.slug));
  }, [doc, sorted]);

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-7 lg:-my-12">
      <DraftBanner />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex gap-10">
          <KBSidebar docs={sorted} currentSlug={slug} />

          <main className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5 flex-wrap">
              <Link to="/AdminKB" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Baza znanja
              </Link>
              <span className="text-muted-foreground/60">›</span>
              <span className="text-foreground truncate">{doc?.title || '...'}</span>
            </nav>

            {isLoading ? (
              <div className="space-y-4">
                <div className="h-10 w-3/4 bg-muted/40 rounded animate-pulse" />
                <div className="h-32 bg-muted/40 rounded-2xl animate-pulse" />
                <div className="h-64 bg-muted/40 rounded animate-pulse" />
              </div>
            ) : !doc ? (
              <NotFound />
            ) : (
              <article>
                <h1 className="font-display text-3xl lg:text-4xl font-bold text-primary leading-tight">
                  {doc.title}
                </h1>
                {doc.subtitle && (
                  <p className="text-base text-muted-foreground mt-3 leading-relaxed">{doc.subtitle}</p>
                )}

                {doc.doc_type === 'scenario' && (
                  <ScenarioHeader
                    severity={doc.severity}
                    owner={doc.owner_role}
                    responseTime={doc.response_time_summary}
                    legalSignoff={doc.legal_signoff_status}
                    relatedSlugs={doc.related_slugs || []}
                    relatedDocs={relatedDocs}
                  />
                )}

                <div className="mt-2">
                  <PolicyMarkdownRenderer markdown={doc.body_markdown} />
                </div>

                {/* Related */}
                {relatedDocs.length > 0 && (
                  <section className="mt-12">
                    <h2 className="font-display text-xl font-semibold text-primary mb-4">
                      Povezani dokumenti
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {relatedDocs.map(rd => (
                        <Link
                          key={rd.slug}
                          to={`/AdminKB/${rd.slug}`}
                          className="block bg-card border border-border/60 rounded-2xl p-4 hover:shadow-sm hover:border-primary/20 transition-all"
                        >
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            {rd.doc_type === 'scenario' && rd.display_number != null
                              ? `Scenarij ${String(rd.display_number).padStart(2, '0')}`
                              : 'Dokument'}
                          </p>
                          <p className="font-semibold text-foreground leading-snug">{rd.title}</p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Prev / next */}
                <nav className="mt-12 pt-6 border-t border-border/60 grid grid-cols-2 gap-4">
                  {prev ? (
                    <Link
                      to={`/AdminKB/${prev.slug}`}
                      className="group block bg-card border border-border/60 rounded-2xl p-4 hover:shadow-sm hover:border-primary/20 transition-all"
                    >
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Prethodni
                      </p>
                      <p className="font-semibold text-foreground leading-snug line-clamp-2">{prev.title}</p>
                    </Link>
                  ) : <div />}
                  {next ? (
                    <Link
                      to={`/AdminKB/${next.slug}`}
                      className="group block bg-card border border-border/60 rounded-2xl p-4 hover:shadow-sm hover:border-primary/20 transition-all text-right"
                    >
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-end gap-1">
                        Sljedeći
                        <ChevronRight className="w-3.5 h-3.5" />
                      </p>
                      <p className="font-semibold text-foreground leading-snug line-clamp-2">{next.title}</p>
                    </Link>
                  ) : <div />}
                </nav>
              </article>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="bg-card border border-dashed border-border/60 rounded-2xl p-10 text-center">
      <p className="font-display text-xl font-semibold text-foreground mb-2">Dokument nije pronađen</p>
      <p className="text-sm text-muted-foreground mb-6">
        Tražena stranica ne postoji ili je premještena.
      </p>
      <Link to="/AdminKB" className="inline-block text-primary font-semibold hover:underline">
        ← Natrag na bazu znanja
      </Link>
    </div>
  );
}