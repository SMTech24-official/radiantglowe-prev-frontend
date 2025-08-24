import LandlordRegistrationForm from "@/components/registration/landlord/LandlordRegistrationForm";
import Breadcrumb from "@/components/shared/Breadcrumb";

export default function LandlordRegistrationPage() {

  return (
    <div>
      <Breadcrumb
        title="Landlord’ registration"
        shortDescription="Register to Find Your Perfect Tenants – Easy, Quick, and Secure"
      />
      <LandlordRegistrationForm />
    </div>
  );
}