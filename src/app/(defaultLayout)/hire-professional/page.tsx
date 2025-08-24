import GetStartedSection from '@/components/hire-professional/GetStartedSection'
import HireProfessionalForm from '@/components/hire-professional/HireProfessionalForm'
import HowItWorksSection from '@/components/hire-professional/HowItWorksSection'
import PropertyManagementHero from '@/components/hire-professional/PropertyManagementHero'
import WhyChooseSection from '@/components/hire-professional/WhyChooseSection'
import Breadcrumb from '@/components/shared/Breadcrumb'
import React from 'react'

export default function HireProfessionalPage() {
  return (
    <div>
      <Breadcrumb title='Hire a Professional' shortDescription='Professional Property Management Services – Let Us Handle the Hard Work for You!' />

      <PropertyManagementHero />
      <WhyChooseSection />
      <HowItWorksSection />
      <GetStartedSection />
      <HireProfessionalForm />
    </div>
  )
}
