import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}



/*
DB_URL="mongodb+srv://saksham4504:Saksham1@smartoffice.embq4z3.mongodb.net/?appName=smartOfficez"
PORT=5000
JWT_SECRET="smartOffice"
*/