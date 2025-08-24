/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { IoClose, IoCheckmark, IoTrash, IoEye } from "react-icons/io5";
import { Badge } from "@/components/ui/badge";
import { useLandlordDetailsByAdminQuery } from "@/redux/api/dashboardApi";
import { useParams, useRouter } from "next/navigation";
import {
  useAcceptOrRejectPropertyMutation,
  useDeleteSinglePropertyMutation,
} from "@/redux/api/propertyApi";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import ReusableTable from "@/components/shared/ReusableTable";

export default function AdminPropertiesInfo() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading: isLoadingData, isError } = useLandlordDetailsByAdminQuery(id);
  const [acceptOrRejectMutate, { isLoading: isLoadingAcceptOrReject }] = useAcceptOrRejectPropertyMutation();
  const [deleteSinglePropertyMutate, { isLoading: isLoadingDelete }] = useDeleteSinglePropertyMutation();

  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"accept" | "reject" | "delete" | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const handleAction = async (action: "accept" | "reject" | "delete", propertyId: string) => {
    setModalAction(action);
    setSelectedPropertyId(propertyId);
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedPropertyId || !modalAction) return;

    try {
      if (modalAction === "delete") {
        await deleteSinglePropertyMutate(selectedPropertyId).unwrap();
        toast.success("Property deleted successfully");
      } else {
        await acceptOrRejectMutate({
          id: selectedPropertyId,
          isActive: modalAction === "accept",
        }).unwrap();
        toast.success(`${modalAction === "accept" ? "Property accepted" : "Property rejected"} successfully`);
      }
    } catch (error) {
      toast.error(`Failed to ${modalAction === "accept" ? "accept" : modalAction === "reject" ? "reject" : "delete"} property`);
    } finally {
      setModalOpen(false);
      setModalAction(null);
      setSelectedPropertyId(null);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAction(null);
    setSelectedPropertyId(null);
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        <p className="ml-4 text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }

  if (isError || !data?.data?.properties) {
    return <div className="text-center text-red-500 py-4">Error loading properties or no properties found.</div>;
  }

  const properties = data.data.properties;

  const columns = [
    {
      header: "Properties Name",
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={row.images[0] || "/placeholder.svg"}
              alt={row.headlineYourProperty}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-gray-900 font-medium text-sm">{row.headlineYourProperty}</span>
        </div>
      ),
      minWidth: "250px",
      maxWidth: "250px",
      className: "px-0",
    },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge
          variant="secondary"
          className={`text-xs font-medium px-3 py-1 rounded-full ${
            row.status === "rented"
              ? "bg-background-secondary text-primary"
              : "bg-pink-100 text-pink-700 hover:bg-pink-100"
          }`}
        >
          {row.status}
        </Badge>
      ),
      minWidth: "120px",
      maxWidth: "120px",
    },
    {
      header: "Post Date",
      accessor: (row: any) => (
        <span className="text-gray-700 text-sm">
          {new Date(row.createdAt).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </span>
      ),
      minWidth: "150px",
      maxWidth: "150px",
    },
    {
      header: "Properties Location",
      accessor: (row: any) => (
        <span className="text-gray-700 text-sm">
          {`${row.location.flatOrHouseNo}, ${row.location.address}, ${row.location.city}, ${row.location.state}`}
        </span>
      ),
      minWidth: "200px",
      maxWidth: "200px",
    },
    {
      header: "Action",
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          {[
            {
              label: "View",
              icon: <IoEye className="w-4 h-4" />,
              onClick: () => router.push(`/admin-dashboard/all-properties/${row._id}`),
              className: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
            },
            {
              label: "Reject",
              icon: <IoClose className="w-4 h-4" />,
              onClick: () => handleAction("reject", row._id),
              className: `text-gray-500 hover:text-red-600 hover:bg-red-50 ${!row.isActive ? "bg-red-50 text-red-600" : ""}`,
              disabled: isLoadingAcceptOrReject || isLoadingDelete,
            },
            {
              label: "Accept",
              icon: <IoCheckmark className="w-4 h-4" />,
              onClick: () => handleAction("accept", row._id),
              className: `text-gray-500 hover:text-green-600 hover:bg-green-50 ${row.isActive ? "bg-green-50 text-green-600" : ""}`,
              disabled: isLoadingAcceptOrReject || isLoadingDelete,
            },
            {
              label: "Delete",
              icon: <IoTrash className="w-4 h-4" />,
              onClick: () => handleAction("delete", row._id),
              className: "text-gray-500 hover:text-red-600 hover:bg-red-50",
              disabled: isLoadingAcceptOrReject || isLoadingDelete,
            },
          ].map((action, index) => (
            <button
              title={action.label}
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`p-1 flex items-center gap-1 text-sm ${action.className} ${action.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {action.icon}
              {/* <span>{action.label}</span> */}
            </button>
          ))}
        </div>
      ),
      minWidth: "200px",
      maxWidth: "200px",
    },
  ];

  return (
    <div className="w-full bg-white">
      <div className="lg:p-6">
        <ReusableTable
          data={properties}
          total={properties.length}
          isLoading={isLoadingData}
          columns={columns}
          itemsPerPage={properties.length}
          currentPage={1}
          onPageChange={() => {}}
          dynamicPagination={false}
          firstColumnWidth="250px"
          className="bg-white"
        />
      </div>

      {/* Confirmation Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {(modalAction as any)?.charAt(0).toUpperCase() + modalAction?.slice(1)}</DialogTitle>
            <DialogDescription>
              Are you sure you want to {modalAction} this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={isLoadingAcceptOrReject || isLoadingDelete}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={isLoadingAcceptOrReject || isLoadingDelete}
              className={modalAction === "delete" || modalAction === "reject" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isLoadingAcceptOrReject || isLoadingDelete ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}