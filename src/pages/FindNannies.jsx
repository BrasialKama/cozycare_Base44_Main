import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { normalize } from '@/lib/normalize';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import NannyCard from '@/components/shared/NannyCard';
import VideoPreviewModal from '@/components/shared/VideoPreviewModal';
import EmptyState from '@/components/shared/EmptyState';

const SPECIALTIES = ['Njega dojenčadi', 'Aktivnosti za malu djecu', 'Posebne potrebe', 'Montessori', 'Dvojezična', 'Noćno čuvanje'];

export default function FindNannies() {
  const urlParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(urlParams.get('q') || '');
  const [sortBy, setSortBy] = useState('rating');
  const [maxRate, setMaxRate] = useState([80]);
  const [minExperience, setMinExperience] = useState([0]);
  const [activeSpecialty, setActiveSpecialty] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [videoNanny, setVideoNanny] = useState(null);

  const { data: nannies = [], isLoading } = useQuery({
    queryKey: ['approvedNannies'],
    queryFn: async () => {
      const approved = await base44.entities.NannyProfile.filter({ status: 'approved' }, '-avg_rating', 100);
      if (approved.length > 0) return approved;
      // Fallback: if no approved nannies found, fetch all to check data availability
      const all = await base44.entities.NannyProfile.list('-avg_rating', 100);
      return all.filter(n => n.status === 'approved');
    },
  });

  const filtered = useMemo(() => {
    let result = nannies.filter(n => {
      const q = normalize(search);
      const matchesSearch = !search ||
        normalize(n.display_name).includes(q) ||
        normalize(n.full_name).includes(q) ||
        normalize(n.bio).includes(q) ||
        normalize(n.service_area).includes(q) ||
        n.specialties?.some(s => normalize(s).includes(q));
      const matchesRate = (n.hourly_rate || 0) <= maxRate[0];
      const matchesExp = (n.years_experience || 0) >= minExperience[0];
      const matchesSpecialty = !activeSpecialty ||
        n.specialties?.some(s => s.toLowerCase().includes(activeSpecialty.toLowerCase()));
      return matchesSearch && matchesRate && matchesExp && matchesSpecialty;
    });

    if (sortBy === 'rating') result.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
    else if (sortBy === 'rate_low') result.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
    else if (sortBy === 'rate_high') result.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0));
    else if (sortBy === 'experience') result.sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0));
    return result;
  }, [nannies, search, sortBy, maxRate, minExperience, activeSpecialty]);

  const hasActiveFilters = maxRate[0] < 80 || minExperience[0] > 0 || !!activeSpecialty;

  return (
    <div className="space-y-8 pb-8">
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
          <SelectTrigger className="w-44 h-12 rounded-xl bg-card border-border/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Najbolje ocijenjene</SelectItem>
            <SelectItem value="rate_low">Cijena: niska–visoka</SelectItem>
            <SelectItem value="rate_high">Cijena: visoka–niska</SelectItem>
            <SelectItem value="experience">Najiskusnije</SelectItem>
          </SelectContent>
        </Select>
        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className={`h-12 rounded-xl px-4 ${hasActiveFilters ? 'border-primary text-primary bg-primary/5' : 'border-border/60 bg-card'}`}>
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtri
              {hasActiveFilters && <span className="ml-1.5 w-2 h-2 rounded-full bg-primary inline-block" />}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[320px]">
            <SheetHeader className="pb-6 border-b border-border/50">
              <SheetTitle className="font-display text-xl">Poboljšajte pretragu</SheetTitle>
            </SheetHeader>
            <div className="space-y-8 mt-6 px-1">
              <div>
                <Label className="text-sm font-semibold mb-4 block text-foreground">
                  Maks. satnica <span className="font-normal text-primary ml-2">€{maxRate[0]}/h</span>
                </Label>
                <Slider value={maxRate} onValueChange={setMaxRate} min={10} max={100} step={5} />
                <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>€10</span><span>€100</span></div>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-4 block text-foreground">
                  Min. iskustvo <span className="font-normal text-primary ml-2">{minExperience[0]} god.</span>
                </Label>
                <Slider value={minExperience} onValueChange={setMinExperience} min={0} max={20} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>0 god.</span><span>20 god.</span></div>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-3 block text-foreground">Specijalnost</Label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(s => (
                    <button
                      key={s}
                      onClick={() => setActiveSpecialty(activeSpecialty === s ? '' : s)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                        activeSpecialty === s
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setMaxRate([80]); setMinExperience([0]); setActiveSpecialty(''); }}>
                  Poništi
                </Button>
                <Button className="flex-1" onClick={() => setFilterOpen(false)}>Primijeni</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-2 flex-wrap -mt-4">
        {['Sve', ...SPECIALTIES.slice(0, 5)].map(s => {
          const val = s === 'Sve' ? '' : s;
          return (
            <button
              key={s}
              onClick={() => setActiveSpecialty(val)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium border transition-all ${
                activeSpecialty === val
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border/60 hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-52 bg-muted/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Nema pronađenih dadilja" description="Pokušajte prilagoditi pretragu ili filtre" />
      ) : (
        <>
          <p className="text-xs text-muted-foreground font-medium -mt-4">
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