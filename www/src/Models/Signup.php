<?php

namespace In3050Inm428WebDev\Models;

require_once 'includes/dbconnect.php';

class Signup
{
    public function retrieve_signups(?string $date = null)
    {
        $referenceDate = $date
            ? \DateTime::createFromFormat('Ymd', $date)
            : new \DateTime();

        if (!$referenceDate) {
            throw new \InvalidArgumentException('Invalid date format. Expected YYYYMMDD.');
        }

        // Calculate Monday-Sunday of the week
        $monday = clone $referenceDate;
        $monday->modify('monday this week');
        $sunday = clone $monday;
        $sunday->modify('+6 days');

        $conn = db_connect();

        $stmt = $conn->prepare(
            'SELECT 
            s.id,
            s.name,
            s.date,
            DATE_FORMAT(s.start, "%H:%i") AS start,
            DATE_FORMAT(s.end, "%H:%i") AS end,
            (SELECT u.fname 
             FROM shifts_users su 
             JOIN users u ON su.user_id = u.id 
             WHERE su.shift_id = s.id 
             ORDER BY su.signed_up_at 
             LIMIT 1) AS volunteer1,
            (SELECT u.fname 
             FROM shifts_users su 
             JOIN users u ON su.user_id = u.id 
             WHERE su.shift_id = s.id 
             ORDER BY su.signed_up_at 
             LIMIT 1 OFFSET 1) AS volunteer2
        FROM shifts s
        WHERE s.date BETWEEN ? AND ?
        ORDER BY s.date, s.start_time'
        );

        if (!$stmt) {
            throw new \Exception('SQL error: ' . $conn->error);
        }

        $start = $monday->format('Y-m-d');
        $end = $sunday->format('Y-m-d');
        $stmt->bind_param('ss', $start, $end);

        if (!$stmt->execute()) {
            throw new \Exception('SQL error: ' . $stmt->error);
        }

        $result = $stmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        // Process each row to split volunteers and add day name
        foreach ($rows as &$row) {
            $row['day'] = (new \DateTime($row['date']))->format('l');
        }
        unset($row);

        $stmt->close();
        $conn->close();

        return $rows ?: false;
    }
}