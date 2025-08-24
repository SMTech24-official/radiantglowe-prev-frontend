/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IoSearch } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiChevronLeft, FiChevronRight, FiEye } from "react-icons/fi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useGetAllHireQuery, useUpdateHireStatusMutation } from "@/redux/api/hireApi";
import { toast } from "sonner";
import ReusableTable from "@/components/shared/ReusableTable";


interface HireRequest {
  _id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  briefMessage?: string;
  status?: string;
  createdAt?: string;
  userId?: {
    role?: string;
    email?: string;
    name?: string;
  };
  address?: {
    state?: string;
    city?: string;
    town?: string;
    area?: string;
  };
}

export default function HireProfessionalPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{ email: string; status: string | undefined }>({ email: "", status: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHire, setSelectedHire] = useState<HireRequest | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const itemsPerPage = 10;

  const { data, isLoading, isError } = useGetAllHireQuery({
    email: filters.email || undefined,
    status: filters.status || undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  const [updateHireStatus, { isLoading: isUpdating }] = useUpdateHireStatusMutation();

  const hireRequests: HireRequest[] = data?.data?.hireRequests || [];
  const total = data?.data?.total || 0;

  const filteredHireRequests = hireRequests.filter(
    (hire) =>
      (hire.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (hire.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (hire.userId?.role?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      await updateHireStatus({ id, status: newStatus }).unwrap();
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update hire request status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleViewHire = (hire: HireRequest) => {
    setSelectedHire(hire);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value === "all" ? "" : value }));
    setCurrentPage(1);
  };

  if (isError) {
    toast.error("Failed to load hire requests", { id: "fetch-error" });
  }

  const columns = [
    {
      header: "Name",
      accessor: (row: any) => (
        <span className="text-gray-900 font-medium text-sm">{row.name || "N/A"}</span>
      ),
      minWidth: "150px",
      maxWidth: "150px",
      className: "px-0",
    },
    {
      header: "Email",
      accessor: (row: any) => (
        <span className="text-gray-700 text-sm">{row.email || "N/A"}</span>
      ),
      minWidth: "200px",
      maxWidth: "200px",
    },
    {
      header: "Phone Number",
      accessor: (row: any) => (
        <span className="text-gray-700 text-sm">{row.phoneNumber || "N/A"}</span>
      ),
      minWidth: "150px",
      maxWidth: "150px",
    },
    {
      header: "Message",
      accessor: (row: any) => (
        <span className="text-gray-700 text-sm">
          {row.briefMessage ? row.briefMessage.slice(0, 50) + (row.briefMessage.length > 50 ? "..." : "") : "N/A"}
        </span>
      ),
      minWidth: "200px",
      maxWidth: "200px",
    },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge
          variant="secondary"
          className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
            row.status === "resolved"
              ? "bg-green-50 text-green-700 hover:bg-green-100"
              : row.status === "in_progress"
              ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
              : row.status === "closed"
              ? "bg-gray-50 text-gray-700 hover:bg-gray-100"
              : "bg-background-secondary text-primary hover:bg-amber-100"
          }`}
        >
          {row.status === "in_progress" ? "In Progress" : row.status || "N/A"}
        </Badge>
      ),
      minWidth: "120px",
      maxWidth: "120px",
    },
    {
      header: "Date",
      accessor: (row: any) => (
        <span className="text-gray-700 text-sm">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A"}
        </span>
      ),
      minWidth: "120px",
      maxWidth: "120px",
    },
    {
      header: "User Type",
      accessor: (row: any) => (
        <Badge
          variant="secondary"
          className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
            row.userId?.role === "tenant"
              ? "bg-background-secondary text-primary hover:bg-amber-100"
              : "bg-green-50 text-green-700 hover:bg-green-100"
          }`}
        >
          {row.userId?.role || "N/A"}
        </Badge>
      ),
      minWidth: "120px",
      maxWidth: "120px",
    },
    {
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewHire(row)}
            className="p-1 flex items-center gap-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <FiEye className="w-4 h-4" />
            <span>View</span>
          </button>
          <Select
            onValueChange={(value) => handleStatusChange(row._id, value)}
            defaultValue={row.status}
            disabled={isUpdatingStatus}
          >
            <SelectTrigger className="w-32 border-gray-300 focus:border-primary focus:ring-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
      minWidth: "200px",
      maxWidth: "200px",
    },
  ];

  return (
    <div className="w-full bg-white mb-12">
      {/* Filter and Search Section */}
      <div className="lg:p-6 pb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative max-w-md w-full">
          <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by name, email, or user type"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 border-gray-200 focus:border-gray-300 focus:ring-0"
          />
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Filter by email"
            value={filters.email}
            onChange={(e) => handleFilterChange("email", e.target.value)}
            className="h-10 border-gray-200 focus:border-gray-300 focus:ring-0 max-w-xs"
          />
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-40 h-10 border-gray-200 focus:border-gray-300 focus:ring-0">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="lg:px-6 pb-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : (
          <ReusableTable
            data={filteredHireRequests}
            total={total}
            isLoading={isLoading}
            columns={columns}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            dynamicPagination={true}
            firstColumnWidth="150px"
            className="bg-white"
          />
        )}
      </div>

      {/* Hire Request Details Modal */}
      <Dialog open={!!selectedHire} onOpenChange={() => setSelectedHire(null)}>
        <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
          <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader className="p-6 border-b border-gray-200">
              <DialogTitle className="text-xl font-semibold text-gray-900">Hire Request Details</DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1 text-gray-900">{selectedHire?.name || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-gray-900">{selectedHire?.email || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                <p className="mt-1 text-gray-900">{selectedHire?.phoneNumber || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">User Type</h3>
                <p className="mt-1 text-gray-900 capitalize">{selectedHire?.userId?.role || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1 text-gray-900">
                  {selectedHire?.address
                    ? `${selectedHire.address.state || "N/A"}, ${selectedHire.address.city || "N/A"}, ${selectedHire.address.town || "N/A"}, ${selectedHire.address.area || "N/A"}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Brief Message</h3>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedHire?.briefMessage || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1 text-gray-900 capitalize">{selectedHire?.status === "in_progress" ? "In Progress" : selectedHire?.status || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Request Date</h3>
                <p className="mt-1 text-gray-900">
                  {selectedHire?.createdAt ? new Date(selectedHire.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
            <DialogFooter className="p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setSelectedHire(null)}
                className="text-sm text-gray-900 hover:bg-gray-100"
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}