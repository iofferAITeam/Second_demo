import Navbar from "@/components/shared/Navbar";
import { PaymentDemo } from "@/components/payments/Payment";
import Footer from "@/components/shared/Footer";

export default function PaymentsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <PaymentDemo />
      <Footer />
    </div>
  );
}
