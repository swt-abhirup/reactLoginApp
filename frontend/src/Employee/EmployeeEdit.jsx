import { useEffect, useState } from "react";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function EmployeeEdit() {
  const { id } = useParams();
  const nav = useNavigate();

  const [form, setForm] = useState({
    emp_name: "",
    emp_email: "",
    emp_phone: "",
    emp_designation: "",
  });

  const load = async () => {
    const res = await axios.get(`http://127.0.0.1:5000/employees/${id}`);
    setForm(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const updateData = async () => {
    await axios.put(`http://127.0.0.1:5000/employees/${id}`, form);
    nav("/employees");
  };

  return (
    <Card sx={{ m: 3 }}>
      <CardContent>
        <Typography variant="h5">Edit Employee</Typography>

        <TextField name="emp_name" label="Name" fullWidth sx={{ mt: 2 }} value={form.emp_name} onChange={handleChange} />
        <TextField name="emp_email" label="Email" fullWidth sx={{ mt: 2 }} value={form.emp_email} onChange={handleChange} />
        <TextField name="emp_phone" label="Phone" fullWidth sx={{ mt: 2 }} value={form.emp_phone} onChange={handleChange} />
        <TextField name="emp_designation" label="Designation" fullWidth sx={{ mt: 2 }} value={form.emp_designation} onChange={handleChange} />

        <Button variant="contained" sx={{ mt: 2 }} onClick={updateData}>
          Update
        </Button>
      </CardContent>
    </Card>
  );
}
