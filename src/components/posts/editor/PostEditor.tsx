"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { submitPost } from "./actions";
import { useSession } from "@/app/(main)/sessionProvider";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import "./styles.css";
import { useSubmitPostMutation } from "./mutations";
import LoadingButton from "@/components/LoadingButton";
import useMediaUpload, { type Attachment } from "./useMediaUpload";
import { useRef } from "react";
import { ImagesIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useDropzone } from "@uploadthing/react";

export default function PostEditor() {
  const { user } = useSession();

  const mutation = useSubmitPostMutation();

  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachments,
    reset: resetMediaUpload,
  } = useMediaUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  });

  const { onClick, ...rootProps } = getRootProps();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "What's going on here...?",
      }),
    ],
  });

  const input = editor?.getText({ blockSeparator: "\n" }) || "";

  async function onSubmit() {
    mutation.mutate(
      {
        content: input,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          resetMediaUpload();
        },
      },
    );
    editor?.commands.clearContent();
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-xl">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <div {...rootProps} className="w-full">
          <EditorContent
            editor={editor}
            className={cn(
              "max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background px-5 py-3",
              isDragActive && "outline-dashed",
            )}
          />
          <input {...getInputProps()} />
        </div>
      </div>
      {!!attachments.length && (
        <AttachmentsPreviews
          attachments={attachments}
          removeAttachment={removeAttachments}
        />
      )}
      <div className="flex items-center justify-end gap-3">
        {isUploading && (
          <>
            <span className="text-sm">{uploadProgress ?? 0}%</span>
            <Loader2 className="size-5 animate-spin text-primary" />
          </>
        )}
        <AddAttachmentButton
          onFilesSelected={startUpload}
          disabled={isUploading || attachments.length >= 5}
        />
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!input.trim() || isUploading}
          className="min-w-20"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}

interface AddAttachmentsButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

function AddAttachmentButton({
  onFilesSelected,
  disabled,
}: AddAttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary hover:text-primary"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImagesIcon size={20} />
      </Button>

      <input
        type="file"
        accept="image/*, video/*"
        multiple
        ref={fileInputRef}
        className="sr-only hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);

          if (files.length) {
            onFilesSelected(files);
            e.target.value = "";
          }
        }}
      />
    </>
  );
}

interface AttachmentsPreviewsProps {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}

function AttachmentsPreviews({
  attachments,
  removeAttachment,
}: AttachmentsPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {attachments.map((attachment) => (
        <AttachmentsPreview
          key={attachment.file.name}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  );
}

interface AttachmentsPreviewProps {
  attachment: Attachment;
  onRemoveClick: () => void;
}

function AttachmentsPreview({
  attachment: { file, mediaId, isUploading },
  onRemoveClick,
}: AttachmentsPreviewProps) {
  const src = URL.createObjectURL(file);
  return (
    <div
      className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}
    >
      {file.type.startsWith("image") ? (
        <Image
          src={src}
          alt="Attachment preview"
          width={500}
          height={500}
          className="size-fit max-h-[30rem] rounded-xl"
        />
      ) : (
        <video controls className="size-fit max-h-[300rem] rounded-xl">
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="transition-color absolute right-3 top-3 rounded-full bg-foreground p-1.5 text-background hover:bg-foreground/60"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
