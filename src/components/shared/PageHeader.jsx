import React from 'react';

export default function PageHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 lg:mb-8">
      <div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1 max-w-lg">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}