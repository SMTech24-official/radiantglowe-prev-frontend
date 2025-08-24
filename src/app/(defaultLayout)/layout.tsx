import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import NotificationBubble from "@/components/shared/NotificationBubble";
import InitAuth from "@/utils/helper/auth.helper";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {

  return (
    <>
      <InitAuth />
      <NotificationBubble />
      <Navbar />
      <main className="overflow-hidden">{children}</main>
      <Footer />
    </>
  );
};

export default CommonLayout;
