
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IoSearch } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiChevronLeft, FiChevronRight, FiEye } from "react-icons/fi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useGetAllSupportQuery, useUpdateSupportStatusMutation } from "@/redux/api/supportApi";
import { toast } from "sonner";

interface Message {
  _id: string;
  name?: string;
  email?: string;
  message?: string;
  messageType?: string;
  status?: string;
  createdAt?: string;
  userId?: {
    role?: string;
  };
}

export default function SupportMessagesTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{ email: string; status: string | undefined }>({ email: "", status: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const itemsPerPage = 10;

  const { data, isLoading, isError } = useGetAllSupportQuery({
    filters: {
      email: filters.email || undefined,
      status: filters.status || undefined,
    },
    page: currentPage,
    limit: itemsPerPage,
  });

  const [updateSupportStatus, { isLoading: isUpdating }] = useUpdateSupportStatusMutation();

  const messages: Message[] = data?.data?.messages || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  const filteredMessages = messages.filter(
    (message) =>
      (message.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (message.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (message.messageType?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (message.userId?.role?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = async (id: string) => {
    try {
      await updateSupportStatus({ id, status: "resolved" }).unwrap();
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update message status");
    }
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value === "all" ? "" : value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  if (isError) {
    toast.error("Failed to load support messages", { id: "fetch-error" });
  }

  return (
    <div className="w-full bg-white mb-12">
      {/* Filter and Search Section */}
      <div className="lg:p-6 pb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative max-w-md w-full">
          <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by name, email, type, or user"
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
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="lg:px-6 pb-6">
        <Table>
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-gray-500 font-normal text-sm h-12 px-0">Name</TableHead>
              <TableHead className="text-gray-500 font-normal text-sm h-12 px-4">Message Type</TableHead>
              <TableHead className="text-gray-500 font-normal text-sm h-12 px-4">Message Date</TableHead>
              <TableHead className="text-gray-500 font-normal text-sm h-12 px-4">Email</TableHead>
              <TableHead className="text-gray-500 font-normal text-sm h-12 px-4">User Type</TableHead>
              <TableHead className="text-gray-500 font-normal text-sm h-12 px-4">Status</TableHead>
              <TableHead className="text-gray-500 font-normal text-sm h-12 px-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center">
                  <div className="flex justify-center items-center">
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
                </TableCell>
              </TableRow>
            ) : filteredMessages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-gray-500">
                  No messages found
                </TableCell>
              </TableRow>
            ) : (
              filteredMessages.map((message) => (
                <TableRow key={message._id} className="border-none hover:bg-gray-50/50 transition-colors">
                  <TableCell className="py-4 px-0">
                    <span className="text-gray-900 font-medium text-sm">{message.name || "N/A"}</span>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-gray-700 text-sm capitalize">
                    {message.messageType || "N/A"}
                  </TableCell>
                  <TableCell className="py-4 px-4 text-gray-700 text-sm">
                    {message.createdAt ? new Date(message.createdAt).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell className="py-4 px-4 text-gray-700 text-sm">{message.email || "N/A"}</TableCell>
                  <TableCell className="py-4 px-4">
                    <Badge
                      variant="secondary"
                      className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
                        message.userId?.role === "tenant"
                          ? "bg-background-secondary text-primary hover:bg-amber-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {message.userId?.role || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <Badge
                      variant="secondary"
                      className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
                        message.status === "resolved"
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-background-secondary text-primary hover:bg-amber-100"
                      }`}
                    >
                      {message.status || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-4 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewMessage(message)}
                      className="p-2 hover:bg-gray-100 rounded-md"
                    >
                      <FiEye className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(message._id)}
                      disabled={isUpdating || message.status === "resolved"}
                      className={`text-xs ${message.status === "resolved" ? "opacity-50 cursor-not-allowed" : "hover:bg-amber-50"}`}
                    >
                      {isUpdating ? (
                        <svg
                          className="animate-spin h-4 w-4 text-primary"
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
                      ) : (
                        "Mark as Resolved"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Message Details Modal */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
          <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader className="p-6 border-b border-gray-200">
              <DialogTitle className="text-xl font-semibold text-gray-900">Message Details</DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1 text-gray-900">{selectedMessage?.name || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-gray-900">{selectedMessage?.email || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">User Type</h3>
                <p className="mt-1 text-gray-900 capitalize">{selectedMessage?.userId?.role || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Message Type</h3>
                <p className="mt-1 text-gray-900 capitalize">{selectedMessage?.messageType || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1 text-gray-900 capitalize">{selectedMessage?.status || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Message Date</h3>
                <p className="mt-1 text-gray-900">
                  {selectedMessage?.createdAt ? new Date(selectedMessage.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Message</h3>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedMessage?.message || "N/A"}</p>
              </div>
            </div>
            <DialogFooter className="p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setSelectedMessage(null)}
                className="text-sm text-gray-900 hover:bg-gray-100"
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 p-6 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isLoading}
          className="cursor-pointer p-2 hover:bg-gray-100 rounded-md disabled:opacity-50"
        >
          <FiChevronLeft className="w-4 h-4" />
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "outline" : "ghost"}
            size="sm"
            onClick={() => handlePageChange(page)}
            disabled={isLoading}
            className={`cursor-pointer w-8 h-8 p-0 rounded-md ${
              currentPage === page ? "border-primary text-primary hover:bg-amber-50" : "hover:bg-gray-100"
            }`}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || isLoading}
          className="cursor-pointer p-2 hover:bg-gray-100 rounded-md disabled:opacity-50"
        >
          <FiChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}