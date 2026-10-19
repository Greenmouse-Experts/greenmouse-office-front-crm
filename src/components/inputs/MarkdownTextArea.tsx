import { useId, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bold, Italic, Link2, List } from "lucide-react";

interface MarkdownTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
}

const tools = [
  { label: "Bold", icon: Bold, before: "**", after: "**", sample: "text" },
  { label: "Italic", icon: Italic, before: "*", after: "*", sample: "text" },
  { label: "List", icon: List, before: "- ", after: "", sample: "item" },
  {
    label: "Link",
    icon: Link2,
    before: "[",
    after: "](https://example.com)",
    sample: "link text",
  },
];

export default function MarkdownTextArea({
  value,
  onChange,
  label,
  placeholder,
  required,
}: MarkdownTextAreaProps) {
  const id = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");

  const insert = (before: string, after: string, sample: string) => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected = value.slice(start, end) || sample;
    onChange(`${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`);
    setMode("write");
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(
        start + before.length,
        start + before.length + selected.length,
      );
    });
  };

  return (
    <div className="min-w-52 space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold text-base-content/70">
          {label}
        </label>
        <div className="join" aria-label={`${label} editor mode`}>
          <button
            type="button"
            className={`btn btn-xs join-item ${mode === "write" ? "btn-primary" : "btn-ghost"}`}
            aria-pressed={mode === "write"}
            onClick={() => setMode("write")}
          >
            Write
          </button>
          <button
            type="button"
            className={`btn btn-xs join-item ${mode === "preview" ? "btn-primary" : "btn-ghost"}`}
            aria-pressed={mode === "preview"}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-base-300 bg-base-100 focus-within:border-primary">
        {mode === "write" ? (
          <>
            <div className="flex gap-1 border-b border-base-300 bg-base-200/40 p-1" role="toolbar" aria-label={`${label} formatting`}>
              {tools.map(({ label: toolLabel, icon: Icon, before, after, sample }) => (
                <button
                  key={toolLabel}
                  type="button"
                  className="btn btn-ghost btn-xs btn-square"
                  aria-label={toolLabel}
                  title={toolLabel}
                  onClick={() => insert(before, after, sample)}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </button>
              ))}
            </div>
            <textarea
              id={id}
              ref={inputRef}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
              required={required}
              rows={2}
              className="block min-h-16 w-full resize-y bg-transparent px-3 py-2 text-sm leading-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            />
          </>
        ) : (
          <div className="min-h-24 space-y-1 px-3 py-2 text-sm leading-5" aria-label={`${label} preview`}>
            {value.trim() ? (
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p>{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-5">{children}</ul>,
                  a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="link link-primary">{children}</a>,
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-base-content/60">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
