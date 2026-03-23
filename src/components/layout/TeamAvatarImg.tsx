"use client";

import { useState } from "react";

interface TeamAvatarImgProps {
  src: string;
  alt: string;
  initials: string;
  gradient: string;
}

export function TeamAvatarImg({ src, alt, initials, gradient }: TeamAvatarImgProps) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradient} text-white text-[11px] font-bold`}
      >
        {initials}
      </div>
    );
  }

  return (
    <>
      <div
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradient} text-white text-[11px] font-bold`}
      >
        {initials}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover rounded-full"
        loading="lazy"
        onError={() => setImgError(true)}
      />
    </>
  );
}
