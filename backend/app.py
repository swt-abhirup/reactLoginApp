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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
