/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IoSearch } from "react-icons/io5";
import { FiChevronLeft, FiChevronRight, FiCalendar, FiX } from "react-icons/fi";
import { useGetAllSubscriptionQuery, useRefundSubscriptionMutation } from "@/redux/api/subscriptionApi";
import { toast } from "sonner";
import { symbol } from "@/utils/symbol";

// Define TypeScript interface for Subscription
interface Subscription {
  _id: string;
  landlord: {
    _id: string;
    email: string;
    name?: string;
  };
  package: {
    _id: string;
    name: string;
    price: number;
  };
  previousPackage?: {
    _id: string;
    name: string;
  };
  status: string;
  state: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  paymentIntentId: string;
}

type FilterType = 'dates' | 'month' | 'week' | 'year';

export default function SubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<FilterType>('dates');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const itemsPerPage = 10;

  // View modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const { data, isLoading, isError } = useGetAllSubscriptionQuery();
  const [refundMutate, { isLoading: isRefundLoading }] = useRefundSubscriptionMutation();

  const subscriptions: Subscription[] = data?.data || [];

  // Refund modal states
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundTargetId, setRefundTargetId] = useState<string | null>(null);

  // Get unique years, months, and weeks from data
  const availableOptions = useMemo(() => {
    const years = new Set<string>();
    const months = new Set<string>();
    const weeks = new Set<string>();

    subscriptions.forEach(sub => {
      const date = new Date(sub.startDate);
      years.add(date.getFullYear().toString());
      months.add(date.toLocaleString('default', { year: 'numeric', month: 'long' }));

      // Get week range
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      const weekLabel = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      weeks.add(`${startOfWeek.toISOString().split('T')[0]}_${endOfWeek.toISOString().split('T')[0]}|${weekLabel}`);
    });

    return {
      years: Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)),
      months: Array.from(months).sort((a, b) => new Date(b + ' 1').getTime() - new Date(a + ' 1').getTime()),
      weeks: Array.from(weeks).sort((a, b) => {
        const [aStart] = a.split('|')[0].split('_');
        const [bStart] = b.split('|')[0].split('_');
        return new Date(bStart).getTime() - new Date(aStart).getTime();
      })
    };
  }, [subscriptions]);

  // Calendar helper function
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dateString: prevDate.toISOString().split('T')[0]
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        dateString: currentDate.toISOString().split('T')[0]
      });
    }

    // Next month days to complete the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dateString: nextDate.toISOString().split('T')[0]
      });
    }

    return days;
  };

  const handleDateClick = (dateString: string) => {
    setSelectedDates(prev => {
      if (prev.includes(dateString)) {
        return prev.filter(d => d !== dateString);
      } else {
        return [...prev, dateString];
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedDates([]);
    setSelectedMonth('');
    setSelectedWeek('');
    setSelectedYear('');
  };

  // Filter subscriptions based on selected filter type
  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptions;

    if (filterType === 'dates' && selectedDates.length > 0) {
      filtered = filtered.filter(sub => {
        const subDate = new Date(sub.startDate).toISOString().split('T')[0];
        return selectedDates.includes(subDate);
      });
    } else if (filterType === 'month' && selectedMonth) {
      filtered = filtered.filter(sub => {
        const subMonth = new Date(sub.startDate).toLocaleString('default', { year: 'numeric', month: 'long' });
        return subMonth === selectedMonth;
      });
    } else if (filterType === 'week' && selectedWeek) {
      const [weekStart, weekEnd] = selectedWeek.split('|')[0].split('_');
      const weekStartDate = new Date(weekStart);
      const weekEndDate = new Date(weekEnd);
      filtered = filtered.filter(sub => {
        const subDate = new Date(sub.startDate);
        const subStartOfWeek = new Date(subDate);
        subStartOfWeek.setDate(subDate.getDate() - subDate.getDay());
        return subStartOfWeek.getTime() === weekStartDate.getTime();
      });
    } else if (filterType === 'year' && selectedYear) {
      filtered = filtered.filter(sub => {
        const subYear = new Date(sub.startDate).getFullYear().toString();
        return subYear === selectedYear;
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sub =>
        (sub.landlord.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (sub.landlord.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (sub.package.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (sub.previousPackage?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [subscriptions, filterType, selectedDates, selectedMonth, selectedWeek, selectedYear, searchTerm]);

  // Calculate total earnings for the filtered subscriptions
  const totalEarnings = filteredSubscriptions.reduce((sum, sub) => sum + (sub.package.price || 0), 0);

  // Pagination calculations
  const total = filteredSubscriptions.length;
  const totalPages = Math.ceil(total / itemsPerPage);
  const paginatedSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterTypeChange = (newFilterType: FilterType) => {
    setFilterType(newFilterType);
    clearAllFilters();
    setCurrentPage(1);
  };

  // View modal handlers
  const openViewModal = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedSubscription(null);
  };

  // Refund modal handlers
  const openRefundModal = (id: string) => {
    setRefundTargetId(id);
    setRefundReason("");
    setShowRefundModal(true);
  };

  const closeRefundModal = () => {
    setShowRefundModal(false);
    setRefundTargetId(null);
    setRefundReason("");
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      toast.error("Please provide a reason for refund.");
      return;
    }
    if (!refundTargetId) return;

    try {
      await refundMutate({ id: refundTargetId, reason: refundReason }).unwrap();
      toast.success("Refund processed successfully.");
      closeRefundModal();
    } catch (error) {
      toast.error("Failed to process refund.");
    }
  };

  if (isError) {
    toast.error("Failed to load subscriptions", { id: "fetch-error" });
  }

  const calendarDays = getDaysInMonth(calendarMonth);

  return (
    <div className="w-full bg-white mb-12">
      {/* Search and Filter Section */}
      <div className="lg:p-6 pb-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative max-w-md w-full">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by landlord name, email, package, or previous package"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-gray-200 focus:border-gray-300 focus:ring-0"
              aria-label="Search subscriptions"
            />
          </div>

          {/* Total Earnings */}
          <div className="text-sm font-medium text-gray-700">
            Total Earnings: <span className="text-primary font-semibold">{symbol.nigeria}{totalEarnings.toFixed(2)}</span>
          </div>
        </div>

        {/* Filter Type Selection */}
        <div className="flex flex-wrap gap-2">
          {(['dates', 'month', 'year'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleFilterTypeChange(type)}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors capitalize ${
                filterType === type
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type === 'dates' ? 'Select Dates' : `Filter by ${type}`}
            </button>
          ))}
          {(selectedDates.length > 0 || selectedMonth || selectedWeek || selectedYear) && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm rounded-lg border bg-red-50 text-red-600 border-red-200 hover:bg-red-100 flex items-center gap-2"
            >
              <FiX className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4">
          {/* Calendar for Date Selection */}
          {filterType === 'dates' && (
            <div className="relative">
              <Button
                onClick={() => setShowCalendar(!showCalendar)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FiCalendar className="w-4 h-4" />
                Select Dates {selectedDates.length > 0 && `(${selectedDates.length})`}
              </Button>

              {showCalendar && (
                <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg z-50 p-4">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-sm font-medium">
                      {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Calendar Days of Week */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-xs font-medium text-gray-500 text-center">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => day.isCurrentMonth && handleDateClick(day.dateString)}
                        className={`p-2 text-xs text-center rounded transition-colors ${
                          !day.isCurrentMonth
                            ? 'text-gray-300 cursor-not-allowed'
                            : selectedDates.includes(day.dateString)
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        disabled={!day.isCurrentMonth}
                      >
                        {day.date.getDate()}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t flex justify-end">
                    <Button
                      onClick={() => setShowCalendar(false)}
                      variant="outline"
                      size="sm"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Month Filter */}
          {filterType === 'month' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
            >
              <option value="">All Months</option>
              {availableOptions.months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          )}

          {/* Week Filter */}
          {filterType === 'week' && (
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
            >
              <option value="">All Weeks</option>
              {availableOptions.weeks.map((week) => {
                const [value, label] = week.split('|');
                return (
                  <option key={value} value={week}>
                    {label}
                  </option>
                );
              })}
            </select>
          )}

          {/* Year Filter */}
          {filterType === 'year' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
            >
              <option value="">All Years</option>
              {availableOptions.years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Selected Filters Display */}
        {(selectedDates.length > 0 || selectedMonth || selectedWeek || selectedYear) && (
          <div className="flex flex-wrap gap-2">
            {selectedDates.map(date => (
              <span key={date} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                <button onClick={() => handleDateClick(date)} className="hover:text-blue-600">
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedMonth && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                {selectedMonth}
                <button onClick={() => setSelectedMonth('')} className="hover:text-green-600">
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedWeek && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center gap-1">
                {selectedWeek.split('|')[1]}
                <button onClick={() => setSelectedWeek('')} className="hover:text-purple-600">
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedYear && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                {selectedYear}
                <button onClick={() => setSelectedYear('')} className="hover:text-yellow-600">
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Subscriptions Table */}
      <div className="lg:px-6 pb-6">
        <Table>
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-gray-500 font-normal text-sm h-12 px-0">Landlord Name</TableHead>
              <TableHead className="text-gray-500 font-normal text-sm h-12 px-4">Email</TableHead>
              <TableHead className="text-gray-500 font-normal text-sm h-12 px-4">
                Package <span className="text-green-700 font-semibold">(Current)</span>
              </TableHead>
              <TableHead className="text-gray-500 font-normal text-sm h-12 px-4">Package (Previous)</TableHead>
              <TableHead className="text-gray-500 font-normal text-sm h-12 px-4">Current Package Price</TableHead>
              <TableHead className="text-gray-500 font-normal text-sm h-12 px-4">Status</TableHead>
              <TableHead className="text-gray-500 font-normal text-sm h-12 px-4">Action</TableHead>
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
            ) : paginatedSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-gray-500">
                  No subscriptions found
                </TableCell>
              </TableRow>
            ) : (
              paginatedSubscriptions.map((sub) => (
                <TableRow key={sub._id} className="border-none hover:bg-gray-50/50 transition-colors">
                  <TableCell className="py-4 px-0">
                    <span className="text-gray-900 font-medium text-sm">{sub.landlord.name || "N/A"}</span>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-gray-700 text-sm">{sub.landlord.email || "N/A"}</TableCell>
                  <TableCell className="py-4 px-4 text-gray-700 text-sm">{sub.package.name || "N/A"}</TableCell>
                  <TableCell className="py-4 px-4 text-gray-700 text-sm">{sub.previousPackage?.name || "N/A"}</TableCell>
                  <TableCell className="py-4 px-4 text-gray-700 text-sm">
                    {sub.package.price ? `${symbol.nigeria}${sub.package.price.toFixed(2)}` : "N/A"}
                  </TableCell>
                  <TableCell className="py-4 px-4 text-gray-700 text-sm">
                    <span className={`${
                      sub.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    } inline-block px-2 py-1 rounded-full`}>{sub.status || "N/A"}</span>
                  </TableCell>
                  <TableCell className="py-4 px-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openViewModal(sub)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRefundModal(sub._id)}
                      disabled={isRefundLoading || sub.status !== "active"}
                    >
                      Refund
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <span className="text-sm text-gray-700">
          Showing <span className="font-semibold">{paginatedSubscriptions.length}</span> of <span className="font-semibold">{total}</span> subscriptions
        </span>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            <FiChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700">{currentPage}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <FiChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Subscription Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Subscription ID:</span>
                <span className="text-sm text-gray-900">{selectedSubscription._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Landlord Name:</span>
                <span className="text-sm text-gray-900">{selectedSubscription.landlord.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Landlord Email:</span>
                <span className="text-sm text-gray-900">{selectedSubscription.landlord.email || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Current Package:</span>
                <span className="text-sm text-gray-900">{selectedSubscription.package.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Package Price:</span>
                <span className="text-sm text-gray-900">
                  {selectedSubscription.package.price ? `${symbol.nigeria}${selectedSubscription.package.price.toFixed(2)}` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Previous Package:</span>
                <span className="text-sm text-gray-900">{selectedSubscription.previousPackage?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className={`text-sm ${
                  selectedSubscription.status === "active" ? "text-green-800" : "text-yellow-800"
                }`}>{selectedSubscription.status || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">State:</span>
                <span className="text-sm text-gray-900">{selectedSubscription.state || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Start Date:</span>
                <span className="text-sm text-gray-900">
                  {new Date(selectedSubscription.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">End Date:</span>
                <span className="text-sm text-gray-900">
                  {new Date(selectedSubscription.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Created At:</span>
                <span className="text-sm text-gray-900">
                  {new Date(selectedSubscription.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Updated At:</span>
                <span className="text-sm text-gray-900">
                  {new Date(selectedSubscription.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Payment Intent ID:</span>
                <span className="text-sm text-gray-900">{selectedSubscription.paymentIntentId || "N/A"}</span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="ghost" onClick={closeViewModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Refund Subscription</h2>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Reason for refund:
              <Input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason"
                className="mt-1"
                aria-label="Refund reason"
              />
            </label>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={closeRefundModal} disabled={isRefundLoading}>
                Cancel
              </Button>
              <Button onClick={handleRefund} disabled={isRefundLoading || !refundReason.trim()}>
                {isRefundLoading ? "Processing..." : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}