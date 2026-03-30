import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import FilterPills from './FilterPills';

const AVAILABILITY_OPTIONS = [
  { value: 'jutro', label: 'Jutro (07–13h)' },
  { value: 'poslijepodne', label: 'Poslijepodne (13–19h)' },
  { value: 'vecer', label: 'Večer (19–23h)' },
  { value: 'vikend', label: 'Vikend' },
  { value: 'nocno', label: 'Noćno čuvanje' },
];

const AGE_OPTIONS = [
  { value: 'bebe', label: 'Bebe (0–1 god.)' },
  { value: 'mala_djeca', label: 'Mala djeca (1–3 god.)' },
  { value: 'predskolska', label: 'Predškolska (3–6 god.)' },
  { value: 'skolska', label: 'Školska (6+ god.)' },
];

const LANGUAGE_OPTIONS = [
  { value: 'hrvatski', label: 'Hrvatski' },
  { value: 'engleski', label: 'Engleski' },
  { value: 'njemacki', label: 'Njemački' },
  { value: 'talijanski', label: 'Talijanski' },
];

export { AVAILABILITY_OPTIONS, AGE_OPTIONS, LANGUAGE_OPTIONS };

function toggleInArray(arr, val) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

function FilterContent({ filters, setFilters, clearAll, activeCount }) {
  return (
    <div className="space-y-6">
      <FilterPills
        label="Dostupnost"
        options={AVAILABILITY_OPTIONS}
        selected={filters.availability}
        onToggle={v => setFilters(f => ({ ...f, availability: toggleInArray(f.availability, v) }))}
      />
      <FilterPills
        label="Dob djece"
        options={AGE_OPTIONS}
        selected={filters.childAge}
        onToggle={v => setFilters(f => ({ ...f, childAge: toggleInArray(f.childAge, v) }))}
      />
      <div>
        <Label className="text-xs font-semibold mb-3 block text-foreground">
          Cijena <span className="font-normal text-primary ml-1.5">€{filters.priceRange[0]} – €{filters.priceRange[1]} / sat</span>
        </Label>
        <Slider
          value={filters.priceRange}
          onValueChange={v => setFilters(f => ({ ...f, priceRange: v }))}
          min={5}
          max={100}
          step={1}
          minStepsBetweenThumbs={1}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
          <span>€5</span><span>€100</span>
        </div>
      </div>
      <FilterPills
        label="Jezik"
        options={LANGUAGE_OPTIONS}
        selected={filters.languages}
        onToggle={v => setFilters(f => ({ ...f, languages: toggleInArray(f.languages, v) }))}
      />
      {activeCount > 0 && (
        <button onClick={clearAll} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
          <X className="w-3 h-3" /> Poništi filtere
        </button>
      )}
    </div>
  );
}

export default function NannyFilters({ filters, setFilters, activeCount, clearAll, mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Desktop: inline filters */}
      <div className="hidden lg:block bg-card/70 border border-border/50 rounded-2xl p-5">
        <FilterContent filters={filters} setFilters={setFilters} clearAll={clearAll} activeCount={activeCount} />
      </div>

      {/* Mobile: sheet trigger + drawer */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className={`h-10 rounded-xl px-4 text-sm ${activeCount > 0 ? 'border-primary text-primary bg-primary/5' : 'border-border/60 bg-card'}`}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtri
              {activeCount > 0 && (
                <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 inline-flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
            <SheetHeader className="pb-4 border-b border-border/50">
              <SheetTitle className="font-display text-lg">Filtriraj dadilje</SheetTitle>
            </SheetHeader>
            <div className="py-5">
              <FilterContent filters={filters} setFilters={setFilters} clearAll={clearAll} activeCount={activeCount} />
            </div>
            <Button className="w-full rounded-xl" onClick={() => setMobileOpen(false)}>Primijeni</Button>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}