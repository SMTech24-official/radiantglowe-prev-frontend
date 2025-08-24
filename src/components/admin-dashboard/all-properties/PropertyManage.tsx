/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import EditPropertyModal from "@/components/landlord-dashboard/all-properties/EditPropertyModal";
import ReusableTable from "@/components/shared/ReusableTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllUsersQuery } from "@/redux/api/authApi";
import {
  useAcceptOrRejectPropertyMutation,
  useDeleteSinglePropertyMutation,
  useGetPropertyQuery,
  useIsPropertyHomePageStatusMutation,
  useUpdatePropertyMutation,
} from "@/redux/api/propertyApi";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BiEditAlt } from "react-icons/bi";
import { FaCheck, FaToggleOff, FaToggleOn } from "react-icons/fa6";
import { FiEye } from "react-icons/fi";
import { IoAdd, IoSearch, IoTrash } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { toast } from "sonner";

export default function PropertyManage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"delete" | "accept" | "reject" | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLandlord, setSelectedLandlord] = useState<string | null>(null);
  const [landlordSearch, setLandlordSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page

  const router = useRouter();

  const { data, isLoading } = useGetPropertyQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    status: statusFilter === "all" ? undefined : statusFilter === "booked" ? "rented" : "available",
  });
  const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation();
  const [deletePropertyFN, { isLoading: isDeleting }] = useDeleteSinglePropertyMutation();
  const [acceptOrRejectMutate, { isLoading: isLoadingAcceptOrReject }] = useAcceptOrRejectPropertyMutation();
  const { data: landlordsData } = useAllUsersQuery("landlord");
  const [toggleHomePageStatus, { isLoading: isToggling }] = useIsPropertyHomePageStatusMutation();

  const landlords = landlordsData?.data || [];
  const properties = data?.data?.properties || [];
  const total = data?.data?.total || 0;

  const filteredLandlords = landlords.filter(
    (landlord: any) =>
      landlord.name.toLowerCase().includes(landlordSearch.toLowerCase()) ||
      landlord.email.toLowerCase().includes(landlordSearch.toLowerCase())
  );

  const handleView = (row: any) => {
    router.push(`/admin-dashboard/all-properties/${row._id}`);
  };

  const handleToggleHomePage = async (propertyId: string) => {
    try {
      await toggleHomePageStatus(propertyId).unwrap();
      toast.success("Homepage status updated successfully!");
    } catch (err) {
      toast.error("Failed to update homepage status.");
    }
  };

  const handleEdit = (property: any) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateProperty({ id, ...data }).unwrap();
      setIsModalOpen(false);
      toast.success("Property updated successfully!");
    } catch (error) {
      toast.error("Error updating property");
    }
  };

  const openModal = (action: "delete" | "accept" | "reject", id: string) => {
    setModalAction(action);
    setSelectedPropertyId(id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAction(null);
    setSelectedPropertyId(null);
  };

  const confirmAction = async () => {
    if (!selectedPropertyId || !modalAction) return;

    try {
      if (modalAction === "delete") {
        await deletePropertyFN(selectedPropertyId).unwrap();
        toast.success("Property deleted successfully!");
      } else if (modalAction === "accept" || modalAction === "reject") {
        await acceptOrRejectMutate({ id: selectedPropertyId, isActive: modalAction === "accept" }).unwrap();
        toast.success(`Property ${modalAction}ed successfully!`);
      }
    } catch (error) {
      toast.error(`Error ${modalAction}ing property`);
    } finally {
      closeModal();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  const actions = [
    {
      label: "Accept",
      icon: <FaCheck className="w-4 h-4" />,
      onClick: (row: any) => openModal("accept", row._id),
      className: `text-gray-500 hover:text-gray-700 rounded transition-colors hover:bg-green-500/40`,
      disabled: isLoadingAcceptOrReject,
    },
    {
      label: "Reject",
      icon: <RxCross1 className="w-4 h-4" />,
      onClick: (row: any) => openModal("reject", row._id),
      className: `text-gray-500 hover:text-gray-700 rounded transition-colors hover:bg-red-500/40`,
      disabled: isLoadingAcceptOrReject,
    },
    {
      label: "View",
      icon: <FiEye className="w-4 h-4" />,
      onClick: handleView,
      className: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
    },
    {
      label: "Edit",
      icon: <BiEditAlt className="w-4 h-4" />,
      onClick: handleEdit,
      className: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
    },
    {
      label: "Delete",
      icon: <IoTrash className="w-4 h-4" />,
      onClick: (row: any) => openModal("delete", row._id),
      className: "text-gray-500 hover:text-red-600 hover:bg-red-50",
      disabled: isDeleting,
    },
  ];

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
              unoptimized
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
        <span className="text-primary text-sm font-medium bg-background-secondary rounded-lg p-2">{row.status}</span>
      ),
      minWidth: "120px",
      maxWidth: "120px",
    },
    {
      header: "IsHomePageView",
      accessor: (row: any) => (
        <button
          onClick={() => handleToggleHomePage(row._id)}
          disabled={isToggling}
          className={`flex items-center space-x-2 ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {row.isHomePageView ? (
            <FaToggleOn className="text-green-500 text-xl" />
          ) : (
            <FaToggleOff className="text-gray-500 text-xl" />
          )}
          <span>{row.isHomePageView ? "Visible" : "Not Visible"}</span>
        </button>
      ),
      minWidth: "150px",
      maxWidth: "150px",
    },
    {
      header: "Post Date",
      accessor: (row: any) => (
        <span className="text-gray-700 text-sm">{new Date(row.createdAt).toLocaleDateString()}</span>
      ),
      minWidth: "120px",
      maxWidth: "120px",
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
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          {actions.map((action, index) => (
            <button
              title={action.label}
              key={index}
              onClick={() => action.onClick(row)}
              disabled={action.disabled}
              className={`p-1 flex items-center ${row?.isActive && action.label === "Accept" ? "bg-green-500 text-white" : !row?.isActive && action.label === "Reject" ? "bg-red-500 text-white" : ""} gap-1 text-sm ${action.className} ${action.disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {action.icon}
              {/* <span>{action.label}</span> */}
            </button>
          ))}
        </div>
      ),
      minWidth: "400px",
      maxWidth: "400px",
    }
  ];



  return (
    <div className="w-full bg-white pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:p-6 pb-4">
        <div className="relative flex-1 w-full md:max-w-md">
          <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 border-gray-200 focus:border-gray-300 focus:ring-0"
          />
        </div>
        <div className="w-full md:w-auto flex items-center justify-between gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-10 border-gray-200 cursor-pointer">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">All</SelectItem>
              <SelectItem value="booked" className="cursor-pointer">Booked</SelectItem>
              <SelectItem value="available" className="cursor-pointer">Available</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary/80 cursor-pointer text-white h-10 px-4 rounded-lg"
          >
            <IoAdd className="w-4 h-4 mr-2" />
            Add New Properties
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="px-0 md:px-6 pb-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
            <p className="mt-4 text-lg font-semibold text-gray-700 animate-pulse">Loading Properties...</p>
          </div>
        ) : (
          <ReusableTable
            data={properties}
            total={total}
            isLoading={isLoading}
            columns={columns}
            // actions={actions}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            dynamicPagination={true}
            firstColumnWidth="250px"
            className="bg-white"
          />
        )}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {(modalAction as string)?.charAt(0).toUpperCase() + modalAction?.slice(1)}</DialogTitle>
            <DialogDescription>
              Are you sure you want to {modalAction} this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={isLoadingAcceptOrReject || isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={isLoadingAcceptOrReject || isDeleting}
              className={modalAction === "delete" || modalAction === "reject" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isLoadingAcceptOrReject || isDeleting ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Property Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Landlord</DialogTitle>
            <DialogDescription>Select a landlord to add the property for.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search by name or email"
              value={landlordSearch}
              onChange={(e) => setLandlordSearch(e.target.value)}
            />
            <Select onValueChange={setSelectedLandlord}>
              <SelectTrigger>
                <SelectValue placeholder="Select landlord" />
              </SelectTrigger>
              <SelectContent>
                {filteredLandlords.map((landlord: any) => (
                  <SelectItem key={landlord._id} value={landlord._id}>
                    {landlord.name} ({landlord.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedLandlord) {
                  toast.error("Please select a landlord");
                  return;
                }
                localStorage.setItem("landlordId", selectedLandlord);
                router.push("/add-properties");
                setIsAddModalOpen(false);
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Property Modal */}
      <EditPropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        property={selectedProperty}
        onUpdate={handleUpdate}
        buttonLoading={isUpdating}
      />
    </div>
  );
}