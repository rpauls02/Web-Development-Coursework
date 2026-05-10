<?php

namespace In3050Inm428WebDev\Controllers;

use In3050Inm428WebDev\Controller;
use In3050Inm428WebDev\Models\Contact;

class ContactController extends Controller
{
    public function create_query()
    {
        $this->start_session();

        // Ensure form was submitted via POST
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: /#contact');
            exit;
        }

        // Retrieve input
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $message = trim($_POST['message'] ?? '');

        // Validate input
        $errors = $this->validate_form($name, $email, $message);

        if (!empty($errors)) {
            // Save errors and form data in session
            $_SESSION['error'] = implode('<br>', $errors);
            $_SESSION['form_data'] = $_POST;

            header('Location: /#contact');
            exit;
        }

        // Process contact form
        $contact = new Contact();
        try {
            $contact->generate_query($name, $email, $message);

            $_SESSION['success'] = 'Your query has been sent.';
            header('Location: /#contact');
            exit;
        } catch (\Exception $e) {
            $_SESSION['error'] = 'An error occurred: ' . $e->getMessage();
            $_SESSION['form_data'] = $_POST;
            header('Location: /#contact');
            exit;
        }
    }

    private function validate_form(string $name, string $email, string $message): array
    {
        $errors = [];

        if (empty($name)) {
            $errors[] = 'Please enter a name.';
        }

        if (empty($email)) {
            $errors[] = 'Please enter an email.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Invalid email address entered.';
        }

        if (empty($message)) {
            $errors[] = 'Please enter a message.';
        }

        return $errors;
    }
}
