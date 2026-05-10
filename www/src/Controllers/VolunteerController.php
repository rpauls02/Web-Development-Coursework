<?php

namespace In3050Inm428WebDev\Controllers;

use In3050Inm428WebDev\Controller;
use In3050Inm428WebDev\Models\Volunteer;

class VolunteerController extends Controller
{
    public function __construct()
    {
        $this->start_session();
    }

    public function index()
    {
        $data = [
            'pagetitle' => 'Community Table | Volunteer',
            'loggedin' => $_SESSION['loggedin'] ?? null,
            'role' => $_SESSION['role'] ?? null,
            'error' => $_SESSION['error'] ?? null,
            'success' => $_SESSION['success'] ?? null,
        ];

        unset($_SESSION['error'], $_SESSION['success']);

        $volunteerModel = new Volunteer();
        $data['shifts'] = $volunteerModel->get_available_shifts() ?: [];

        $data['logged_in'] = !empty($_SESSION['loggedin']) && $_SESSION['loggedin'] === true;
        $this->render('volunteer', $data);
    }

    public function signup()
    {
        $this->requireVolunteer();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: /volunteer');
            exit;
        }

        if (empty($_POST['shift_id'])) {
            $_SESSION['error'] = 'Shift ID is required.';
            header('Location: /volunteer');
            exit;
        }

        $shiftId = (int) $_POST['shift_id'];
        $userId = (int) $_SESSION['user_id'];
        $userEmail = (int) $_SESSION['email'];

        try {
            $model = new Volunteer();
            $model->add_volunteer($shiftId, $userId, $userEmail);

            $_SESSION['success'] = 'You have successfully signed up for this shift. An email confirming your chosen shift will be sent shortly.';
            header('Location: /volunteer');
            exit;

        } catch (\Exception $e) {
            $_SESSION['error'] = $e->getMessage();
            header('Location: /volunteer');
            exit;
        }
    }
}
