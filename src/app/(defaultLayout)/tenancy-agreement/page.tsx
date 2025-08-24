import Breadcrumb from '@/components/shared/Breadcrumb';
import TenancyAgreement from '@/components/tenentcyAgreement/TenancyAgreement';
import React from 'react';

const TenancyAgreementPage = () => {
    return (
        <div>
            <Breadcrumb title="Tenancy Agreement" shortDescription="" />
            <TenancyAgreement />
        </div>
    );
};

export default TenancyAgreementPage;