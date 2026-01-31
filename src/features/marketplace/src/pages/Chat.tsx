import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getChat } from "@marketplace/actions/chat";
import type { IChat } from "@marketplace/actions/types";
import { MessageBox } from "@marketplace/components/message-box";
import { useEffect, useState } from "react";
import { supabase } from "@marketplace/lib/supabase";

export default function Chat() {
    const { id } = useParams();
    const [chat, setChat] = useState<IChat | undefined>(undefined);
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id);

            if (id) {
                const response = await getChat(id);
                if (response?.success) {
                    setChat(response.success as unknown as IChat);
                } else {
                    console.log(response?.error);
                }
            }
            setLoading(false);
        }
        init();
    }, [id]);

    if (loading) return <div className="p-5">Loading chat...</div>;

    return (
        <div className="flex flex-1 flex-col min-h-[91dvh] lg:h-full">
            {/* Header */}
            <div className="flex items-center gap-2 border-y border-r border-gray-100 p-3">
                <div className="">
                    <Link
                        to={"/messages"}
                        className="text-primary hover:bg-secondary hover:text-white transition-all duration-150 w-10 h-10 flex justify-center items-center rounded-full"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <img
                        src={
                            chat?.participants.filter((user) => user.id !== userId)[0]
                                ?.image || "/marketplace/logo.svg"
                        }
                        alt="user profile pic"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <h1 className="text-primary font-bold">
                        {chat?.participants.filter((user) => user.id !== userId)[0]?.name}
                    </h1>
                </div>
            </div>

            <MessageBox chat={chat as IChat} userId={userId as string} />
        </div>
    );
}
