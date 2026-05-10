<?php

namespace In3050Inm428WebDev\Controllers;

use In3050Inm428WebDev\Controller;

class StoryController extends Controller
{
    public function index()
    {
        $data["pagesection"] = 'Story';

        $this->render('story', $data);
    }
}