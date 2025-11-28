import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import EmployeeList from "./Employee/EmployeeList";
import EmployeeAdd from "./Employee/EmployeeAdd";
import EmployeeEdit from "./Employee/EmployeeEdit";
import EmployeeMaster from "./Employee/EmployeeMaster";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* fallback */}
          <Route path="*" element={<Navigate to="/" />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
                  <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/add" element={<EmployeeAdd />} />
        <Route path="/employees/edit/:id" element={<EmployeeEdit />} />
        <Route path="/employee-master" element={
  <ProtectedRoute>
    <EmployeeMaster />
  </ProtectedRoute>
} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
