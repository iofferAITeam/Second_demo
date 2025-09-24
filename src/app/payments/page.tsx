import Navbar from "@/components/Navbar";
import { PaymentDemo } from "@/components/payments/Payment";
import Footer from "@/components/Footer";

export default function PaymentsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <PaymentDemo />
      <Footer />
    </div>
  );
}
