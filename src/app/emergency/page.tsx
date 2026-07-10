"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmergencyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard?sos=true");
  }, [router]);

  return null;
}
