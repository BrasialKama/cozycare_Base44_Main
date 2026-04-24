import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const SUBCATEGORIES = [
  { value: 'left_early', label: 'Otišla je prije dogovorenog vremena' },
  { value: 'inappropriate_care', label: 'Skrb nije bila primjerena' },
  { value: 'no_show', label: 'Nije se pojavila' },
  { value: 'safety_concern', label: 'Sigurnosni problem' },
  { value: 'other', label: 'Nešto drugo' },
];

export default function DisputeBookingDialog({ booking, open, onOpenChange, onSuccess }) {
  const [subcategory, setSubcategory] = useState('left_early');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (description.trim().length < 10) {
      toast.error('Molimo opišite problem u najmanje 10 znakova.');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await base44.functions.invoke('disputeBookingCompletion', {
        booking_id: booking.id,
        subcategory,
        description: description.trim(),
      });
      const data = resp?.data || resp;
      if (!data?.success) throw new Error(data?.error || 'Prijava nije poslana.');
      toast.success('Prijava je zaprimljena. CozyCare tim će je pregledati.');
      onSuccess?.();
      onOpenChange(false);
      setDescription('');
      setSubcategory('left_early');
    } catch (err) {
      toast.error(err?.message || 'Prijava nije poslana.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Prijavi problem s rezervacijom
          </DialogTitle>
          <DialogDescription>
            Vaša prijava ide izravno CozyCare timu na pregled. Status rezervacije ostaje nepromijenjen dok ne istražimo slučaj.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <Label className="text-sm font-semibold mb-2 block">Kategorija</Label>
            <RadioGroup value={subcategory} onValueChange={setSubcategory}>
              {SUBCATEGORIES.map(c => (
                <div key={c.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={c.value} id={`dbd-${c.value}`} />
                  <Label htmlFor={`dbd-${c.value}`} className="text-sm font-normal cursor-pointer">{c.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="dbd-description" className="text-sm font-semibold mb-2 block">Opis</Label>
            <Textarea
              id="dbd-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opišite što se dogodilo — što više detalja, to lakše ćemo pomoći."
              rows={5}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground mt-1">{description.length}/2000 znakova · minimum 10</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Odustani
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Šalje se…' : 'Pošalji prijavu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}