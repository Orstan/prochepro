"use client";

import { API_BASE_URL } from "@/lib/api";

interface UserAvatarProps {
  avatar?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-base",
  lg: "h-20 w-20 text-2xl",
  xl: "h-28 w-28 text-4xl",
};

export default function UserAvatar({
  avatar,
  name,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const sizeClass = sizeClasses[size];
  const initial = name?.charAt(0)?.toUpperCase() || "?";

  if (avatar) {
    const avatarUrl = avatar.startsWith("http") ? avatar : `${API_BASE_URL}${avatar}`;
    return (
      <img
        src={avatarUrl}
        alt={name || "Avatar"}
        className={`rounded-full object-cover ring-2 ring-slate-200 ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-500 ${sizeClass} ${className}`}
    >
      {initial}
    </div>
  );
}
