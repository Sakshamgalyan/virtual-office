
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
    const { provider } = await params;

    const ORIGIN = request.nextUrl.origin;
    let redirectUrl = "";

    switch (provider) {
        case "google":
            redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${ORIGIN}/api/auth/callback/google&response_type=code&scope=profile email`;
            break;
        case "microsoft":
            redirectUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.MICROSOFT_CLIENT_ID}&redirect_uri=${ORIGIN}/api/auth/callback/microsoft&response_type=code&scope=openid profile email`;
            break;
        case "apple":
            redirectUrl = `https://appleid.apple.com/auth/authorize?client_id=${process.env.APPLE_CLIENT_ID}&redirect_uri=${ORIGIN}/api/auth/callback/apple&response_type=code&scope=name email&response_mode=form_post`;
            break;
        default:
            return NextResponse.json(
                { error: "Invalid provider" },
                { status: 400 }
            );
    }

    // Since we are mocking, we can't actually redirect to a provider without valid Client IDs.
    // For demonstration, we might redirect back to the app with a success param or similar.
    // But per instructions, I should redirect to the constructed URL.
    // Given the placeholder nature, this will likely fail at the provider side, but the "redirection" logic is what is requested.

    // To be more user-friendly effectively "mocking" the success for now:
    // redirectUrl = `${ORIGIN}?social_login_success=true&provider=${provider}`;

    return NextResponse.redirect(redirectUrl);
}
