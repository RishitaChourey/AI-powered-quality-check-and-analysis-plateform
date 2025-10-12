from flask import Flask, request, jsonify
from flask_cors import CORS
from save_user import register_user, check_login

app = Flask(__name__)
CORS(app)

def valid_email_gmail(email):
    if not email or '@' not in email: 
        return False
    return email.lower().endswith('@gmail.com')

def valid_password(password):
    return isinstance(password, str) and len(password) >= 6

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    # Basic backend validation
    if not valid_email_gmail(email):
        return jsonify({'message': 'Invalid email format or not a gmail address.'}), 400
    if not valid_password(password):
        return jsonify({'message': 'Password must be at least 6 characters.'}), 400

    success, message = check_login(email, password)
    # return 200 for success, 401 for incorrect password, 404 for user not found
    if success:
        return jsonify({'message': message}), 200
    else:
        if message == "User does not exist. Please sign up first.":
            return jsonify({'message': message}), 404
        else:
            return jsonify({'message': message}), 401

@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    email = data.get('email')
    new_password = data.get('password')

    # Validate email format
    if not email.endswith('@gmail.com'):
        return jsonify({'message': 'Invalid email format. Only Gmail allowed.'}), 400
    if not new_password or len(new_password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters.'}), 400

    # Connect to database
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({'message': 'User does not exist. Please sign up first.'}), 404

    # Update password
    cursor.execute('UPDATE users SET password = ? WHERE email = ?', (new_password, email))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Password reset successfully.'}), 200


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    username = data.get('username') or data.get('email')  # fallback
    email = data.get('email')
    password = data.get('password')

    if not valid_email_gmail(email):
        return jsonify({'message': 'Invalid email format or not a gmail address.'}), 400
    if not valid_password(password):
        return jsonify({'message': 'Password must be at least 6 characters.'}), 400

    success, message = register_user(username, email, password)
    if success:
        return jsonify({'message': message}), 201
    else:
        return jsonify({'message': message}), 409

if __name__ == "__main__":
    app.run(debug=True)
