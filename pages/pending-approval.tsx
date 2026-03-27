import { ClockIcon } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export default function PendingApproval() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-black">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-xl border border-border bg-white p-10 text-center shadow-sm dark:bg-gray-950">
        <div className="rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/30">
          <ClockIcon className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Awaiting approval
          </h1>
          <p className="text-sm text-muted-foreground">
            Your account has been created. A team admin will review your request
            and grant you access shortly. You&apos;ll receive an email once
            you&apos;re approved.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
