import React from "react";
import { StructuredRichTextJSON, RichTextBlock } from "@/types/blog";

interface SafeRichTextRendererProps {
  content: StructuredRichTextJSON;
  className?: string;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : null;
}

export const SafeRichTextRenderer: React.FC<SafeRichTextRendererProps> = ({
  content,
  className = "",
}) => {
  // If Lexical generated HTML is available, render clean semantic markup
  if (content?.html && content.html.trim().length > 0) {
    return (
      <article
        className={`prose prose-slate dark:prose-invert max-w-none text-text-primary leading-relaxed space-y-4 ${className}`}
        dangerouslySetInnerHTML={{ __html: content.html }}
      />
    );
  }

  const blocks = content?.blocks || [];

  return (
    <article className={`space-y-6 text-text-primary leading-relaxed ${className}`}>
      {blocks.map((block: RichTextBlock) => {
        switch (block.type) {
          case "heading": {
            if (block.level === 1) {
              return (
                <h1
                  key={block.id}
                  className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary pt-4 pb-1"
                >
                  {block.text}
                </h1>
              );
            }
            if (block.level === 3) {
              return (
                <h3
                  key={block.id}
                  className="text-lg sm:text-xl font-bold tracking-tight text-text-primary pt-3 pb-1"
                >
                  {block.text}
                </h3>
              );
            }
            return (
              <h2
                key={block.id}
                className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary pt-3 pb-1 border-b border-border/60 pb-2"
              >
                {block.text}
              </h2>
            );
          }

          case "paragraph":
            return (
              <p key={block.id} className="text-sm sm:text-base text-text-secondary leading-relaxed">
                {block.text}
              </p>
            );

          case "blockquote":
            return (
              <blockquote
                key={block.id}
                className="border-l-4 border-brand pl-4 py-2 italic text-sm sm:text-base font-serif bg-surface-subtle/50 text-text-primary rounded-r-card my-4"
              >
                &ldquo;{block.text}&rdquo;
              </blockquote>
            );

          case "list": {
            if (block.ordered) {
              return (
                <ol
                  key={block.id}
                  className="list-decimal pl-6 space-y-2 text-sm sm:text-base text-text-secondary"
                >
                  {(block.items || []).map((item, idx) => (
                    <li key={idx} className="pl-1 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ol>
              );
            }
            return (
              <ul
                key={block.id}
                className="list-disc pl-6 space-y-2 text-sm sm:text-base text-text-secondary"
              >
                {(block.items || []).map((item, idx) => (
                  <li key={idx} className="pl-1 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            );
          }

          case "image":
            return (
              <figure key={block.id} className="my-6 space-y-2">
                <div className="rounded-card overflow-hidden border border-border shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={block.url || ""}
                    alt={block.alt || "Article illustration"}
                    className="w-full h-auto object-cover max-h-[500px]"
                    loading="lazy"
                  />
                </div>
                {block.caption && (
                  <figcaption className="text-center text-xs text-text-muted italic">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case "youtube": {
            const videoId = extractYouTubeId(block.url || "");
            if (!videoId) return null;
            return (
              <figure key={block.id} className="my-6 space-y-2">
                <div className="relative aspect-video rounded-card overflow-hidden border border-border shadow-xs bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
                {block.caption && (
                  <figcaption className="text-center text-xs text-text-muted italic">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case "table": {
            const tableData = block.tableData;
            if (!tableData) return null;
            return (
              <div key={block.id} className="my-6 overflow-x-auto rounded-card border border-border">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-surface-subtle border-b border-border text-text-primary font-bold">
                    <tr>
                      {(tableData.headers || []).map((h, hIdx) => (
                        <th key={hIdx} className="p-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(tableData.rows || []).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-surface-subtle/40 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3 text-text-secondary">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          case "code":
            return (
              <div
                key={block.id}
                className="my-6 p-4 rounded-card bg-[#063B2E] text-mint font-mono text-xs sm:text-sm overflow-x-auto shadow-inner border border-border"
              >
                <div className="text-[10px] text-mint/60 pb-2 border-b border-mint/20 mb-2 uppercase tracking-wider">
                  {block.language || "Code"}
                </div>
                <pre>
                  <code>{block.text}</code>
                </pre>
              </div>
            );

          case "divider":
            return <hr key={block.id} className="my-8 border-border" />;

          default:
            return null;
        }
      })}
    </article>
  );
};

