import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    React.useEffect(() => {
      const handleResize = () => {
        if (textareaRef.current) {
          // Reset height to auto to calculate new scrollHeight
          textareaRef.current.style.height = 'auto';
          // Set height based on scrollHeight
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      };

      // Add resize handling for auto-resizing
      if (textareaRef.current) {
        handleResize();
      }

      return () => {
        if (textareaRef.current) {
          textareaRef.current.removeEventListener('input', handleResize);
        }
      };
    }, [props.value]); // Triggers when value changes

    return (
      <textarea
        ref={(el) => {
          textareaRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        className={cn(
          "flex min-h-[80px] w-full h-full overflow-hidden resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onInput={() => {
          if (textareaRef.current) {
            // Resize the textarea as content grows
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
          }
        }}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
