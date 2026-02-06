import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { Marketplace } from "./pages/Marketplace";
import { ListingDetail } from "./pages/ListingDetail";
import { FarmerDashboard } from "./pages/FarmerDashboard";
import { AIAgronomist } from "./pages/AIAgronomist";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/market" element={<Marketplace />} />
        <Route path="/market/:id" element={<ListingDetail />} />
        <Route path="/farmers" element={<FarmerDashboard />} />
        <Route path="/ai" element={<AIAgronomist />} />
      </Routes>
    </Layout>
  );
}

