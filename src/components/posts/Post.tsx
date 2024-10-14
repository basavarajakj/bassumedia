import { PostData } from "@/lib/types";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { cn, formateRelativeDate } from "@/lib/utils";
import { useSession } from "@/app/(main)/sessionProvider";
import PostMoreButton from "./PostMoreButton";
import Linkify from "../Linkify";
import UserToolTip from "../UserTooltip";
import type { Media } from "@prisma/client";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carosuel";
import React, { useState, useEffect } from "react";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();
  const [activeIndex, setActiveIndex] = useState(0); // Active slide index

  const updateActiveIndex = (api: any) => {
    setActiveIndex(api.selectedScrollSnap());
  };

  return (
    <article className="group/post space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {post?.user && (
            <UserToolTip user={post?.user}>
              <Link href={`/users/${post.user?.username}`}>
                <UserAvatar avatarUrl={post.user?.avatarUrl} />
              </Link>
            </UserToolTip>
          )}
          <div>
            {post?.user && (
              <UserToolTip user={post?.user}>
                <Link
                  href={`/users/${post.user?.username}`}
                  className="block font-medium hover:underline"
                >
                  {post.user?.displayName}
                </Link>
              </UserToolTip>
            )}
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
            >
              {formateRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>
        {post.user?.id === user.id && (
          <PostMoreButton
            post={post}
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>
      <Linkify>
        <div className="whitespace-pre-line break-words">{post.content}</div>
      </Linkify>
      {post.attachments.length > 1 ? (
        <>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            setApi={(api) => api?.on("select", () => updateActiveIndex(api))}
          >
            <CarouselContent className="w-full">
              {post.attachments.map((attachment, index) => (
                <CarouselItem key={attachment.id} className="max-w-80 aspect-square flex-shrink-0 w-full gap-0">
                  <MediaPreview media={attachment} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          {/* Pagination Dots */}
          <div className="md:hidden flex justify-center mt-2">
            {post.attachments.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-2 w-2 mx-1 rounded-full transition-all duration-300",
                  index === activeIndex ? "bg-primary" : "bg-gray-300"
                )}
              />
            ))}
          </div>
        </>
      ) : post.attachments.length === 1 ? (
        <div
          className={cn(
            "mx-auto",
            post.attachments[0].type === "IMAGE" && "max-w-96"
          )}
        >
          <MediaPreview media={post.attachments[0]} />
        </div>
      ) : null}
    </article>
  );
}

interface MediaPreviewProps {
  media: Media;
}

function MediaPreview({ media }: MediaPreviewProps) {
  if (media.type === "IMAGE") {
    return (
      <Image
        src={media.url}
        alt="Attachment"
        width={200}
        height={200}
        className="mx-auto h-full w-full rounded-xl object-cover"
      />
    );
  }

  if (media.type === "VIDEO") {
    return (
      <video
        src={media.url}
        controls
        className="mx-auto h-[220] max-w-[320] rounded-xl"
      />
    );
  }

  return <p className="text-destructive">Unsupported media type</p>;
}
