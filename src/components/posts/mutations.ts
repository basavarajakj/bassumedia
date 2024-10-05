import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryFilters,
} from "@tanstack/react-query";
import { toast, useToast } from "../ui/use-toast";
import { usePathname, useRouter } from "next/navigation";
import type { PostsPage } from "@/lib/types";
import { deletePost } from "./actions";

export function useDeletePostMutation() {
  const {} = useToast();

  const queryClient = useQueryClient();

  const router = useRouter();
  const pathName = usePathname();

  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async (deletedPost) => {
      const queryFilter: QueryFilters = { queryKey: ["post-feed"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((p) => p.id !== deletedPost.id),
            })),
          };
        },
      );

      toast({
        description: "Post deleted!",
      });

      if (pathName == `/posts/${deletedPost.id}`) {
        router.push(`/users/${deletedPost.user?.username}`)
      }
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to delete post. Please try again.",
      });
    },
  });

  return mutation;
}
