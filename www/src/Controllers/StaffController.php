<?php

namespace In3050Inm428WebDev\Controllers;

use In3050Inm428WebDev\Controller;
use In3050Inm428WebDev\Models\Shift;
use In3050Inm428WebDev\Models\OpenHours;

class StaffController extends Controller
{
    public function index()
    {
        $this->requireStaff();

        $data = [
            'pagetitle' => 'Community Table | Staff',
            'loggedin' => $_SESSION['loggedin'],
            'role' => $_SESSION['role'],
            'error' => $_SESSION['error'] ?? null,
            'success' => $_SESSION['success'] ?? null,
        ];

        unset($_SESSION['error'], $_SESSION['success']);
        $date = $_GET['date'] ?? null;

        $shiftsModel = new Shift();
        $data['shifts'] = $shiftsModel->retrieve_shifts($date) ?: [];

        $this->render('staff', $data);
    }
}