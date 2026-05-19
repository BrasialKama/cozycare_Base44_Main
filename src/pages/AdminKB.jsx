import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { BookOpen, AlertTriangle, Layers, Compass, ArrowRight } from 'lucide-react';
import DraftBanner from '@/components/admin/kb/DraftBanner';
import KBSearch, { filterDocs } from '@/components/admin/kb/KBSearch';
import ScenarioCard from '@/components/admin/kb/ScenarioCard';
import PrincipleCard from '@/components/admin/kb/PrincipleCard';

export default function AdminKB() {
  const [query, setQuery] = useState('');

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['policyDocuments'],
    queryFn: () => base44.entities.PolicyDocument.list('display_order', 200),
  });

  const filtered = useMemo(() => filterDocs(docs, query), [docs, query]);

  const principlesDocs = useMemo(
    () => filtered.filter(d => d.doc_type === 'principles' || d.doc_type === 'glossary'),
    [filtered]
  );
  const scenarioDocs = useMemo(
    () =>
      filtered
        .filter(d => d.doc_type === 'scenario')
        .sort((a, b) => (a.display_number || 0) - (b.display_number || 0)),
    [filtered]
  );
  const decisionIndexDoc = useMemo(
    () => filtered.find(d => d.doc_type === 'decision_index'),
    [filtered]
  );

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-7 lg:-my-12">
      <DraftBanner />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-primary">Baza znanja</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Operativni priručnik za sigurnost i postupanje
              </p>
            </div>
          </div>
        </header>

        <div className="mb-10">
          <KBSearch value={query} onChange={setQuery} />
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Brzi pristup */}
            <section>
              <div className="flex items-center gap-2.5 mb-5">
                <Compass className="w-5 h-5 text-primary" />
                <h2 className="font-display text-2xl font-semibold text-primary">Brzi pristup</h2>
              </div>
              {decisionIndexDoc ? (
                <Link
                  to={`/AdminKB/${decisionIndexDoc.slug}`}
                  className="group block bg-gradient-to-br from-primary/10 via-primary/5 to-card border-t-4 border-primary rounded-2xl p-7 lg:p-8 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold tracking-[0.14em] text-primary mb-2">
                        BRZI PRISTUP
                      </p>
                      <h3 className="font-display text-xl lg:text-2xl font-semibold text-foreground leading-tight mb-2">
                        {decisionIndexDoc.title}
                      </h3>
                      {decisionIndexDoc.subtitle && (
                        <p className="text-sm text-muted-foreground max-w-2xl">
                          {decisionIndexDoc.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-primary whitespace-nowrap pt-1 group-hover:translate-x-0.5 transition-transform">
                      Otvori
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ) : (
                <EmptySection text="Nema podudaranja." />
              )}
            </section>

            {/* Principi i pojmovi */}
            <section>
              <div className="flex items-center gap-2.5 mb-5">
                <Layers className="w-5 h-5 text-primary" />
                <h2 className="font-display text-2xl font-semibold text-primary">Principi i pojmovi</h2>
              </div>
              {principlesDocs.length === 0 ? (
                <EmptySection text="Nema podudaranja." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {principlesDocs.map(d => (
                    <PrincipleCard key={d.id} doc={d} />
                  ))}
                </div>
              )}
            </section>

            {/* Scenariji */}
            <section>
              <div className="flex items-center gap-2.5 mb-5">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <h2 className="font-display text-2xl font-semibold text-primary">Scenariji</h2>
              </div>
              {scenarioDocs.length === 0 ? (
                <EmptySection text="Nema podudaranja." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scenarioDocs.map(d => (
                    <ScenarioCard key={d.id} doc={d} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptySection({ text }) {
  return (
    <div className="bg-card border border-dashed border-border/60 rounded-2xl p-6 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}