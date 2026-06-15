import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface TendLogoLinkProps {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

export function TendLogoLink({
  className,
  imageClassName = "h-7 w-auto",
  priority = false,
}: TendLogoLinkProps) {
  return (
    <Link
      href="/"
      className={cn(
        "shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <Image
        src="/promo/tend-logo.png"
        alt="Tend"
        width={135}
        height={40}
        priority={priority}
        className={imageClassName}
      />
    </Link>
  );
}
