"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function StudioPage() {
  const router = useRouter();
  const pathname = usePathname();

  // Redirect bare /studio to /studio/structure so the content list is immediately visible
  useEffect(() => {
    if (pathname === "/studio" || pathname === "/studio/") {
      router.replace("/studio/structure");
    }
  }, [pathname, router]);

  return <NextStudio config={config} />;
}
