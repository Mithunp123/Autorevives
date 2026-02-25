from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import random
import string
import uuid
from datetime import datetime, timedelta

forgot_password_bp = Blueprint("forgot_password", __name__)

def _get_db():
    from .. import db
    return db.get_db()


def _send_otp_email(to_email, username, otp):
    """Send OTP via SMTP. Returns (success, error_message)."""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_username = os.getenv("SMTP_USERNAME", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")

    if not smtp_password:
        print(f"[SIMULATED EMAIL] To: {to_email} | OTP: {otp}")
        return True, None

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = smtp_username
        msg["To"] = to_email
        msg["Subject"] = "AutoRevive — Your Password Reset OTP"

        year = datetime.now().year
        html_body = f"""
        <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:#0B1628;padding:28px 32px;text-align:center;">
            <h1 style="color:#fff;font-size:22px;margin:0;">Auto<span style="color:#D4A017;">Revive</span></h1>
          </div>
          <div style="padding:32px;">
            <p style="font-size:16px;color:#111827;">Hello <strong>{username}</strong>,</p>
            <p style="color:#6b7280;font-size:14px;">We received a request to reset your password. Use the OTP below to verify your identity. This OTP is valid for <strong>10 minutes</strong>.</p>
            <div style="background:#f9fafb;border:2px dashed #D4A017;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
              <p style="font-size:38px;font-weight:900;letter-spacing:12px;color:#0B1628;margin:0;">{otp}</p>
              <p style="color:#9ca3af;font-size:12px;margin-top:8px;">One-Time Password</p>
            </div>
            <p style="color:#9ca3af;font-size:12px;text-align:center;">If you did not request this, please ignore this email. Your account is safe.</p>
          </div>
          <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #f3f4f6;">
            <p style="font-size:11px;color:#9ca3af;margin:0;">&copy; {year} AutoRevive. All rights reserved.</p>
          </div>
        </div>
        """

        plain_body = (
            f"Hello {username},\n\n"
            f"Your OTP for password reset is: {otp}\n\n"
            f"This OTP expires in 10 minutes.\n\n"
            f"If you did not request this, ignore this email."
        )
        msg.attach(MIMEText(plain_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        server = smtplib.SMTP(smtp_host, smtp_port)
        server.ehlo()
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()
        return True, None
    except Exception as e:
        print(f"SMTP Error: {repr(e)}")
        return False, str(e)


@forgot_password_bp.route("/forgot", methods=["POST"])
def forgot_password():
    """Step 1: User enters email -> OTP sent via SMTP."""
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, username FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            # Prevent email enumeration
            return jsonify({"message": "If that email is registered, an OTP will be sent.", "email": email}), 200

        # Generate 6-digit OTP
        otp = "".join(random.choices(string.digits, k=6))
        expires_at = datetime.now() + timedelta(minutes=10)

        # Delete old OTPs for this user
        cursor.execute("DELETE FROM password_resets WHERE user_id = %s", (user["id"],))

        # Store OTP in the token column
        cursor.execute(
            "INSERT INTO password_resets (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user["id"], otp, expires_at)
        )
        conn.commit()

        # Send OTP email
        _send_otp_email(email, user["username"], otp)

        return jsonify({"message": "OTP sent to your email address.", "email": email}), 200

    finally:
        cursor.close()
        conn.close()


@forgot_password_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    """Step 2: User enters OTP -> returns a short-lived reset_token."""
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    otp = data.get("otp", "").strip()

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required"}), 400

    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "Invalid request"}), 400

        cursor.execute(
            "SELECT * FROM password_resets WHERE user_id = %s AND token = %s",
            (user["id"], otp)
        )
        entry = cursor.fetchone()

        if not entry:
            return jsonify({"error": "Invalid OTP. Please check and try again."}), 400

        if entry["expires_at"] < datetime.now():
            cursor.execute("DELETE FROM password_resets WHERE user_id = %s", (user["id"],))
            conn.commit()
            return jsonify({"error": "OTP has expired. Please request a new one."}), 400

        # OTP valid -> swap to a secure reset token (15-min window to reset)
        reset_token = str(uuid.uuid4())
        new_expires = datetime.now() + timedelta(minutes=15)
        cursor.execute(
            "UPDATE password_resets SET token = %s, expires_at = %s WHERE user_id = %s",
            (reset_token, new_expires, user["id"])
        )
        conn.commit()

        return jsonify({"message": "OTP verified.", "reset_token": reset_token}), 200

    finally:
        cursor.close()
        conn.close()


@forgot_password_bp.route("/reset", methods=["POST"])
def reset_password():
    """Step 3: User sets new password using the verified reset_token."""
    data = request.get_json() or {}
    token = data.get("token", "").strip()
    new_password = data.get("new_password", "")

    if not token or not new_password:
        return jsonify({"error": "Token and new password are required"}), 400

    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    conn = _get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM password_resets WHERE token = %s", (token,))
        reset_entry = cursor.fetchone()

        if not reset_entry:
            return jsonify({"error": "Invalid or expired session. Please restart."}), 400

        if reset_entry["expires_at"] < datetime.now():
            cursor.execute("DELETE FROM password_resets WHERE id = %s", (reset_entry["id"],))
            conn.commit()
            return jsonify({"error": "Session expired. Please request a new OTP."}), 400

        hashed = generate_password_hash(new_password)
        cursor.execute("UPDATE users SET password_hash = %s WHERE id = %s", (hashed, reset_entry["user_id"]))
        cursor.execute("DELETE FROM password_resets WHERE user_id = %s", (reset_entry["user_id"],))
        conn.commit()

        return jsonify({"message": "Password reset successfully. You can now login."}), 200

    finally:
        cursor.close()
        conn.close()
