import { useEffect, useState } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@marketplace/components/ui/pagination";

import { fetchRequests } from "@marketplace/actions/request";
import type { IUserRequest } from "@marketplace/actions/types";
import { RequestCard } from "@marketplace/components/request-card";
import { toast } from "sonner";

export default function Requests() {
    const [requests, setRequests] = useState<IUserRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadRequests() {
            const response = await fetchRequests();
            if (response && Array.isArray(response)) {
                setRequests(response as IUserRequest[]);
            } else {
                // Fallback if structure is different
                if ((response as any)?.error) toast.error((response as any).error);
                if ((response as any)?.success) setRequests((response as any).success);
                // If it returns array directly
                if (Array.isArray(response)) setRequests(response);
            }
            setLoading(false);
        }
        loadRequests();
    }, []);

    if (loading) return <div className="p-5">Loading requests...</div>;

    return (
        <div className="p-5 mb-20 lg:mb-0 flex flex-col h-full justify-between">
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-3">
                        <h1 className="text-xl font-bold text-primary">
                            Resource Requests
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {requests && requests.length > 0 ? (
                        requests.map((request) => (
                            <RequestCard type="home" key={request.id} request={request} />
                        ))
                    ) : (
                        <h1 className="font-bold text-lg col-span-3">
                            No requests created by others yet
                        </h1>
                    )}
                </div>
            </div>
        </div>
    );
}
