
import Breadcrumb from "@/components/shared/Breadcrumb";
import TenantMessageTable from "@/components/tenants/TenantMessageTable";
import TenantsProfileCard from "@/components/tenants/TenantsProfileCard";

export default function TenantMessagesPage() {
    return (
        <div>
            <Breadcrumb
                title="Your Previous  Bookings"
                shortDescription="Manage Your Bookings"
            />

            <div className="container mx-auto py-10 space-y-10">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <TenantsProfileCard />
                    <div>
                        <h1 className="text-2xl md:text-4xl font-bold text-center md:text-start">
                            Your All Messages
                        </h1>
                        <p className="pt-4 text-center md:text-start">Manage Your Messages</p>
                    </div>
                </div>

                <TenantMessageTable />
            </div>
        </div>
    );
}