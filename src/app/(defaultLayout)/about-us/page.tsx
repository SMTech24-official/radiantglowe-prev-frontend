import AboutUsSections from '@/components/aboutUs/AboutUsSections'
// import OurMissionSection from '@/components/aboutUs/OurMissionSection'
// import OurVisionSection from '@/components/aboutUs/OurVisionSection'
// import WhoWeAreSection from '@/components/aboutUs/WhoWeAreSection'
import Breadcrumb from '@/components/shared/Breadcrumb'
import React from 'react'

export default function AboutUsPage() {
  return (
    <div>
        <Breadcrumb title='About Us' shortDescription='Connecting Landlords and Tenants with Ease and Transparency'/>
        <AboutUsSections />
        {/* <WhoWeAreSection />
        <OurMissionSection />
        <OurVisionSection /> */}
    </div>
  )
}
