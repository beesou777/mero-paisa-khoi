import Link from "next/link";
import { WalletCards } from "lucide-react";
import { GoogleLoginButton } from "@/components/shared/google-login-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link href="/" className="mb-4 flex items-center gap-2 font-heading text-2xl font-bold">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              <WalletCards className="h-5 w-5" />
            </span>
            Asti Ko Paisa
          </Link>
          <CardTitle>Sign in to your money notes</CardTitle>
          <p className="text-sm text-muted">
            Use Google to get back to your debts without typing another password.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleLoginButton />
          {message ? (
            <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-primary">
              {message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
