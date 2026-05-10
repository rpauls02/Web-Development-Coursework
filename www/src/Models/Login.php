<?php

namespace In3050Inm428WebDev\Models;

require_once 'includes/dbconnect.php';

class Login
{
    public function handle_login($email, $password)
    {
        // Connect to database
        $conn = db_connect();

        // Check if user account exists
        if (!$this->user_exists($conn, $email)) {
            throw new \Exception('Account not found. Verify details or create account.');
        }

        // Prepare statement
        $stmt = $conn->prepare('SELECT id, password, role FROM users WHERE email = ?');
        if (!$stmt) {
            throw new \Exception('SQL error: ' . $conn->error);
        }

        // Bind parameters
        $stmt->bind_param('s', $email);

        // Execute statement and store result
        if (!$stmt->execute()) {
            throw new \Exception('SQL error: ' . $stmt->error);
        }

        $stmt->store_result();

        // If account exists (one or more rows found)
        if ($stmt->num_rows > 0) {
            // Fetch stored password and compare to user input
            $stmt->bind_result($id, $stored_password, $role);
            $stmt->fetch();

            if (password_verify($password, $stored_password)) {
                $stmt->close();
                $conn->close();
                
                $_SESSION['user_id'] = $id;
                $_SESSION['role'] = $role;
                $_SESSION['email'] = $email;
                return true;
            }
        }

        $stmt->close();
        $conn->close();
    }

    private function user_exists($conn, $email)
    {
        // Prepare statement
        $stmt = $conn->prepare('SELECT * FROM users WHERE email = ?');

        // Bind parameters
        $stmt->bind_param('s', $email);

        // Execute statement and store result
        $stmt->execute();
        $stmt->store_result();
        $exists = $stmt->num_rows > 0;
        $stmt->close();

        // Return result
        return $exists;
    }
}
