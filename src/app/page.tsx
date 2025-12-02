"use client";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (!auth) {
      router.replace("/login");
      return;
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/dashboard");
      else router.replace("/login");
    });
    return () => unsub();
  }, [router]);
  return null;
}
