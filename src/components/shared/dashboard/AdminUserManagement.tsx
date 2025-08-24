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
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    useAllUsersQuery,
    useDeleteUserMutation,
    useUpdateUserByAdminMutation,
} from "@/redux/api/authApi";
import { useUploadFileMutation } from "@/redux/api/uploaderApi";
import { LoaderIcon } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { IoSearch } from "react-icons/io5";
import { toast } from "sonner";
import ReusableTable from "../ReusableTable";

export default function AdminUserManagement() {
    const pathname = usePathname();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        phoneNumber: "",
        image: "",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const { data: allUserData, isLoading: allUserLoading, isError: allUserError } =
        useAllUsersQuery(pathname === "/admin-dashboard/all-tenants" ? "tenant" : "landlord");
    const [updateMutate, { isLoading: updateLoading }] = useUpdateUserByAdminMutation();
    const [deleteMutate, { isLoading: deleteLoading }] = useDeleteUserMutation();
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

    const userData = allUserData?.data?.map((data: any) => ({
        id: data._id,
        name: data.name,
        phone: data.phoneNumber,
        email: data.email,
        documentStatus: data.profileVerificationImage.length > 0 ? "Submitted" : "Not Submitted",
        image: data.image || "/placeholder.svg",
        uid: data.uid,  
    })) || [];

    const filteredTenants = userData.filter(
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

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            phoneNumber: user.phone,
            image: user.image,
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = (user: any) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedUser) {
            try {
                await deleteMutate(selectedUser.id).unwrap();
                toast.success("User deleted successfully");
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
            } catch (error) {
                toast.error("Failed to delete user");
            }
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setFormData((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUser) {
            try {
                let imageUrl = formData.image;
                if (imageFile) {
                    const uploadFormData = new FormData();
                    uploadFormData.append("images", imageFile);
                    const uploadResponse = await uploadFile(uploadFormData).unwrap();
                    if (uploadResponse.data && uploadResponse.data.length > 0) {
                        imageUrl = uploadResponse.data[0];
                    } else {
                        toast.error("Image upload failed");
                        return;
                    }
                }

                const updatedData = {
                    name: formData.name,
                    phoneNumber: formData.phoneNumber,
                    image: imageUrl,
                };

                await updateMutate({ id: selectedUser.id, data: updatedData }).unwrap();
                toast.success("User updated successfully");
                setIsEditModalOpen(false);
                setSelectedUser(null);
                setImageFile(null);
            } catch (error) {
                toast.error("Failed to update user");
            }
        }
    };

    const columns = [
        {
            header: "Name",
            accessor: (row: any) => (
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <Image unoptimized src={row.image} alt={row.name} fill className="object-cover" />
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
        {
            header: "Document Status",
            accessor: (row: any) => (
                <Badge
                    variant="secondary"
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                        row.documentStatus === "Submitted"
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                            : "bg-pink-100 text-pink-700 hover:bg-pink-100"
                    }`}
                >
                    {row.documentStatus}
                </Badge>
            ),
            minWidth: "150px",
            maxWidth: "150px",
        },
    ];

    const actions = [
        {
            label: "View user",
            icon: <FiEye className="w-4 h-4" />,
            onClick: handleView,
            className: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
        },
        {
            label: "Edit user",
            icon: <FiEdit className="w-4 h-4" />,
            onClick: handleEdit,
            className: "text-gray-500 hover:text-blue-700 hover:bg-blue-100",
        },
        {
            label: "Delete user",
            icon: <FiTrash2 className="w-4 h-4" />,
            onClick: handleDelete,
            className: "text-gray-500 hover:text-red-700 hover:bg-red-100",
            disabled: deleteLoading,
        },
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
                {allUserLoading ? (
                    <div className="text-center text-gray-400 py-4 flex items-center justify-center bg-primary/10 rounded-md">
                        Loading Tenant.... <LoaderIcon className="animate-spin" />
                    </div>
                ) : allUserError ? (
                    <div className="text-center py-4 text-red-500">Error loading Tenant</div>
                ) : (
                    <ReusableTable
                        data={filteredTenants}
                        total={filteredTenants.length}
                        isLoading={allUserLoading}
                        columns={columns}
                        actions={actions}
                        itemsPerPage={filteredTenants.length}
                        currentPage={1}
                        onPageChange={() => {}}
                        dynamicPagination={false}
                        firstColumnWidth="200px"
                        className="bg-white"
                    />
                )}
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Update the user details below.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="image">Profile Image</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {formData.image && (
                                    <div className="relative w-20 h-20 mt-2">
                                        <Image src={formData.image} alt="Preview" fill className="object-cover rounded" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                disabled={updateLoading || isUploading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateLoading || isUploading}>
                                {updateLoading || isUploading ? (
                                    <>
                                        <LoaderIcon className="animate-spin mr-2" /> Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={deleteLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? (
                                <>
                                    <LoaderIcon className="animate-spin mr-2" /> Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}