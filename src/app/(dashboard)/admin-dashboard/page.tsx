'use client'
import AdminDashboardStats from "@/components/admin-dashboard/dashboard/AdminDashboardStats";
import BookingOverview from "@/components/shared/dashboard/BookingOverview";
import PropertiesBookingList from "@/components/shared/dashboard/PropertiesBookingList";

export default function AdminDashboardPage() {
  // useAuthCheck();
  return (
    <div>
      <AdminDashboardStats />
      <BookingOverview />
      <PropertiesBookingList />
    </div>
  );
}
