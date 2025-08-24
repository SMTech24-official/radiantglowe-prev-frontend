/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useDecodedToken } from "@/hooks/useDecodedToken";
import { useDisLikePropertyMutation, useLikePropertyMutation } from "@/redux/api/propertyReviewApi";
import Image from "next/image";
import { FiThumbsUp, FiThumbsDown, FiStar } from "react-icons/fi";
import { toast } from "sonner";

interface ReviewCardProps {
  id: string;
  userName: string;
  userAvatar: string;
  timeAgo: string;
  rating: number;
  reviewText: string;
  likes: number;
  dislikes: number;
}

export default function ReviewCard({
  id,
  userName,
  userAvatar,
  timeAgo,
  rating,
  reviewText,
  likes,
  dislikes,
}: ReviewCardProps) {
  const [likeProperty, { isLoading: isLiking }] = useLikePropertyMutation();
  const [dislikeProperty, { isLoading: isDisliking }] = useDisLikePropertyMutation();
  const user = useDecodedToken(localStorage.getItem("accessToken"));

  const handleLike = async () => {
    if (!user) {
      toast.error("Please log in to like a review");
      return;
    }
    try {
      await likeProperty(id).unwrap();
    } catch (error) {
      toast.error("Failed to like review");
    }
  };

  const handleDislike = async () => {
    if (!user) {
      toast.error("Please log in to dislike a review");
      return;
    }
    try {
      await dislikeProperty(id).unwrap();
    } catch (error) {
      toast.error("Failed to dislike review:");
    }
  };

  return (
    <div className="py-6 border-b border-gray-300 last:border-b-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 relative">
            <Image
              src={userAvatar || "/placeholder.svg"}
              alt={userName}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h4 className="font-bold text-primary">{userName}</h4>
            <p className="text-sm text-gray-500">{timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded">
          <FiStar className="w-3 h-3 text-primary fill-current" />
          <span className="text-xs font-medium text-gray-700">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-sm leading-relaxed mb-4">{reviewText}</p>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`cursor-pointer flex items-center space-x-2 transition-colors ${
            isLiking ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiThumbsUp className="w-4 h-4" />
          <span className="text-sm">{likes}</span>
        </button>
        <button
          onClick={handleDislike}
          disabled={isDisliking}
          className={`cursor-pointer flex items-center space-x-2 transition-colors ${
            isDisliking ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiThumbsDown className="w-4 h-4" />
          <span className="text-sm">{dislikes}</span>
        </button>
      </div>
    </div>
  );
}