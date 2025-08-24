import React from 'react';
import RegistrationModal from '../auth/RegistrationModal';

interface GlobalRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
}
const GlobalRegisterModal = ({isOpen,onClose}:GlobalRegisterModalProps) => {
    return (
        <div>
            <RegistrationModal isOpen={isOpen} onClose={onClose}/>
        </div>
    );
};

export default GlobalRegisterModal;