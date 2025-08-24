/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiCalendar, FiMapPin, FiX } from "react-icons/fi";
import {  usePropertyElementQuery } from "@/redux/api/propertyApi";
import { useState, useEffect, useRef } from "react";
import nigeriaLocations from "@/constants/ngfullLocations.json";
import { useSearchParams } from "next/navigation";

// Define props interface for type safety
interface PropertySearchFormProps {
  setAddress: (address: string) => void;
  setPriceRange: (priceRange: string) => void;
  setPropertyType: (propertyType: string) => void;
  setAvailability: (availability: string) => void;
}

// Define interfaces for location data
interface Ward {
  name: string;
  latitude: number;
  longitude: number;
}

interface LGA {
  name: string;
  wards: Ward[];
}

interface LocationData {
  state: string;
  lgas: LGA[];
}

// Form schema using Zod
const formSchema = z.object({
  destination: z.string().optional(),
  priceRange: z.string().optional(),
  propertyType: z.string().optional(),
  availability: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// Static price ranges as per requirements
const priceRanges = [
  "0-50000",
  "50000-100000",
  "100000-500000",
  "500000-1000000",
  "1000000-2000000",
  "2000000-5000000",
  "5000000-10000000",
  "10000000-50000000",
  "50000000-100000000",
  "100000000-500000000",
  "500000000-1000000000",
  "1000000000-5000000000",
  "5000000000+",
];

export default function PropertySearchForm({
  setAddress,
  setPriceRange,
  setPropertyType,
  setAvailability,
}: PropertySearchFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      priceRange: "",
      propertyType: "",
      availability: "",
    },
  });

  // const { data: propertyData } = useGetActivePropertyQuery("");
  const searchParams = useSearchParams();
  const searchFromHome = searchParams.get("where");
  const { data } = usePropertyElementQuery();
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const propertyTypes = data?.data?.propertyTypes || [];
  const types = propertyTypes.map((type: any) => ({
    label: type.title,
  }));

  // Number formatter with suffix (M, B, T)
  const formatPrice = (value: number): string => {
    if (value >= 1_000_000_000_000) return (value / 1_000_000_000_000).toFixed(1).replace(/\.0$/, "") + "T"; // Trillion
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B"; // Billion
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"; // Million
    return value.toLocaleString(); // below 1M = comma separated
  };

  useEffect(() => {
    if (searchFromHome) {
      setAddress(searchFromHome);
      setInputValue(searchFromHome);
      setValue("destination", searchFromHome, { shouldValidate: true });
    }
  }, [searchFromHome, setValue, setAddress]);

  // Flatten the location data for searching
  const flattenLocations = (locations: LocationData[]) => {
    const flattened: string[] = [];

    locations.forEach((stateData) => {
      // Add state name
      flattened.push(stateData.state);

      // Add LGAs with state prefix
      stateData.lgas.forEach((lga) => {
        flattened.push(`${lga.name}, ${stateData.state}`);

        // Add wards with LGA and state prefix
        lga.wards.forEach((ward) => {
          flattened.push(`${ward.name}, ${lga.name}, ${stateData.state}`);
        });
      });
    });

    return flattened;
  };

  const allLocations = flattenLocations(nigeriaLocations);

  const onSubmit = (data: FormData) => {
    setAddress(data.destination ?? '');
    setPriceRange(data.priceRange ?? '');
    setPropertyType(data.propertyType ?? '');
    setAvailability(data.availability ?? '');
  };

  const handleSelectChange = (field: keyof FormData, value: string) => {
    setValue(field, value, { shouldValidate: true });
  };

  // Handle destination input changes
  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setValue("destination", value, { shouldValidate: true });

    if (value.length > 0) {
      const filtered = allLocations.filter((location) =>
        location.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Select a suggestion
  const selectSuggestion = (location: string) => {
    setInputValue(location);
    setValue("destination", location, { shouldValidate: true });
    setShowSuggestions(false);
  };

  // Clear input
  const clearInput = () => {
    setInputValue("");
    setValue("destination", "", { shouldValidate: true });
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Where Field */}
          <div className="space-y-2 relative">
            <label htmlFor="destination" className="text-sm font-medium text-gray-600">
              Where
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary" />
              <input
                id="destination"
                ref={inputRef}
                value={inputValue}
                onChange={handleDestinationChange}
                onFocus={() => inputValue.length > 0 && setShowSuggestions(true)}
                placeholder="Search state, LGA or ward"
                className="cursor-pointer w-full h-12 pl-10 pr-8 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary outline-none text-gray-700"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={clearInput}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
            {errors.destination && (
              <p className="text-xs text-red-500">{errors.destination.message}</p>
            )}

            {/* Location suggestions dropdown */}
            {showSuggestions && locationSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {locationSuggestions.map((location, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectSuggestion(location)}
                  >
                    {location}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Field */}
          <div className="space-y-2">
            <label htmlFor="priceRange" className="text-sm font-medium text-gray-600">
              Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary">₦</span>
              <select
                id="priceRange"
                value={watch("priceRange")}
                onChange={(e) => handleSelectChange("priceRange", e.target.value)}
                className="cursor-pointer w-full h-12 pl-10 pr-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary outline-none text-gray-700 appearance-none"
              >
                <option value="" disabled>
                  Select Price Range
                </option>
                {priceRanges.map((range, index) => {
                  if (range.includes("+")) {
                    const base = Number(range.replace("+", ""));
                    return (
                      <option key={index} value={range}>
                        ₦ {formatPrice(base)} and above
                      </option>
                    );
                  } else {
                    const [min, max] = range.split("-").map(Number);
                    return (
                      <option key={index} value={range}>
                        ₦ {formatPrice(min)} – ₦ {formatPrice(max)}
                      </option>
                    );
                  }
                })}
              </select>
            </div>
            {errors.priceRange && <p className="text-xs text-red-500">{errors.priceRange.message}</p>}
          </div>

          {/* Property Type Field */}
          <div className="space-y-2">
            <label htmlFor="propertyType" className="text-sm font-medium text-gray-600">
              Property Type
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🏠</span>
              <select
                id="propertyType"
                value={watch("propertyType")}
                onChange={(e) => handleSelectChange("propertyType", e.target.value)}
                className="cursor-pointer w-full h-12 pl-10 pr-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary outline-none text-gray-700 appearance-none"
              >
                <option value="" disabled>
                  Select Property Features
                </option>
                {types.map((type: any) => (
                  <option key={type.label} value={type.label}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.propertyType && <p className="text-xs text-red-500">{errors.propertyType.message}</p>}
          </div>

          {/* Availability Field */}
          <div className="space-y-2">
            <label htmlFor="availability" className="text-sm font-medium text-gray-600">
              Availability
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 cursor-pointer" />
              <input
                id="availability"
                {...register("availability")}
                type="date"
                defaultValue="2025-11-08"
                className="w-full h-12 pl-10 pr-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary outline-none text-gray-700"
              />
            </div>
            {errors.availability && <p className="text-xs text-red-500">{errors.availability.message}</p>}
          </div>

          {/* Search Button */}
          <div className="md:col-span-2 lg:col-span-1">
            <button
              type="submit"
              className="cursor-pointer w-full h-12 bg-primary hover:bg-primary/60 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}