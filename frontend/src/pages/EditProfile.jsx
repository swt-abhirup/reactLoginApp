import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  Grid,
  Alert
} from "@mui/material";
import { getProfile } from "../services/profileService";
import { updateProfile } from "../services/profileService";
import MainLayout from "../layouts/MainLayout";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const res = await getProfile();
      if (res.status === "success") {
        setForm({
          full_name: res.user.full_name,
          email: res.user.email,
          phone: res.user.phone,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async () => {
    setSaving(true);
    setMessage("");

    const res = await updateProfile(form);

    if (res.status === "success") {
      setMessage("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 1200); // auto redirect
    } else {
      setMessage("Failed to update profile");
    }

    setSaving(false);
  };

  return (
    <MainLayout title="Edit Profile">
      <Paper sx={{ p: 3, maxWidth: 1000 }}>
        <Typography variant="h5" gutterBottom>
          Edit Profile
        </Typography>

        {message && <Alert severity="info">{message}</Alert>}

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                fullWidth
                size="small"           // <--- make it small
                margin="dense"         // <--- reduce vertical spacing
                variant="outlined"     // or 'filled' / 'standard', as you like
                value={form.full_name}
                onChange={(e) => updateField("full_name", e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Email"
                fullWidth
                size="small"           // <--- make it small
                margin="dense"         // <--- reduce vertical spacing
                variant="outlined"     // or 'filled' / 'standard', as you like
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Phone"
                fullWidth
                size="small"           // <--- make it small
                margin="dense"         // <--- reduce vertical spacing
                variant="outlined"     // or 'filled' / 'standard', as you like
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={submit}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>

              <Button
                sx={{ ml: 2 }}
                variant="outlined"
                onClick={() => navigate("/profile")}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        )}
      </Paper>
    </MainLayout>
  );
}
