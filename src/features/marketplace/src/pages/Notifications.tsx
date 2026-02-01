import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@marketplace/components/lib/utils";
import { parseDateSafe } from "@/utils";

import { fetchUserNotifications } from "@marketplace/actions/user";
import type { IUserNotification } from "@marketplace/actions/types";
import { MarkAsReadBtn } from "@marketplace/components/mark-as-read-btn";
import { toast } from "sonner";

export default function Notifications() {
    const [notifications, setNotifications] = useState<IUserNotification[]>([]);

    useEffect(() => {
        async function loadNotifications() {
            const response = await fetchUserNotifications();
            if (response?.error) toast.error(response.error);
            if (response?.success) {
                setNotifications(response.success as IUserNotification[]);
            }
        }
        loadNotifications();
    }, []);

    return (
        <div className="p-5">
            <div className="mb-2">
                <h1 className="text-xl font-bold text-primary">Your notifications</h1>
            </div>

            <div className="grid grid-cols-1 gap-5">
                {notifications.length > 0 ? (
                    notifications.map((item, idx) => (
                        <div
                            key={item.id}
                            className={cn(
                                "flex flex-col md:flex-row md:items-center gap-2 justify-between shadow bg-gray-50 p-5 rounded-md",
                                idx + 1 === notifications.length && "mb-20 lg:mb-0"
                            )}
                        >
                            <div className="flex items-center gap-5">
                                <img
                                    src={
                                        item.targetType === "ADMIN_APPROVE" ||
                                            item.targetType === "ADMIN_REJECT"
                                            ? "/marketplace/logo.svg"
                                            : item.action?.image || "/marketplace/logo.svg"
                                    }
                                    alt="user profile pic"
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 object-cover rounded-full"
                                />
                                <div>
                                    <h1 className="text-secondary">{item.message}</h1>
                                    <p className="text-xs text-wrap text-market-accent">
                                        {(() => {
                                            const date = parseDateSafe(item.createdAt);
                                            return date ? formatDistanceToNow(date, { addSuffix: true }) : "";
                                        })()}
                                    </p>
                                </div>
                            </div>
                            {!item.read && (
                                <div>
                                    <MarkAsReadBtn id={item.id} />
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <h1 className="text-lg font-bold">No notifications for you yet</h1>
                )}
            </div>
        </div>
    );
}
