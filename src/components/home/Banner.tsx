"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FiMapPin, FiSearch, FiX } from "react-icons/fi";
import banner from "@/assets/home/Banner.png";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import nigeriaLocations from "@/constants/ngfullLocations.json"; // Assuming this is your JSON file

interface LGA {
  name: string;
  wards: {
    name: string;
    latitude: number;
    longitude: number;
  }[];
}

interface LocationData {
  state: string;
  lgas: LGA[];
}

export default function CommonLayoutHomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Define variants with explicit types
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  // Flatten the location data for searching
  const flattenLocations = (locations: LocationData[]) => {
    const flattened: string[] = [];
    locations.forEach((stateData) => {
      flattened.push(stateData.state);
      stateData.lgas.forEach((lga) => {
        flattened.push(`${lga.name}, ${stateData.state}`);
        lga.wards.forEach((ward) => {
          flattened.push(`${ward.name}, ${lga.name}, ${stateData.state}`);
        });
      });
    });
    return flattened;
  };

  const allLocations = flattenLocations(nigeriaLocations);

  // Handle destination input changes
  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

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
    setSearchQuery(location);
    setShowSuggestions(false);
  };

  // Clear input
  const clearInput = () => {
    setSearchQuery("");
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

  // Handle navigation to /properties with search query
  const handleSearch = () => {
    if (searchQuery) {
      router.push(`/properties?where=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/properties");
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Background Image */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={banner}
            alt="Modern house property"
            fill
            className="object-cover"
            priority
            quality={100}
            sizes="100vw"
          />
        </motion.div>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 flex items-center justify-center h-full px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              className="lg:text-4xl 2xl:text-5xl text-3xl font-bold text-white mb-4 leading-tight"
              variants={itemVariants}
            >
              Find Your Ideal Rental Property
            </motion.h1>
            <motion.p
              className="2xl:text-xl text-lg text-white mb-16 opacity-90 tracking-wider"
              variants={itemVariants}
            >
              The First and Fastest Expanding Zero Commission Rental Platform in Nigeria
            </motion.p>

            {/* Search Bar */}
            <motion.div
              className="w-full max-w-2xl mx-auto mb-8"
              variants={itemVariants}
            >
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary" />
                <input
                  id="destination"
                  ref={inputRef}
                  value={searchQuery}
                  onChange={handleDestinationChange}
                  onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                  placeholder="state, LGA or ward"
                  className="w-full h-16 pl-10 pr-8 border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary outline-none text-gray-700 text-lg bg-white"
                />
                <div onClick={handleSearch} className={`absolute ${searchQuery ? "right-8":"right-3"} top-1/2 transform -translate-y-1/2 bg-primary p-4 rounded-2xl `}>
                  <FiSearch className=" w-5 h-5 text-white" />
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearInput}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
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
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex gap-4 justify-center items-center"
              variants={containerVariants}
            >
              <motion.button
                className="bg-white hover:bg-primary hover:text-white text-gray-900 px-4 md:px-8 py-3 rounded-lg font-medium 2xl:text-lg lg:text-base shadow-lg transition-colors text-sm"
                variants={itemVariants}
                onClick={() => router.push("/properties")}
              >
                Book a property
              </motion.button>
              <motion.button
                className="bg-primary text-white hover:bg-primary/60 px-4 md:px-8 py-3 rounded-lg font-medium lg:text-base text-sm 2xl:text-lg shadow-lg transition-colors"
                variants={itemVariants}
                onClick={() => router.push("/register")}
              >
                Become a Landlord
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}