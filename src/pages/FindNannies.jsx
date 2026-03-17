import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/shared/PageHeader';
import NannyCard from '@/components/shared/NannyCard';
import EmptyState from '@/components/shared/EmptyState';

export default function FindNannies() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [maxRate, setMaxRate] = useState([80]);
  const [minExperience, setMinExperience] = useState([0]);
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: nannies = [], isLoading } = useQuery({
    queryKey: ['approvedNannies'],
    queryFn: () => base44.entities.NannyProfile.filter({ status: 'approved' }),
  });

  const filtered = useMemo(() => {
    let result = nannies.filter(n => {
      const matchesSearch = !search || 
        n.display_name?.toLowerCase().includes(search.toLowerCase()) ||
        n.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        n.bio?.toLowerCase().includes(search.toLowerCase()) ||
        n.service_area?.toLowerCase().includes(search.toLowerCase()) ||
        n.specialties?.some(s => s.toLowerCase().includes(search.toLowerCase()));
      const matchesRate = n.hourly_rate <= maxRate[0];
      const matchesExp = (n.years_experience || 0) >= minExperience[0];
      return matchesSearch && matchesRate && matchesExp;
    });

    if (sortBy === 'rating') result.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
    else if (sortBy === 'rate_low') result.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
    else if (sortBy === 'rate_high') result.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0));
    else if (sortBy === 'experience') result.sort((a, b) => (b.years_experience || 0) - (a.years_experience || 0));

    return result;
  }, [nannies, search, sortBy, maxRate, minExperience]);

  return (
    <div>
      <PageHeader
        icon={Search}
        title="Find Your Perfect Nanny"
        subtitle="Browse our trusted, verified caregivers"
      />

      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, area, or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-card"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40 h-11 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="rate_low">Price: Low</SelectItem>
            <SelectItem value="rate_high">Price: High</SelectItem>
            <SelectItem value="experience">Most Experienced</SelectItem>
          </SelectContent>
        </Select>
        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-11">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="font-display">Filter Nannies</SheetTitle>
            </SheetHeader>
            <div className="space-y-8 mt-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Max Hourly Rate: ${maxRate[0]}/hr</Label>
                <Slider value={maxRate} onValueChange={setMaxRate} min={10} max={100} step={5} />
              </div>
              <div>
                <Label className="text-sm font-medium mb-3 block">Min Experience: {minExperience[0]} years</Label>
                <Slider value={minExperience} onValueChange={setMinExperience} min={0} max={20} step={1} />
              </div>
              <Button onClick={() => setFilterOpen(false)} className="w-full">
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No nannies found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">{filtered.length} nannies found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(nanny => (
              <NannyCard key={nanny.id} nanny={nanny} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}