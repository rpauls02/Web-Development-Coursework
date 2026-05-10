<?php

namespace In3050Inm428WebDev\Models;

require_once 'includes/dbconnect.php';

class OpenHours
{
    public function retrieve_open_hours(?string $date = null)
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
            'SELECT date, 
            DATE_FORMAT(open, "%H:%i") AS open, 
            DATE_FORMAT(close, "%H:%i") AS close
            FROM openhours
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

    public function insert_open_hours(array $openhours)
    {
        $conn = db_connect();

        $stmt = $conn->prepare(
            "INSERT INTO openhours (`date`, `open`, `close`) VALUES (?, ?, ?)"
        );

        if (!$stmt) {
            throw new \Exception('SQL error: ' . $conn->error);
        }

        foreach ($openhours as $row) {
            $stmt->bind_param('sss', $row['date'], $row['open'], $row['close']);

            if (!$stmt->execute()) {
                throw new \Exception('SQL error: ' . $stmt->error);
            }
        }

        $stmt->close();
        $conn->close();
    }

    public function update_open_hours(array $openhours)
    {
        $conn = db_connect();

        $stmt = $conn->prepare("
            UPDATE openhours
            SET open = ?, close =?
            WHERE date = ?
        ");

        foreach ($openhours as $row) {
            $stmt->bind_param('sss', $row['open'], $row['close'], $row['date']);

            if (!$stmt->execute()) {
                throw new \Exception('SQL error: ' . $stmt->error);
            }
        }

        $stmt->close();
        $conn->close();
    }
}
