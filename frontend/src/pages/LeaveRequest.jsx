// src/pages/LeaveRequest.jsx
import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api/axios";

// If using MUI X date pickers
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";

export default function LeaveRequest() {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({
    emp_id: "",        // you may have a select dropdown instead
    leave_type: "",
    start_date: null,
    end_date: null,
    reason: ""
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const loadLeaves = async () => {
    try {
      const res = await api.get("/leaves");
      setLeaves(res.data);
    } catch (err) {
      console.error("Failed to load leaves:", err);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const validate = () => {
    const temp = {};
    if (!form.emp_id) temp.emp_id = "Employee ID is required";
    if (!form.leave_type) temp.leave_type = "Leave type is required";
    if (!form.start_date) temp.start_date = "Start date is required";
    if (!form.end_date) temp.end_date = "End date is required";
    // optionally check start_date <= end_date
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await api.post("/leaves", {
        emp_id: form.emp_id,
        leave_type: form.leave_type,
        start_date: form.start_date,  // send as ISO string or format as needed
        end_date: form.end_date,
        reason: form.reason,
      });
      setMessage("Leave request submitted");
      setForm({ emp_id: "", leave_type: "", start_date: null, end_date: null, reason: "" });
      await loadLeaves();
    } catch (err) {
      console.error("Error submitting leave:", err);
      setMessage("Failed to submit leave");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cancel this leave request?")) return;
    try {
      await api.delete(`/leaves/${id}`);
      setMessage("Leave request deleted");
      await loadLeaves();
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("Failed to delete");
    }
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <MainLayout title="Leave Requests">
      <Box p={3}>
        {/* <Typography variant="h5" gutterBottom>Leave Requests</Typography> */}

        {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}

        <Card sx={{ maxWidth: 1000, mb: 2 }}>
          <CardContent>
            {/* <Typography variant="h6" gutterBottom>New Leave Request</Typography> */}

            <TextField
              label="Employee ID"
              value={form.emp_id}
              onChange={(e) => setForm({ ...form, emp_id: e.target.value })}
              error={!!errors.emp_id}
              helperText={errors.emp_id}
              fullWidth
              size="small"
              margin="dense"
            />

            <TextField
              label="Leave Type"
              value={form.leave_type}
              onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
              error={!!errors.leave_type}
              helperText={errors.leave_type}
              fullWidth
              size="small"
              margin="dense"
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                label="Start Date"
                value={form.start_date}
                onChange={(newV) => setForm({ ...form, start_date: newV })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    size="small"
                    margin="dense"
                    error={!!errors.start_date}
                    helperText={errors.start_date}
                  />
                )}
              />

              <DesktopDatePicker
                label="End Date"
                value={form.end_date}
                onChange={(newV) => setForm({ ...form, end_date: newV })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    size="small"
                    margin="dense"
                    error={!!errors.end_date}
                    helperText={errors.end_date}
                  />
                )}
              />
            </LocalizationProvider>

            <TextField
              label="Reason"
              multiline
              minRows={2}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              fullWidth
              size="small"
              margin="dense"
              sx={{ mt: 1 }}
            />

            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={handleSubmit}>Submit</Button>
              <Button variant="outlined" onClick={() => setForm({ emp_id: "", leave_type: "", start_date: null, end_date: null, reason: "" })}>
                Cancel
              </Button>
            </Box>
          </CardContent>
        </Card>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Employee ID</b></TableCell>
                <TableCell><b>Leave Type</b></TableCell>
                <TableCell><b>Start</b></TableCell>
                <TableCell><b>End</b></TableCell>
                <TableCell><b>Reason</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">No leave requests found</TableCell>
                </TableRow>
              ) : (
                leaves.map((l) => (
                  <TableRow key={l.leave_id}>
                    <TableCell>{l.leave_id}</TableCell>
                    <TableCell>{l.emp_id}</TableCell>
                    <TableCell>{l.leave_type}</TableCell>
                    <TableCell>{new Date(l.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(l.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>{l.reason}</TableCell>
                    <TableCell>{l.status}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleDelete(l.leave_id)}>
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
