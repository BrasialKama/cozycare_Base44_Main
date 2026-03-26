import React from 'react';

export default function TrustCard({ icon, title, description }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-7 text-center flex flex-col items-center hover:shadow-md transition-shadow">
      <div className="h-14 w-14 rounded-full bg-background flex items-center justify-center shadow-sm mb-5 border border-border/50">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold mb-2.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}