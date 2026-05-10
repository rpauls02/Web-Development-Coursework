<?php

namespace In3050Inm428WebDev\Models;

require_once 'includes/dbconnect.php';

class Register
{
    public function handle_registration($fname, $sname, $mobile, $email, $password, $age_verified)
    {
        $conn = db_connect();

        if ($this->user_exists($conn, $email)) {
            throw new \Exception('An account already exists with this email. Try again or log in.');
        }

        $stmt = $conn->prepare(
            'INSERT INTO users (fname, sname, mobile, email, password, age_verified)
             VALUES (?, ?, ?, ?, ?, ?)'
        );

        if (!$stmt) {
            throw new \Exception('SQL error: ' . $conn->error);
        }

        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $age_verified = $age_verified ? 1 : 0;

        $stmt->bind_param(
            'sssssi',
            $fname,
            $sname,
            $mobile,
            $email,
            $hashed_password,
            $age_verified
        );

        if (!$stmt->execute()) {
            throw new \Exception('SQL error: ' . $stmt->error);
        }

        $stmt->close();
        $conn->close();

        $this->generate_confirmation_email($email);
    }

    private function user_exists($conn, $email)
    {
        // Prepare statement
        $stmt = $conn->prepare('SELECT * FROM users WHERE email = ?');
        if (!$stmt) {
            throw new \Exception('SQL error: ' . $conn->error);
        }

        // Bind parameters
        $stmt->bind_param('s', $email);

        if (!$stmt->execute()) {
            throw new \Exception('SQL error: ' . $stmt->error);
        }

        $stmt->store_result();
        $exists = $stmt->num_rows > 0;
        $stmt->close();

        // Return result
        return $exists;
    }

    private function generate_confirmation_email($email)
    {
        $to = $email;
        $from = "no-reply@commtable.com";
        $subject = "Welcome to Community Table!";

        // Minimal headers for a readable .eml
        $headers = "From: $from\r\n";
        $headers .= "Subject: $subject\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

        $htmlText = "
            <html>
                <body>
                    <h1>Welcome to the Community Table!</h1>
                    <p>We are thrilled to have you on board.</p>
                    <p>Happy browsing!</p>
                    <p><strong>Best regards,</strong><br>The Community Table Team</p>
                </body>
            </html>";

        $filePath = "./Emails/{$email}_welcome_email.eml";

        if (!file_exists('./Emails')) {
            mkdir('./Emails', 0755, true);
        }

        file_put_contents($filePath, $headers . "\r\n" . $htmlText);

        return $filePath;
    }
}
