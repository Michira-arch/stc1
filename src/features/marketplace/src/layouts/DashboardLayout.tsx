import { Link, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

import { Logout } from "@marketplace/components/logout-btn";
import { Logo, Navbar } from "@marketplace/components/navbar";
import {
    ArchiveRestore,
    Bell,
    HandHelping,
    Home,
    MessageSquare,
    Upload,
    User,
} from "lucide-react";
import { fetchUserNotifications } from "@marketplace/actions/user";
import { toast } from "sonner";
import type { IUserNotification } from "@marketplace/actions/types";

const homeLinks: { icon: React.ReactNode; title: string; link: string }[] = [
    {
        icon: <Home />,
        title: "Home",
        link: "/home",
    },
    {
        icon: <Upload />,
        title: "Create Post",
        link: "/post",
    },
    {
        icon: <HandHelping />,
        title: "Requests",
        link: "/requests",
    },
    {
        icon: <MessageSquare />,
        title: "Messages",
        link: "/messages",
    },
    {
        icon: <Bell />,
        title: "Notifications",
        link: "/notifications",
    },
    {
        icon: <ArchiveRestore />,
        title: "Create Request",
        link: "/requests/create",
    },
    {
        icon: <User />,
        title: "Profile",
        link: "/profile",
    },
];

export default function DashboardLayout() {
    const [notifications, setNotifications] = useState<IUserNotification[]>([]);

    useEffect(() => {
        async function loadNotifications() {
            const response = await fetchUserNotifications();
            if (response?.error) {
                toast.error(response.error);
            } else if (response?.success) {
                setNotifications(response.success.filter((item) => !item.read));
            }
        }
        loadNotifications();
    }, []);

    const count = notifications.length;

    return (
        <div className="flex flex-col min-h-dvh lg:flex-row bg-background text-foreground">
            <div className="sticky top-0 lg:hidden z-40 shadow-neu-flat">
                <Navbar />
            </div>
            <aside className="hidden sticky h-dvh top-0 w-[300px] shadow-neu-flat p-5 lg:flex flex-col justify-between z-30">
                <div>
                    <div className="w-fit p-4 rounded-xl shadow-neu-flat mb-5">
                        <Logo />
                    </div>

                    <ul className="grid grid-cols-1 my-5 gap-3">
                        {homeLinks.map((item, idx) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            <Link key={idx} to={item.link}>
                                <li className="flex items-center gap-3 text-foreground hover:text-primary hover:shadow-neu-flat transition-all duration-200 p-3 rounded-xl active:shadow-neu-pressed">
                                    {item.icon} <span className="font-medium">{item.title}</span>
                                    {item.title === "Notifications" && count > 0 && (
                                        <span className="bg-primary text-white rounded-full w-6 h-6 text-xs flex items-center justify-center ml-auto">
                                            {count}
                                        </span>
                                    )}
                                </li>
                            </Link>
                        ))}
                    </ul>
                </div>
                <div>
                    <Logout type="USER" />
                </div>
            </aside>
            <main className="flex-1 h-dvh w-full lg:overflow-y-auto scrollbar-thin bg-background p-4">
                <Outlet />
            </main>

            <div className="lg:hidden bg-background fixed bottom-0 py-3 w-full z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t-0">
                <ul className="flex w-full justify-evenly items-center">
                    {homeLinks.map((item, idx) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        <Link key={idx} to={item.link}>
                            <li className="text-foreground hover:text-primary active:scale-95 transition-all duration-200 p-3 rounded-xl">
                                {item.icon}
                                {item.title === "Notifications" && count > 0 && (
                                    <span className="absolute top-1 right-1 z-40 bg-market-accent text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                                        {count}
                                    </span>
                                )}
                            </li>
                        </Link>
                    ))}
                </ul>
            </div>
        </div>
    );
}
