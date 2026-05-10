<?php

namespace In3050Inm428WebDev\Controllers;

use In3050Inm428WebDev\Controller;

class TestimonialsController extends Controller
{
    public function index()
    {
        $data["pagesection"] = 'Testimonials';

        $this->render('testimonials', $data);
    }
}