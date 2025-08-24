'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAddPackageMutation } from "@/redux/api/packageApi";
import { toast } from "sonner";

interface FormData {
  name: string;
  description: string;
  price: string;
  duration: 'FREE' | 'MONTHLY' | 'YEARLY';
  durationInDays: string;
  state: 'PAID' | 'FREE';
  features: string[];
  bgColor: string;
  textColor?: string;
  isFreePromo?: boolean;
  freePromoText?: string;
  propertyLimit: number;
  isActive: boolean;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  price: '0',
  duration: 'FREE',
  durationInDays: 'UNLIMITED',
  state: 'FREE',
  features: [],
  bgColor: '#ffffff',
  textColor: '#000000',
  isFreePromo: false,
  freePromoText: '',
  propertyLimit: 0,
  isActive: false,
};

const AddPricePage = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [addPackage, { isLoading: isAdding }] = useAddPackageMutation();

  const handleChange = (field: keyof FormData, value: string | boolean | number) => {
    const newData = { ...formData, [field]: value };
    if (field === 'state' && value === 'FREE') {
      newData.price = '0';
    }
    setFormData(newData);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData({ ...formData, features: updatedFeatures });
  };

  const handleAddFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const handleSubmit = async () => {
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

      await addPackage(payload).unwrap();
      toast.success("Pricing plan added successfully!");
      setFormData(initialFormData);
    } catch (err) {
      toast.error("Failed to add pricing plan. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl lg:p-6 mb-16">
      <div className="flex justify-between items-center gap-2">
        <h1 className="text-2xl font-semibold mb-6">Add Pricing Plan</h1>
        <div className="flex items-center gap-3 mt-4">
          <Label>Active</Label>
          <Switch
            className="cursor-pointer"
            checked={formData.isActive}
            onCheckedChange={(checked) => handleChange("isActive", checked)}
            disabled={isAdding}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            disabled={isAdding}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            disabled={isAdding}
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
              disabled={isAdding || formData.state === "FREE"}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label>Duration</Label>
            <select
              value={formData.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
              disabled={isAdding}
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
              disabled={isAdding}
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
              disabled={isAdding}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>State</Label>
          <select
            value={formData.state}
            onChange={(e) => handleChange("state", e.target.value)}
            disabled={isAdding}
            className="w-full border rounded-md p-2"
          >
            <option value="FREE">FREE</option>
            <option value="PAID">PAID</option>
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label>Background Color</Label>
            <Input
              type="color"
              value={formData.bgColor}
              onChange={(e) => handleChange("bgColor", e.target.value)}
              disabled={isAdding}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label>Text Color</Label>
            <Input
              type="color"
              value={formData.textColor}
              onChange={(e) => handleChange("textColor", e.target.value)}
              disabled={isAdding}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Free Promo</Label>
          <Switch
            className="cursor-pointer"
            checked={formData.isFreePromo}
            onCheckedChange={(checked) => handleChange("isFreePromo", checked)}
            disabled={isAdding}
          />
        </div>

        <div className="space-y-2">
          <Label>Free Promo Text</Label>
          <Input
            value={formData.freePromoText}
            onChange={(e) => handleChange("freePromoText", e.target.value)}
            disabled={isAdding || !formData.isFreePromo}
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
                disabled={isAdding}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddFeature}
              className="mt-2 cursor-pointer"
              disabled={isAdding}
            >
              + Add Feature
            </Button>
          </div>
        </div>

        <div className="pt-6">
          <Button
            className="cursor-pointer bg-primary hover:bg-primary/80"
            onClick={handleSubmit}
            disabled={isAdding}
          >
            {isAdding ? "Adding..." : "Add Plan"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPricePage;