// import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Typography, Button, Box, Grid, Card, CardContent } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie,
  Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/dashboard/stats")
      .then(res => setStats(res.data))
      .catch(err => console.log(err));
  }, []);

  if (!stats) return <h3>Loading...</h3>;

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

  return (
    <MainLayout title="Dashboard">
      <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>

      {/* STATS CARDS */}
      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card><CardContent>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h4">{stats.total_users}</Typography>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="h6">Today's Sales</Typography>
            <Typography variant="h4">{stats.today_sales}</Typography>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="h6">Total Revenue</Typography>
            <Typography variant="h4">₹{stats.total_revenue}</Typography>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="h6">Pending Tasks</Typography>
            <Typography variant="h4">{stats.pending_tasks}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* GAP */}
      <div style={{ marginTop: "20px" }} />

      {/* CHARTS */}
      <Grid container spacing={3}>
        
        {/* LINE CHART */}
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6">Monthly Sales</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthly_sales.map((v, i) => ({ month: i+1, sales: v }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Grid>

        {/* BAR CHART */}
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6">Users Joined Per Month</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.users_per_month.map((v, i) => ({ month: i+1, users: v }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Grid>

        {/* PIE CHART */}
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6">Revenue Split</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.revenue_split}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {stats.revenue_split.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Grid>

      </Grid>
    </div>
    </MainLayout>
  );
}

