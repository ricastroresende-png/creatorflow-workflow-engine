import { useEffect, useRef, useState } from "react";

interface ZenEditorProps {
  noteId: string;
  initialContent: string;
  onChange?: (value: string) => void;
  onClose?: () => void;
}

/**
 * Minimal Zen editor with paste handler that safely processes images without
 * losing the textarea reference during the asynchronous FileReader workflow.
 */
export default function ZenEditor({
  noteId,
  initialContent,
  onChange,
  onClose,
}: ZenEditorProps) {
  const [value, setValue] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setValue(initialContent);
  }, [initialContent]);

  const persistValue = (text: string) => {
    setValue(text);
    onChange?.(text);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Capture reference synchronously; e.currentTarget becomes null once the
    // async FileReader finishes, which previously caused selectionStart errors.
    const target = e.currentTarget;
    if (!target) return;

    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.includes("image"));
    if (!imageItem) return;

    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;

    const selectionStart = target.selectionStart ?? target.value.length;
    const selectionEnd = target.selectionEnd ?? target.value.length;
    const before = target.value.slice(0, selectionStart);
    const after = target.value.slice(selectionEnd);

    const reader = new FileReader();
    reader.onload = () => {
      // Reuse the captured target instead of relying on e.currentTarget.
      const textarea = target;
      const imageMarkdown = `![imagem colada](${reader.result})`;
      const nextValue = `${before}${imageMarkdown}${after}`;

      textarea.value = nextValue;
      persistValue(nextValue);

      // Restore cursor after inserted image.
      const caret = before.length + imageMarkdown.length;
      textarea.setSelectionRange(caret, caret);
      textarea.focus();
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <div className="font-mono text-xs uppercase text-muted-foreground">
          Zen Editor • Nota {noteId}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
            Fechar
          </button>
        )}
      </header>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => persistValue(e.target.value)}
        onPaste={handlePaste}
        className="min-h-[320px] w-full rounded-lg border border-border bg-background p-4 font-mono text-sm leading-7 shadow-sm outline-none focus:border-primary"
        placeholder="Escreva suas ideias aqui..."
      />
    </div>
  );
}
