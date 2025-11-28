"use client";
import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
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
  }, [router]);
  if (!ready || !authed) return null;
  return <>{children}</>;
}
