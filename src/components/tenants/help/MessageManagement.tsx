/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FiSearch, FiPlus, FiChevronLeft, FiChevronRight, FiMessageSquare } from "react-icons/fi";
import { ContactFormModal } from "./ContactFormModal";
import { useAddMessageInTicketMutation, useGetOwnSupportTicketQuery } from "@/redux/api/supportApi";
import { toast } from "sonner";

export default function MessageManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;

const { data, isLoading, isError } = useGetOwnSupportTicketQuery(
  { page: currentPage, limit: itemsPerPage },
  { pollingInterval: 30000 } 
);
  const [addMessage, { isLoading: isAddingMessage }] = useAddMessageInTicketMutation();

  const tickets = data?.data?.tickets || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  const filteredData = tickets.filter(
    (item: any) =>
      item.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewMessages = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsMessagesModalOpen(true);
  };

  const handleAddMessage = async () => {
    if (!replyContent.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    try {
      await addMessage({ id: selectedTicket._id, content: replyContent }).unwrap();
      toast.success("Reply sent successfully");
      setReplyContent("");
      setIsMessagesModalOpen(false);
      setSelectedTicket(null);
    } catch (error) {
      toast.error("Failed to send reply");
    }
  };

  if (isError) {
    toast.error("Failed to load tickets");
  }

  return (
    <div className="w-full min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-b border-gray-200">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by ticket number, title, or category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-6 border-gray-300 focus:border-primary focus:ring-primary"
            />
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/80 cursor-pointer text-white p-6 rounded-lg flex items-center gap-2 whitespace-nowrap"
          >
            <FiPlus className="w-4 h-4" />
            Create a Support Ticket
          </Button>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 hover:bg-transparent">
                <TableHead className="text-gray-500 font-medium text-sm py-4 px-6 w-1/5">Ticket Number</TableHead>
                <TableHead className="text-gray-500 font-medium text-sm py-4 px-6 w-2/5">Title</TableHead>
                <TableHead className="text-gray-500 font-medium text-sm py-4 px-6">Category</TableHead>
                <TableHead className="text-gray-500 font-medium text-sm py-4 px-6">Status</TableHead>
                <TableHead className="text-gray-500 font-medium text-sm py-4 px-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center">
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
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-gray-500">
                    No tickets found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item: any) => (
                  <TableRow key={item._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <TableCell className="py-6 px-6">
                      <span className="text-gray-900 text-sm">{item.ticketNumber}</span>
                    </TableCell>
                    <TableCell className="py-6 px-6">
                      <span className="text-gray-900 text-sm">{item.title}</span>
                    </TableCell>
                    <TableCell className="py-6 px-6">
                      <span className="text-gray-700 text-sm capitalize">{item.category}</span>
                    </TableCell>
                    <TableCell className="py-6 px-6">
                      <Badge
                        variant="secondary"
                        className="bg-background-secondary text-primary font-medium text-xs px-3 py-1 rounded-md capitalize"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-6 px-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewMessages(item)}
                        className="text-primary hover:text-primary/80"
                      >
                        <FiMessageSquare className="w-4 h-4 mr-2" />
                        View Messages
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

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

      {/* Contact Form Modal */}
      <ContactFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Messages Modal */}
      <Dialog open={isMessagesModalOpen} onOpenChange={() => setIsMessagesModalOpen(false)}>
        <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
          <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader className="p-6 border-b border-gray-200">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Ticket: {selectedTicket?.ticketNumber}
              </DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                {selectedTicket?.messages?.map((msg: any) => (
                  <div
                    key={msg._id}
                    className={`p-4 rounded-lg ${
                      msg.sender === "user" ? "bg-gray-100 ml-4" : "bg-primary/10 mr-4"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {msg.sender === "user" ? selectedTicket.userId.name : "Admin"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{msg.content}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={4}
                  className="w-full border-gray-300 focus:border-primary focus:ring-primary"
                />
                <Button
                  onClick={handleAddMessage}
                  disabled={isAddingMessage}
                  className={`mt-4 w-full bg-primary hover:bg-primary/80 text-white rounded-md py-2 ${
                    isAddingMessage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isAddingMessage ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                      Sending...
                    </div>
                  ) : (
                    "Send Reply"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}