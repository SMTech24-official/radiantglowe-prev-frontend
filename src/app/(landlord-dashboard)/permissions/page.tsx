/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "lucide-react";
import { useOwnTenantRequestQuery, useStatusUpdatePermissionMutation } from "@/redux/api/permissionApi";
import { toast } from "sonner";
import ReusableTable from "@/components/shared/ReusableTable";

export default function PermissionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, isError } = useOwnTenantRequestQuery();
  const [updateStatus, { isLoading: updateLoading }] = useStatusUpdatePermissionMutation();

  const filteredPermissions = data?.data?.permissions?.filter((permission: any) =>
    permission.tenantId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.tenantId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.propertyId.headlineYourProperty.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleStatusUpdate = async (id: string, status: "granted" | "denied") => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  // Define columns for ReusableTable
  const columns = [
    {
      header: "Tenant Name",
      accessor: (row: any) => (
        <span className="text-gray-900 font-medium text-sm">{row.tenantId.name}</span>
      ),
      minWidth: "200px",
      maxWidth: "200px",
      className: "px-0",
    },
    {
      header: "Email",
      accessor: (row: any) => (
        <span className="text-gray-700 text-sm">{row.tenantId.email}</span>
      ),
      minWidth: "200px",
      maxWidth: "200px",
    },
    {
      header: "Property Headline",
      accessor: (row: any) => (
        <span className="text-gray-700 text-sm">{row.propertyId.headlineYourProperty}</span>
      ),
      minWidth: "200px",
      maxWidth: "200px",
    },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge
          variant="secondary"
          className={`text-xs font-medium px-3 py-1 rounded-full ${
            row.status === "granted"
              ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
              : row.status === "pending"
              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
              : "bg-red-100 text-red-700 hover:bg-red-100"
          }`}
        >
          {row.status}
        </Badge>
      ),
      minWidth: "120px",
      maxWidth: "120px",
    },
  ];

  // Define actions for ReusableTable
  const actions = [
    {
      label: "Accept",
      icon: updateLoading ? <LoaderIcon className="animate-spin w-4 h-4 mr-2" /> : 'Accept',
      onClick: (row: any) => handleStatusUpdate(row._id, "granted"),
      className: "text-green-600 hover:text-green-700 hover:bg-green-100",
      disabled: updateLoading,
    },
    {
      label: "Reject",
      icon: updateLoading ? <LoaderIcon className="animate-spin w-4 h-4 mr-2" /> : 'Reject',
      onClick: (row: any) => handleStatusUpdate(row._id, "denied"),
      className: "text-red-600 hover:text-red-700 hover:bg-red-100",
      disabled: updateLoading,
    },
  ];

  return (
    <div>
      {/* Search Bar */}
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
        {isLoading ? (
          <div className="text-center text-gray-400 py-4 flex items-center justify-center bg-primary/10 rounded-md">
            Loading Permissions...
            <LoaderIcon className="animate-spin ml-2" />
          </div>
        ) : isError ? (
          <div className="text-center py-4 text-red-500">
            Error loading permissions
          </div>
        ) : (
          <ReusableTable
            data={filteredPermissions}
            total={filteredPermissions.length} 
            isLoading={isLoading}
            columns={columns}
            actions={actions}
            itemsPerPage={filteredPermissions.length} 
            currentPage={1} 
            onPageChange={() => {}} 
            dynamicPagination={false} 
            firstColumnWidth="200px"
            className="bg-white"
          />
        )}
      </div>
    </div>
  );
}