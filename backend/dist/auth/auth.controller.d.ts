import { PrismaService } from "src/prisma/prisma.service";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
export declare class AuthController {
    private authService;
    private prisma;
    constructor(authService: AuthService, prisma: PrismaService);
    signin(dto: AuthDto): Promise<void> | Promise<{
        access_token: string;
    }>;
    me(req: any): any;
}
