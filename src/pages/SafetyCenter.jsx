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
    title: 'ID Verified',
    description: 'Every nanny provides a government-issued ID that is verified by our team. This ensures the person you\'re hiring is exactly who they say they are.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: FileCheck,
    title: 'Background Checked',
    description: 'Comprehensive background screening including criminal records, sex offender registries, and relevant court records. Updated annually.',
    color: 'bg-secondary/60 text-secondary-foreground',
  },
  {
    icon: UserCheck,
    title: 'References Verified',
    description: 'We personally contact and verify each nanny\'s professional references. At least two references from previous families or employers are required.',
    color: 'bg-accent text-accent-foreground',
  },
  {
    icon: Camera,
    title: 'Video Verified',
    description: 'Each nanny completes a live video interview with our team, confirming their identity and assessing their communication and demeanor.',
    color: 'bg-peach text-peach-dark',
  },
  {
    icon: Award,
    title: 'Certifications Verified',
    description: 'Professional certifications like CPR, First Aid, early childhood education, and specialized training are verified with issuing institutions.',
    color: 'bg-sage/40 text-sage-foreground',
  },
];

export default function SafetyCenter() {
  const { user } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const reportMutation = useMutation({
    mutationFn: () => base44.entities.Report.create({
      reporter_email: user.email,
      category,
      description,
    }),
    onSuccess: () => {
      toast.success('Report submitted. Our team will review it within 24 hours.');
      setReportOpen(false);
      setCategory('');
      setDescription('');
    },
  });

  return (
    <div>
      <PageHeader
        icon={Shield}
        title="Safety Center"
        subtitle="Your family's safety is our highest priority"
        action={
          <Dialog open={reportOpen} onOpenChange={setReportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive/30">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report a Concern
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Report a Safety Concern</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="safety_concern">Safety Concern</SelectItem>
                      <SelectItem value="inappropriate_behavior">Inappropriate Behavior</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                      <SelectItem value="payment_dispute">Payment Dispute</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    className="mt-1"
                    placeholder="Please describe the situation in detail..."
                  />
                </div>
                <Button
                  onClick={() => reportMutation.mutate()}
                  disabled={!category || !description || reportMutation.isPending}
                  className="w-full"
                >
                  {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Trust badges explained */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold text-lg">What Our Trust Badges Mean</h2>
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
        <h2 className="font-display font-semibold text-lg mb-4">Safety Tips for Parents</h2>
        <ul className="space-y-2.5 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            Always meet your nanny in person before the first booking
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            Watch the nanny's introduction video to get a sense of their personality
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            Check all trust badges and read reviews from other families
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            Use the in-app check-in feature during bookings for peace of mind
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            Report any concerns immediately through our Safety Center
          </li>
        </ul>
      </Card>
    </div>
  );
}