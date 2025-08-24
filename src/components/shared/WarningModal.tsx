'use'
import React, { useState, useEffect } from 'react';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({ isOpen, onClose }) => {
  const [isVisible, setIsOverlay] = useState(isOpen);

  useEffect(() => {
    setIsOverlay(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setIsOverlay(false);
    setTimeout(onClose, 300); // Delay to allow animation to complete
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div
      className={`absolute left-0 buttom-0 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-4 transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <svg
              className="w-8 h-8 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className=''>
            <h2 className="text-xl font-semibold text-gray-800">Warning</h2>
            <h3 className="text-lg font-medium text-gray-700 mt-2">Stay on Our Platform</h3>
            <p className="text-gray-600 mt-2 text-sm">
              Conversations or transactions outside Simpleroomsng.com are not protected under our Terms & Conditions.
            </p>
            <p className="text-gray-600 mt-2 text-lg">For your own safety and protection:</p>
            <ul className="list-disc list-inside text-gray-600 mt-2 text-sm space-y-1">
              <li>
                Always communicate with clients through our platform and keep all rental discussions, agreements, and
                payments within Simpleroomsng.com
              </li>
              <li>We can only assist and protect you when interactions happen here.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;