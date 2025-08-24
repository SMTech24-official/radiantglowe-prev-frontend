/* eslint-disable @typescript-eslint/no-unused-vars */
import Banner from "@/components/home/Banner";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import FirstSection from "@/components/home/FirstSection";
import LandlordSection from "@/components/home/LandlordSection";
import SecondSection from "@/components/home/SecondSection";
// import Partners from "@/components/home/Partners";
import TenantsSection from "@/components/home/TenantsSection";
import TestimonialsSection from "@/components/home/testimonial/TestimonialsSection";
import TawkMessenger from "@/components/shared/chat/TawkMessenger";
// import ChatComponent from "@/components/shared/ChatComponent";

const HomePage = () => {
  return (
    <div>
      <Banner />
      {/* <LandlordSection /> */}
      <FirstSection />
      {/* <TenantsSection /> */}
      <FeaturedProperties />
      {/* <LandlordSection /> */}
      {/* <TenantsSection /> */}
      <SecondSection />
      <TestimonialsSection />
      {/* <Partners /> */}
      {/* <ChatComponent/> */}
      <TawkMessenger/>
    </div>
  );
};

export default HomePage;
