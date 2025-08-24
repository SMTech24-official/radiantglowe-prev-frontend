/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { IoBedOutline } from "react-icons/io5";
import { PiBathtub } from "react-icons/pi";
import { HiOutlineFire } from "react-icons/hi2";
import { useParams } from "next/navigation";
import { usePropertyDetailsWithReviewQuery } from "@/redux/api/propertyApi";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import axios from "axios";
import L, { LatLngTuple } from "leaflet";
import Image from "next/image";
import { Loader2 } from "lucide-react";

// Fix for default marker icon in Leaflet
const customIcon = new L.Icon({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationResult {
  success: boolean;
  coordinates?: LatLngTuple;
  address?: string;
  source?: string;
}

export default function PropertyDetails() {
  const { id } = useParams();
  const { data: property } = usePropertyDetailsWithReviewQuery(id);
  const [coordinates, setCoordinates] = useState<LatLngTuple | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Nigerian locations database with precise coordinates
  const getNigerianLocationCoordinates = (address: string): LatLngTuple | null => {
    if (!address) return null;
    
    const addressLower = address.toLowerCase().trim();
    
    // Nigerian locations organized by states and major cities
    const nigerianLocations: Record<string, LatLngTuple> = {
      // LAGOS STATE - Detailed Areas
      'richmond pearl estate': [6.448618, 3.588836],
      'richmond pearl': [6.448618, 3.588836],
      'pearl estate lekki': [6.448618, 3.588836],
      'ibeju lekki': [6.4886, 3.6886],
      'lekki epe expressway': [6.4486, 3.5886],
      'abraham adesanya': [6.4586, 3.4986],
      'sangotedo': [6.4386, 3.5186],
      'awoyaya': [6.4186, 3.5486],
      'lakowe': [6.4686, 3.6186],
      'chevron drive lekki': [6.4386, 3.4786],
      
      // Lagos Islands
      'awolowo ikeja': [6.614519, 3.355585],
      'obafemi awolowo ikeja': [6.614519, 3.355585],
      'awolowo way ikeja': [6.614519, 3.355585],
      'allen avenue ikeja': [6.6045, 3.3555],
      'computer village ikeja': [6.6145, 3.3455],
      'ikeja gra': [6.5945, 3.3655],
      'ikeja cantonment': [6.6245, 3.3755],
      'ikeja': [6.6018, 3.3515],
      
      'awolowo road ikoyi': [6.459964, 3.429836],
      'ikoyi lagos': [6.4598, 3.4298],
      'ikoyi': [6.4598, 3.4298],
      'banana island': [6.4398, 3.4398],
      'parkview ikoyi': [6.4498, 3.4198],
      
      'victoria island': [6.4281, 3.4219],
      'vi lagos': [6.4281, 3.4219],
      'bar beach': [6.4181, 3.4319],
      'tiamiyu savage': [6.4381, 3.4119],
      'ahmadu bello way': [6.4481, 3.4219],
      
      // Lekki Areas
      'lekki': [6.4488, 3.5889],
      'lekki phase 1': [6.4398, 3.4719],
      'lekki phase 2': [6.4298, 3.5119],
      'lekki county': [6.4188, 3.5419],
      'chevron lekki': [6.4388, 3.4819],
      'oniru': [6.4288, 3.4519],
      
      'ajah': [6.4667, 3.5667],
      'thomas estate ajah': [6.4567, 3.5567],
      
      // Mainland Lagos
      'surulere': [6.4950, 3.3500],
      'adeniran ogunsanya': [6.5050, 3.3600],
      'bode thomas': [6.4850, 3.3400],
      
      'yaba': [6.5158, 3.3719],
      'herbert macaulay': [6.5058, 3.3819],
      'unilag': [6.5158, 3.3919],
      'akoka': [6.5258, 3.3919],
      
      'mainland': [6.5506, 3.3611],
      'iddo': [6.4706, 3.3811],
      'oyingbo': [6.4806, 3.3911],
      
      'apapa': [6.4608, 3.3653],
      'wharf road apapa': [6.4508, 3.3753],
      
      'mushin': [6.5247, 3.3456],
      'papa ajao': [6.5347, 3.3356],
      'itire': [6.5147, 3.3556],
      
      'oshodi': [6.5486, 3.3019],
      'mafoluku': [6.5386, 3.2919],
      
      'isolo': [6.5342, 3.3217],
      'okota': [6.5242, 3.3317],
      
      'festac': [6.4664, 3.2964],
      'festac town': [6.4664, 3.2964],
      'mile 2': [6.4667, 3.3167],
      
      'alaba': [6.4667, 3.1833],
      'alaba market': [6.4667, 3.1833],
      
      'badagry': [6.4317, 2.8875],
      'epe': [6.5833, 3.9833],
      'ikorodu': [6.6156, 3.5097],
      'maryland': [6.5647, 3.3697],
      'gbagada': [6.5467, 3.3867],
      'ojodu': [6.6167, 3.3167],
      'agege': [6.6158, 3.3422],
      'shomolu': [6.5397, 3.3847],
      'ketu': [6.5897, 3.3747],
      'ojota': [6.5597, 3.3847],
      'palmgrove': [6.5497, 3.3647],
      'anthony': [6.5597, 3.3697],

      // ABUJA - FCT
      'abuja': [9.0579, 7.4951],
      'garki abuja': [9.0379, 7.4872],
      'garki': [9.0379, 7.4872],
      'wuse abuja': [9.0579, 7.4951],
      'wuse': [9.0579, 7.4951],
      'wuse zone 1': [9.0479, 7.5051],
      'wuse zone 2': [9.0679, 7.4851],
      'wuse zone 3': [9.0379, 7.5151],
      'wuse zone 4': [9.0779, 7.4751],
      'wuse zone 5': [9.0279, 7.5251],
      'maitama abuja': [9.0879, 7.4951],
      'maitama': [9.0879, 7.4951],
      'asokoro abuja': [9.0279, 7.5251],
      'asokoro': [9.0279, 7.5251],
      'utako abuja': [9.0879, 7.4651],
      'utako': [9.0879, 7.4651],
      'gwarinpa abuja': [9.1179, 7.4151],
      'gwarinpa': [9.1179, 7.4151],
      'kubwa abuja': [9.1379, 7.3451],
      'kubwa': [9.1379, 7.3451],

      // Other major Nigerian cities
      'kano': [12.0022, 8.5920],
      'ibadan': [7.3775, 3.9470],
      'port harcourt': [4.8156, 7.0498],
      'ph': [4.8156, 7.0498],
      'kaduna': [10.5105, 7.4165],
      'jos': [9.8965, 8.8583],
      'enugu': [6.4474, 7.4898],
      'awka': [6.2120, 7.0740],
      'onitsha': [6.1645, 6.7866],
      'owerri': [5.4840, 7.0351],
      'aba': [5.1066, 7.3667],
      'umuahia': [5.5251, 7.4977],
      'warri': [5.5160, 5.7500],
      'asaba': [6.2649, 6.7027],
      'calabar': [4.9517, 8.3220],
      'uyo': [5.0380, 7.9208],
      'minna': [9.6177, 6.5569],
      'ilorin': [8.5000, 4.5500],
      'osogbo': [7.7719, 4.5561],
      'akure': [7.2571, 5.2058],
      'abeokuta': [7.1475, 3.3619],
      'makurdi': [7.7319, 8.5122],
      'lokoja': [7.7974, 6.7337],
      'lafia': [8.4833, 8.5167],
      'yola': [9.2167, 12.4667],
      'bauchi': [10.3158, 9.8442],
      'gombe': [10.2833, 11.1667],
      'maiduguri': [11.8333, 13.1500],
      'katsina': [12.9908, 7.6006],
      'sokoto': [13.0627, 5.2433],
      'benin city': [6.3350, 5.6037],
      'benin': [6.3350, 5.6037],
    };
    
    // Enhanced matching algorithm
    try {
      // 1. Check for exact string matches
      for (const [key, coords] of Object.entries(nigerianLocations)) {
        if (addressLower.includes(key)) {
          return coords;
        }
      }
      
      // 2. Check for word-based matches
      const words = addressLower.split(/[,\s]+/).filter(word => word.length > 2);
      for (const word of words) {
        for (const [key, coords] of Object.entries(nigerianLocations)) {
          if (key.includes(word) || (word.length > 3 && key.includes(word.substring(0, 3)))) {
            return coords;
          }
        }
      }
      
      // 3. Check for multi-word combinations
      for (let i = 0; i < words.length - 1; i++) {
        const combination = `${words[i]} ${words[i + 1]}`;
        for (const [key, coords] of Object.entries(nigerianLocations)) {
          if (key.includes(combination)) {
            return coords;
          }
        }
      }
    } catch (error) {
      // console.error('Error in location matching:', error);
    }
    
    return null;
  };

  // Improved address construction with ALL fields for exact location
  const getSearchAddresses = (): string[] => {
    if (!property?.data?.location) return [];
    
    try {
      const { flatOrHouseNo, address, area, city, town, state } = property.data.location;
      const addresses: string[] = [];
      
      // Strategy 1: Complete address with house number (Most Specific)
      if (flatOrHouseNo && address && area && city && state) {
        const completeAddress = [flatOrHouseNo, address, area, city, town, state, "Nigeria"]
          .filter(Boolean).join(", ");
        addresses.push(completeAddress);
      }
      
      // Strategy 2: Address without house number but with town
      if (address && area && city && town && state) {
        const detailedAddress = [address, area, city, town, state, "Nigeria"]
          .filter(Boolean).join(", ");
        addresses.push(detailedAddress);
      }
      
      // Strategy 3: Full address without house number
      if (address && area && city && state) {
        const fullAddress = [address, area, city, state, "Nigeria"]
          .filter(Boolean).join(", ");
        addresses.push(fullAddress);
      }
      
      // Strategy 4: Area + City + Town + State (for specific neighborhoods)
      if (area && city && town && state) {
        const areaAddress = [area, city, town, state, "Nigeria"]
          .filter(Boolean).join(", ");
        addresses.push(areaAddress);
      }
      
      // Strategy 5: Area + City + State
      if (area && city && state) {
        const cityAreaAddress = [area, city, state, "Nigeria"]
          .filter(Boolean).join(", ");
        addresses.push(cityAreaAddress);
      }
      
      // Strategy 6: Town + City + State (important for exact location)
      if (town && city && state) {
        const townAddress = [town, city, state, "Nigeria"]
          .filter(Boolean).join(", ");
        addresses.push(townAddress);
      }
      
      // Strategy 7: City + State only
      if (city && state) {
        const cityAddress = [city, state, "Nigeria"].filter(Boolean).join(", ");
        addresses.push(cityAddress);
      }
      
      // Strategy 8: State only as final fallback
      if (state) {
        const stateAddress = [state, "Nigeria"].filter(Boolean).join(", ");
        addresses.push(stateAddress);
      }
      
      // Remove duplicates and return
      return [...new Set(addresses)];
    } catch (error) {
      // console.error('Error constructing search addresses:', error);
      return [];
    }
  };

  const getDisplayAddress = (): string => {
    if (!property?.data?.location) return "";
    
    try {
      const { flatOrHouseNo, address, area, city, town, state } = property.data.location;
      const parts = [flatOrHouseNo, address, area, city, town, state].filter(Boolean);
      return parts.join(", ");
    } catch (error) {
      // console.error('Error getting display address:', error);
      return "";
    }
  };

  // Enhanced geocoding with multiple fallback strategies
  const tryGeocodingWithFallback = async (addresses: string[]): Promise<LocationResult> => {
    try {
      // First, check if we have known coordinates for this location
      for (const address of addresses) {
        const knownCoords = getNigerianLocationCoordinates(address);
        if (knownCoords) {
          // console.log(`Found known coordinates for: ${address}`, knownCoords);
          return { 
            success: true, 
            coordinates: knownCoords, 
            address, 
            source: 'nigerian_database' 
          };
        }
      }
      
      // If no known location, try geocoding with error handling
      for (let i = 0; i < addresses.length && i < 3; i++) { // Limit to 3 attempts
        const address = addresses[i];
        // console.log(`Trying geocoding for address ${i + 1}:`, address);
        
        try {
          // Try multiple search terms for better results
          const searchTerms = [
            address,
            address.replace(/road/gi, 'way').replace(/rd/gi, 'way'),
            address.replace(/way/gi, 'road').replace(/rd/gi, 'road'),
          ];
          
          for (const searchTerm of searchTerms) {
            try {
              const response = await axios.get(
                `https://nominatim.openstreetmap.org/search`,
                {
                  params: {
                    q: searchTerm,
                    format: "json",
                    limit: 3,
                    countrycodes: "ng",
                    addressdetails: 1,
                  },
                  headers: {
                    "User-Agent": "SimpleRooms Property App contact@simpleroomsng.com",
                  },
                  timeout: 8000,
                }
              );

              if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                // Find the best match
                let bestMatch = response.data[0];
                
                // Prefer results that contain specific Nigerian area names
                const nigerianAreas = [
                  'ikeja', 'ikoyi', 'victoria island', 'lekki', 'surulere', 'yaba', 'mainland', 
                  'apapa', 'mushin', 'oshodi', 'garki', 'wuse', 'maitama', 'asokoro', 'utako',
                  'gwarinpa', 'kubwa', 'kano', 'ibadan', 'port harcourt', 'kaduna', 'jos',
                  'enugu', 'awka', 'onitsha', 'owerri', 'aba', 'umuahia', 'warri', 'asaba',
                  'calabar', 'uyo', 'minna', 'ilorin', 'osogbo', 'akure', 'abeokuta', 'makurdi',
                  'lokoja', 'lafia', 'yola', 'bauchi', 'gombe', 'maiduguri', 'benin city'
                ];
                
                for (const area of nigerianAreas) {
                  const areaMatch = response.data.find((result: any) => 
                    result?.display_name?.toLowerCase().includes(area) &&
                    result?.display_name?.toLowerCase().includes('nigeria')
                  );
                  if (areaMatch) {
                    bestMatch = areaMatch;
                    break;
                  }
                }
                
                if (bestMatch?.lat && bestMatch?.lon) {
                  const coords: LatLngTuple = [parseFloat(bestMatch.lat), parseFloat(bestMatch.lon)];
                  // console.log(`Found coordinates for "${searchTerm}":`, coords);
                  return { 
                    success: true, 
                    coordinates: coords, 
                    address: searchTerm, 
                    source: 'geocoding' 
                  };
                }
              }
            } catch (searchError) {
              // console.error(`Error searching for "${searchTerm}":`, searchError);
              continue;
            }
            
            // Small delay between search terms
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (addressError) {
          // console.error(`Error processing address "${address}":`, addressError);
          continue;
        }
        
        // Add delay between addresses
        if (i < addresses.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      // console.error('Error in geocoding fallback:', error);
    }
    
    return { success: false };
  };

  // Geocode with comprehensive fallback
  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!property?.data?.location) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const searchAddresses = getSearchAddresses();
        // console.log("Search addresses:", searchAddresses);
        
        if (searchAddresses.length === 0) {
          setError("No valid address information available");
          setIsLoading(false);
          return;
        }

        const result = await tryGeocodingWithFallback(searchAddresses);
        
        if (result.success && result.coordinates) {
          setCoordinates(result.coordinates);
          setError(null);
          // console.log(`Successfully located using: ${result.address} (${result.source})`);
        } else {
          // Final fallback: Use Lagos coordinates as default for Nigerian properties
          // console.log("All geocoding attempts failed, using Lagos as fallback");
          setCoordinates([6.5244, 3.3792]); // Lagos, Nigeria coordinates
          setError("Could not find exact location. Showing approximate area in Lagos.");
        }
      } catch (error) {
        // console.error('Error fetching coordinates:', error);
        setCoordinates([6.5244, 3.3792]); // Lagos fallback
        setError("Error loading location. Showing default area.");
      }
      
      setIsLoading(false);
    };

    if (property?.data) {
      fetchCoordinates();
    }
  }, [property]);

  if (!property?.data) {
    return (
      <section className="px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8">
      <div className="">
        {/* Property Title */}
        <h2 className="text-2xl md:text-3xl font-medium text-primary mb-4">
          {getDisplayAddress() || "Property Details"}
        </h2>

        {/* Property Features */}
        <div className="flex flex-wrap items-center gap-6 mb-6">
          <div className="flex items-center space-x-2">
            <IoBedOutline className="w-5 h-5 text-primary" />
            <span className="text-gray-600 text-sm font-medium">
              {property?.data?.bedrooms || 0} bedrooms
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <PiBathtub className="w-5 h-5 text-primary" />
            <span className="text-gray-600 text-sm font-medium">
              {property?.data?.bathrooms || 0} baths
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <IoBedOutline className="w-5 h-5 text-primary" />
            <span className="text-gray-600 text-sm font-medium">
              {property?.data?.livingRooms || 0} living rooms
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <HiOutlineFire className="w-5 h-5 text-primary" />
            <span className="text-gray-600 text-sm font-medium">
              {property?.data?.kitchen || 0} kitchen
            </span>
          </div>
        </div>

        {/* Property Owner */}
        {property?.data?.landlordId && (
          <div className="flex items-center gap-2 mb-6">
            <Image
              src={property?.data?.landlordId?.image || "/placeholder.svg"}
              alt="Landlord"
              width={50}
              height={50}
              className="rounded-full w-12 h-12 object-cover mb-2 border"
            />
            <div>
              <p className="font-medium">{property?.data?.landlordId?.name || "N/A"}</p>
              <p className={`${property?.data?.landlordId?.isVerified ? 'bg-green-600' : 'bg-gray-500'} text-white text-sm px-4 py-0.5 rounded`}>
                {property?.data?.landlordId?.isVerified ? 'Verified' : 'Not Verified'}
              </p>
            </div>
          </div>
        )}

        {/* Property Description */}
        {property?.data?.description && (
          <div className="prose prose-gray max-w-none mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              {property?.data?.description}
            </p>
          </div>
        )}
        
        {/* Map Integration */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Location</h3>
          {isLoading ? (
            <div className="h-[300px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin w-5 h-5 text-primary" />
                <span className="text-gray-600">Loading map...</span>
              </div>
            </div>
          ) : coordinates ? (
            <div className="space-y-2">
              {error && (
                <p className="text-amber-600 text-sm bg-amber-50 p-2 rounded border border-amber-200">
                  {error}
                </p>
              )}
              <div className="h-[300px] w-full rounded-lg overflow-hidden border">
                <MapContainer
                  center={coordinates}
                  zoom={error ? 10 : 15}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={coordinates} icon={customIcon}>
                    <Popup>
                      <div className="text-sm">
                        <strong>{property?.data?.location?.address || "Property Location"}</strong>
                        <br />
                        {getDisplayAddress()}
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          ) : (
            <div className="h-[300px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-red-600 text-sm">Unable to load map. Please check the address information.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}