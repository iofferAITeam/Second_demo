import Header from "@/components/application-case/Header";
import SchoolInfoSection from "@/components/application-case/SchoolInfoSection";
import SchoolSelectionPlan from "@/components/application-case/SchoolSelectionPlan";
import SchoolCard from "@/components/application-case/SchoolCard";
import "@/styles/application-case.css";

export default function ApplicationCasePage() {
  return (
    <div>
      <title>Application Case</title>
      <Header />
      <SchoolInfoSection />
      <SchoolSelectionPlan />
      <SchoolCard />
    </div>
  );
}
