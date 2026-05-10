<?php

namespace In3050Inm428WebDev\Controllers;

use In3050Inm428WebDev\Controller;
use In3050Inm428WebDev\Models\Register;

class LogoutController extends Controller
{

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public function logout()
    {
        // Make sure session is started
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }

        // Clear all session data
        $_SESSION = [];

        // Destroy the session
        session_destroy();

        // Optionally, redirect to login page
        header('Location: /');
        exit;
    }
}