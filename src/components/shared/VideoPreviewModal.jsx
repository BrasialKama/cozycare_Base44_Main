import React from 'react';
import { X } from 'lucide-react';

export default function VideoPreviewModal({ nanny, onClose }) {
  if (!nanny) return null;

  const videoUrl = nanny.intro_video_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div
        className="relative bg-card rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">
              {nanny.display_name || nanny.full_name}
            </h3>
            <p className="text-xs text-muted-foreground">Verification Video</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Video */}
        <div className="aspect-video bg-foreground/5">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Video coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}