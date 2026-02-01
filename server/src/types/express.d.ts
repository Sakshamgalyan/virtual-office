import { User } from '@/types/User.types';

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
