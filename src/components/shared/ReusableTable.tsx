/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";

interface Action {
  label: string;
  icon: React.ReactNode;
  onClick: (row: any) => void;
  className?: string;
  disabled?: boolean;
}

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  maxWidth?: string;
  minWidth?: string;
  className?: string;
}

interface ReusableTableProps<T> {
  data: T[];
  total: number;
  isLoading: boolean;
  columns: Column<T>[];
  actions?: Action[];
  itemsPerPage?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
  firstColumnWidth?: string;
  dynamicPagination?: boolean; // New prop
}

const ReusableTable = <T,>({
  data,
  total,
  isLoading,
  columns,
  actions = [],
  itemsPerPage = 10,
  currentPage,
  onPageChange,
  className = "",
  firstColumnWidth = "200px",
  dynamicPagination = true, // Default to true
}: ReusableTableProps<T>) => {
  // Internal state for pagination when dynamicPagination is false
  const [internalPage, setInternalPage] = useState(1);

  // Determine which page to use based on dynamicPagination
  const effectivePage = dynamicPagination ? currentPage : internalPage;

  // Calculate total pages
  const totalPages = Math.ceil(total / itemsPerPage);

  // Slice data for internal pagination when dynamicPagination is false
  const paginatedData = dynamicPagination
    ? data
    : data.slice(
        (effectivePage - 1) * itemsPerPage,
        effectivePage * itemsPerPage
      );

  const handlePrevious = () => {
    if (effectivePage > 1) {
      if (dynamicPagination) {
        onPageChange(currentPage - 1);
      } else {
        setInternalPage((prev) => prev - 1);
      }
    }
  };

  const handleNext = () => {
    if (effectivePage < totalPages) {
      if (dynamicPagination) {
        onPageChange(currentPage + 1);
      } else {
        setInternalPage((prev) => prev + 1);
      }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile table (no sticky first column) */}
      <div className="block md:hidden">
        <div className="relative overflow-x-auto">
          <Table className="w-full min-w-max">
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={String(column.accessor)}
                    className="text-gray-500 font-normal text-sm h-12 px-4 bg-gray-50"
                    style={{
                      minWidth: column.minWidth || "150px",
                      width: column.maxWidth || "150px",
                    }}
                  >
                    {column.header}
                  </TableHead>
                ))}
                {actions.length > 0 && (
                  <TableHead
                    className="text-gray-500 font-normal text-sm h-12 px-4 bg-gray-50"
                    style={{ minWidth: "120px", width: "120px" }}
                  >
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                    className="py-8 text-center text-gray-500"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className="border-none hover:bg-gray-50/50 transition-colors"
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={`${rowIndex}-${String(column.accessor)}`}
                        className={`py-4 px-4 text-gray-700 text-sm ${column.className || ""}`}
                        style={{
                          minWidth: column.minWidth || "150px",
                          width: column.maxWidth || "150px",
                        }}
                      >
                        <div className="truncate">
                          {typeof column.accessor === "function"
                            ? column.accessor(row)
                            : String(row[column.accessor as keyof T])}
                        </div>
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell
                        className="py-4 px-4"
                        style={{ minWidth: "120px", width: "120px" }}
                      >
                        <div className="flex gap-2">
                          {actions.map((action, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              onClick={() => action.onClick(row)}
                              className={action.className}
                              disabled={action.disabled}
                              title={action.label}
                            >
                              {action.icon}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                    className="py-8 text-center text-gray-500"
                  >
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Desktop & Tablet table (first column sticky from md:) */}
      <div className="hidden md:block overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              {columns.map((column, index) => (
                <TableHead
                  key={String(column.accessor)}
                  className={`text-gray-500 font-normal text-sm h-12 px-4 ${index === 0
                        ? "md:sticky md:left-0 md:bg-white md:z-10 md:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                        : ""
                        } ${column.className || ""}`}
                //   className="text-gray-500 font-normal text-sm h-12 px-4"
                  style={{
                    minWidth: column.minWidth || (index === 0 ? firstColumnWidth : "120px"),
                    maxWidth: column.maxWidth,
                    width: column.maxWidth || (index === 0 ? firstColumnWidth : "auto"),
                  }}
                >
                  {column.header}
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead
                  className="text-gray-500 font-normal text-sm h-12 px-4"
                  style={{ minWidth: "120px", width: "120px" }}
                >
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="py-8 text-center text-gray-500"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="border-none hover:bg-gray-50/50 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={`${rowIndex}-${String(column.accessor)}`}
                      className={`py-4 px-4 text-gray-700 ${colIndex === 0
                        ? "md:sticky md:left-0 md:bg-white md:z-10 md:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                        : ""
                        } ${column.className || ""}`}
                      style={{
                        minWidth: column.minWidth || (colIndex === 0 ? firstColumnWidth : "120px"),
                        maxWidth: column.maxWidth,
                        width: column.maxWidth || (colIndex === 0 ? firstColumnWidth : "auto"),
                      }}
                    >
                      <div className="truncate">
                        {typeof column.accessor === "function"
                          ? column.accessor(row)
                          : String(row[column.accessor as keyof T])}
                      </div>
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell
                      className="py-4 px-4"
                      style={{ minWidth: "120px", width: "120px" }}
                    >
                      <div className="flex gap-2">
                        {actions.map((action, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            onClick={() => action.onClick(row)}
                            className={action.className}
                            disabled={action.disabled}
                            title={action.label}
                          >
                            {action.icon}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="py-8 text-center text-gray-500"
                >
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
          <div className="text-sm text-gray-600 order-2 md:order-1">
            Showing {(effectivePage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(effectivePage * itemsPerPage, total)} of {total} entries
          </div>
          <div className="flex gap-2 order-1 md:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={effectivePage === 1 || isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="flex items-center px-3 py-1 text-sm">
              {effectivePage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={effectivePage === totalPages || isLoading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReusableTable;