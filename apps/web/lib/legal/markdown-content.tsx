import Link from "next/link";
import type { ReactNode } from "react";

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match = pattern.exec(text);

  while (match) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={`${match.index}-strong`}>{token.slice(2, -2)}</strong>);
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        nodes.push(
          <Link key={`${match.index}-link`} href={href} className="text-primary hover:underline">
            {label}
          </Link>,
        );
      }
    }

    lastIndex = match.index + token.length;
    match = pattern.exec(text);
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

export function MarkdownContent({ source }: { source: string }) {
  const blocks = source.trim().split(/\n\n+/);
  const elements: ReactNode[] = [];

  for (const [index, block] of blocks.entries()) {
    const trimmed = block.trim();
    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={index} className="mt-8 font-display text-lg font-medium text-foreground">
          {parseInline(trimmed.slice(4))}
        </h3>,
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={index} className="mt-10 font-display text-xl font-medium text-foreground">
          {parseInline(trimmed.slice(3))}
        </h2>,
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1 key={index} className="font-display text-2xl font-medium text-foreground">
          {parseInline(trimmed.slice(2))}
        </h1>,
      );
      continue;
    }

    const lines = trimmed.split("\n");
    if (lines.every((line) => line.startsWith("- "))) {
      elements.push(
        <ul key={index} className="mt-4 list-disc space-y-2 pl-5 text-base text-muted-foreground">
          {lines.map((line) => (
            <li key={line}>{parseInline(line.slice(2))}</li>
          ))}
        </ul>,
      );
      continue;
    }

    elements.push(
      <p key={index} className="mt-4 text-base leading-relaxed text-muted-foreground">
        {parseInline(trimmed.replace(/\n/g, " "))}
      </p>,
    );
  }

  return <div className="max-w-prose">{elements}</div>;
}
