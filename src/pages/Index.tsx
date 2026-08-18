import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import CapabilitiesSection from "../components/CapabilitiesSection";
import FabricInspectionSection from "../components/FabricInspectionSection";
import CommandCenterSection from "../components/CommandCenterSection";
import IoTSection from "../components/IoTSection";
import ImpactSection from "../components/ImpactSection";
import Footer from "../components/Footer";

const ScanDivider = () => (
  <div className="section-divider" />
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <div className="section-fade-sage" />
        <CapabilitiesSection />
        <ScanDivider />
         <FabricInspectionSection /> 
        <ScanDivider />
        <CommandCenterSection />
        <div className="section-fade-sage-out" />
        <ScanDivider />
         <IoTSection />
        <ScanDivider />
         <ImpactSection /> 
      </main>
      <Footer />
    </div>
  );
};

export default Index;
