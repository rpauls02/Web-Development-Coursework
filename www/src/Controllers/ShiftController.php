<?php

namespace In3050Inm428WebDev\Controllers;

use In3050Inm428WebDev\Controller;
use In3050Inm428WebDev\Models\Shift;

class ShiftController extends Controller
{
    public function retrieve(?string $date = null)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not permitted']);
            return;
        }

        header('Content-Type: application/json');

        try {
            $date = $_GET['date'] ?? null;
            
            $model = new Shift();

            $includeSignups = !empty($_GET['includeSignups']);

            if ($includeSignups) {
                $shifts = $model->retrieve_signups($date);
                echo json_encode(['shifts' => $shifts]);
            } else {
                $shifts = $model->retrieve_shifts($date);
                echo json_encode(['shifts' => $shifts]);
            }

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function create()
    {
        $this->requireStaff();
        header('Content-Type: application/json');

        try {
            $request = json_decode(file_get_contents('php://input'), true);
            $shifts = $request['shifts'] ?? [];

            $model = new Shift();
            $model->insert_shifts($shifts);

            echo json_encode(['success' => true]);

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Server error']);
        }
    }

    public function update()
    {
        $this->requireStaff();
        header('Content-Type: application/json');

        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $shifts = $input['shifts'] ?? [];

            $model = new Shift();
            $model->update_shifts($shifts);

            echo json_encode(['success' => true]);

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Server error']);
        }
    }
}
