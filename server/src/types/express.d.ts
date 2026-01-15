import { User } from './User.types';

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
