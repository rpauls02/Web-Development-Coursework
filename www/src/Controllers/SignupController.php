<?php

namespace In3050Inm428WebDev\Controllers;

use In3050Inm428WebDev\Controller;
use In3050Inm428WebDev\Models\Signup;

class SignupController extends Controller
{
    public function retrieve(?string $date = null)
    {
        $signupModel = new Signup();

        try {
            $shifts = $signupModel->retrieve_signups($date);
            header('Content-Type: application/json');
            echo json_encode(['shifts' => $shifts ?: []]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => $e->getMessage()
            ]);
        }
    }
}
