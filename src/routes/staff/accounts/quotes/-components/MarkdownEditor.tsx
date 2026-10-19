import { useRef, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { Bold, Italic, Link2, List, ListOrdered, Heading3 } from "lucide-react";
import type { QuoteFormValues } from "./QuoteFields";

const tools = [
  { label: "Bold", icon: Bold, before: "**", after: "**", sample: "important text" },
  { label: "Italic", icon: Italic, before: "*", after: "*", sample: "emphasis" },
  { label: "Heading", icon: Heading3, before: "### ", after: "", sample: "Section heading" },
  { label: "Bulleted list", icon: List, before: "- ", after: "", sample: "List item" },
  { label: "Numbered list", icon: ListOrdered, before: "1. ", after: "", sample: "List item" },
  { label: "Link", icon: Link2, before: "[", after: "](https://example.com)", sample: "link text" },
];

export default function MarkdownEditor() {
  const { control } = useFormContext<QuoteFormValues>();
  const { field, fieldState } = useController({
    name: "description",
    control,
    rules: { validate: (value) => !!value.trim() || "Description is required" },
  });
  const [mode, setMode] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insert = (before: string, after: string, sample: string) => {
    const input = textareaRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected = field.value.slice(start, end) || sample;
    field.onChange(
      `${field.value.slice(0, start)}${before}${selected}${after}${field.value.slice(end)}`,
    );
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="quote-description" className="text-sm font-semibold">Description <span className="text-error">*</span></label>
        <div className="join" aria-label="Description editor mode">
          <button type="button" className={`btn btn-xs join-item ${mode === "write" ? "btn-primary" : "btn-ghost"}`} aria-pressed={mode === "write"} onClick={() => setMode("write")}>Write</button>
          <button type="button" className={`btn btn-xs join-item ${mode === "preview" ? "btn-primary" : "btn-ghost"}`} aria-pressed={mode === "preview"} onClick={() => setMode("preview")}>Preview</button>
        </div>
      </div>
      <div className={`overflow-hidden rounded-xl border bg-base-100 ${fieldState.error ? "border-error" : "border-base-300"}`}>
        {mode === "write" ? (
          <>
            <div className="flex flex-wrap gap-1 border-b border-base-300 bg-base-200/50 p-2" role="toolbar" aria-label="Markdown formatting">
              {tools.map(({ label, icon: Icon, before, after, sample }) => (
                <button key={label} type="button" className="btn btn-ghost btn-xs" aria-label={label} title={label} onClick={() => insert(before, after, sample)}>
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
            <textarea
              id="quote-description"
              name={field.name}
              ref={(element) => { field.ref(element); textareaRef.current = element; }}
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!fieldState.error}
              aria-describedby={fieldState.error ? "quote-description-error" : "quote-description-help"}
              placeholder="Describe the scope, deliverables, and terms..."
              className="min-h-48 w-full resize-y bg-transparent p-4 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            />
          </>
        ) : (
          <div className="min-h-48 space-y-3 p-4 text-sm leading-6 text-base-content" aria-label="Description preview">
            {field.value?.trim() ? (
              <ReactMarkdown components={{
                h3: ({ children }) => <h3 className="text-base font-semibold">{children}</h3>,
                p: ({ children }) => <p>{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5">{children}</ol>,
                a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="link link-primary">{children}</a>,
              }}>{field.value}</ReactMarkdown>
            ) : <p className="text-base-content/60">Your formatted description will appear here.</p>}
          </div>
        )}
      </div>
      {fieldState.error ? <p id="quote-description-error" role="alert" className="text-sm text-error">{fieldState.error.message}</p> : <p id="quote-description-help" className="text-xs text-base-content/70">Use Markdown for headings, lists, links, and emphasis.</p>}
    </div>
  );
}
