import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  Box, Button, Card, CardContent, TextField,
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  Typography, IconButton, Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api/axios";

export default function DesignationMaster() {
  const [designations, setDesignations] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/designations");
      setDesignations(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const validate = () => {
    const temp = {};
    if (!form.title || form.title.trim() === "") temp.title = "Title is required";
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const clearForm = () => {
    setForm({ title: "", description: "" });
    setEditingId(null);
    setErrors({});
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editingId) {
        await api.put(`/designations/${editingId}`, form);
        setMessage("Designation updated");
      } else {
        await api.post("/designations", form);
        setMessage("Designation added");
      }
      clearForm();
      load();
      setTimeout(() => setMessage(""), 2000);
    } catch (e) {
      console.error(e);
      setMessage("Error saving designation");
    }
  };

  const handleEdit = (d) => {
    setForm({ title: d.title, description: d.description || "" });
    setEditingId(d.desig_id);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this designation?")) return;
    await api.delete(`/designations/${id}`);
    setMessage("Designation deleted");
    load();
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <MainLayout title="Designation Master">
      <Box p={3}>
        {/* <Typography variant="h5" gutterBottom>Designation Master</Typography> */}

        {message && <Alert severity="info" sx={{ mb:2 }}>{message}</Alert>}

        <Card sx={{ mb: 3, maxWidth: 500 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {editingId ? "Edit Designation" : "Add Designation"}
            </Typography>

            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              error={!!errors.title}
              helperText={errors.title}
              fullWidth
              size="small"
              margin="dense"
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              size="small"
              margin="dense"
              sx={{ mt: 1 }}
            />

            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={handleSave}>
                {editingId ? "Update" : "Save"}
              </Button>
              <Button variant="outlined" onClick={clearForm}>Cancel</Button>
            </Box>
          </CardContent>
        </Card>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Title</b></TableCell>
                <TableCell><b>Description</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {designations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No designations found</TableCell>
                </TableRow>
              ) : (
                designations.map((d) => (
                  <TableRow key={d.desig_id}>
                    <TableCell>{d.desig_id}</TableCell>
                    <TableCell>{d.title}</TableCell>
                    <TableCell>{d.description}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEdit(d)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(d.desig_id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </MainLayout>
  );
}
