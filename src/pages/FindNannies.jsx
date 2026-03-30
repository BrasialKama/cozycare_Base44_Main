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
import NannyFilters, { AVAILABILITY_OPTIONS, AGE_OPTIONS, LANGUAGE_OPTIONS } from '@/components/search/NannyFilters';

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

// Map filter values to nanny specialties/keywords for matching
const AVAILABILITY_KEYWORDS = {
  jutro: ['jutro', 'morning'],
  poslijepodne: ['poslijepodne', 'afternoon'],
  vecer: ['vecer', 'evening', 'večer'],
  vikend: ['vikend', 'weekend'],
  nocno: ['nocno čuvanje', 'nocno cuvanje', 'noćno čuvanje', 'night'],
};

const AGE_KEYWORDS = {
  bebe: ['bebe', 'dojenčad', 'dojenčadi', 'novorođenčad', 'infant', 'njega dojenčadi', 'njega dojencadi'],
  mala_djeca: ['mala djeca', 'toddler', 'aktivnosti za malu djecu'],
  predskolska: ['predškolska', 'predskolska', 'montessori', 'preschool'],
  skolska: ['školska', 'skolska', 'school'],
};

const LANGUAGE_MAP = {
  hrvatski: 'hrvatski',
  engleski: 'engleski',
  njemacki: 'njemacki',
  talijanski: 'talijanski',
};

function matchesMultiFilter(nannyText, filterValues, keywordMap) {
  if (!filterValues.length) return true;
  const norm = normalize(nannyText);
  return filterValues.some(fv => {
    const keywords = keywordMap[fv] || [fv];
    return keywords.some(kw => norm.includes(normalize(kw)));
  });
}

function matchesLanguage(nannyLangs, filterLangs) {
  if (!filterLangs.length) return true;
  if (!nannyLangs || !nannyLangs.length) return false;
  const normLangs = nannyLangs.map(l => normalize(l));
  return filterLangs.some(fl => normLangs.some(nl => nl.includes(normalize(LANGUAGE_MAP[fl] || fl))));
}

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
    queryKey: ['approvedNannies'],
    queryFn: async () => {
      const approved = await base44.entities.NannyProfile.filter({ status: 'approved' }, '-avg_rating', 100);
      if (approved.length > 0) return approved;
      const all = await base44.entities.NannyProfile.list('-avg_rating', 100);
      return all.filter(n => n.status === 'approved');
    },
  });

  const filtered = useMemo(() => {
    let result = nannies.filter(n => {
      // Text search
      const q = normalize(search);
      const matchesSearch = !search ||
        normalize(n.display_name).includes(q) ||
        normalize(n.full_name).includes(q) ||
        normalize(n.bio).includes(q) ||
        normalize(n.service_area).includes(q) ||
        n.specialties?.some(s => normalize(s).includes(q));

      // Price
      const rate = n.hourly_rate || 0;
      const matchesPrice = rate >= filters.priceRange[0] && rate <= filters.priceRange[1];

      // Availability — match against bio + specialties text
      const nannyAvailText = [n.bio, ...(n.specialties || [])].join(' ');
      const matchesAvail = matchesMultiFilter(nannyAvailText, filters.availability, AVAILABILITY_KEYWORDS);

      // Child age — match against specialties + bio
      const matchesAge = matchesMultiFilter(nannyAvailText, filters.childAge, AGE_KEYWORDS);

      // Language
      const matchesLang = matchesLanguage(n.languages, filters.languages);

      return matchesSearch && matchesPrice && matchesAvail && matchesAge && matchesLang;
    });

    if (sortBy === 'rating') result.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
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