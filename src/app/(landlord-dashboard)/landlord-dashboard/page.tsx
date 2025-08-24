'use client'
import DashboardStats from '@/components/landlord-dashboard/dashboard/DashboardStats';
import BookingOverview from '@/components/shared/dashboard/BookingOverview';
import PropertiesBookingList from '@/components/shared/dashboard/PropertiesBookingList';

export default function LandlordDashboardPage() {
  // useAuthCheck();
  return (
    <div>
      <DashboardStats />
      <BookingOverview />
      <PropertiesBookingList />
    </div>
  )
}
