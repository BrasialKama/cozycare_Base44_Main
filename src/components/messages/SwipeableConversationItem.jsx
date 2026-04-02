import React, { useRef, useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function SwipeableConversationItem({ conv, isActive, otherName, onSelect, onHide }) {
  const startX = useRef(0);
  const [offsetX, setOffsetX] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const dragging = useRef(false);

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    dragging.current = true;
  };

  const onTouchMove = (e) => {
    if (!dragging.current) return;
    const diff = startX.current - e.touches[0].clientX;
    setOffsetX(Math.max(0, Math.min(diff, 80)));
  };

  const onTouchEnd = () => {
    dragging.current = false;
    if (offsetX > 40) {
      setOffsetX(80);
    } else {
      setOffsetX(0);
    }
  };

  const handleClick = () => {
    if (offsetX > 0) {
      setOffsetX(0);
    } else {
      onSelect(conv.id);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Red background behind */}
      <div className="absolute inset-y-0 right-0 w-20 bg-destructive flex items-center justify-center rounded-r-2xl">
        <button
          className="text-destructive-foreground text-xs font-semibold px-2"
          onClick={() => setShowConfirm(true)}
        >
          Sakrij
        </button>
      </div>

      {/* Conversation card */}
      <div
        className={`relative z-10 w-full text-left p-4 rounded-2xl transition-transform ${
          isActive
            ? 'bg-primary/8 border border-primary/20 shadow-sm'
            : 'bg-card border border-border/50 hover:border-primary/15 hover:shadow-sm'
        }`}
        style={{ transform: `translateX(-${offsetX}px)`, transition: dragging.current ? 'none' : 'transform 0.2s ease' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleClick}
      >
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-primary/15' : 'bg-gradient-to-br from-rose-light to-peach/60'}`}>
            <span className="text-sm font-bold text-primary">{otherName[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{otherName}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.last_message || 'Započnite razgovor…'}</p>
          </div>
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sakriti razgovor?</AlertDialogTitle>
            <AlertDialogDescription>
              Razgovor će biti skriven iz vašeg popisa. Ako vam osoba pošalje novu poruku, razgovor će se ponovo pojaviti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowConfirm(false); setOffsetX(0); }}>Odustani</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => {
                onHide(conv.id);
                setShowConfirm(false);
                setOffsetX(0);
              }}
            >
              Da
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}