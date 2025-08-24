import Breadcrumb from '@/components/shared/Breadcrumb'
import { TermsAndConditions } from '@/components/termsAndConditions/TermsAndConditions'
import React from 'react'

export default function TermsAndConditionPage() {
  return (
    <div>
        <Breadcrumb title="Term and Conditions " shortDescription="" />

        <TermsAndConditions />
    </div>
  )
}
