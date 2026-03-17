import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Heart, Baby, Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) return;
    setLoading(true);
    await base44.auth.updateMe({
      role: selectedRole,
      display_name: user?.full_name || '',
    });
    if (selectedRole === 'parent') {
      navigate('/FamilySettings');
    } else {
      navigate('/NannyOnboarding');
    }
  };

  const roles = [
    {
      id: 'parent',
      icon: Baby,
      title: 'I\'m a Parent',
      description: 'Find trusted, verified nannies for your family',
      color: 'bg-primary/10 text-primary border-primary/20 hover:border-primary/40',
      selectedColor: 'bg-primary/15 border-primary ring-2 ring-primary/20',
    },
    {
      id: 'nanny',
      icon: Briefcase,
      title: 'I\'m a Nanny',
      description: 'Join our boutique platform and connect with families',
      color: 'bg-sage/20 text-sage-foreground border-sage/30 hover:border-sage/50',
      selectedColor: 'bg-sage/30 border-sage ring-2 ring-sage/30',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/12 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary" fill="currentColor" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Welcome to CozyCare</h1>
          <p className="text-muted-foreground mt-2">
            A warm, trusted place for families and caregivers
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px bg-border" />
          <Sparkles className="w-4 h-4 text-primary/40" />
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Role selection */}
        <div className="space-y-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                selectedRole === role.id ? role.selectedColor : role.color
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center shadow-sm">
                  <role.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground">{role.title}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selectedRole || loading}
          className="w-full mt-8 h-12 font-semibold text-base"
        >
          {loading ? 'Setting up...' : 'Continue'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}