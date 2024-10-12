import { PostData } from "@/lib/types";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { formateRelativeDate } from "@/lib/utils";
import { useSession } from "@/app/(main)/sessionProvider";
import PostMoreButton from "./PostMoreButton";
import Linkify from "../Linkify";
import UserToolTip from "../UserTooltip";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();

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
                  {post.user?.username}
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
    </article>
  );
}
