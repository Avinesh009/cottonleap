import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import CapabilitiesSection from "./components/CapabilitiesSection";
import CommandCenterSection from "./components/CommandCenterSection";
import FabricInspectionSection from "./components/FabricInspectionSection";
import IoTSection from "./components/IoTSection";
import ImpactSection from "./components/ImpactSection";
import Footer from "./components/Footer";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import BlogPage from "./components/BlogPage";
import BlogViewPage from "./components/BlogViewPage";
import AdminPage from "./components/AdminPage";
import AdminLogin from "./components/AdminLogin";
import BlogEditorPage from "./components/BlogEditorPage";
// Import the new Production page
import ProductionPage from "./pages/ProductionPage";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

// Layout without Navbar for admin routes
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public routes with Navbar + Footer */}
          <Route path="/" element={
            <Layout>
              <HeroSection />
              <CapabilitiesSection />
              
              <FabricInspectionSection />
              <IoTSection />
              <ImpactSection />
            </Layout>
          } />
          <Route path="/capabilities" element={
            <Layout>
              <CapabilitiesSection />
            </Layout>
          } />
          <Route path="/command-center" element={
            <Layout>
              <CommandCenterSection />
            </Layout>
          } />
          <Route path="/iot" element={
            <Layout>
              <IoTSection />
            </Layout>
          } />
          <Route path="/sustainability" element={
            <Layout>
              <ImpactSection />
            </Layout>
          } />
          <Route path="/about" element={
            <Layout>
              <AboutPage />
            </Layout>
          } />
          <Route path="/contact" element={
            <Layout>
              <ContactPage />
            </Layout>
          } />
          <Route path="/blog" element={
            <Layout>
              <BlogPage />
            </Layout>
          } />
          <Route path="/blog/:id" element={
            <Layout>
              <BlogViewPage />
            </Layout>
          } />
          
          {/* Production Route - with Navbar + Footer but special login handling */}
          <Route path="/production" element={
            <Layout>
              <ProductionPage />
            </Layout>
          } />
          
          {/* Admin Routes - No Navbar, No Footer */}
          <Route path="/admin/login" element={
            <AdminLayout>
              <AdminLogin />
            </AdminLayout>
          } />
          <Route path="/admin/dashboard" element={
            <AdminLayout>
              <AdminPage />
            </AdminLayout>
          } />
          <Route path="/admin/blog/new" element={
            <AdminLayout>
              <BlogEditorPage />
            </AdminLayout>
          } />
          <Route path="/admin/blog/edit/:id" element={
            <AdminLayout>
              <BlogEditorPage />
            </AdminLayout>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;