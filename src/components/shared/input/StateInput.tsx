/* eslint-disable @typescript-eslint/no-explicit-any */

import nigeriaLocations from "@/constants/ngfullLocations.json";
import React, { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import z from "zod";

interface LocationData {
  state: string;
  lgas: {
    name: string;
    wards: {
      name: string;
      latitude: number;
      longitude: number;
    }[];
  }[];
}

interface StateInputProps {
  form: UseFormReturn<z.infer<any>>;
  name: any
  placeholder?: string;
  className?: string;
}

// Extracts only state names, excluding LGAs and wards
const getStateNames = (locations: LocationData[]): string[] => {
  return locations.map((location) => location.state);
};

// Only state names are included in the suggestions
const allStates = getStateNames(nigeriaLocations);

const StateInput: React.FC<StateInputProps> = ({
  form,
  name,
  placeholder = "State",
  className = "h-12 border-gray-300 focus:border-gray-400 focus:ring-0",
}) => {
  const { register, setValue, watch } = form; // Destructure setValue, register, and watch from form prop
  const [inputValue, setInputValue] = useState("");
  // Sync inputValue with form value (from local storage or reset)
  useEffect(() => {
    const formStateValue = watch(name);
    if (typeof formStateValue === "string" && formStateValue !== inputValue) {
      setInputValue(formStateValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch(name)]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setValue(name, value, { shouldValidate: true }); // Update form value and trigger validation

    if (value.length > 0) {
      const filtered = allStates.filter((state) =>
        state.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setValue(name, suggestion, { shouldValidate: true }); // Update form value and trigger validation
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        {...register(name)}
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className={`w-full ${className} border border-gray-300 focus:border-gray-400 focus:ring-0 px-2 rounded-md`}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StateInput;