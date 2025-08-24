/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from '@/components/ui/button';
import { useGetPropertyQuery } from '@/redux/api/propertyApi';
import {
  useCreateReviewMutation,
  useEditReviewMutation,
  useGetAllReviewQuery,
  useIsHomePageStatusMutation
} from '@/redux/api/propertyReviewApi';
import React, { useState } from 'react';
import { FaEdit, FaSpinner, FaToggleOff, FaToggleOn } from 'react-icons/fa';
import { toast } from 'sonner';

// Type definitions
interface User {
  _id: string;
  email: string;
  name?: string;
  role: string;
}

interface Review {
  _id: string;
  property: string;
  user: User | null;
  rating: number;
  reviewText: string;
  likes: string[];
  dislikes: string[];
  isHomePageView: boolean;
  createdAt: string;
  updatedAt: string;
  name?: string;
}

interface EditFormData {
  reviewText: string;
  rating: number;
  name?: string;
}

const ReviewManagement = () => {
  // State
  const [filter, setFilter] = useState<'all' | 'true' | 'false'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({ reviewText: '', rating: 1, name: '' });

  // Add Review Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [newRating, setNewRating] = useState<number>(1);
  const [newReviewText, setNewReviewText] = useState('');
  const [newName, setNewName] = useState<string>('');

  // Queries & Mutations
  const { data, isLoading, error } = useGetAllReviewQuery();
  const [editReview, { isLoading: isEditing }] = useEditReviewMutation();
  const [toggleHomePageStatus, { isLoading: isToggling }] = useIsHomePageStatusMutation();
  const { data: propertyData, isLoading: isPropertyLoading } = useGetPropertyQuery({ searchTerm: searchTerm });
  const [createReview, { isLoading: reviewLoading }] = useCreateReviewMutation();

  // Filtered reviews
  const filteredReviews: Review[] = data?.data?.filter((review: Review) =>
    filter === 'all' ? true : review.isHomePageView.toString() === filter
  ) || [];

  // Edit modal functions
  const openEditModal = (review: Review) => {
    setSelectedReview(review);
    setEditForm({ reviewText: review.reviewText, rating: review.rating });
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
    setEditForm({ reviewText: '', rating: 1 });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;

    try {
      await editReview({
        id: selectedReview._id,
        data: {
          reviewText: editForm.reviewText,
          rating: Number(editForm.rating),
          name: editForm.name,
        },
      }).unwrap();
      toast.success('Review updated successfully!');
      closeEditModal();
    } catch (error) {
      toast.error('Failed to update review.');
      // console.error('Edit review error:', err);
    }
  };

  // Homepage toggle
  const handleToggleHomePage = async (reviewId: string, currentStatus: boolean) => {
    try {
      await toggleHomePageStatus({ id: reviewId, isHomePageView: !currentStatus }).unwrap();
      toast.success('Homepage status updated successfully!');
    } catch (err) {
      toast.error('Failed to update homepage status.');
    }
  };

  // Add Review submission
  const handleAddReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId) {
      toast.error('Please select a property.');
      return;
    }
    try {
      await createReview({
        property: selectedPropertyId,
        rating: newRating,
        reviewText: newReviewText,
        name: newName
      }).unwrap();
      toast.success('Review created successfully!');
      setIsAddModalOpen(false);
      setSelectedPropertyId(null);
      setNewRating(1);
      setNewReviewText('');
    } catch (err) {
      toast.error('Failed to create review.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          Error loading reviews. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Review Management</h1>

      {/* Filter + Add Review */}
      <div className='flex justify-between items-center gap-2 flex-wrap'>
        <div className="mb-6">
          <label htmlFor="filter" className="text-lg font-medium text-gray-700 mr-4">
            Filter by Homepage Visibility:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'true' | 'false')}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="all">All</option>
            <option value="true">Visible on Homepage</option>
            <option value="false">Not Visible on Homepage</option>
          </select>
        </div>
        <Button
          className='bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary/80'
          onClick={() => setIsAddModalOpen(true)}
        >
          Add New Review
        </Button>
      </div>

      {/* Reviews Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Property</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Review Text</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Homepage Visibility</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No reviews found.
                </td>
              </tr>
            ) : (
              filteredReviews.map((review: Review) => (
                <tr key={review._id} className="border-t border-gray-200">
                  <td className="px-6 py-4 text-gray-600 line-clamp-1">
                    {(review as any).property?.headlineYourProperty || 'Unknown Property'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {review.user?.name || review.name || 'Unknown User'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{review.reviewText}</td>
                  <td className="px-6 py-4 text-gray-600">{review.rating}/5</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleHomePage(review._id, review.isHomePageView)}
                      disabled={isToggling}
                      className={`flex items-center space-x-2 ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {review.isHomePageView ? (
                        <FaToggleOn className="text-green-500 text-xl" />
                      ) : (
                        <FaToggleOff className="text-gray-500 text-xl" />
                      )}
                      <span>{review.isHomePageView ? 'Visible' : 'Not Visible'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openEditModal(review)}
                      className="text-primary hover:text-yellow-900"
                    >
                      <FaEdit className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Review Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="max-w-lg w-full mx-4 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Review</h2>
            <form onSubmit={handleAddReviewSubmit}>
              {/* Search & Select Property */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Search Property</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Select Property</label>
                <select
                  value={selectedPropertyId || ''}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                >
                  <option value="">-- Select Property --</option>
                  {isPropertyLoading ? (
                    <option>Loading...</option>
                  ) : (
                    propertyData?.data?.properties?.map((p: any) => (
                      <option key={p._id} value={p._id}>{p.headlineYourProperty}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  required  
                />
              </div>
              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newRating}
                  onChange={(e) => setNewRating(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              {/* Review Text */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Review Text</label>
                <textarea
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  rows={4}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className={`px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 ${reviewLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {reviewLoading && <FaSpinner className="animate-spin inline mr-2" />}
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {isModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="max-w-lg w-full mx-4 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Review</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700">
                  Review Text
                </label>
                <textarea
                  id="reviewText"
                  name="reviewText"
                  value={editForm.reviewText}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, reviewText: e.target.value }))}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  rows={4}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                  Rating (1-5)
                </label>
                <input
                  id="rating"
                  name="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={editForm.rating}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className={`px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isEditing && <FaSpinner className="animate-spin inline mr-2" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
