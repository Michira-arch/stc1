import { toast } from "sonner";
import { Button } from "@marketplace/components/ui/button";
import { ImageCarousel } from "@marketplace/components/image-carousel";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@marketplace/components/ui/dialog";


import { fetchPost } from "@marketplace/actions/post";
import { MarkPostSoldForm } from "@marketplace/components/mark-post-sold-form";
import type { IChat, IPost } from "@marketplace/actions/types";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { ConfirmButton } from "@marketplace/components/confirm-btn";
import { getAllChats } from "@marketplace/actions/chat";
import { supabase } from "@marketplace/lib/supabase";
import { useEffect, useState } from "react";

export default function UserPostDetails() {
    const { id } = useParams();
    const [post, setPost] = useState<IPost | undefined>(undefined);
    const [chats, setChats] = useState<IChat[]>([]);
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!id) return;

            const { data: { user } } = await supabase.auth.getUser();
            const currentUserId = user?.id;
            setUserId(currentUserId);

            const response = await fetchPost(id);
            const fetchChatResponse = await getAllChats();

            if (response?.error) toast.error(response.error);

            if (response?.success) {
                setPost(response.success.post);
                // console.log(response.success.post?.feeback);
            }

            let fetchedChats: IChat[] = [];
            if (fetchChatResponse?.success) {
                fetchedChats = fetchChatResponse.success;
            }

            if (currentUserId) {
                setChats(fetchedChats.filter(
                    (chat) => chat.participants.filter((p) => p.id !== currentUserId).length > 0
                ));
            } else {
                setChats(fetchedChats);
            }
            setLoading(false);
        }
        loadData();
    }, [id]);

    if (loading) return <div className="p-5">Loading details...</div>;

    return (
        <>
            <div className="pt-5 pl-5">
                <Link
                    to={"/profile"}
                    className="text-primary hover:bg-secondary hover:text-white transition-all duration-150 w-10 h-10 flex justify-center items-center rounded-full"
                >
                    <ArrowLeft size={24} />
                </Link>
            </div>
            <div className="flex flex-col xl:flex-row">
                <div className="w-full max-w-lg mx-auto px-14">
                    <ImageCarousel images={post?.images as string[]} />
                </div>
                <div className="space-y-2 w-full px-5">
                    <h1 className="text-2xl font-bold">{post?.title}</h1>
                    <p className="text-sm text-neutral-800 text-wrap">
                        {post?.description}
                    </p>
                    <p className="font-extrabold text-xl">Rs. {post?.price}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-5 px-5">
                {!post?.isApproved && (
                    <Link to={`/profile/posts/${post?.id}/edit`}>
                        <Button className="w-full">Edit Post</Button>
                    </Link>
                )}

                {/* <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full" variant="destructive">
              Delete Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] dark:bg-black">
            <DialogHeader>
              <DialogTitle>Delete your post</DialogTitle>
              <DialogDescription className="space-y-2">
                <span>
                  Are you sure you want to delete your product listing?
                </span>
              </DialogDescription>
            </DialogHeader>
            <ConfirmButton postId={id} />
          </DialogContent>
        </Dialog> */}

                {post?.isAvailable && chats.length > 0 && id && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="w-full dark:bg-neutral-600" variant="outline">
                                Sold
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] dark:bg-black">
                            <DialogHeader>
                                <DialogTitle className="tracking-normal text-lg font-semibold">
                                    Are you sure you want to set your product listing as sold?
                                </DialogTitle>
                                <DialogDescription className="space-y-2">
                                    <MarkPostSoldForm postId={id} chats={chats} />
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {post?.feeback && (
                <div className="pl-5">
                    <h1 className="text-xl font-bold text-primary mb-2">Feedback</h1>
                    <div className="flex items-center gap-2">
                        <p className="flex items-center text-yellow-400">
                            {[...Array(post.feeback.rating)].map((_, idx) => (
                                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                <Star key={idx} />
                            ))}{" "}
                        </p>
                        {post.feeback.text && (
                            <p className="text-lg">{post.feeback.text}</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
