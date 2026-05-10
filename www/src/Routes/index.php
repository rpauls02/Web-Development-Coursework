<?php

namespace In3050Inm428WebDev;

use In3050Inm428WebDev\Controllers\IndexController;
use In3050Inm428WebDev\Controllers\SignupController;
use In3050Inm428WebDev\Controllers\StaffController;
use In3050Inm428WebDev\Controllers\ContactController;
use In3050Inm428WebDev\Controllers\ShiftController;
use In3050Inm428WebDev\Controllers\OpenHoursController;
use In3050Inm428WebDev\Controllers\VolunteerController;
use In3050Inm428WebDev\Controllers\LoginController;
use In3050Inm428WebDev\Controllers\RegisterController;
use In3050Inm428WebDev\Controllers\LogoutController;
use In3050Inm428WebDev\Router;

$router = new Router();

// Main page
$router->get('/', IndexController::class, 'index');

// Customer query route
$router->post('/query', ContactController::class, action: 'create_query');

// Register page
$router->get('/register', RegisterController::class, 'index');
$router->post('/api/create_account', RegisterController::class, 'create_account');

// Login page
$router->get('/login', LoginController::class, 'index');
$router->post('/api/authenticate', LoginController::class, 'authenticate');

// Volunteer pages
$router->get('/volunteer', VolunteerController::class, 'index');
$router->post('/api/signup', VolunteerController::class, 'signup');

// Staff dashboard page
$router->get('/staff', StaffController::class, 'index');

// Open hours endpoints
$router->get('/api/openhours', OpenHoursController::class, 'retrieve');
$router->post('/api/openhours/create', OpenHoursController::class, 'create');
$router->put('/api/openhours/update', OpenHoursController::class, 'update');

// Shifts endpoints
$router->get('/api/shifts', ShiftController::class, 'retrieve');
$router->post('/api/shifts/create', ShiftController::class, 'create');
$router->put('/api/shifts/update', ShiftController::class, 'update');

# Signups endpoint
$router->get('/api/signups', SignupController::class,'retrieve');

// Logout
$router->get('/logout', LogoutController::class, 'logout');

$router->dispatch();