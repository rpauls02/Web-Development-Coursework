<?php

namespace In3050Inm428WebDev\Controllers;

use In3050Inm428WebDev\Controller;
use In3050Inm428WebDev\Models\OpenHours;

class IndexController extends Controller
{
    public function index()
    {
        $this->start_session();

        $data = [
            'pagetitle' => 'Community Table',
            'loggedin' => $_SESSION['loggedin'] ?? null,
            'error' => $_SESSION['error'] ?? null,
            'role' => $_SESSION['role'] ?? null,
            'success' => $_SESSION['success'] ?? null,
            'form_data' => $_SESSION['form_data'] ?? []
        ];

        $model = new OpenHours();
        $data['open_hours'] = $model->retrieve_open_hours();

        unset($_SESSION['error'], $_SESSION['success']);

        $this->render('index', $data);
    }
}
