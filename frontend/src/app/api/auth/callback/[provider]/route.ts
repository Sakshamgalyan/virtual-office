
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
    const { provider } = await params;
    const ORIGIN = request.nextUrl.origin;

    // In a real implementation:
    // 1. Get the 'code' from searchParams.
    // 2. Exchange 'code' for access token using provider secrets.
    // 3. Get user info using access token.
    // 4. Find or create user in DB.

    // MOCK IMPLEMENTATION:
    // We assume the user successfully logged in with the provider.
    // We'll create a dummy session or use a fixed one for testing.

    // For demonstration, let's pretend we found a user with ID "mock-social-user-id"
    const mockUserId = `mock-${provider}-user-id-${Date.now()}`;

    // Redirect to home/dashboard
    const response = NextResponse.redirect(`${ORIGIN}/home`);

    // Set auth cookie (replicating logic from User.controller.ts)
    response.cookies.set('auth-token', mockUserId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
    });

    return response;
}

// POST handler to handle 'form_post' response mode from Apple if needed
export async function POST(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
    // Apple sends a POST request to the callback URL if response_mode is form_post
    return GET(request, { params });
}
