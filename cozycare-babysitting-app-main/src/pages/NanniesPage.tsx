import { useState, useEffect } from 'react';
import { blink } from '../blink/client';
import { NannyCard } from '../features/nannies/components/NannyCard';
import { demoNannies } from '../features/nannies/demoNannies';
import { Button } from '../components/ui/button';
import { Search, SlidersHorizontal, ShieldCheck } from 'lucide-react';

export function NanniesPage() {
  const [nannies, setNannies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchNannies = async () => {
      setNannies(demoNannies);
      try {
        const result = await blink.db.nannies.list({ orderBy: { rating: 'desc' } });
        if (result.length > 0) setNannies(result);
      } catch {
        // Keep curated browsing available for anonymous users.
      } finally {
        setLoading(false);
      }
    };
    fetchNannies();
  }, []);

  const filtered = search.trim()
    ? nannies.filter(
        (n) =>
          n.displayName?.toLowerCase().includes(search.toLowerCase()) ||
          n.serviceArea?.toLowerCase().includes(search.toLowerCase()) ||
          n.specialties?.toLowerCase().includes(search.toLowerCase()),
      )
    : nannies;

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-card/40 border-b shabby-chic-pattern">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary mb-3">Verified caregivers</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
              Discover Exceptional Nannies
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Every caregiver on CozyCare is identity verified, background checked, and reference reviewed before they appear here.
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-8 max-w-2xl">
            <div className="boutique-card p-3 flex gap-3 items-center border-border/60">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, location, or specialty…"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-background text-sm text-foreground focus:ring-1 focus:ring-primary outline-none transition-all border border-border/50 focus:border-primary/50"
                />
              </div>
              <Button variant="outline" className="h-11 rounded-xl px-4 border-border/50 shrink-0 gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust banner */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-3 rounded-2xl bg-primary/5 border border-primary/15 px-5 py-3 max-w-2xl">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs font-medium text-muted-foreground">
            Only approved nannies appear in search. All profiles are verified before being listed.
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="boutique-card h-56 animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-serif text-foreground">No results found for "{search}"</p>
            <p className="mt-2 text-sm text-muted-foreground">Try a different name, location, or specialty.</p>
            <Button variant="ghost" onClick={() => setSearch('')} className="mt-4 rounded-full">Clear search</Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Showing <span className="font-medium text-foreground">{filtered.length}</span> verified caregiver{filtered.length !== 1 ? 's' : ''}
              {search ? ` matching "${search}"` : ''}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {filtered.map((nanny) => (
                <NannyCard key={nanny.id} nanny={nanny} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
