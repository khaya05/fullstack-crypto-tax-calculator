<?php

return [
    'paths' => [
        'api/*',                    // All API routes
        'sanctum/csrf-cookie',     // Laravel Sanctum auth
        'oauth/*',                 // Laravel Passport auth
        'login',                   // Login endpoint
        'logout',                  // Logout endpoint
        'register',               // Registration endpoint
    ],
    'allowed_origins' => [
        // Development
        'http://localhost:3000',     // React default
        'http://localhost:3001',     // React alternate
        'http://localhost:5173',     // Vite default
        'http://localhost:5174',     // Vite alternate
        'http://127.0.0.1:3000',    // IP variant
        'http://127.0.0.1:5173',    // IP variant
    ],
    'allowed_methods' => [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
        'HEAD',
    ],
    'allowed_headers' => [
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Requested-With',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
        'Origin',
        'Cache-Control',
        'Pragma',
        'X-API-KEY',
        'X-Client-Version',
        'X-Platform',
    ],
    'exposed_headers' => [
        'Cache-Control',
        'Content-Language',
        'Content-Type',
        'Expires',
        'Last-Modified',
        'Pragma',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'X-Total-Count',
        'X-Pagination-Page',
        'X-Pagination-Limit',
    ],
    'max_age' => 60 * 60 * 24, // 24 hours
    'supports_credentials' => true,
];
