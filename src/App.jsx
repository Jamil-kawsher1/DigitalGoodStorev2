import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const API_BASE = "http://localhost:4002";
import HomePage from "./HomePage.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import CustomerDashboard from "./CustomerDashboard.jsx";
import { ProductProvider } from "./ProductContext.jsx";
import PaymentPage from "./PaymentPage.jsx";
import Login from "./Login.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleRoute from "./RoleRoute.jsx";
import Signup from "./Signup.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/admin/*"
              element={
                <RoleRoute allowed={["admin"]}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/customer/*"
              element={
                <RoleRoute allowed={["customer"]}>
                  <CustomerDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage country="Bangladesh" />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ProductProvider>
    </AuthProvider>
  );
}
