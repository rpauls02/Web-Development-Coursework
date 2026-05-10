<?php

namespace In3050Inm428WebDev\Models;

require_once 'includes/dbconnect.php';

class Shift
{
    public function retrieve_shifts(?string $date = null)
    {
        $referenceDate = $date
            ? \DateTime::createFromFormat('Ymd', $date)
            : new \DateTime();

        if (!$referenceDate) {
            throw new \InvalidArgumentException('Invalid date format. Expected YYYYMMDD.');
        }

        $monday = clone $referenceDate;
        $monday->modify('monday this week');

        $sunday = clone $monday;
        $sunday->modify('+6 days');

        $conn = db_connect();

        $stmt = $conn->prepare(
            'SELECT *, 
            DATE_FORMAT(start, "%H:%i") AS start, 
            DATE_FORMAT(end, "%H:%i") AS end
            FROM shifts
            WHERE date BETWEEN ? AND ?
            ORDER BY date'
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

        foreach ($rows as &$row) {
            $row['day'] = (new \DateTime($row['date']))->format('l');
        }
        unset($row);

        return $rows ?: false;

        $stmt->close();
        $conn->close();
    }


    public function insert_shifts(array $shifts)
    {
        $conn = db_connect();

        $stmt = $conn->prepare(
            'INSERT INTO shifts (`date`, `name`, `start`, `end`)
         VALUES (?, ?, ?, ?)'
        );

        if (!$stmt) {
            throw new \Exception('SQL error: ' . $conn->error);
        }

        foreach ($shifts as $shift) {
            $stmt->bind_param(
                'ssss',
                $shift['date'],
                $shift['name'],
                $shift['start'],
                $shift['end']
            );

            if (!$stmt->execute()) {
                throw new \Exception('SQL error: ' . $stmt->error);
            }
        }

        $stmt->close();
        $conn->close();
    }

    public function update_shifts($shifts)
    {
        $conn = db_connect();

        $stmt = $conn->prepare("
        UPDATE shifts
        SET start = ?, end = ?
        WHERE date = ? AND name = ?
    ");

        if (!$stmt) {
            throw new \Exception('SQL error: ' . $conn->error);
        }

        foreach ($shifts as $row) {
            $stmt->bind_param('ssss', $row['start'], $row['end'], $row['date'], $row['name']);

            if (!$stmt->execute()) {
                throw new \Exception('SQL error: ' . $stmt->error);
            }
        }

        $stmt->close();
        $conn->close();
    }

    public function retrieve_signups(?string $date = null)
    {
        $referenceDate = $date
            ? \DateTime::createFromFormat('Y-m-d', $date)
            : new \DateTime();

        if (!$referenceDate) {
            throw new \InvalidArgumentException('Invalid date format. Expected YYYY-MM-DD.');
        }

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
                (SELECT CONCAT(u.fname, " (", u.email, ", ", u.mobile, ")")
                FROM shifts_users su 
                JOIN users u ON su.user_id = u.id 
                WHERE su.shift_id = s.id 
                ORDER BY su.signed_up_at 
                LIMIT 1) AS volunteer1,
                (SELECT CONCAT(u.fname, " (", u.email, ", ", u.mobile, ")")
                FROM shifts_users su 
                JOIN users u ON su.user_id = u.id 
                WHERE su.shift_id = s.id 
                ORDER BY su.signed_up_at 
                LIMIT 1 OFFSET 1) AS volunteer2
            FROM shifts s
            WHERE s.date BETWEEN ? AND ?
            ORDER BY s.date, s.start'
        );

        if (!$stmt)
            throw new \Exception('SQL error: ' . $conn->error);

        $start = $monday->format('Y-m-d');
        $end = $sunday->format('Y-m-d');
        $stmt->bind_param('ss', $start, $end);
        if (!$stmt->execute())
            throw new \Exception('SQL error: ' . $stmt->error);

        $result = $stmt->get_result();
        $shifts = $result->fetch_all(MYSQLI_ASSOC);

        foreach ($shifts as &$shift) {
            $shift['day'] = (new \DateTime($shift['date']))->format('l');
        }
        unset($shift);

        $stmt->close();
        $conn->close();

        return $shifts ?: [];
    }
}
