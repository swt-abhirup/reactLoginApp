# Employee Management System (React + Flask + MariaDB)

A full-stack web application for managing employees, designations, departments, and leave requests.  
Built with React (frontend), Material-UI (for UI components), Flask (backend API), and MariaDB (database).  

## 🔧 Features

- User authentication (login flow, token-based, protected routes)  
- Employee CRUD (Create / Read / Update / Delete) with pagination, search/filter, and CSV export  
- Designation Master CRUD — manage job titles / designations  
- Department Master CRUD (optional / future)  
- Leave Request system — employees can apply for leave, view lists; admin can approve/reject (future)  
- Responsive UI using Material-UI, with dark-mode toggle  
- Sidebar + top navigation layout with user menu (profile, settings, logout, dark mode)  
- Modular, extensible architecture — easy to add more modules (payroll, attendance, reports, etc.)

## 📦 Tech Stack

| Layer       | Technologies |
|-------------|--------------|
| Frontend    | React, React Router, Material-UI (MUI), Axios |
| Backend     | Python, Flask, flask-cors, MariaDB Connector |
| Database    | MariaDB / MySQL (or compatible) |
| State / Auth| React Context / Hooks (Auth & Theme management) |
| Versioning  | Git / GitHub |

## 🚀 Quick Start / Setup

### Prerequisites

- Node.js (v16+ recommended)  
- Python 3.8+  
- MariaDB (or MySQL) server  
- Git  

### Installation & Running Locally

1. **Clone the repository**  
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
