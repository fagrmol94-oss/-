import React from "react";
import { UserProfile } from "../types";

interface ProfileAvatarProps {
  profile: UserProfile;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function ProfileAvatar({ profile, size = "md" }: ProfileAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  // Check if animated avatar is valid or active (simulate 30 days expiry or simple flag active)
  const isAnimatedActive = profile.hasAnimatedAvatar30Days;

  // Dicebear avatar as default
  const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile.name || 'salem')}`;
  
  // Rotating animated sacred geometric gold halo motif
  const animatedAvatar = "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDVtcXZ5NGRpdzhjMXAwOWE1Mnd4b3R3cmRxYXZpaTZwbGcxY3pqbCZjdD1n/W6Lf9P49rMC41E8SOf/giphy.gif";

  const baseAvatar = profile.customAvatarUrl || profile.avatarUrl || defaultAvatar;

  const avatarUrl = isAnimatedActive ? animatedAvatar : baseAvatar;

  // Configure frame-based ring styling and overlay elements
  let ringClasses = "";
  let frameOverlay = null;

  if (profile.activeFrame === "gold-sparkle") {
    ringClasses = "ring-2 ring-yellow-400 ring-offset-2 ring-offset-neutral-950 shadow-[0_0_15px_rgba(234,179,8,0.7)] animate-pulse";
    frameOverlay = (
      <div className="absolute inset-0 border-2 border-yellow-400 rounded-full animate-spin-slow pointer-events-none scale-110">
        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-yellow-300 rounded-full shadow-[0_0_8px_#fbbf24]"></div>
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_8px_#d97706]"></div>
      </div>
    );
  } else if (profile.activeFrame === "blue-lightning") {
    ringClasses = "ring-2 ring-cyan-400 ring-offset-2 ring-offset-neutral-950 shadow-[0_0_15px_rgba(34,211,238,0.7)]";
    frameOverlay = (
      <div className="absolute inset-0 border-2 border-dashed border-cyan-450 rounded-full animate-pulse-glow pointer-events-none scale-110">
        <div className="absolute top-1/2 left-0 w-2 h-2 bg-cyan-300 rounded-full -translate-y-1/2 shadow-[0_0_10px_#22d3ee]"></div>
        <div className="absolute top-1/2 right-0 w-2 h-2 bg-blue-400 rounded-full -translate-y-1/2 shadow-[0_0_10px_#3b82f6]"></div>
      </div>
    );
  } else if (profile.activeFrame === "royal-ruby") {
    ringClasses = "ring-2 ring-purple-500 ring-offset-2 ring-offset-neutral-950 shadow-[0_0_15px_rgba(168,85,247,0.7)]";
    frameOverlay = (
      <div className="absolute inset-0 border-2 border-purple-500 rounded-full pointer-events-none scale-110 animate-spin-slow">
        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-purple-400 rounded-full shadow-[0_0_8px_#a855f7]"></div>
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-rose-500 rounded-full shadow-[0_0_8px_#f43f5e]"></div>
      </div>
    );
  } else if (profile.activeFrame === "emerald-sparkle") {
    ringClasses = "ring-2 ring-emerald-500 ring-offset-2 ring-offset-neutral-950 shadow-[0_0_15px_rgba(16,185,129,0.7)]";
    frameOverlay = (
      <div className="absolute inset-0 border-2 border-dotted border-emerald-400 rounded-full animate-spin-slow pointer-events-none scale-110">
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses[size]}`}>
      {frameOverlay}
      <img
        src={avatarUrl}
        alt={profile.name || "User Avatar"}
        referrerPolicy="no-referrer"
        className={`w-full h-full rounded-full object-cover bg-neutral-900 border border-neutral-800 ${ringClasses}`}
      />
      
      {profile.isSvip && (
        <span className="absolute -bottom-1 -left-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-neutral-950 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md border border-yellow-300 flex items-center justify-center scale-90 z-10 animate-bounce">
          👑 SVIP
        </span>
      )}
    </div>
  );
}
