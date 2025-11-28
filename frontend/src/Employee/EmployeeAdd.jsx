import { useState } from "react";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function EmployeeAdd() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    emp_name: "",
    emp_email: "",
    emp_phone: "",
    emp_designation: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const saveData = async () => {
    await axios.post("http://127.0.0.1:5000/employees", form);
    nav("/employees");
  };

  return (
    <Card sx={{ m: 3 }}>
      <CardContent>
        <Typography variant="h5">Add Employee</Typography>

        <TextField name="emp_name" label="Name" fullWidth sx={{ mt: 2 }} onChange={handleChange} />
        <TextField name="emp_email" label="Email" fullWidth sx={{ mt: 2 }} onChange={handleChange} />
        <TextField name="emp_phone" label="Phone" fullWidth sx={{ mt: 2 }} onChange={handleChange} />
        <TextField name="emp_designation" label="Designation" fullWidth sx={{ mt: 2 }} onChange={handleChange} />

        <Button variant="contained" sx={{ mt: 2 }} onClick={saveData}>
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
