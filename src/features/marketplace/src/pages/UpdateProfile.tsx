import { toast } from "sonner";
import { useEffect, useState } from "react";

import { fetchUserProfile } from "@marketplace/actions/user";
import { UpdateProfileForm } from "@marketplace/components/update-profile-form";
import type { UserProfile } from "@marketplace/types";

export default function UpdateUserProfile() {
    const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            const response = await fetchUserProfile();
            if (response?.error) {
                toast.error(response?.error);
            } else if (response?.success) {
                setUserProfile(response.success);
            }
            setLoading(false);
        }
        loadProfile();
    }, []);

    if (loading) return <div className="p-5">Loading...</div>;

    return (
        <div className="p-5">
            <h1 className="text-xl font-bold text-primary">Update your profile</h1>
            <div className="my-5 p-5 bg-gray-100 rounded shadow max-w-xl">
                {userProfile && <UpdateProfileForm user={userProfile} />}
            </div>
        </div>
    );
}
