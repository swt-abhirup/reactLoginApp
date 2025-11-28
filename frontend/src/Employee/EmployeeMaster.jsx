// src/pages/EmployeeMaster.jsx
import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  Box,  Button,  Card,  CardContent,
  TextField,  Typography,  Table,
  TableBody,  TableCell,  TableContainer,
  TableHead,  TableRow,  Paper,
  Alert,  Grid,  IconButton,  Pagination,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api/axios"; // uses baseURL from your axios instance



export default function EmployeeMaster() {
  // state for table data + pagination
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // state for form (add/edit)
  const [form, setForm] = useState({
    emp_name: "",    emp_email: "",
    emp_phone: "",    emp_designation: "",
  });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  // state for sorting
  const [sortBy, setSortBy] = useState("emp_id");
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" or "desc"

  // state for search/filter
  const [searchQ, setSearchQ] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");


  // load employees
  // const loadEmployees = async () => {
  //   try {
  //     const res = await api.get(`/employees?page=${page}&limit=${limit}`);
  
  //     setEmployees(res.data?.data || []);  // <-- Always safe array
  //     setTotal(res.data?.total || 0);
  
  //   } catch (err) {
  //     console.error("Failed loading employees", err);
  //     setEmployees([]);  // prevent undefined
  //   }
  // };
  
  

  // useEffect(() => {
  //   loadEmployees();
  // }, [page]);

  const loadEmployees = async () => {
    try {
      const params = {
        page,
        limit,
        sort_by: sortBy,
        order: sortOrder
      };
      if (searchQ) params.q = searchQ;
      else {
        if (filterName) params.name = filterName;
        if (filterEmail) params.email = filterEmail;
        if (filterDesignation) params.designation = filterDesignation;
      }

      const res = await api.get("/employees", { params });
      setEmployees(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Load employees failed:", err);
    }
  };

  // fetch on mount & when page / search / filter changes
  useEffect(() => {
    loadEmployees();
  }, [page, sortBy, sortOrder, searchQ, filterName, filterEmail, filterDesignation]);
  

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);  // ← add this line
  };
  

  const exportToCsv = () => {
    const csvRows = [];
    // header
    csvRows.push(["ID","Name","Email","Phone","Designation"]);
    // data
    employees.forEach(emp => {
      csvRows.push([
        emp.emp_id,
        emp.emp_name,
        emp.emp_email,
        emp.emp_phone,
        emp.emp_designation
      ]);
    });
    // build csv string
    const csvContent = csvRows.map(e => e.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "employees_export.csv");
    link.click();
  };

  // simple validation
  const validate = () => {
    const temp = {};
    if (!form.emp_name || form.emp_name.trim() === "") temp.emp_name = "Name is required";
    if (!form.emp_email || form.emp_email.trim() === "") temp.emp_email = "Email is required";
    else {
      // basic email regex
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(form.emp_email)) temp.emp_email = "Invalid email";
    }
    if (!form.emp_phone || form.emp_phone.trim() === "") temp.emp_phone = "Phone is required";
    if (!form.emp_designation || form.emp_designation.trim() === "") temp.emp_designation = "Designation is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const clearForm = () => {
    setForm({ emp_name: "", emp_email: "", emp_phone: "", emp_designation: "" });
    setErrors({});
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editingId) {
        // update
        await api.put(`/employees/${editingId}`, form);
        setMessage("Employee updated successfully");
      } else {
        // create
        await api.post("/employees", form);
        setMessage("Employee added successfully");
      }
      clearForm();
      await loadEmployees();
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Server error";
      setMessage(msg);
    }
  };

  const handleEdit = (emp) => {
    setForm({
      emp_name: emp.emp_name || "",
      emp_email: emp.emp_email || "",
      emp_phone: emp.emp_phone || "",
      emp_designation: emp.emp_designation || "",
    });
    setEditingId(emp.emp_id);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await api.delete(`/employees/${id}`);
      setMessage("Employee deleted");
      await loadEmployees();
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      console.error(err);
      setMessage("Delete failed");
    }
  };

  return (
    <MainLayout title="Employee Master">
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Employee Master
        </Typography>

        {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}

        <Card sx={{ maxWidth: 1000, mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {editingId ? "Edit Employee" : "Add Employee"}
            </Typography>

            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  value={form.emp_name}
                  onChange={(e) => setForm({ ...form, emp_name: e.target.value })}
                  error={!!errors.emp_name}
                  helperText={errors.emp_name}
                  fullWidth
                  size="small"           // <--- make it small
                  margin="dense"         // <--- reduce vertical spacing
                  variant="outlined"     // or 'filled' / 'standard', as you like
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  value={form.emp_email}
                  onChange={(e) => setForm({ ...form, emp_email: e.target.value })}
                  error={!!errors.emp_email}
                  helperText={errors.emp_email}
                  fullWidth
                  size="small"           // <--- make it small
                  margin="dense"         // <--- reduce vertical spacing
                  variant="outlined"     // or 'filled' / 'standard', as you like
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  value={form.emp_phone}
                  onChange={(e) => setForm({ ...form, emp_phone: e.target.value })}
                  error={!!errors.emp_phone}
                  helperText={errors.emp_phone}
                  fullWidth
                  size="small"           // <--- make it small
                  margin="dense"         // <--- reduce vertical spacing
                  variant="outlined"     // or 'filled' / 'standard', as you like
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Designation"
                  value={form.emp_designation}
                  onChange={(e) => setForm({ ...form, emp_designation: e.target.value })}
                  error={!!errors.emp_designation}
                  helperText={errors.emp_designation}
                  fullWidth
                  size="small"           // <--- make it small
                  margin="dense"         // <--- reduce vertical spacing
                  variant="outlined"     // or 'filled' / 'standard', as you like
                />
              </Grid>

              <Grid item xs={12} sx={{ display: "flex", gap: 1 }}>
                <Button variant="contained" onClick={handleSave}>
                  {editingId ? "Update" : "Save"}
                </Button>

                <Button variant="outlined" onClick={clearForm}>
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* SEARCH & FILTER UI */}
        <Card sx={{ mb: 1, p: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Search (name / email / designation)"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                fullWidth
                size="small"           // <--- make it small
                margin="dense"         // <--- reduce vertical spacing
                variant="outlined"     // or 'filled' / 'standard', as you like
              />
            </Grid>

            {/* <Grid item xs={12} sm={3}>
              <TextField
                label="Filter Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                fullWidth
                size="small"           // <--- make it small
                margin="dense"         // <--- reduce vertical spacing
                variant="outlined"     // or 'filled' / 'standard', as you like
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Filter Email"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                fullWidth
                size="small"           // <--- make it small
                margin="dense"         // <--- reduce vertical spacing
                variant="outlined"     // or 'filled' / 'standard', as you like
              />
            </Grid> */}

            <Grid item xs={12} sm={2} display="flex" alignItems="center">
              <Button
                variant="outlined"
                onClick={() => {
                  // clear filters
                  setSearchQ("");
                  setFilterName("");
                  setFilterEmail("");
                  setFilterDesignation("");
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Card>

        {message && <Alert severity="info" sx={{ mb:2 }}>{message}</Alert>}

        {/* Export & Table */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
          <Button variant="contained" onClick={exportToCsv} disabled={employees.length === 0}>
            Export CSV
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {[
                  { label: "ID", key: "emp_id" },
                  { label: "Name", key: "emp_name" },
                  { label: "Email", key: "emp_email" },
                  { label: "Phone", key: "emp_phone" },
                  { label: "Designation", key: "emp_designation" },
                  { label: "Actions", key: null }
                ].map((col) => (
                  <TableCell
                    key={col.label}
                    onClick={col.key ? () => handleSort(col.key) : undefined}
                    style={col.key ? { cursor: "pointer", userSelect: "none" } : {}}
                  >
                    <b>{col.label}</b>
                    {col.key && sortBy === col.key ? (sortOrder === "asc" ? " 🔼" : " 🔽") : null}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No employees found</TableCell>
                </TableRow>
              ) : (
                employees.map(emp => (
                  <TableRow key={emp.emp_id}>
                    <TableCell>{emp.emp_id}</TableCell>
                    <TableCell>{emp.emp_name}</TableCell>
                    <TableCell>{emp.emp_email}</TableCell>
                    <TableCell>{emp.emp_phone}</TableCell>
                    <TableCell>{emp.emp_designation}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEdit(emp)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(emp.emp_id)}>
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
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
            count={Math.ceil(total / limit)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
        />
        </Box>

    </MainLayout>
  );
}
