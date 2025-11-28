import { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  Card,
  CardContent
} from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);

  const loadEmployees = async () => {
    const res = await axios.get("http://127.0.0.1:5000/employees");
    setEmployees(res.data);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const deleteEmp = async (id) => {
    if (!confirm("Are you sure?")) return;

    await axios.delete(`http://127.0.0.1:5000/employees/${id}`);
    loadEmployees();
  };

  return (
    <Card sx={{ m: 3 }}>
      <CardContent>
        <Typography variant="h5">Employee Master</Typography>

        <Button
          variant="contained"
          component={Link}
          to="/employees/add"
          sx={{ mt: 2, mb: 2 }}
        >
          Add New Employee
        </Button>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.emp_id}>
                <TableCell>{emp.emp_name}</TableCell>
                <TableCell>{emp.emp_email}</TableCell>
                <TableCell>{emp.emp_phone}</TableCell>
                <TableCell>{emp.emp_designation}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    component={Link}
                    to={`/employees/edit/${emp.emp_id}`}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => deleteEmp(emp.emp_id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      </CardContent>
    </Card>
  );
}
