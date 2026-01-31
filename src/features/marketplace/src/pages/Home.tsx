import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@marketplace/components/ui/pagination";

import { Filters } from "@marketplace/components/filters";
import { fetchFilteredPosts, fetchPosts } from "@marketplace/actions/post";
import type { IPost } from "@marketplace/actions/types";
import { PostCard } from "@marketplace/components/post-card";
import { ArrowLeft } from "lucide-react";

export default function Home() {
    const [searchParams] = useSearchParams();
    const [posts, setPosts] = useState<IPost[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const query = searchParams.get("q");
    const category = searchParams.get("category");

    useEffect(() => {
        async function loadPosts() {
            setLoading(true);
            setError(null);
            let response;
            if (query || category) {
                response = await fetchFilteredPosts(category || "", query || "");
            } else {
                response = await fetchPosts();
            }

            if (response?.error) {
                setError(response.error);
            } else if (response?.success) {
                setPosts(response.success);
            }
            setLoading(false);
        }

        loadPosts();
    }, [query, category]);

    if (error) {
        return (
            <div className="p-5">
                <Link to={"/home"}>
                    <div className="text-primary flex items-center justify-center  w-10 h-10 rounded-full hover:bg-primary hover:text-white transition duration-150">
                        <ArrowLeft size={24} />
                    </div>
                </Link>
                <h1 className="text-xl font-bold">Search Results: </h1>
                <h1>{error}</h1>
            </div>
        );
    }

    return (
        <div className="p-5 mb-20 lg:mb-0 flex flex-col justify-between h-full">
            <div>
                <h1 className="text-xl font-bold text-primary mb-5">
                    Browse Resources
                </h1>
                <Filters />

                {loading ? (
                    <div className="text-center p-10">Loading resources...</div>
                ) : (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
                        {posts && posts.length > 0 ? (
                            posts.map((post) => (
                                <PostCard type="home" key={post.id} post={post} />
                            ))
                        ) : (
                            <h1 className="col-span-3 text-xl font-bold">
                                No resource listed yet
                            </h1>
                        )}
                    </div>
                )}
            </div>

            {/* <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination> */}
        </div>
    );
}
