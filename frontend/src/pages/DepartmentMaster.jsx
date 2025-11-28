// src/pages/DepartmentMaster.jsx
import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, IconButton, Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api/axios";

export default function DepartmentMaster() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ dept_name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const load = async () => {
    const res = await api.get("/departments");
    setList(res.data);
  };

  useEffect(() => { load(); }, []);

  const validate = () => {
    const err = {};
    if (!form.dept_name.trim()) err.dept_name = "Name is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const clearForm = () => {
    setForm({ dept_name: "", description: "" });
    setEditingId(null);
    setErrors({});
  };

  const handleSave = async () => {
    if (!validate()) return;

    if (editingId) {
      await api.put(`/departments/${editingId}`, form);
      setMessage("Department updated");
    } else {
      await api.post("/departments", form);
      setMessage("Department added");
    }
    clearForm();
    load();
    setTimeout(() => setMessage(""), 2000);
  };

  const handleEdit = (d) => {
    setForm({ dept_name: d.dept_name, description: d.description || "" });
    setEditingId(d.dept_id);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    await api.delete(`/departments/${id}`);
    setMessage("Department deleted");
    load();
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <MainLayout title="Department Master">
      <Box p={3}>
        {/* <Typography variant="h5" gutterBottom>Department Master</Typography> */}
        {message && <Alert severity="info" sx={{ mb:2 }}>{message}</Alert>}

        <Card sx={{ mb: 3, maxWidth: 500 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {editingId ? "Edit Department" : "Add Department"}
            </Typography>
            
            <TextField
              label="Department Name"
              value={form.dept_name}
              onChange={(e) => setForm({ ...form, dept_name: e.target.value })}
              error={!!errors.dept_name}
              helperText={errors.dept_name}
              fullWidth size="small" margin="dense"
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth size="small" margin="dense" sx={{ mt:1 }}
            />
            <Box sx={{ mt:2, display:"flex", gap:1 }}>
              <Button variant="contained" onClick={handleSave}>{editingId ? "Update" : "Save"}</Button>
              <Button variant="outlined" onClick={clearForm}>Cancel</Button>
            </Box>
          </CardContent>
        </Card>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Description</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center">No departments found</TableCell></TableRow>
              ) : list.map(d => (
                <TableRow key={d.dept_id}>
                  <TableCell>{d.dept_id}</TableCell>
                  <TableCell>{d.dept_name}</TableCell>
                  <TableCell>{d.description}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(d)}><EditIcon fontSize="small"/></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(d.dept_id)}><DeleteIcon fontSize="small"/></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </MainLayout>
  );
}
