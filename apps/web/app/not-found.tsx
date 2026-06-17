import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-lg font-medium">Page not found</h2>
      <Link href="/" className="text-primary hover:underline">
        Go back home
      </Link>
    </div>
  );
}
