import { useState } from "react";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginRequest } from "../services/authService";

export default function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";

  const submitLogin = async () => {
    setError("");
    try {
      const data = await loginRequest(username, password);
      if (data.status === "success") {
        // assume server returns token
        const token = data.token || "demo-token";
        login(token);
        navigate(from, { replace: true });
      } else {
        setError("Invalid Username or Password");
      }
    } catch (e) {
      console.error(e);
      setError("Server error");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" }}>
      <Card sx={{ width: 350, p: 2 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center">Login</Typography>

          <TextField label="Username" fullWidth
          size="small"           // <--- make it small
          margin="dense"         // / 'normal' <--- reduce vertical spacing
          variant="outlined"     // or 'filled' / 'standard', as you like
          onChange={(e) => setU(e.target.value)} />
          <TextField label="Password" type="password" fullWidth
          
          size="small"           // <--- make it small
          margin="dense"         // / 'normal' <--- reduce vertical spacing
          variant="outlined"     // or 'filled' / 'standard', as you like
          onChange={(e) => setP(e.target.value)} />

          {error && <Typography color="error">{error}</Typography>}

          <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={submitLogin}>Login</Button>
        </CardContent>
      </Card>
    </div>
  );
}
