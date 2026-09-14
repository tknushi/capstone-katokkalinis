<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
    ],

    'allowed_methods' => [
        '*',
    ],

    'allowed_origins' => [
        '*',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        '*',
    ],

    'exposed_headers' => [],

    'max_age' => 0,

    // The admin web dashboard authenticates with a Bearer token (not
    // cookies), so credentials are not needed and origins can stay
    // wide open for local development (XAMPP, Live Server, file://, etc).
    'supports_credentials' => false,

];
