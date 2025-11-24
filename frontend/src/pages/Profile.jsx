import React, { useEffect, useState } from "react";
import { Typography, Box, Paper, Grid, CircularProgress, Button } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { getProfile } from "../services/profileService";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await getProfile();
        if (mounted) {
          if (data.status === "success") {
            setUser(data.user);
          } else {
            setError(data.message || "Failed to load profile");
          }
        }
      } catch (e) {
        console.error(e);
        setError("Server error");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <MainLayout title="Profile">
      <Box sx={{ mt: 1 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : user ? (
          <Paper sx={{ p: 3, maxWidth: 800 }}>
            <Typography variant="h5" gutterBottom>
              {user.full_name || user.username}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Username</Typography>
                <Typography>{user.username}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Email</Typography>
                <Typography>{user.email || "-"}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Phone</Typography>
                <Typography>{user.phone || "-"}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2">About</Typography>
                <Typography variant="body2" color="text.secondary">
                  {/* placeholder: later you can add biography or other fields */}
                  This is your profile page. You can edit the profile details here later.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => navigate("/profile/edit")}
                >
                  Edit Profile
                </Button>
              </Grid>

            </Grid>
          </Paper>
        ) : (
          <Typography>No user data</Typography>
        )}
      </Box>
    </MainLayout>
  );
}
