<?php

namespace In3050Inm428WebDev\Controllers;

use In3050Inm428WebDev\Controller;
use In3050Inm428WebDev\Models\OpenHours;

class OpenHoursController extends Controller
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

            $model = new OpenHours();
            $open_hours = $model->retrieve_open_hours($date);

            http_response_code(200);
            echo json_encode(['open_hours' => $open_hours]);

        } catch (\InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error']);
        }
    }

    public function create()
    {
        $this->requireStaff();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not permitted']);
            return;
        }

        $request = json_decode(file_get_contents('php://input'), true);

        if (!isset($request['openhours']) || !is_array($request['openhours'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid request format']);
            return;
        }

        if (empty($request['openhours'])) {
            http_response_code(422);
            echo json_encode(['success' => false, 'error' => 'No opening hours provided']);
            return;
        }

        try {
            $model = new OpenHours();
            $model->insert_open_hours($request['openhours']);

            http_response_code(201);
            echo json_encode(['success' => true]);

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function update()
    {
        $this->requireStaff();

        if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not permitted']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['openhours']) || !is_array($input['openhours'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid input']);
            return;
        }

        try {
            $model = new OpenHours();
            $model->update_open_hours($input['openhours']);

            http_response_code(200);
            echo json_encode(['success' => true]);

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}
