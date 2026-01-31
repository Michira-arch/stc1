import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { Button } from "@marketplace/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@marketplace/components/ui/tabs";

import { fetchUserProfile } from "@marketplace/actions/user";
import type { IUserProfile } from "@marketplace/actions/types";
import { ArrowLeft, Mail, Phone, School, SquarePen } from "lucide-react";
import { PostCard } from "@marketplace/components/post-card";
import { RequestCard } from "@marketplace/components/request-card";
import { toast } from "sonner";
import { PurchasedCard } from "@marketplace/components/purchased-card";

export default function Profile() {
    const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            const response = await fetchUserProfile();
            if (response?.error) toast.error(response.error);
            if (response?.success) {
                setUserProfile(response.success as unknown as IUserProfile);
            }
            setLoading(false);
        }
        loadProfile();
    }, []);

    if (loading) return <div className="p-5">Loading profile...</div>;

    if (!userProfile) return <div className="p-5">Profile not found.</div>;

    return (
        <div className="p-4 mb-20 lg:mb-0">
            <div className="w-full mx-auto flex flex-col">
                <div className="relative">
                    {/* Banner */}
                    <div className="w-full h-32 bg-primary rounded-t-xl" />

                    {/* Profile Picture Container */}
                    <div className="absolute bottom-0 w-full sm:w-fit flex justify-center transform translate-y-1/2 sm:justify-start sm:left-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                                <img
                                    src={userProfile.image || "/marketplace/logo.svg"}
                                    alt={`${userProfile.name} profile picture`}
                                    width={300}
                                    height={300}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full flex flex-col items-center mt-20 sm:mt-0 sm:items-end sm:pr-5 sm:pt-5">
                    <Link to={"/profile/edit"}>
                        <Button className="bg-primary text-white hover:bg-market-accent">
                            <SquarePen className="mr-2" /> Edit profile
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="sm:pl-10">
                <h1 className="text-2xl font-bold text-primary">{userProfile.name}</h1>
                <ul className="my-2 space-y-3 text-gray-700/80">
                    <li className="flex gap-2">
                        <Mail /> {userProfile.email}
                    </li>
                    <li className="flex gap-2">
                        <Phone /> {userProfile.phoneNo || "N/A"}
                    </li>
                    <li className="flex gap-2">
                        <School /> {userProfile.college || "N/A"}
                    </li>
                </ul>
            </div>

            <Tabs defaultValue="posts" className="w-full sm:px-10 mt-5">
                <TabsList className="w-full sm:w-fit bg-light text-secondary">
                    <TabsTrigger value="posts" className="w-full px-10">
                        Posts
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="w-full px-10">
                        Requests
                    </TabsTrigger>
                    <TabsTrigger value="purchased" className="w-full px-10">
                        Purchased
                    </TabsTrigger>
                </TabsList>
                <TabsContent
                    value="posts"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                    {userProfile.posts && userProfile.posts.length > 0 ? (
                        userProfile.posts.map((item) => (
                            <PostCard type="profile" key={item.id} post={item} />
                        ))
                    ) : (
                        <h1 className="my-5 text-lg font-bold w-full col-span-3">
                            You haven{`'`}t posted any resource yet
                        </h1>
                    )}
                </TabsContent>
                <TabsContent
                    value="requests"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                    {userProfile.requests && userProfile.requests.length > 0 ? (
                        userProfile.requests.map((item) => (
                            <RequestCard type="profile" key={item.id} request={item} />
                        ))
                    ) : (
                        <h1 className="my-5 text-lg font-bold w-full col-span-3">
                            You haven{`'`}t requested any resource yet
                        </h1>
                    )}
                </TabsContent>
                <TabsContent
                    value="purchased"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                    {userProfile.purchasedItems &&
                        userProfile.purchasedItems.length > 0 ? (
                        userProfile.purchasedItems.map((item) => (
                            <PurchasedCard key={item.id} post={item} />
                        ))
                    ) : (
                        <h1 className="my-5 text-lg font-bold w-full col-span-3">
                            You haven{`'`}t purchased any resource yet
                        </h1>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
