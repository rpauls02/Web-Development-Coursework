<?php

namespace In3050Inm428WebDev;

require_once 'vendor/autoload.php';

class Controller
{
    public $data;

    protected function start_session(bool $remember = false): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_set_cookie_params([
                'lifetime' => $remember ? 60 * 60 * 24 * 30 : 0,
                'path' => '/',
                'secure' => isset($_SERVER['HTTPS']),
                'httponly' => true,
                'samesite' => 'Lax',
            ]);
            session_start();
        }
    }

    protected function is_expired(): bool
    {
        return
            empty($_SESSION['loggedin']) ||
            $_SESSION['loggedin'] !== true ||
            !isset($_SESSION['expires_at']) ||
            time() > $_SESSION['expires_at'];
    }

    protected function expire_session(): void
    {
        if (!$this->is_expired()) {
            return;
        }

        session_unset();
        session_destroy();

        session_start();
        $_SESSION['error'] = 'Your session has expired. Please log in again.';
        header('Location: /login');
        exit;
    }

    protected function requireStaff(): void
    {
        $this->start_session();

        if (
            empty($_SESSION['loggedin']) ||
            $_SESSION['loggedin'] !== true ||
            $_SESSION['role'] !== 'staff'
        ) {
            header('Location: /login');
            exit;
        }

        if ($this->is_expired()) {
            $this->expire_session();
        }
    }

    protected function requireVolunteer(): void
    {
        $this->start_session();

        if (
            empty($_SESSION['loggedin']) ||
            $_SESSION['loggedin'] !== true ||
            $_SESSION['role'] !== 'volunteer'
        ) {
            header('Location: /login');
            exit;
        }

        if ($this->is_expired()) {
            $this->expire_session();
        }
    }

    protected function render($view, $data = [])
    {
        $loader = new \Twig\Loader\FilesystemLoader('src/Views');
        $twig = new \Twig\Environment($loader, ['cache' => 'compilation_cache', 'debug' => true,]);
        $twig->addExtension(new \Twig\Extension\DebugExtension());

        $template = $twig->load("$view.html");
        echo $template->render($data);

    }
}