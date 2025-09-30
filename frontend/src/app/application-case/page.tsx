import Header from "@/components/application-case/Header";
import SchoolInfoSection from "@/components/application-case/SchoolInfoSection";
import SchoolSelectionPlan from "@/components/application-case/SchoolSelectionPlan";
import "@/styles/application-case.css";

export default function ApplicationCasePage() {
  return (
    <div>
      <Header />
      <SchoolInfoSection />
      <SchoolSelectionPlan />
    </div>
  );
}
