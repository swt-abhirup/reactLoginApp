// src/pages/Login.jsx
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Divider
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginRequest } from "../services/authService";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";

  const submitLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await loginRequest(username, password);
      if (data.status === "success") {
        const token = data.token || "demo-token";
        login(token, rememberMe); // pass rememberMe if needed
        navigate(from, { replace: true });
      } else {
        setError("Invalid username or password");
      }
    } catch (e) {
      console.error(e);
      setError("Server error — unable to login");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "linear-gradient(to bottom right, #1976d2, #1565c0)", // blue gradient
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: 0,
        padding: 2,
      }}
    >
      <Box sx={{ maxWidth: 400, width: "100%" }}>
        <Card elevation={8}>
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={3}>
              <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 'bold', color: "#1976d2" }}>
                Login
              </Typography>
            </Box>

            {error && (
              <Typography color="error" align="center" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <form onSubmit={submitLogin}>
              <TextField
                label="Username"
                fullWidth
                size="small"
                margin="normal"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <TextField
                label="Password"
                type="password"
                fullWidth
                size="small"
                margin="normal"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label="Remember me"
                sx={{ mt: 1 }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                sx={{ mt: 2, mb: 1 }}
              >
                Sign In
              </Button>
            </form>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
              <Link href="#" underline="hover" variant="body2">
                Forgot Password?
              </Link>
              <Link href="/register" underline="hover" variant="body2">
                Sign Up
              </Link>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Optional social login buttons */}
            {/* <Typography variant="body2" color="text.secondary" align="center">
              — or sign in with —
            </Typography>
            <Box display="flex" justifyContent="center" mt={2} gap={2}>
              <Button variant="outlined" size="small">Google</Button>
              <Button variant="outlined" size="small">GitHub</Button>
            </Box> */}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
