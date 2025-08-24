/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';
import { useAllUsersQuery } from '@/redux/api/authApi';
import { useGetAllMessagesByAdminQuery } from '@/redux/api/chatApi';
import { useGetPropertyQuery } from '@/redux/api/propertyApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { debounce } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Define strict TypeScript interfaces
interface User {
    _id: string;
    name: string;
    email: string;
    role: 'tenant' | 'landlord';
    uid: string;
}

interface Property {
    _id: string;
    headlineYourProperty: string;
    PID: number;
}

interface Message {
    _id: string;
    senderId: User;
    receiverId: User;
    propertyId: string;
    message: string;
    createdAt: string;
    isRead: boolean;
}

// Reusable UserCard component
const UserCard = ({
    user,
    selectedUser,
    onSelect,
    type,
}: {
    user: User;
    selectedUser: User | null;
    onSelect: (user: User) => void;
    type: 'tenant' | 'landlord';
}) => (
    <div
        role="button"
        tabIndex={0}
        className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedUser?._id === user._id ? 'bg-blue-100 border-blue-500' : 'border-gray-200 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        onClick={() => onSelect(user)}
        onKeyDown={(e) => e.key === 'Enter' && onSelect(user)}
    >
        <div className="font-medium text-gray-800">{user.name}</div>
        <div className="text-sm text-gray-600">{user.email}</div>
        <div className="text-xs text-gray-500 mt-1">ID: {user.uid}</div>
    </div>
);

// Reusable PropertyCard component
const PropertyCard = ({
    property,
    selectedProperty,
    onSelect,
}: {
    property: Property;
    selectedProperty: Property | null;
    onSelect: (property: Property) => void;
}) => (
    <div
        role="button"
        tabIndex={0}
        className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedProperty?._id === property._id ? 'bg-blue-100 border-blue-500' : 'border-gray-200 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        onClick={() => onSelect(property)}
        onKeyDown={(e) => e.key === 'Enter' && onSelect(property)}
    >
        <div className="font-medium text-gray-800">{property.headlineYourProperty}</div>
        <div className="text-xs text-gray-500 mt-1">PID: {property.PID}</div>
    </div>
);

// Reusable SkeletonLoader component
const SkeletonLoader = () => (
    <div className="space-y-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
        ))}
    </div>
);

const AllChatPage = () => {
    // State management
    const [tenantSearch, setTenantSearch] = useState('');
    const [landlordSearch, setLandlordSearch] = useState('');
    const [propertySearch, setPropertySearch] = useState('');
    const [selectedTenant, setSelectedTenant] = useState<User | null>(null);
    const [selectedLandlord, setSelectedLandlord] = useState<User | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);

    // Debounced search handlers
    const debouncedSetTenantSearch = useMemo(
        () => debounce((value: string) => setTenantSearch(value), 300),
        []
    );
    const debouncedSetLandlordSearch = useMemo(
        () => debounce((value: string) => setLandlordSearch(value), 300),
        []
    );
    const debouncedSetPropertySearch = useMemo(
        () => debounce((value: string) => setPropertySearch(value), 300),
        []
    );

    // API queries
    const {
        data: tenants = { data: [] },
        isLoading: tenantsLoading,
        error: tenantsError,
    } = useAllUsersQuery('tenant');

    const {
        data: landlords = { data: [] },
        isLoading: landlordsLoading,
        error: landlordsError,
    } = useAllUsersQuery('landlord');

    const {
        data: properties = { data: { properties: [] } },
        isLoading: propertiesLoading,
        error: propertiesError,
    } = useGetPropertyQuery({ limit: 99999999999999 });

    const {
        data: chatData,
        isLoading: chatLoading,
        error: chatError,
    } = useGetAllMessagesByAdminQuery(
        selectedTenant?._id && selectedLandlord?._id && selectedProperty?._id
            ? {
                userId1: selectedTenant._id,
                userId2: selectedLandlord._id,
                propertyId: selectedProperty._id,
            }
            : skipToken
    );

    // Handle errors with toast notifications
    useMemo(() => {
        if (tenantsError) toast.error('Failed to load tenants');
        if (landlordsError) toast.error('Failed to load landlords');
        if (propertiesError) toast.error('Failed to load properties');
        if (chatError) toast.error('Failed to load chat messages');
    }, [tenantsError, landlordsError, propertiesError, chatError]);

    // Filter users and properties
    const filteredTenants = useMemo(() => {
        if (!Array.isArray(tenants?.data)) return [];
        if (!tenantSearch) return tenants?.data;
        return tenants?.data.filter(
            (tenant: User) =>
                tenant.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
                tenant.email.toLowerCase().includes(tenantSearch.toLowerCase()) ||
                tenant.uid.includes(tenantSearch)
        );
    }, [tenants, tenantSearch]);

    const filteredLandlords = useMemo(() => {
        if (!Array.isArray(landlords?.data)) return [];
        if (!landlordSearch) return landlords?.data;
        return landlords?.data.filter(
            (landlord: User) =>
                landlord.name.toLowerCase().includes(landlordSearch.toLowerCase()) ||
                landlord.email.toLowerCase().includes(landlordSearch.toLowerCase()) ||
                landlord.uid.includes(landlordSearch)
        );
    }, [landlords, landlordSearch]);

    const filteredProperties = useMemo(() => {
        if (!Array.isArray(properties?.data?.properties)) return [];
        if (!propertySearch) return properties?.data?.properties;
        return properties?.data?.properties.filter(
            (property: Property) =>
                property.headlineYourProperty.toLowerCase().includes(propertySearch.toLowerCase()) ||
                property.PID.toString().includes(propertySearch)
        );
    }, [properties, propertySearch]);

    // Handlers
    const handleViewChat = useCallback(() => {
        if (selectedTenant && selectedLandlord && selectedProperty) {
            setIsChatModalOpen(true);
        } else {
            toast.error('Please select a tenant, landlord, and property');
        }
    }, [selectedTenant, selectedLandlord, selectedProperty]);

    const handleCloseModal = useCallback(() => {
        setIsChatModalOpen(false);
        setSelectedTenant(null);
        setSelectedLandlord(null);
        setSelectedProperty(null);
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-6 pb-20 font-sans">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Chat Management</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tenants Column */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tenants</h2>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search by name, email or ID..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onChange={(e) => debouncedSetTenantSearch(e.target.value)}
                                aria-label="Search tenants"
                            />
                        </div>
                        {tenantsLoading ? (
                            <SkeletonLoader />
                        ) : tenantsError ? (
                            <div className="text-red-500 text-center py-8">Error loading tenants</div>
                        ) : filteredTenants.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {tenantSearch ? 'No tenants match your search' : 'No tenants available'}
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {filteredTenants.map((tenant: User) => (
                                    <UserCard
                                        key={tenant._id}
                                        user={tenant}
                                        selectedUser={selectedTenant}
                                        onSelect={setSelectedTenant}
                                        type="tenant"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Landlords Column */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Landlords</h2>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search by name, email or ID..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onChange={(e) => debouncedSetLandlordSearch(e.target.value)}
                                aria-label="Search landlords"
                            />
                        </div>
                        {landlordsLoading ? (
                            <SkeletonLoader />
                        ) : landlordsError ? (
                            <div className="text-red-500 text-center py-8">Error loading landlords</div>
                        ) : filteredLandlords.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {landlordSearch ? 'No landlords match your search' : 'No landlords available'}
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {filteredLandlords.map((landlord: User) => (
                                    <UserCard
                                        key={landlord._id}
                                        user={landlord}
                                        selectedUser={selectedLandlord}
                                        onSelect={setSelectedLandlord}
                                        type="landlord"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Properties Column */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Properties</h2>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search by headline or PID..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onChange={(e) => debouncedSetPropertySearch(e.target.value)}
                                aria-label="Search properties"
                            />
                        </div>
                        {propertiesLoading ? (
                            <SkeletonLoader />
                        ) : propertiesError ? (
                            <div className="text-red-500 text-center py-8">Error loading properties</div>
                        ) : filteredProperties.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {propertySearch ? 'No properties match your search' : 'No properties available'}
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {filteredProperties.map((property: Property) => (
                                    <PropertyCard
                                        key={property._id}
                                        property={property}
                                        selectedProperty={selectedProperty}
                                        onSelect={setSelectedProperty}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* View Chat Button */}
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleViewChat}
                        disabled={!selectedTenant || !selectedLandlord || !selectedProperty}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${selectedTenant && selectedLandlord && selectedProperty
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        aria-label="View chat"
                    >
                        View Chat
                    </button>
                </div>

                {/* Selected Users and Property Display */}
                {(selectedTenant || selectedLandlord || selectedProperty) && (
                    <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Selected Users & Property</h3>
                        <div className="flex flex-wrap gap-4">
                            {selectedTenant && (
                                <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                                    <span className="font-medium">Tenant:</span> {selectedTenant.name}
                                </div>
                            )}
                            {selectedLandlord && (
                                <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                                    <span className="font-medium">Landlord:</span> {selectedLandlord.name}
                                </div>
                            )}
                            {selectedProperty && (
                                <div className="bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                                    <span className="font-medium">Property:</span> {selectedProperty.headlineYourProperty} (PID: {selectedProperty.PID})
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Chat Modal */}
                {isChatModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                            <div className="px-6 py-4 border-b flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-gray-800">
                                    Chat: {selectedTenant?.name} & {selectedLandlord?.name} - {selectedProperty?.headlineYourProperty}
                                </h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Close chat modal"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {chatLoading ? (
                                    <SkeletonLoader />
                                ) : chatError ? (
                                    <div className="text-red-500 text-center py-8">Error loading chat</div>
                                ) : chatData?.data?.messages?.length ? (
                                    <div className="space-y-4 px-4 py-2">
                                        {chatData.data.messages.map((message: Message) => {
                                            const isTenant = message.senderId._id === selectedTenant?._id;
                                            const senderName = isTenant ? selectedTenant?.name : selectedLandlord?.name;
                                            const avatarInitial = senderName?.charAt(0).toUpperCase() || '';

                                            return (
                                                <div
                                                    key={message._id}
                                                    className={`flex items-end w-full ${isTenant ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    {!isTenant && (
                                                        <div className="w-8 h-8 bg-gray-300 text-white flex items-center justify-center rounded-full mr-2 text-sm">
                                                            {avatarInitial}
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`p-3 rounded-2xl max-w-xs text-sm shadow ${isTenant ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-100 text-gray-900'
                                                            }`}
                                                    >
                                                        <div className="font-semibold mb-1">{senderName}</div>
                                                        <div>{message.message}</div>
                                                        <div className={`text-[10px] mt-1 ${isTenant ? 'text-gray-200' : 'text-gray-500'} text-right`}>
                                                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    {isTenant && (
                                                        <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-full ml-2 text-sm">
                                                            {avatarInitial}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No messages found between these users for this property
                                    </div>
                                )}
                            </div>

                            <div className="px-6 py-4 border-t">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Close chat"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllChatPage;