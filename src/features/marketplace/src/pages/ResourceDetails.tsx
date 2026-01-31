import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@marketplace/lib/supabase";

import { ImageCarousel } from "@marketplace/components/image-carousel";
import { ArrowLeft, IndianRupee } from "lucide-react";

import { fetchPost } from "@marketplace/actions/post";
import type { IPost } from "@marketplace/actions/types";
import { toast } from "sonner";
import { MessageSellerBtn } from "@marketplace/components/message-seller-btn";

export default function ResourceDetails() {
    const { id } = useParams();
    const [post, setPost] = useState<IPost | undefined>(undefined);
    const [sellerStats, setSellerStats] = useState<
        { totalSoldWithRating: number; averageRating: number } | undefined
    >(undefined);
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!id) return;

            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id);

            const response = await fetchPost(id);

            if (response?.error) {
                toast.error(response.error);
            } else if (response?.success) {
                setPost(response.success.post);
                setSellerStats(response.success.sellerStats);
            }
            setLoading(false);
        }
        loadData();
    }, [id]);

    if (loading) return <div className="p-5">Loading details...</div>;

    return (
        <div className="h-full mb-20 lg:mb-0">
            <div className="pt-5 pl-5">
                <Link
                    to={"/home"}
                    className="text-primary hover:bg-secondary hover:text-white transition-all duration-150 w-10 h-10 flex justify-center items-center rounded-full"
                >
                    <ArrowLeft size={24} />
                </Link>
            </div>
            <div className="flex flex-col xl:flex-row items-center">
                <div className="w-full max-w-lg mx-auto px-14">
                    <ImageCarousel images={post?.images as string[]} />
                </div>
                <div className="w-full space-y-2 px-5">
                    <h1 className="text-2xl font-bold text-secondary">{post?.title}</h1>
                    <p className="text-neutral-800 text-wrap text-sm">
                        {post?.description}
                    </p>
                    <p className="flex items-center font-extrabold text-2xl text-primary">
                        <IndianRupee /> {post?.price}
                    </p>

                    {post?.seller.id !== userId && post?.isAvailable && (
                        <MessageSellerBtn sellerId={post?.seller.id as string} />
                    )}
                </div>
            </div>

            <div className="max-w-xl mx-auto md:mx-0">
                <h1 className="text-xl text-center mt-5 mb-2 md:text-left font-semibold text-secondary pl-5">
                    Seller Info:
                </h1>
                <div className="md:flex md:items-center md:gap-2 p-5 pt-0">
                    <img
                        src={post?.seller.image as string || "/marketplace/logo.svg"}
                        alt={`${post?.seller.name} profile picture`}
                        width={500} // Used by Next/Image but plain img ignores if styled with css classes for width/height? 
                        // Tailwind classes here are w-44 h-44.
                        height={500}
                        className="w-44 h-44 rounded-full object-cover mx-auto md:mx-0"
                    />
                    <div>
                        <h1 className="text-xl font-semibold text-secondary">
                            {post?.seller.name}
                        </h1>
                        <h2 className="text-lg font-medium text-secondary">
                            {post?.seller.college}
                        </h2>
                        <p className="text-lg font-medium text-market-accent">
                            Avg. rating: {sellerStats?.averageRating}
                        </p>
                        <p className="text-lg font-medium text-market-accent">
                            Total items sold: {sellerStats?.totalSoldWithRating}
                        </p>
                    </div>
                </div>
            </div>

            {/* <div></div> */}
        </div>
    );
}
