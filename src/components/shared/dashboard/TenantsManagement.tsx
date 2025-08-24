/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAllUsersQuery, useDeleteUserMutation, useUpdateUserByAdminMutation } from "@/redux/api/authApi";
import { useOwnTenantRequestQuery } from "@/redux/api/permissionApi";
import { LoaderIcon } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { IoSearch } from "react-icons/io5";
import ReusableTable from "../ReusableTable";

export default function TenantsManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteMutate, { isLoading: deleteLoading }] = useDeleteUserMutation();
  const [updateMutate, { isLoading: updateLoading }] = useUpdateUserByAdminMutation();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateName, setUpdateName] = useState("");
  const [updatePhone, setUpdatePhone] = useState("");

  const { data, isLoading, isError } = useOwnTenantRequestQuery();
  const { data: allUserData, isLoading: allUserLoading, isError: allUserError } =
    useAllUsersQuery(pathname === "/admin-dashboard/all-tenants" ? "tenant" : "landlord");

  // Use allUserData for admin route, otherwise use tenant data
  const tenantsData = pathname === "/admin-dashboard/all-tenants"
    ? allUserData?.data?.map((user: any) => ({
      id: user._id,
      name: user.name,
      phone: user.phoneNumber,
      email: user.email,
      status: user.isActive ? "Active" : "Deactive",
      image: user.image || "/placeholder.svg",
      profileVerificationImage: user.profileVerificationImage || [],
      isVerified: user.isVerified,
      uid: user.uid,
    })) || []
    : data?.data?.permissions?.map((permission: any) => ({
      id: permission.tenantId._id,
      name: permission.tenantId.name,
      phone: permission.tenantId.phoneNumber,
      email: permission.tenantId.email,
      bookingDate: new Date(permission.responseDate).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      status: permission.status === "granted" ? "Active" : "Deactive",
      image: permission.tenantId.image || "/placeholder.svg",
      isVerified: permission.tenantId.isVerified,
      profileVerificationImage: permission.tenantId.profileVerificationImage || [],
      uid: permission.tenantId.uid,
    })) || [];

  const filteredTenants = tenantsData.filter(
    (tenant: any) =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.includes(searchTerm)
  );

  const handleView = (row: any) => {
    if (pathname === "/admin-dashboard/all-landlords") {
      router.push(`/admin-dashboard/all-landlords/${row.id}`);
    } else if (pathname === "/admin-dashboard/all-tenants") {
      router.push(`/admin-dashboard/all-tenants/${row.id}`);
    } else {
      router.push(`/all-tenants/${row.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutate(id).unwrap();
      setIsDeleteModalOpen(false);
    } catch (error) {
      // Handle error (e.g., show toast notification)
    }
  };

  const handleUpdate = async () => {
    if (selectedUser) {
      try {
        await updateMutate({
          id: selectedUser.id,
          data: {
            name: updateName,
            phoneNumber: updatePhone,
          },
        }).unwrap();
        setIsUpdateModalOpen(false);
        setSelectedUser(null);
      } catch (error) {
        // Handle error (e.g., show toast notification)
      }
    }
  };

  const openUpdateModal = (tenant: any) => {
    setSelectedUser(tenant);
    setUpdateName(tenant.name);
    setUpdatePhone(tenant.phone);
    setIsUpdateModalOpen(true);
  };

  // Define columns for ReusableTable
  const columns = [
    {
      header: "Name",
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={row.image}
              alt={row.name}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-gray-900 font-medium text-sm">{row.name}</span>
        </div>
      ),
      minWidth: "200px",
      maxWidth: "200px",
      className: "px-0",
    },
    {
      header: "ID",
      accessor: (row: any) => (
        <span className="text-gray-700 text-sm">{row.uid}</span>
      ),
      minWidth: "150px",
      maxWidth: "150px",
    },
    ...(pathname !== "/all-tenants"
      ? [
        {
          header: "Phone Number",
          accessor: (row: any) => (
            <span className="text-gray-700 text-sm">{row.phone}</span>
          ),
          minWidth: "150px",
          maxWidth: "150px",
        },
        {
          header: "Email",
          accessor: (row: any) => (
            <span className="text-gray-700 text-sm">{row.email}</span>
          ),
          minWidth: "200px",
          maxWidth: "200px",
        },
      ]
      : []),
    ...(pathname !== "/admin-dashboard/all-tenants"
      ? [
        {
          header: "Booking Date",
          accessor: (row: any) => (
            <span className="text-gray-700 text-sm">{row.bookingDate}</span>
          ),
          minWidth: "150px",
          maxWidth: "150px",
        },
      ]
      : []),
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge
          variant="secondary"
          className={`text-xs font-medium px-3 py-1 rounded-full ${row.status === "Active"
            ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
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
      header: "Document Status",
      accessor: (row: any) => (
        <Badge
          variant="secondary"
          className={`text-xs font-medium px-3 py-1 rounded-full ${row.profileVerificationImage?.length > 0
            ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
            : "bg-pink-100 text-pink-700 hover:bg-pink-100"
            }`}
        >
          {row.profileVerificationImage?.length > 0 ? "Submitted" : "Not Submitted"}
        </Badge>
      ),
      minWidth: "150px",
      maxWidth: "150px",
    },
  ];

  // Define actions for ReusableTable
  const actions = [
    {
      label: "View",
      icon: <FiEye className="w-4 h-4" />,
      onClick: handleView,
      className: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
    },
    ...(pathname === "/admin-dashboard/all-tenants"
      ? [
        {
          label: "Edit",
          icon: <FiEdit className="w-4 h-4" />,
          onClick: openUpdateModal,
          className: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
        },
        {
          label: "Delete",
          icon: <FiTrash2 className="w-4 h-4" />,
          onClick: (row: any) => {
            setSelectedUser(row);
            setIsDeleteModalOpen(true);
          },
          className: "text-gray-500 hover:text-red-700 hover:bg-red-100",
          disabled: deleteLoading,
        },
      ]
      : []),
  ];

  return (
    <div className="w-full bg-white mb-12">
      {/* Search Section */}
      <div className="md:p-6 pb-4">
        <div className="relative w-full md:max-w-md">
          <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-gray-300 focus:ring-0"
          />
        </div>
      </div>

      {/* Table */}
      <div className="md:px-6 pb-6">
        {(isLoading || allUserLoading) ? (
          <div className="text-center text-gray-400 py-4 flex items-center justify-center bg-primary/10 rounded-md">
            Loading {pathname === "/admin-dashboard/all-tenants" ? "Tenants" : "Landlords"}....
            <LoaderIcon className="animate-spin" />
          </div>
        ) : ((pathname !== "/admin-dashboard/all-tenants" && isError) || (pathname === "/admin-dashboard/all-tenants" && allUserError)) ? (
          <div className="text-center py-4 text-red-500">
            Error loading {pathname === "/admin-dashboard/all-tenants" ? "Tenants" : "Landlords"}
          </div>
        ) : (
          <ReusableTable
            data={filteredTenants}
            total={filteredTenants.length}
            isLoading={isLoading || allUserLoading}
            columns={columns}
            actions={actions}
            itemsPerPage={filteredTenants.length}
            currentPage={1}
            onPageChange={() => { }}
            dynamicPagination={false}
            firstColumnWidth="200px"
            className="bg-white"
          />
        )}
      </div>

      {/* Update Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User</DialogTitle>
            <DialogDescription>
              Update the details for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                className="border-gray-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={updatePhone}
                onChange={(e) => setUpdatePhone(e.target.value)}
                className="border-gray-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateLoading}
            >
              {updateLoading ? (
                <LoaderIcon className="animate-spin w-4 h-4 mr-2" />
              ) : null}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-black/20">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(selectedUser?.id)}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <LoaderIcon className="animate-spin w-4 h-4 mr-2" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}