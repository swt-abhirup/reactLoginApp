from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt
from db import get_connection
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
    return response


@app.post("/login")
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password").encode("utf-8")

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT password, full_name, email, phone FROM users WHERE username=%s", (username,))
    row = cur.fetchone()

    if not row:
        return jsonify({"status": "fail"}), 401

    stored_hash = row[0].encode("utf-8")

    if bcrypt.checkpw(password, stored_hash):
        # For demo: return username as token. Replace with JWT later.
        token = username
        return jsonify({"status": "success", "token": token})
    else:
        return jsonify({"status": "fail"}), 401

@app.get("/me")
def me():
    # Expect header: Authorization: Bearer <token>
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"status": "fail", "message": "Missing token"}), 401

    token = auth_header.split(" ", 1)[1]
    # For demo token == username
    username = token

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT username, full_name, email, phone FROM users WHERE username=%s", (username,))
    row = cur.fetchone()

    if not row:
        return jsonify({"status": "fail", "message": "User not found"}), 404

    user = {
        "username": row[0],
        "full_name": row[1],
        "email": row[2],
        "phone": row[3],
    }
    return jsonify({"status": "success", "user": user})

@app.put("/profile/update")
def update_profile():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"status": "fail", "message": "Missing token"}), 401

    token = auth_header.split(" ", 1)[1]
    username = token  # demo token = username

    data = request.get_json()
    full_name = data.get("full_name")
    email = data.get("email")
    phone = data.get("phone")

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE users 
        SET full_name=%s, email=%s, phone=%s
        WHERE username=%s
    """, (full_name, email, phone, username))

    conn.commit()

    return jsonify({"status": "success", "message": "Profile updated successfully"})


@app.get("/dashboard/stats")
def dashboard_stats():
    data = {
        "total_users": 1200,
        "today_sales": 34,
        "total_revenue": 98000,
        "pending_tasks": 12,
        "monthly_sales": [5000, 7000, 9000, 7500, 8500, 10000, 11000],
        "users_per_month": [50, 80, 120, 90, 140, 160, 200],
        "revenue_split": [
            {"name": "Product A", "value": 40000},
            {"name": "Product B", "value": 30000},
            {"name": "Product C", "value": 28000}
        ]
    }
    return jsonify(data)

# @app.get("/employees")
# def get_employees():
#     conn = get_connection()
#     cur = conn.cursor(dictionary=True)
#     cur.execute("SELECT * FROM employee_master ORDER BY emp_id DESC")
#     data = cur.fetchall()
#     return jsonify(data)

# @app.get("/employees")
# def get_employees():
#     try:
#         page = int(request.args.get("page", 1))
#         limit = int(request.args.get("limit", 10))
#         offset = (page - 1) * limit

#         conn = get_connection()
#         cur = conn.cursor(dictionary=True)

#         # Get paginated records
#         cur.execute("""
#             SELECT emp_id, emp_name, emp_email, emp_phone, emp_designation, created_at
#             FROM employee_master
#             ORDER BY emp_id DESC
#             LIMIT %s OFFSET %s
#         """, (limit, offset))

#         rows = cur.fetchall()

#         # Get total count
#         cur.execute("SELECT COUNT(*) AS total FROM employee_master")
#         total = cur.fetchone()['total']

#         return jsonify({
#             "data": rows,
#             "total": total,
#             "page": page,
#             "limit": limit
#         })

#     except Exception as e:
#         print("Pagination error:", e)
#         return jsonify({"error": "Server error"}), 500

@app.get("/employees")
def get_employees():
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        offset = (page - 1) * limit

        # new: get search params
        q = request.args.get("q", "").strip()  # general search string
        # Or you can use specific filters: name, email, designation
        name = request.args.get("name", "").strip()
        email = request.args.get("email", "").strip()
        designation = request.args.get("designation", "").strip()

        conn = get_connection()
        cur = conn.cursor(dictionary=True)

        # Build WHERE clause parts
        where_clauses = []
        params = []

        if q:
            where_clauses.append(
                "(emp_name LIKE %s OR emp_email LIKE %s OR emp_designation LIKE %s)"
            )
            likeq = f"%{q}%"
            params.extend([likeq, likeq, likeq])

        else:
            if name:
                where_clauses.append("emp_name LIKE %s")
                params.append(f"%{name}%")
            if email:
                where_clauses.append("emp_email LIKE %s")
                params.append(f"%{email}%")
            if designation:
                where_clauses.append("emp_designation LIKE %s")
                params.append(f"%{designation}%")

        where_sql = ""
        if where_clauses:
            where_sql = "WHERE " + " AND ".join(where_clauses)

        # Total count query
        count_sql = f"SELECT COUNT(*) AS total FROM employee_master {where_sql}"
        cur.execute(count_sql, params)
        total = cur.fetchone()["total"]

        # Data fetch with limit & offset
        # sql = f"""
        #   SELECT emp_id, emp_name, emp_email, emp_phone, emp_designation, created_at
        #   FROM employee_master
        #   {where_sql}
        #   ORDER BY emp_id DESC
        #   LIMIT %s OFFSET %s
        # """
        # After you compute where_sql & params and before building final SQL:
        sort_by = request.args.get("sort_by", "emp_id")
        order = request.args.get("order", "desc").lower()

        # Whitelist columns:
        allowed_cols = {"emp_id", "emp_name", "emp_email", "emp_phone", "emp_designation", "created_at"}
        if sort_by not in allowed_cols:
            sort_by = "emp_id"
        if order not in ("asc", "desc"):
            order = "desc"

        sql = f"""
        SELECT emp_id, emp_name, emp_email, emp_phone, emp_designation, created_at
        FROM employee_master
        {where_sql}
        ORDER BY {sort_by} {order.upper()}
        LIMIT %s OFFSET %s
        """

        params_for_data = params + [limit, offset]
        cur.execute(sql, params_for_data)
        rows = cur.fetchall()

        return jsonify({
            "data": rows,
            "total": total,
            "page": page,
            "limit": limit
        })

    except Exception as e:
        print("Error in /employees:", e)
        return jsonify({"error": "Server error"}), 500

@app.post("/employees")
def add_employee():
    data = request.get_json()
    name = data.get("emp_name")
    email = data.get("emp_email")
    phone = data.get("emp_phone")
    desig = data.get("emp_designation")

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO employee_master (emp_name, emp_email, emp_phone, emp_designation)
        VALUES (%s, %s, %s, %s)
    """, [name, email, phone, desig])
    conn.commit()

    return jsonify({"status": "success"})

@app.get("/employees/<int:emp_id>")
def get_single_employee(emp_id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM employee_master WHERE emp_id=%s", [emp_id])
    data = cur.fetchone()
    return jsonify(data)


@app.put("/employees/<int:emp_id>")
def update_employee(emp_id):
    data = request.get_json()

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE employee_master
        SET emp_name=%s, emp_email=%s, emp_phone=%s, emp_designation=%s
        WHERE emp_id=%s
    """, [
        data["emp_name"],
        data["emp_email"],
        data["emp_phone"],
        data["emp_designation"],
        emp_id
    ])
    conn.commit()

    return jsonify({"status": "success"})

@app.delete("/employees/<int:emp_id>")
def delete_employee(emp_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM employee_master WHERE emp_id=%s", [emp_id])
    conn.commit()
    return jsonify({"status": "deleted"})


# --- GET all designations ---
@app.get("/designations")
def get_designations():
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("""
      SELECT desig_id, title, description, created_at
      FROM designation_master
      ORDER BY desig_id DESC
    """)
    rows = cur.fetchall()
    return jsonify(rows)

# --- GET single designation by id ---
@app.get("/designations/<int:desig_id>")
def get_single_designation(desig_id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("""
      SELECT desig_id, title, description, created_at
      FROM designation_master
      WHERE desig_id = %s
    """, (desig_id,))
    row = cur.fetchone()
    if not row:
        return jsonify({"message": "Not found"}), 404
    return jsonify(row)

# --- CREATE new designation ---
@app.post("/designations")
def add_designation():
    data = request.get_json()
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()

    if not title:
        return jsonify({"message": "Title is required"}), 400

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
          INSERT INTO designation_master (title, description)
          VALUES (%s, %s)
        """, (title, description))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "Designation added"}), 201

# --- UPDATE designation ---
@app.put("/designations/<int:desig_id>")
def update_designation(desig_id):
    data = request.get_json()
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()

    if not title:
        return jsonify({"message": "Title is required"}), 400

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
          UPDATE designation_master
          SET title = %s, description = %s
          WHERE desig_id = %s
        """, (title, description, desig_id))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "Designation updated"})

# --- DELETE designation ---
@app.delete("/designations/<int:desig_id>")
def delete_designation(desig_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM designation_master WHERE desig_id = %s", (desig_id,))
    conn.commit()
    return jsonify({"message": "Designation deleted"})

# --- GET all departments ---
@app.get("/departments")
def get_departments():
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("""
      SELECT dept_id, dept_name, description, created_at
      FROM department_master
      ORDER BY dept_id DESC
    """)
    return jsonify(cur.fetchall())

# --- GET single department ---
@app.get("/departments/<int:dept_id>")
def get_department(dept_id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("""
      SELECT dept_id, dept_name, description, created_at
      FROM department_master
      WHERE dept_id = %s
    """, (dept_id,))
    row = cur.fetchone()
    if not row:
        return jsonify({"message":"Not found"}), 404
    return jsonify(row)

# --- CREATE department ---
@app.post("/departments")
def add_department():
    data = request.get_json()
    name = data.get("dept_name", "").strip()
    desc = data.get("description", "").strip()
    if not name:
        return jsonify({"message":"Name is required"}), 400

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
          "INSERT INTO department_master (dept_name, description) VALUES (%s, %s)",
          (name, desc)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"message": str(e)}), 400

    return jsonify({"message":"Department added"}), 201

# --- UPDATE department ---
@app.put("/departments/<int:dept_id>")
def update_department(dept_id):
    data = request.get_json()
    name = data.get("dept_name", "").strip()
    desc = data.get("description", "").strip()
    if not name:
        return jsonify({"message":"Name is required"}), 400

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
          UPDATE department_master
          SET dept_name=%s, description=%s
          WHERE dept_id=%s
        """, (name, desc, dept_id))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"message": str(e)}), 400

    return jsonify({"message":"Department updated"})

# --- DELETE department ---
@app.delete("/departments/<int:dept_id>")
def delete_department(dept_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM department_master WHERE dept_id=%s", (dept_id,))
    conn.commit()
    return jsonify({"message":"Department deleted"})

@app.get("/leaves")
def get_leaves():
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("""
      SELECT l.leave_id, l.emp_id, e.emp_name, l.leave_type,
             l.start_date, l.end_date, l.reason, l.status,
             l.applied_at, l.updated_at
      FROM leave_requests l
      JOIN employee_master e ON e.emp_id = l.emp_id
      ORDER BY l.leave_id DESC
    """)
    return jsonify(cur.fetchall())

# @app.post("/leaves")
# def apply_leave():
#     data = request.get_json()
#     emp_id = data.get("emp_id")
#     leave_type = data.get("leave_type")
#     start = data.get("start_date")
#     end = data.get("end_date")
#     reason = data.get("reason", "")

#     if not (emp_id and leave_type and start and end):
#         return jsonify({"message":"Missing data"}), 400

#     conn = get_connection()
#     cur = conn.cursor()
#     cur.execute("""
#       INSERT INTO leave_requests (emp_id, leave_type, start_date, end_date, reason)
#       VALUES (%s, %s, %s, %s, %s)
#     """, (emp_id, leave_type, start, end, reason))
#     conn.commit()
#     return jsonify({"message":"Leave applied"}), 201

@app.post("/leaves")
def apply_leave():
    data = request.get_json()
    emp_id = data.get("emp_id")
    leave_type = data.get("leave_type")
    start = data.get("start_date")  # e.g. '2025-11-28T18:30:00.000Z'
    end = data.get("end_date")
    reason = data.get("reason", "")

    try:
        # convert ISO string to date (or datetime) object
        start_dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
        end_dt = datetime.fromisoformat(end.replace("Z", "+00:00"))
    except Exception as e:
        return jsonify({"message": "Invalid date format"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
      INSERT INTO leave_requests (emp_id, leave_type, start_date, end_date, reason)
      VALUES (%s, %s, %s, %s, %s)
    """, (emp_id, leave_type, start_dt.date(), end_dt.date(), reason))
    conn.commit()
    return jsonify({"message":"Leave applied"}), 201


@app.put("/leaves/<int:leave_id>")
def update_leave(leave_id):
    data = request.get_json()
    # You may allow employee to update before approval, or admin to approve/reject
    status = data.get("status")  # 'approved' or 'rejected'
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
      UPDATE leave_requests SET status=%s, updated_at=NOW() WHERE leave_id=%s
    """, (status, leave_id))
    conn.commit()
    return jsonify({"message":"Leave status updated"})

@app.delete("/leaves/<int:leave_id>")
def delete_leave(leave_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM leave_requests WHERE leave_id=%s", (leave_id,))
    conn.commit()
    return jsonify({"message":"Leave deleted"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
