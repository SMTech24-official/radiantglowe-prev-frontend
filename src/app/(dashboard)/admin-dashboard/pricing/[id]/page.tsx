/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGetSinglePackageQuery, useStatusUpdatePackageMutation, useUpdatePackageMutation, useDeletePackageMutation } from "@/redux/api/packageApi";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Define TypeScript interfaces for type safety
export interface IPackage {
  _id: string;
  name: string;
  description?: string;
  price: number;
  duration: 'FREE' | 'MONTHLY' | 'YEARLY';
  durationInDays: number | 'UNLIMITED';
  state: 'PAID' | 'FREE';
  features: string[];
  bgColor?: string;
  textColor?: string;
  isFreePromo?: boolean;
  freePromoText?: string;
  propertyLimit: number;
  isActive: boolean;
}

interface FormData {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: 'FREE' | 'MONTHLY' | 'YEARLY';
  durationInDays: string;
  state: 'PAID' | 'FREE';
  features: string[];
  bgColor: string;
  textColor: string;
  isFreePromo: boolean;
  freePromoText: string;
  propertyLimit: number;
  isActive: boolean;
}

// Helper function to map API data to form data
const mapPackageToFormData = (pkg: IPackage): FormData => ({
  id: pkg._id,
  name: pkg.name,
  description: pkg.description || "",
  price: pkg.price.toString(),
  duration: pkg.duration,
  durationInDays: pkg.durationInDays.toString(),
  state: pkg.state,
  features: pkg.features,
  bgColor: pkg.bgColor || "#ffffff",
  textColor: pkg.textColor || "#000000",
  isFreePromo: pkg.isFreePromo || false,
  freePromoText: pkg.freePromoText || "",
  propertyLimit: pkg.propertyLimit || 0,
  isActive: pkg.isActive,
});

export default function AdminPriceDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data, isLoading, isError, error } = useGetSinglePackageQuery(id);
  const [updatePackage, { isLoading: isUpdating }] = useUpdatePackageMutation();
  const [updateStatus, { isLoading: isStatusUpdating }] = useStatusUpdatePackageMutation();
  const [deletePackage, { isLoading: isDeleting }] = useDeletePackageMutation();

  const [formData, setFormData] = useState<FormData | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (data?.data) {
      setFormData(mapPackageToFormData(data.data));
    }
  }, [data]);

  const handleChange = (field: keyof FormData, value: string | boolean | number) => {
    if (formData) {
      const newData = { ...formData, [field]: value };
      if (field === 'state' && value === 'FREE') {
        newData.price = '0';
      }
      setFormData(newData);
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    if (formData) {
      const updatedFeatures = [...formData.features];
      updatedFeatures[index] = value;
      setFormData({ ...formData, features: updatedFeatures });
    }
  };

  const handleAddFeature = () => {
    if (formData) {
      setFormData({ ...formData, features: [...formData.features, ""] });
    }
  };

  const handleSubmit = async () => {
    if (!formData) return;

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: formData.duration,
        durationInDays: formData.durationInDays === "UNLIMITED" ? "UNLIMITED" : parseInt(formData.durationInDays),
        state: formData.state,
        features: formData.features.filter(f => f.trim() !== ''),
        bgColor: formData.bgColor,
        textColor: formData.textColor,
        isFreePromo: formData.isFreePromo,
        freePromoText: formData.freePromoText,
        propertyLimit: formData.propertyLimit,
        isActive: formData.isActive,
      };

      await updatePackage({ id, data: payload }).unwrap();
      toast.success("Pricing plan updated successfully!");
    } catch (err) {
      toast.error("Failed to update pricing plan. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await deletePackage(id).unwrap();
      toast.success("Pricing plan deleted successfully!");
      setIsDeleteModalOpen(false);
      router.push("/admin-dashboard/pricing");
    } catch (err) {
      toast.error("Failed to delete pricing plan. Please try again.");
    }
  };

  const handleStatusChange = async (checked: boolean) => {
    try {
      await updateStatus({ id, status: checked }).unwrap();
      handleChange("isActive", checked);
      toast.success(`Plan ${checked ? "activated" : "deactivated"} successfully!`);
    } catch (err) {
      toast.error("Failed to update plan status. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl lg:p-6 mb-16 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl lg:p-6 mb-16">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">
            {(error as any)?.message || "Failed to load pricing plan. Please try again later."}
          </span>
        </div>
      </div>
    );
  }

  if (!formData) {
    return <p className="p-6">No plan found.</p>;
  }

  return (
    <div className="max-w-4xl lg:p-6 mb-16">
      <div className="flex justify-between items-center gap-2">
        <h1 className="text-2xl font-semibold mb-6">Edit Pricing Plan</h1>
        <div className="flex items-center gap-3 mt-4">
          <Label>Active</Label>
          <Switch
            className="cursor-pointer"
            checked={formData.isActive}
            onCheckedChange={handleStatusChange}
            disabled={isStatusUpdating}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={isUpdating}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            disabled={isUpdating}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label>Price</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleChange("price", e.target.value)}
              disabled={isUpdating || formData.state === "FREE"}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label>Duration</Label>
            <select
              value={formData.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
              disabled={isUpdating}
              className="w-full border rounded-md p-2"
            >
              <option value="FREE">Free</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <Label>Duration (in Days)</Label>
            <select
              value={formData.durationInDays}
              onChange={(e) => handleChange("durationInDays", e.target.value)}
              disabled={isUpdating}
              className="w-full border rounded-md p-2"
            >
              <option value="UNLIMITED">Unlimited</option>
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
              <option value="180">180 Days</option>
              <option value="365">365 Days</option>
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <Label>Property Limit</Label>
            <Input
              type="number"
              value={formData.propertyLimit}
              onChange={(e) => handleChange("propertyLimit", parseInt(e.target.value))}
              disabled={isUpdating}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>State</Label>
          <Input
            value={formData.state}
            readOnly
            disabled
            className="bg-gray-100"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label>Background Color</Label>
            <div className="flex items-center gap-4">
              <Input
                type="color"
                value={formData.bgColor}
                onChange={(e) => handleChange("bgColor", e.target.value)}
                disabled={isUpdating}
                className="w-16 h-10 p-1"
              />
              <Input
                type="text"
                value={formData.bgColor}
                onChange={(e) => handleChange("bgColor", e.target.value)}
                disabled={isUpdating}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <Label>Text Color</Label>
            <div className="flex items-center gap-4">
              <Input
                type="color"
                value={formData.textColor}
                onChange={(e) => handleChange("textColor", e.target.value)}
                disabled={isUpdating}
                className="w-16 h-10 p-1"
              />
              <Input
                type="text"
                value={formData.textColor}
                onChange={(e) => handleChange("textColor", e.target.value)}
                disabled={isUpdating}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Free Promo</Label>
          <Switch
            className="cursor-pointer"
            checked={formData.isFreePromo}
            onCheckedChange={(checked) => handleChange("isFreePromo", checked)}
            disabled={isUpdating}
          />
        </div>

        <div className="space-y-2">
          <Label>Free Promo Text</Label>
          <Input
            value={formData.freePromoText}
            onChange={(e) => handleChange("freePromoText", e.target.value)}
            disabled={isUpdating || !formData.isFreePromo}
            placeholder="Enter promotional text"
          />
        </div>

        <div>
          <Label className="mb-2 block">Features</Label>
          <div className="space-y-2">
            {formData.features.map((feature, index) => (
              <Input
                key={index}
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                disabled={isUpdating}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddFeature}
              className="mt-2 cursor-pointer"
              disabled={isUpdating}
            >
              + Add Feature
            </Button>
          </div>
        </div>

        <div className="pt-6 flex gap-4">
          <Button
            className="cursor-pointer bg-primary hover:bg-primary/80"
            onClick={handleSubmit}
            disabled={isUpdating || isStatusUpdating || isDeleting}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isUpdating || isStatusUpdating || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Plan"}
          </Button>
        </div>
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this pricing plan? This action cannot be undone.
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
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}