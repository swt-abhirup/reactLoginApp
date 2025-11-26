from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt
from db import get_connection

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

@app.get("/employees")
def get_employees():
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM employee_master ORDER BY emp_id DESC")
    data = cur.fetchall()
    return jsonify(data)

# @app.post("/employees")
# def add_employee():
#     data = request.get_json()
#     name = data.get("emp_name")
#     email = data.get("emp_email")
#     phone = data.get("emp_phone")
#     desig = data.get("emp_designation")

#     conn = get_connection()
#     cur = conn.cursor()
#     cur.execute("""
#         INSERT INTO employee_master (emp_name, emp_email, emp_phone, emp_designation)
#         VALUES (%s, %s, %s, %s)
#     """, [name, email, phone, desig])
#     conn.commit()

#     return jsonify({"status": "success"})

@app.get("/employees")
def get_employee():
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        offset = (page - 1) * limit

        conn = get_connection()
        cur = conn.cursor(dictionary=True)

        # Get paginated records
        cur.execute("""
            SELECT emp_id, emp_name, emp_email, emp_phone, emp_designation, created_at
            FROM employee_master
            ORDER BY emp_id DESC
            LIMIT %s OFFSET %s
        """, (limit, offset))

        rows = cur.fetchall()

        # Get total count
        cur.execute("SELECT COUNT(*) AS total FROM employee_master")
        total = cur.fetchone()['total']

        return jsonify({
            "data": rows,
            "total": total,
            "page": page,
            "limit": limit
        })

    except Exception as e:
        print("Pagination error:", e)
        return jsonify({"error": "Server error"}), 500


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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
