"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/sidequest/auth-form";

function LoginContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/quest-log";
  return <AuthForm next={next} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="sq-auth" />}>
      <LoginContent />
    </Suspense>
  );
}
