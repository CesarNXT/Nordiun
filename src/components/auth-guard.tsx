"use client";
import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    if (pathname && pathname.startsWith("/login")) { return; }
    if (!auth) {
      router.replace("/login");
      return;
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      const ok = !!user;
      setAuthed(ok);
      setReady(true);
      if (!ok) router.replace("/login");
    });
    return () => unsub();
  }, [router, pathname]);
  if (pathname && pathname.startsWith("/login")) return <>{children}</>;
  if (!ready || !authed) return null;
  return <>{children}</>;
}
