<?php

namespace In3050Inm428WebDev\Models;

require_once 'includes/dbconnect.php';

class Volunteer
{
    public function get_available_shifts(?string $date = null)
    {
        $referenceDate = new \DateTime();
        $endDate = (clone $referenceDate)->modify('+13 days');

        $conn = db_connect();

        $stmt = $conn->prepare(
            'SELECT 
            s.id,
            s.date,
            s.name,
            DATE_FORMAT(s.start, "%H:%i") AS start,
            DATE_FORMAT(s.end, "%H:%i") AS end,
            COUNT(su.id) AS signup_count
        FROM shifts s
        LEFT JOIN shifts_users su ON s.id = su.shift_id
        WHERE s.date BETWEEN ? AND ?
        GROUP BY s.id, s.date
        HAVING signup_count < 2
        ORDER BY s.date, s.start'
        );

        if (!$stmt) {
            throw new \Exception('SQL error: ' . $conn->error);
        }

        $startStr = $referenceDate->format('Y-m-d');
        $endStr = $endDate->format('Y-m-d');
        $stmt->bind_param('ss', $startStr, $endStr);

        if (!$stmt->execute()) {
            throw new \Exception('SQL error: ' . $stmt->error);
        }

        $result = $stmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        foreach ($rows as &$row) {
            $row['day'] = (new \DateTime($row['date']))->format('l');
        }
        unset($row);

        $stmt->close();
        $conn->close();

        return $rows ?: false;
    }

    public function add_volunteer(int $shiftId, int $userId, string $userEmail): bool
    {
        $conn = db_connect();

        try {
            if ($this->is_shift_full($shiftId, $conn)) {
                throw new \Exception('This shift is already full');
            }

            if ($this->is_already_signed_up($shiftId, $userId, $conn)) {
                throw new \Exception('You are already signed up for this shift');
            }

            $shiftDate = $this->get_shift_date($shiftId, $conn);
            if (!$shiftDate) {
                throw new \Exception('Shift not found');
            }

            if (!$this->check_daily_limit($userId, $shiftDate, $conn)) {
                throw new \Exception('You have already signed up for 2 shifts on this day');
            }

            $success = $this->insert_signup($shiftId, $userId, $conn);

            if ($success) {
                $stmt = $conn->prepare('SELECT name, DATE_FORMAT(start, "%H:%i") AS start, DATE_FORMAT(end, "%H:%i") AS end FROM shifts WHERE id = ?');
                $stmt->bind_param('i', $shiftId);
                $stmt->execute();
                $result = $stmt->get_result();
                $shift = $result->fetch_assoc();
                $stmt->close();

                $this->generate_confirmation_email($userEmail, $shift['name'], $shiftDate, $shift['start'], $shift['end']);
            }

            return $success;

        } finally {
            $conn->close();
        }
    }

    private function is_shift_full(int $shiftId, $conn): bool
    {
        $stmt = $conn->prepare('SELECT COUNT(*) as count FROM shifts_users WHERE shift_id = ?');
        $stmt->bind_param('i', $shiftId);
        $stmt->execute();
        $result = $stmt->get_result();
        $count = $result->fetch_assoc()['count'];
        $stmt->close();

        return $count >= 2;
    }

    private function is_already_signed_up(int $shiftId, int $userId, $conn): bool
    {
        $stmt = $conn->prepare('SELECT id FROM shifts_users WHERE shift_id = ? AND user_id = ?');
        $stmt->bind_param('ii', $shiftId, $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $exists = $result->num_rows > 0;
        $stmt->close();

        return $exists;
    }

    private function check_daily_limit(int $userId, string $date, $conn): bool
    {
        $stmt = $conn->prepare(
            'SELECT COUNT(*) as count 
         FROM shifts_users su
         JOIN shifts s ON su.shift_id = s.id
         WHERE su.user_id = ? AND s.date = ?'
        );
        $stmt->bind_param('is', $userId, $date);
        $stmt->execute();
        $result = $stmt->get_result();
        $count = $result->fetch_assoc()['count'];
        $stmt->close();

        return $count < 2;
    }

    private function insert_signup(int $shiftId, int $userId, $conn): bool
    {
        $stmt = $conn->prepare(
            'INSERT INTO shifts_users (shift_id, user_id, signed_up_at) VALUES (?, ?, ?)'
        );
        $timestamp = date('Y-m-d H:i:s');
        $stmt->bind_param('iis', $shiftId, $userId, $timestamp);
        $stmt->execute();
        $success = $stmt->affected_rows > 0;
        $stmt->close();

        return $success;
    }

    private function get_shift_date(int $shiftId, $conn): ?string
    {
        $stmt = $conn->prepare('SELECT date FROM shifts WHERE id = ?');
        $stmt->bind_param('i', $shiftId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();

        return $row ? $row['date'] : null;
    }

    private function generate_confirmation_email(string $email, string $shiftName, string $shiftDate, string $shiftStart, string $shiftEnd): string
    {
        $to = $email;
        $from = "no-reply@commtable.com";
        $subject = "Volunteer Shift Confirmation";

        $headers = "From: $from\r\n";
        $headers .= "Subject: $subject\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

        $htmlText = "
            <html>
                <body>
                    <h1>Volunteer Shift Confirmation</h1>
                    <p>You have successfully signed up for the chosen shift.</p>
                    <p><strong>Shift:</strong> $shiftName<br>
                    <strong>Date:</strong> $shiftDate<br>
                    <strong>Time:</strong> $shiftStart - $shiftEnd</p>
                    <p>Thank you for volunteering!</p>
                    <p><strong>Best regards,</strong><br>The Community Table Team</p>
                </body>
            </html>";

        $filePath = "./Emails/{$email}_shift_{$shiftDate}.eml";

        if (!file_exists('./Emails')) {
            mkdir('./Emails', 0755, true);
        }

        file_put_contents($filePath, $headers . "\r\n" . $htmlText);

        return $filePath;
    }



}