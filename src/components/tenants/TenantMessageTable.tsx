/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { MessageSquare, FileText } from "lucide-react";
import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMessageConversationsQuery } from "@/redux/api/chatApi";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ReusableTable from "../shared/ReusableTable";
import { useCreateTenancyAgreementMutation } from "@/redux/api/tenancyAgreementApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Define TypeScript interfaces for the data structure
interface Address {
    flatOrHouseNo: string;
    address: string;
    state: string;
    city: string;
    town: string;
    area: string;
    _id: string;
}

interface OtherUser {
    _id: string;
    email: string;
    name: string;
    address: Address;
    role: string;
    isVerified: boolean;
    image: string;
}

interface Property {
    _id: string;
    headlineYourProperty: string;
}

interface Conversation {
    _id: {
        propertyId: string;
        otherId: string;
    };
    lastMessage: string;
    lastImageUrl: string | null;
    lastMessageTime: string;
    unreadCount: number;
    otherUser: OtherUser;
    property: Property;
}

// Define a Column type for table columns
type Column<T> = {
    header: string;
    accessor: (row: T) => React.ReactNode;
    minWidth?: string;
    className?: string;
};

// Define the TenantMessageTable component
const TenantMessageTable: React.FC = () => {
    const { data, isLoading } = useGetMessageConversationsQuery(undefined, {
        pollingInterval: 60000, // 1 minute in milliseconds
    });
    const [createTenancyAgreement, { isLoading: isCreatingTenancy }] = useCreateTenancyAgreementMutation();
    const [loadingRowId, setLoadingRowId] = useState<string | null>(null);

    const router = useRouter(); // Hook for navigation

    // Extract conversations from the response
    const conversations: Conversation[] = data?.data?.conversations || [];

    // Handle tenancy agreement creation
    const handleCreateTenancy = async (row: Conversation) => {
        try {
            setLoadingRowId(row._id.propertyId);
            await createTenancyAgreement({
                propertyId: row._id.propertyId,
                otherPartyId: row._id.otherId,
            }).unwrap();

            toast.success("Tenancy agreement created successfully!");
        } catch (error) {
            toast.error((error as any)?.data?.message || "Failed to create tenancy agreement.");
        } finally {
            setLoadingRowId(null);
        }
    };

    // Define table columns
    const columns: Column<Conversation>[] = [
        {
            header: "Landlord",
            accessor: (row) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8">
                        <Image
                            src={row.otherUser.image || "/placeholder.svg"}
                            alt={row.otherUser.name}
                            className="rounded-full object-cover"
                            width={32}
                            height={32}
                        />
                    </div>
                    <div>
                        <div className="font-medium">{row.otherUser.name}</div>
                        <div className="text-xs text-gray-500">{row.otherUser.email}</div>
                    </div>
                </div>
            ),
            minWidth: "250px",
            className: "font-semibold",
        },
        {
            header: "Property",
            accessor: (row) => row.property.headlineYourProperty,
            minWidth: "200px",
        },
        {
            header: "Last Message",
            accessor: (row) => (
                <div className="truncate max-w-[200px]">{row.lastMessage}</div>
            ),
            minWidth: "200px",
        },
        {
            header: "Last Message Time",
            accessor: (row) =>
                formatDistanceToNow(new Date(row.lastMessageTime), { addSuffix: true }),
            minWidth: "180px",
        },
        {
            header: "Unread",
            accessor: (row) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs ${row.unreadCount > 0 ? "bg-red-100 text-red-600" : "text-gray-500"
                        }`}
                >
                    {row.unreadCount}
                </span>
            ),
            minWidth: "100px",
        },
        {
            header: "Verified",
            accessor: (row) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs ${row.otherUser.isVerified
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                        }`}
                >
                    {row.otherUser.isVerified ? "Yes" : "No"}
                </span>
            ),
            minWidth: "100px",
        },
        {
            header: "Actions",
            accessor: (row) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/properties/${row.property._id}?isMessaging=true`)}
                        title="View Conversation"
                    >
                        <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCreateTenancy(row)}
                        disabled={loadingRowId === row._id.propertyId && isCreatingTenancy}
                        title="Create Tenancy Agreement"
                    >
                        <FileText className="h-4 w-4" />
                        {loadingRowId === row._id.propertyId && isCreatingTenancy && (
                            <span className="ml-2">Loading...</span>
                        )}
                    </Button>
                     <Button
                        className="bg-gray-100 text-black hover:text-white"
                        size="sm"
                        onClick={() => router.push(`/properties/${row.property._id}/payment`)}
                        title="Make Payment"
                    >
                        Make Payment
                    </Button>
                </div>
            ),
            minWidth: "150px",
        },
    ];

    // Render loading state
    if (isLoading) {
        return (
            <div className="w-full space-y-4">
                <Skeleton className="h-12 w-full" /> {/* Header skeleton */}
                {[...Array(5)].map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" /> // Row skeletons
                ))}
            </div>
        );
    }

    return (
        <div className="p-4">
            <ReusableTable
                data={conversations}
                columns={columns}
                itemsPerPage={10}
                className="rounded-lg border border-gray-200 shadow-sm"
                firstColumnWidth="250px"
                total={conversations.length}
                isLoading={isLoading}
                currentPage={1}
                onPageChange={() => {}}
            />
        </div>
    );
};

export default TenantMessageTable;