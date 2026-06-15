import { cn } from "@/lib/utils";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <Link href="/" className="mb-8 font-display text-2xl font-medium text-primary">
        Tend
      </Link>
      {children}
    </div>
  );
}
