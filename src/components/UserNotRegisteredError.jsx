import React from 'react';
import { ShieldAlert } from 'lucide-react';

const UserNotRegisteredError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-2xl shadow-lg border border-border">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-destructive/10">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-3">Pristup ograničen</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Niste registrirani za korištenje ove aplikacije. Obratite se administratoru za pristup.
          </p>
          <div className="p-4 bg-muted rounded-xl text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Ako mislite da je ovo greška:</p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>Provjerite jeste li prijavljeni s ispravnim računom</li>
              <li>Obratite se administratoru aplikacije</li>
              <li>Pokušajte se odjaviti i ponovo prijaviti</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;