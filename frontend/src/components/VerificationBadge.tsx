"use client";

interface VerificationBadgeProps {
  isVerified: boolean;
  verificationStatus?: string;
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
}

export default function VerificationBadge({
  isVerified,
  verificationStatus,
  size = "sm",
  showLabel = false,
}: VerificationBadgeProps) {
  if (!isVerified && verificationStatus !== "pending") {
    return null;
  }

  const sizeClasses = {
    xs: "w-3.5 h-3.5 text-[8px]",
    sm: "w-4 h-4 text-[10px]",
    md: "w-5 h-5 text-xs",
  };

  const labelSizeClasses = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
  };

  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1" title="Identité vérifiée">
        <span
          className={`inline-flex items-center justify-center rounded-full bg-emerald-500 text-white font-bold ${sizeClasses[size]}`}
        >
          ✓
        </span>
        {showLabel && (
          <span className={`text-emerald-600 font-medium ${labelSizeClasses[size]}`}>
            Vérifié
          </span>
        )}
      </span>
    );
  }

  if (verificationStatus === "pending") {
    return (
      <span className="inline-flex items-center gap-1" title="Vérification en cours">
        <span
          className={`inline-flex items-center justify-center rounded-full bg-amber-400 text-white ${sizeClasses[size]}`}
        >
          ⏳
        </span>
        {showLabel && (
          <span className={`text-amber-600 font-medium ${labelSizeClasses[size]}`}>
            En cours
          </span>
        )}
      </span>
    );
  }

  return null;
}
