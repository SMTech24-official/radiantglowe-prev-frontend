import BookingCard2 from "@/components/propertyDetails/BookingCard2";
import CustomerReviews from "@/components/propertyDetails/CustomerReviews";
import PropertyAccordion from "@/components/propertyDetails/PropertyAccordion";
import PropertyDetails from "@/components/propertyDetails/PropertyDetails";
import PropertyShowcase from "@/components/propertyDetails/PropertyShowcase";
import Breadcrumb from "@/components/shared/Breadcrumb";
import Image from "next/image";
import Warining from "@/assets/Warning.png"

export default function PropertyDetailsPage() {
  return (
    <div>
      <Breadcrumb
        title="Property Details"
        shortDescription="Explore all the essential information about this property, including its features, amenities, and availability."
      />
      <PropertyShowcase />
      <div className="container mx-auto flex flex-col md:flex-row">
        <div className="md:w-2/3">
          <PropertyDetails />
          <PropertyAccordion />
          <CustomerReviews />
        </div>
        <div className="md:w-1/3">
          <BookingCard2 />
         <div className="flex justify-center items-center mt-10">
           <Image 
            src={Warining}
            className=""
            height={200}
            width={300}
            alt="warning"
          />
         </div>
        </div>
      </div>
    </div>
  );
}
