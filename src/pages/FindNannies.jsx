import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, X, Sparkles } from 'lucide-react';
import { normalize } from '@/lib/normalize';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import NannyCard from '@/components/shared/NannyCard';
import VideoPreviewModal from '@/components/shared/VideoPreviewModal';
import EmptyState from '@/components/shared/EmptyState';
import NannyFilters from '@/components/search/NannyFilters';

const DEFAULT_FILTERS = {
  availability: [],
  childAge: [],
  priceRange: [5, 100],
  languages: [],
};

function countActive(filters) {
  let c = 0;
  if (filters.availability.length) c++;
  if (filters.childAge.length) c++;
  if (filters.priceRange[0] > 5 || filters.priceRange[1] < 100) c++;
  if (filters.languages.length) c++;
  return c;
}

// Map filter values to entity field values
const AVAILABILITY_MAP = {
  jutro: 'Jutro',
  poslijepodne: 'Poslijepodne',
  vecer: 'Večer',
  vikend: 'Vikend',
  nocno: 'Noćno čuvanje',
};

const AGE_MAP = {
  bebe: 'Bebe',
  mala_djeca: 'Mala djeca',
  predskolska: 'Predškolska',
  skolska: 'Školska',
};

const LANGUAGE_MAP = {
  hrvatski: 'Hrvatski',
  engleski: 'Engleski',
  njemacki: 'Njemački',
  talijanski: 'Talijanski',
};

export default function FindNannies() {
  const urlParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(urlParams.get('q') || '');
  const [sortBy, setSortBy] = useState('rating');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [videoNanny, setVideoNanny] = useState(null);

  const activeCount = countActive(filters);
  const clearAll = () => setFilters({ ...DEFAULT_FILTERS });

  const { data: nannies = [], isLoading } = useQuery({
    queryKey: ['activeNannies'],
    queryFn: () => base44.entities.NannyProfile.filter({ is_active: true }, '-rating', 100),
  });

  const filtered = useMemo(() => {
    let result = nannies.filter(n => {
      const fullName = `${n.first_name} ${n.last_name}`;

      // Text search
      const q = normalize(search);
      const matchesSearch = !search ||
        normalize(fullName).includes(q) ||
        normalize(n.bio).includes(q) ||
        normalize(n.location).includes(q) ||
        n.specialties?.some(s => normalize(s).includes(q));

      // Price
      const rate = n.hourly_rate || 0;
      const matchesPrice = rate >= filters.priceRange[0] && rate <= filters.priceRange[1];

      // Availability — match against the availability array field
      const matchesAvail = filters.availability.length === 0 ||
        filters.availability.some(fv => {
          const label = AVAILABILITY_MAP[fv];
          return (n.availability || []).some(a => normalize(a) === normalize(label));
        });

      // Child age — match against the age_groups array field
      const matchesAge = filters.childAge.length === 0 ||
        filters.childAge.some(fv => {
          const label = AGE_MAP[fv];
          return (n.age_groups || []).some(a => normalize(a) === normalize(label));
        });

      // Language — match against the languages array field
      const matchesLang = filters.languages.length === 0 ||
        filters.languages.some(fv => {
          const label = LANGUAGE_MAP[fv];
          return (n.languages || []).some(l => normalize(l) === normalize(label));
        });

      return matchesSearch && matchesPrice && matchesAvail && matchesAge && matchesLang;
    });

    if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'rate_low') result.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
    else if (sortBy === 'rate_high') result.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0));
    else if (sortBy === 'experience') result.sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0));
    return result;
  }, [nannies, search, sortBy, filters]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="pt-2">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-primary/60 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Provjerene dadilje
        </p>
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground leading-tight">
          Pronađite savršenu dadilju
        </h1>
        <p className="mt-1.5 text-muted-foreground text-sm max-w-lg">
          Svaka dadilja na CozyCare platformi je provjerena, s potvrđenim referencama i recenzijama stvarnih obitelji.
        </p>
      </div>

      {/* Search + sort row */}
      <div className="flex gap-2.5">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži po imenu, kvartu ili specijalnosti…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 rounded-xl bg-card border-border/60 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44 h-12 rounded-xl bg-card border-border/60 hidden sm:flex">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Najbolje ocijenjene</SelectItem>
            <SelectItem value="rate_low">Cijena: niska–visoka</SelectItem>
            <SelectItem value="rate_high">Cijena: visoka–niska</SelectItem>
            <SelectItem value="experience">Najiskusnije</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filters */}
      <NannyFilters
        filters={filters}
        setFilters={setFilters}
        activeCount={activeCount}
        clearAll={clearAll}
        mobileOpen={mobileFilterOpen}
        setMobileOpen={setMobileFilterOpen}
      />

      {/* Active filter summary (mobile inline) */}
      {activeCount > 0 && (
        <div className="flex items-center gap-2 lg:hidden -mt-2">
          <span className="text-xs text-muted-foreground">{activeCount} {activeCount === 1 ? 'filter aktivan' : 'filtera aktivno'}</span>
          <button onClick={clearAll} className="text-xs text-primary font-medium hover:underline">Poništi</button>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-52 bg-muted/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nismo pronašli dadilje s ovim filterima"
          description="Pokušajte s drugačijim pretragom."
          action={
            (activeCount > 0 || search) && (
              <Button variant="outline" className="rounded-full" onClick={() => { clearAll(); setSearch(''); }}>
                Poništi filtere
              </Button>
            )
          }
        />
      ) : (
        <>
          <p className="text-xs text-muted-foreground font-medium">
            {filtered.length} {filtered.length === 1 ? 'dadilja dostupna' : 'dadilja dostupno'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(nanny => (
              <NannyCard key={nanny.id} nanny={nanny} onWatchVideo={setVideoNanny} />
            ))}
          </div>
        </>
      )}

      {videoNanny && (
        <VideoPreviewModal nanny={videoNanny} onClose={() => setVideoNanny(null)} />
      )}
    </div>
  );
}