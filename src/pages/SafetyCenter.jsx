import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Shield, ShieldCheck, FileCheck, Camera, UserCheck, Award, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/shared/PageHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const trustExplainers = [
  {
    icon: ShieldCheck,
    title: 'Potvrđen identitet',
    description: 'Svaka dadilja pruža službeni dokument koji naš tim verificira. To osigurava da je osoba koju zapošljavate upravo ona za koju se predstavlja.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: FileCheck,
    title: 'Provjera pozadine',
    description: 'Kompletna provjera pozadine uključujući kaznenu evidenciju i relevantne sudske zapise. Ažurira se godišnje.',
    color: 'bg-secondary/60 text-secondary-foreground',
  },
  {
    icon: UserCheck,
    title: 'Provjerene reference',
    description: 'Osobno kontaktiramo i provjeravamo profesionalne reference svake dadilje. Potrebne su najmanje dvije reference od prethodnih obitelji ili poslodavaca.',
    color: 'bg-accent text-accent-foreground',
  },
  {
    icon: Camera,
    title: 'Video verifikacija',
    description: 'Svaka dadilja završava video intervju s našim timom, potvrđujući identitet i procjenjujući komunikaciju i ponašanje.',
    color: 'bg-peach text-peach-dark',
  },
  {
    icon: Award,
    title: 'Provjereni certifikati',
    description: 'Profesionalni certifikati poput Prve pomoći, CPR-a, ranog odgoja i specijaliziranih obuka provjeravaju se kod izdavatelja.',
    color: 'bg-sage/40 text-sage-foreground',
  },
];

export default function SafetyCenter() {
  const { user } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const reportMutation = useMutation({
    mutationFn: async () => {
      const resp = await base44.functions.invoke('createSafetyReport', {
        category,
        description,
      });
      const data = resp?.data || resp;
      if (!data?.success) throw new Error(data?.error || 'Prijava nije poslana.');
      return data;
    },
    onSuccess: () => {
      toast.success('Prijava poslana. Naš tim će je pregledati unutar 24 sata.');
      setReportOpen(false);
      setCategory('');
      setDescription('');
    },
    onError: (err) => {
      toast.error(err?.message || 'Prijava nije poslana.');
    },
  });

  return (
    <div>
      <PageHeader
        icon={Shield}
        title="Centar sigurnosti"
        subtitle="Sigurnost vaše obitelji je naš najveći prioritet"
        action={
          <Dialog open={reportOpen} onOpenChange={setReportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive/30">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Prijavi problem
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Prijavi sigurnosni problem</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Kategorija</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Odaberite kategoriju" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="safety_concern">Sigurnosni problem</SelectItem>
                      <SelectItem value="inappropriate_behavior">Neprimjereno ponašanje</SelectItem>
                      <SelectItem value="no_show">Nedolazak</SelectItem>
                      <SelectItem value="payment_dispute">Spor oko plaćanja</SelectItem>
                      <SelectItem value="other">Ostalo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Opis</Label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    className="mt-1"
                    placeholder="Molimo opišite situaciju detaljno..."
                  />
                </div>
                <Button
                  onClick={() => reportMutation.mutate()}
                  disabled={!category || !description || reportMutation.isPending}
                  className="w-full"
                >
                  {reportMutation.isPending ? 'Šaljem...' : 'Pošalji prijavu'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Trust badges explained */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold text-lg">Što znače naše oznake povjerenja</h2>
        {trustExplainers.map((item) => (
          <Card key={item.title} className="p-5 border-border/60">
            <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-base">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Safety tips */}
      <Card className="p-6 border-border/60 mt-8 bg-primary/3">
        <h2 className="font-display font-semibold text-lg mb-4">Savjeti za sigurnost roditelja</h2>
        <ul className="space-y-2.5 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            Uvijek se upoznajte s dadiljom osobno prije prve rezervacije
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            Pogledajte video predstavljanje dadilje da steknete dojam o njezinoj osobnosti
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            Provjerite sve oznake povjerenja i pročitajte recenzije drugih obitelji
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            Koristite funkciju prijave tijekom termina za mir uma
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            Prijavite bilo kakve probleme odmah putem Centra sigurnosti
          </li>
        </ul>
      </Card>
    </div>
  );
}