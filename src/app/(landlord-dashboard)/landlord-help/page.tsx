/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FiSearch, FiPlus, FiMessageSquare } from "react-icons/fi";
import { ContactFormModal } from "@/components/tenants/help/ContactFormModal";
import { useAddMessageInTicketMutation, useGetOwnSupportTicketQuery } from "@/redux/api/supportApi";
import { toast } from "sonner";
import ReusableTable from "@/components/shared/ReusableTable";

export default function LandlordHelpPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 20;

  const { data, isLoading, isError } = useGetOwnSupportTicketQuery(
    { page: currentPage, limit: itemsPerPage },
    { pollingInterval: 30000 }
  );
  const [addMessage, { isLoading: isAddingMessage }] = useAddMessageInTicketMutation();

  const tickets = data?.data?.tickets || [];
  const total = data?.data?.total || 0;

  const filteredData = tickets.filter(
    (item: any) =>
      item.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Define columns for ReusableTable
  const columns = [
    {
      header: "Ticket Number",
      accessor: (row: any) => (
        <span className="text-gray-900 text-sm">{row.ticketNumber}</span>
      ),
      minWidth: "150px",
      maxWidth: "150px",
    },
    {
      header: "Title",
      accessor: (row: any) => (
        <span className="text-gray-900 text-sm">{row.title}</span>
      ),
      minWidth: "300px",
      maxWidth: "300px",
    },
    {
      header: "Category",
      accessor: (row: any) => (
        <span className="text-gray-700 text-sm capitalize">{row.category}</span>
      ),
      minWidth: "150px",
      maxWidth: "150px",
    },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge
          variant="secondary"
          className="bg-background-secondary text-primary font-medium text-xs px-3 py-1 rounded-md capitalize"
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
      label: "View Messages",
      icon: <FiMessageSquare className="w-4 h-4 mr-2" />,
      onClick: handleViewMessages,
      className: "text-primary hover:text-primary/80",
    },
  ];

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
              data={filteredData}
              total={total}
              isLoading={isLoading}
              columns={columns}
              actions={actions}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              dynamicPagination={true}
              firstColumnWidth="150px"
              className="bg-white"
            />
          )}
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