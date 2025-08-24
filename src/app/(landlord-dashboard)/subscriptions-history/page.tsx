/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button'; // Adjust the import path as needed
import { RefreshCw, Eye } from 'lucide-react'; // Replaced MessageSquare/FileText with Eye for view
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'; // Adjust import for your dialog component
import { useGetLandlordSubscriptionQuery } from '@/redux/api/subscriptionApi';
import ReusableTable from '@/components/shared/ReusableTable';
import { symbol } from '@/utils/symbol';

const Page = () => {
  const { data, isLoading, isError, refetch } = useGetLandlordSubscriptionQuery();
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  // Define columns for the subscription table
  const columns = [
    {
      header: 'Package',
      accessor: (row:any) => row.package.name,
      minWidth: '150px',
    },
    {
      header: 'Price',
      accessor: (row:any) => `${symbol.nigeria}${row.package.price / 100}`,
      minWidth: '100px',
    },
    {
      header: 'Duration',
      accessor: (row:any) => row.package.duration,
      minWidth: '120px',
    },
    {
      header: 'Duration (Days)',
      accessor: (row:any) => row.package.durationInDays,
      minWidth: '120px',
    },
    {
      header: 'State',
      accessor: (row:any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.state === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.state}
        </span>
      ),
      minWidth: '100px',
    },
    {
      header: 'Active',
      accessor: (row:any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.package.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.package.isActive ? 'Yes' : 'No'}
        </span>
      ),
      minWidth: '100px',
    },
    {
      header: 'Previous Package',
      accessor: (row:any) => row.previousPackage?.name || 'None',
      minWidth: '150px',
    },
    {
      header: 'Payment Intent ID',
      accessor: (row:any) => row.paymentIntentId,
      minWidth: '150px',
    },
    {
      header: 'Actions',
      accessor: (row:any) => (
        <div className="flex items-center gap-2">
          <Button
          
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSubscription(row)}
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
      minWidth: '100px',
    },
  ];

  // Production-grade loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
        <p className="mt-4 text-gray-600 text-lg font-medium">Loading subscriptions...</p>
      </div>
    );
  }

  // Production-grade error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-gray-50 p-6 rounded-lg">
        <div className="text-red-600 text-2xl font-semibold mb-2">Something went wrong</div>
        <p className="text-gray-600 mb-4 text-center max-w-md">
          We couldn’t load the subscriptions. Please try again or contact support if the issue persists.
        </p>
        <Button
          onClick={() => refetch()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Landlord Subscriptions</h1>
      <ReusableTable
        data={data?.data || []}
        total={data?.data?.length || 0}
        isLoading={isLoading}
        columns={columns}
        itemsPerPage={data?.data?.length || 10}
        currentPage={1}
        onPageChange={() => {}}
        dynamicPagination={false}
        firstColumnWidth="200px"
        className="bg-white"
      />
      {/* Modal for viewing subscription details */}
      <Dialog open={!!selectedSubscription} onOpenChange={() => setSelectedSubscription(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto]">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogClose />
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-6">
              {/* Current Package Details */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Current Package</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {(selectedSubscription as any).package.name}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span> ${(selectedSubscription as any).package.price / 100}
                  </div>
                  <div>
                    <span className="font-medium">Description:</span> {(selectedSubscription as any).package.description}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {(selectedSubscription as any).package.duration}
                  </div>
                  <div>
                    <span className="font-medium">Duration (Days):</span> {(selectedSubscription as any).package.durationInDays}
                  </div>
                  <div>
                    <span className="font-medium">State:</span> {(selectedSubscription as any).package.state}
                  </div>
                  <div>
                    <span className="font-medium">Active:</span> {(selectedSubscription as any).package.isActive ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className="font-medium">Property Limit:</span> {(selectedSubscription as any).package.propertyLimit}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Features:</span>
                    <ul className="list-disc pl-5">
                      {(selectedSubscription as any).package.features.map((feature:any, index:any) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              {/* Previous Package Details */}
              {(selectedSubscription as any)?.previousPackage && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Previous Package</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {(selectedSubscription as any).previousPackage.name}
                    </div>
                    <div>
                      <span className="font-medium">Price:</span> ${(selectedSubscription as any).previousPackage.price / 100}
                    </div>
                    <div>
                      <span className="font-medium">Description:</span> {(selectedSubscription as any).previousPackage.description}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {(selectedSubscription as any).previousPackage.duration}
                    </div>
                    <div>
                      <span className="font-medium">Duration (Days):</span> {(selectedSubscription as any).previousPackage.durationInDays}
                    </div>
                    <div>
                      <span className="font-medium">State:</span> {(selectedSubscription as any).previousPackage.state}
                    </div>
                    <div>
                      <span className="font-medium">Active:</span> {(selectedSubscription as any).previousPackage.isActive ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <span className="font-medium">Property Limit:</span> {(selectedSubscription as any).previousPackage.propertyLimit}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Features:</span>
                      <ul className="list-disc pl-5">
                        {(selectedSubscription as any).previousPackage.features.map((feature:any, index:any) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;