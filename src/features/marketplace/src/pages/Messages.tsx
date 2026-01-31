import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@marketplace/lib/supabase";

import { getAllChats } from "@marketplace/actions/chat";
import type { IChat } from "@marketplace/actions/types";

export default function MessagesPage() {
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [chats, setChats] = useState<IChat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id);

            const response = await getAllChats();
            if (response?.success) {
                setChats(response.success);
            }
            setLoading(false);
        }
        init();
    }, []);

    if (loading) return <div className="p-5">Loading messages...</div>;

    if (chats.length === 0) {
        return (
            <div className="lg:h-dvh flex flex-col mb-20 lg:mb-0 border-r">
                <div className="pl-5">
                    <h1 className="text-xl py-5 font-bold text-primary">
                        Your messages with the sellers
                    </h1>
                </div>
                <div className="pl-5">
                    <h1 className="text-xl font-bold">
                        You don{`'`}t have any chats with the sellers
                    </h1>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:h-dvh flex flex-col mb-20 lg:mb-0 border-r">
            <div className="pl-5">
                <h1 className="text-xl py-5 font-bold text-primary">
                    Your messages with the sellers
                </h1>
            </div>

            <div className="flex-1 w-full flex overflow-hidden">
                <div className="flex-1 divide-y border-t w-full overflow-y-auto scrollbar-thin">
                    {chats.map((item) => (
                        <Link
                            key={item.id}
                            to={`/messages/${item.id}`}
                            className="block"
                        >
                            <div className="flex items-center gap-3 p-5 hover:bg-gray-100">
                                <img
                                    src={
                                        item.participants.filter((user) => user.id !== userId)[0]
                                            ?.image || "/marketplace/logo.svg"
                                    }
                                    alt="user profile pic"
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 object-cover rounded-full"
                                />
                                <div>
                                    <h1 className="text-secondary font-bold">
                                        {
                                            item.participants.filter(
                                                (user) => user.id !== userId
                                            )[0]?.name
                                        }
                                    </h1>
                                    <p className="text-sm text-primary">
                                        {item.messages && item.messages.length > 0 ? (
                                            <>
                                                {item.messages[item.messages.length - 1].senderId !==
                                                    userId
                                                    ? `${item.participants.filter(
                                                        (user) => user.id !== userId
                                                    )[0]?.name
                                                    }: `
                                                    : "You: "}
                                                {item.messages[item.messages.length - 1].text}
                                            </>
                                        ) : (
                                            <span>Start conversation by sending the first message</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
