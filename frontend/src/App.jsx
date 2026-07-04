import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { Marketplace } from "./pages/Marketplace";
import { ListingDetail } from "./pages/ListingDetail";
import  FarmerDashboard  from "./pages/FarmerDashboard";
import  AIAgronomist  from "./pages/AIAgronomist";
import  About  from "./pages/About";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/market" element={<Marketplace />} />
        <Route path="/market/:id" element={<ListingDetail />} />
        <Route path="/farmers" element={<FarmerDashboard />} />
        <Route path="/ai" element={<AIAgronomist />} />
        <Route path="/about" element={<About />} />

      </Routes>
    </Layout>
  );
}

