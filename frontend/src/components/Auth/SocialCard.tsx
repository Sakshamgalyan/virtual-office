import React from 'react';
import Button from '../UI/Button';

import { API_BASE_URL } from '@/lib/constant';

export default function SocialCard() {
    const handleSocialLogin = (provider: 'google' | 'microsoft' | 'apple') => {
        window.location.href = `${API_BASE_URL}/auth/${provider}`;
    };

    return (
        <div className="flex gap-4 justify-center w-full">
            {/* Google */}
            <Button
                variant="secondary"
                size="md"
                className="flex-1 bg-forest-50 hover:bg-forest-100 border-none"
                onClick={() => handleSocialLogin('google')}
                type="button"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.1901C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4" />
                    <path d="M12.24 24.0008C15.4765 24.0008 18.2058 22.9382 20.1945 21.1039L16.3274 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.24 24.0008Z" fill="#34A853" />
                    <path d="M5.50253 14.3003C5.00236 12.8199 5.00236 11.1799 5.50253 9.69951V6.60861H1.51649C-0.18551 10.0056 -0.18551 13.9945 1.51649 17.3915L5.50253 14.3003Z" fill="#FBBC05" />
                    <path d="M12.24 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.24 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.60861L5.50264 9.69951C6.45064 6.85983 9.10947 4.74966 12.24 4.74966Z" fill="#EA4335" />
                </svg>
            </Button>

            {/* Microsoft */}
            <Button
                variant="secondary"
                size="md"
                className="flex-1 bg-forest-50 hover:bg-forest-100 border-none"
                onClick={() => handleSocialLogin('microsoft')}
                type="button"
            >
                <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.5 0H0V10.5H10.5V0Z" fill="#F25022" />
                    <path d="M22.5 0H12V10.5H22.5V0Z" fill="#7FBA00" />
                    <path d="M10.5 12H0V22.5H10.5V12Z" fill="#00A4EF" />
                    <path d="M22.5 12H12V22.5H22.5V12Z" fill="#FFB900" />
                </svg>
            </Button>

            {/* Apple */}
            <Button
                variant="secondary"
                size="md"
                className="flex-1 bg-forest-50 hover:bg-forest-100 border-none"
                onClick={() => handleSocialLogin('apple')}
                type="button"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.0729 0.697813C13.9113 -0.219688 15.2934 -0.279687 15.4241 0.730312C15.5492 1.70531 15.0134 2.87953 14.1873 3.66062C12.4497 5.23437 11.2386 4.67344 11.0028 2.65172C10.9329 2.04016 11.0829 1.45547 11.3854 0.982969C11.6666 0.534219 12.3391 0.221719 13.0729 0.697813Z" />
                    <path d="M18.8465 13.9511C18.8853 16.4884 21.0828 17.5122 21.1553 17.5511C21.1341 17.6223 20.8065 18.7309 20.0165 19.8822C19.3303 20.8809 18.6153 21.8722 17.5028 21.8934C16.3903 21.9147 16.0353 21.2347 14.7353 21.2347C13.4353 21.2347 13.0128 21.8734 11.9678 21.9159C10.9228 21.9572 10.0915 20.9147 9.40531 19.9222C7.99406 17.8822 6.91906 14.1647 8.35656 11.6709C9.07031 10.4359 10.3391 9.65469 11.7778 9.63469C12.8465 9.61344 13.8541 10.3547 14.5078 10.3547C15.1615 10.3547 16.3903 9.43219 17.6628 9.61344C18.1965 9.63469 19.6641 9.82719 20.6128 11.2159C20.5391 11.2609 18.8091 12.2709 18.8465 13.9511Z" />
                </svg>
            </Button>
        </div>
    );
}
