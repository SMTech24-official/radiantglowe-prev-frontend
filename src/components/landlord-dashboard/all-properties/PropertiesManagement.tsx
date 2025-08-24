/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Image from "next/image"
import { useState } from "react"
import { IoSearch, IoAdd, IoTrash } from "react-icons/io5"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FiEye } from "react-icons/fi"
import { BiEditAlt } from "react-icons/bi"
import { useRouter } from "next/navigation"
import { useDeleteSinglePropertyMutation, useLandlordPropertyQuery, useUpdatePropertyMutation } from "@/redux/api/propertyApi"
import { LoaderIcon } from "lucide-react"
import { toast } from "sonner"
import EditPropertyModal from "./EditPropertyModal"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ReusableTable from "@/components/shared/ReusableTable"

// Import the shared PropertyFormData type

export default function PropertiesManagement() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null)
  const limit = 10

  // Fetch properties
  const { data, isLoading, isError } = useLandlordPropertyQuery({ page, limit })
  const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation()
  const [deletePropertyFN, { isLoading: isDeleting }] = useDeleteSinglePropertyMutation()

  const properties = data?.data?.properties || []
  const totalProperties = data?.data?.total || 0

  const handleView = (row: any) => {
    router.push(`/all-properties/${row._id}`)
  }

  const handleEdit = (row: any) => {
    setSelectedProperty(row)
    setIsModalOpen(true)
  }

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateProperty({ id, ...data }).unwrap()
      setIsModalOpen(false)
      toast.success("Property updated successfully!")
    } catch (error) {
      toast.error("Error updating property")
    }
  }

  const handleDeleteClick = (row: any) => {
    setPropertyToDelete(row._id)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (propertyToDelete) {
      try {
        await deletePropertyFN(propertyToDelete).unwrap()
        setIsDeleteModalOpen(false)
        setPropertyToDelete(null)
        toast.success("Property deleted successfully!")
      } catch (error) {
        toast.error("Error deleting property")
      }
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalProperties / limit)) {
      setPage(newPage)
    }
  }

  // Filter properties based on search term and status
  const filteredProperties = properties.filter((property: any) => {
    const matchesSearch = property.headlineYourProperty
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || property.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Define columns for ReusableTable
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
        <span className="text-primary text-sm font-medium bg-background-secondary rounded-lg p-2">
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
      minWidth: "120px",
      maxWidth: "120px",
    },
    {
      header: "IsActive",
      accessor: (row: any) => (
        <span
          className={`text-sm font-medium rounded-lg p-2 ${
            row.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
      minWidth: "120px",
      maxWidth: "120px",
    },
    {
      header: "Post Date",
      accessor: (row: any) => (
        <span className="text-gray-700 text-sm">
          {new Date(row.createdAt).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
      minWidth: "120px",
      maxWidth: "120px",
    },
    {
      header: "Properties Location",
      accessor: (row: any) => (
        <span className="text-gray-700 text-sm max-w-xs line-clamp-1 truncate">
          {`${row.location.flatOrHouseNo}, ${row.location.address}, ${row.location.city}, ${row.location.state}`}
        </span>
      ),
      minWidth: "200px",
      maxWidth: "200px",
    },
  ]

  // Define actions for ReusableTable
  const actions = [
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
      onClick: handleDeleteClick,
      className: "text-gray-500 hover:text-red-600 hover:bg-red-50",
      disabled: isDeleting,
    },
  ]

  return (
    <div className="w-full bg-white">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:p-6 pb-4">
        {/* Search Bar */}
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

        {/* Action Buttons */}
        <div className="w-full md:w-auto flex items-center justify-between gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-20 h-10 border-gray-200 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">All</SelectItem>
              <SelectItem value="rented" className="cursor-pointer">Rented</SelectItem>
              <SelectItem value="available" className="cursor-pointer">Available</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => router.push('/add-properties')}
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
          <div className="text-center text-gray-400 py-4 flex items-center justify-center bg-primary/10 rounded-md">
            Loading properties.... <LoaderIcon className="animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-4 text-red-500">Error loading properties</div>
        ) : (
          <ReusableTable
            data={filteredProperties}
            total={totalProperties}
            isLoading={isLoading}
            columns={columns}
            actions={actions}
            itemsPerPage={limit}
            currentPage={page}
            onPageChange={handlePageChange}
            dynamicPagination={true}
            firstColumnWidth="250px"
            className="bg-white"
          />
        )}
      </div>

      {/* Edit Property Modal */}
      <EditPropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        property={selectedProperty}
        onUpdate={handleUpdate}
        buttonLoading={isUpdating}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <LoaderIcon className="animate-spin mr-2 h-4 w-4" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}