<?php

namespace In3050Inm428WebDev\Controllers;

use In3050Inm428WebDev\Controller;
use In3050Inm428WebDev\Models\Register;
use In3050Inm428WebDev\Models\OpenHours;

class RegisterController extends Controller
{

    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public function index()
    {
        $data = [
            "pagetitle" => 'Community Table | Register',
            'loggedin' => $_SESSION['loggedin'] ?? null,
            'error' => $_SESSION['error'] ?? null,
            'success' => $_SESSION['success'] ?? null
        ];
        unset($_SESSION['error'], $_SESSION['success']);

        $model = new OpenHours();
        $data['open_hours'] = $model->retrieve_open_hours();


        $this->render('register', $data);
    }

    public function create_account()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $fname = trim($_POST['fname']);
            $sname = trim($_POST['sname']);
            $dob = trim($_POST['dob']);
            $email = trim($_POST['email']);
            $mobile = trim($_POST['mobile']);
            $password = trim($_POST['password']);
            $confirmPassword = trim($_POST['confirm-password']);

            $errors = $this->validate_form($fname, $sname, $dob, $email, $mobile, $password, $confirmPassword);

            if (!empty($errors)) {
                $_SESSION['error'] = implode('<br>', $errors);
                header('Location: /register');
                exit;
            }

            $dob = $_POST['dob'];

            try {
                $birthDate = new \DateTime($dob);
            } catch (\Exception $e) {
                $_SESSION['error'] = 'You must be 18 or over to register.';
                header('Location: /register');
                exit;
            }

            $today = new \DateTime();
            $age = $today->diff($birthDate)->y;

            $age_verified = $age >= 18;

            $register = new Register();
            try {
                $register->handle_registration($fname, $sname, $mobile, $email, $password, $age_verified);
                $_SESSION['success'] = 'Account successfully registered.';
                header('Location: /login');
                exit;
            } catch (\Exception $e) {
                $_SESSION['error'] = $e->getMessage();
                header('Location: /register');
                exit;
            }
        }
    }

    private function validate_form($fname, $sname, $dob, $email, $mobile, $password, $confirmPassword)
    {
        $errors = [];

        // First name
        if (empty($fname)) {
            $errors[] = 'First name is required.';
        } elseif (!preg_match('/^[a-zA-Z\s\-]+$/', $fname)) {
            $errors[] = 'First name may only contain letters, spaces, or hyphens.';
        }

        // Surname
        if (empty($sname)) {
            $errors[] = 'Surname is required.';
        } elseif (!preg_match('/^[a-zA-Z\s\-]+$/', $sname)) {
            $errors[] = 'Surname may only contain letters, spaces, or hyphens.';
        }

        // Date of Birth
        if (empty($dob)) {
            $errors[] = 'Date of Birth is required.';
        } else {
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dob)) {
                $errors[] = 'Date of Birth must be in YYYY-MM-DD format.';
            } else {
                list($year, $month, $day) = explode('-', $dob);
                if (!checkdate($month, $day, $year)) {
                    $errors[] = 'Invalid Date of Birth.';
                } else {
                    $birthDate = new \DateTime("$year-$month-$day");
                    $today = new \DateTime();
                    $age = $today->diff($birthDate)->y;
                    if ($age < 18) {
                        $errors[] = 'You must be at least 18 years old to register.';
                    }
                }
            }
        }

        // Email
        if (empty($email)) {
            $errors[] = 'Email is required.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Invalid email address.';
        }

        // Mobile
        if (empty($mobile)) {
            $errors[] = 'Mobile number is required.';
        } elseif (!preg_match('/^\+?[0-9]{10,15}$/', $mobile)) {
            $errors[] = 'Invalid mobile number format.';
        }

        // Password
        if (empty($password)) {
            $errors[] = 'Password is required.';
        } else {
            if (strlen($password) < 12) {
                $errors[] = 'Password must be at least 12 characters long.';
            }
            if (!preg_match('/[A-Z]/', $password)) {
                $errors[] = 'Password must contain at least one uppercase letter.';
            }
            if (!preg_match('/[a-z]/', $password)) {
                $errors[] = 'Password must contain at least one lowercase letter.';
            }
            if (!preg_match('/[0-9]/', $password)) {
                $errors[] = 'Password must contain at least one number.';
            }
            if (!preg_match('/[\W_]/', $password)) {
                $errors[] = 'Password must contain at least one special character (e.g., !@#$%^&*).';
            }
        }

        // Confirm password
        if ($password !== $confirmPassword) {
            $errors[] = 'Passwords do not match.';
        }

        return $errors;
    }

}