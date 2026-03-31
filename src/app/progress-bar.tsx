"use client";

import NextTopLoader from "nextjs-toploader";

export function TopProgressBar() {
  return (
    <NextTopLoader
      color="hsl(142, 76%, 36%)"
      height={2}
      showSpinner={false}
      shadow={false}
    />
  );
}
