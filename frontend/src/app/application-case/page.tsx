import Header from "@/components/application-case/Header";
import SchoolInfoSection from "@/components/application-case/SchoolInfoSection"; // 👈 加上这行
import "@/styles/application-case.css";

export default function ApplicationCasePage() {
  return (
    <div>
      <Header />
      <SchoolInfoSection />
    </div>
  );
}
