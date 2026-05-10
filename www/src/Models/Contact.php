<?php

namespace In3050Inm428WebDev\Models;

require_once 'includes/dbconnect.php';

class Contact
{
    public function generate_query(string $name, string $email, string $message): void
    {
        $name = trim($name);
        $email = trim($email);
        $message = trim($message);

        // Email components
        $to = 'contact@communitytable.org';
        $subject = 'New Contact Form Enquiry';

        $headers = [
            "From: {$name} <{$email}>",
            "Reply-To: {$email}",
            "MIME-Version: 1.0",
            "Content-Type: text/plain; charset=UTF-8"
        ];

        $body = "New enquiry received via Community Table contact form\n\n";
        $body .= "Name: {$name}\n";
        $body .= "Email: {$email}\n\n";
        $body .= "Message:\n";
        $body .= "--------------------------------\n";
        $body .= $message . "\n";
        $body .= "--------------------------------\n";

        $emailText = "To: {$to}\n";
        $emailText .= "Subject: {$subject}\n";
        $emailText .= implode("\n", $headers) . "\n\n";
        $emailText .= $body;

        // Ensure Emails directory exists
        if (!is_dir(__DIR__ . '/../../Emails')) {
            mkdir(__DIR__ . '/../../Emails', 0755, true);
        }

        // Safe filename
        $timestamp = date('Ymd_His');
        $safeName = preg_replace('/[^a-z0-9]/i', '_', $name);
        $filename = __DIR__ . "/../../Emails/contact_{$safeName}_{$timestamp}.txt";

        file_put_contents($filename, $emailText);
    }
}