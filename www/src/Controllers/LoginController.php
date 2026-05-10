<?php

namespace In3050Inm428WebDev\Controllers;

use In3050Inm428WebDev\Controller;
use In3050Inm428WebDev\Models\Login;
use In3050Inm428WebDev\Models\OpenHours;

class LoginController extends Controller
{
    public function __construct()
    {
        $this->start_session();
    }

    public function index()
    {
        if (!empty($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
            if ($this->is_expired()) {
                $this->expire_session();
            }

            $redirect = $_SESSION['role'] === 'staff' ? '/staff' : '/volunteer';
            header("Location: $redirect");
            exit;
        }

        $data = [
            'pagetitle' => 'Community Table | Login',
            'loggedin' => $_SESSION['loggedin'] ?? null,
            'role' => $_SESSION['role'] ?? null,
            'error' => $_SESSION['error'] ?? null,
            'success' => $_SESSION['success'] ?? null
        ];

        unset($_SESSION['error'], $_SESSION['success']);

        $model = new OpenHours();
        $data['open_hours'] = $model->retrieve_open_hours();

        $this->render('login', $data);
    }

    public function authenticate()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: /login');
            exit;
        }

        $email = trim($_POST['email'] ?? '');
        $password = trim($_POST['password'] ?? '');
        $remember = isset($_POST['remember_me']);

        $errors = $this->validate_form($email, $password);

        if (!empty($errors)) {
            $_SESSION['error'] = implode('<br>', $errors);
            header('Location: /login');
            exit;
        }

        try {
            $login = new Login();

            if (!$login->handle_login($email, $password)) {
                $_SESSION['error'] = 'Incorrect email and/or password.';
                header('Location: /login');
                exit;
            }

            $this->start_session($remember);

            session_regenerate_id(true);

            $_SESSION['loggedin'] = true;
            $role = $_SESSION['role'];

            $_SESSION['expires_at'] = time() + ($remember
                ? ($role === 'staff' ? 8 * 60 * 60 : 1 * 60 * 60)
                : ($role === 'staff' ? 8 * 60 * 60 : 1 * 60 * 60)
            );

            $_SESSION['remember_me'] = $remember;

            $redirect = $role === 'staff' ? '/staff' : '/volunteer';
            header("Location: $redirect");
            exit;

        } catch (\Throwable $e) {
            $_SESSION['error'] = 'Incorrect details entered. Please try again.';
            header('Location: /login');
            exit;
        }
    }

    private function validate_form(string $email, string $password): array
    {
        $errors = [];

        if ($email === '' || $password === '') {
            $errors[] = 'Email and password are required.';
        }

        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Invalid email address.';
        }

        return $errors;
    }
}
