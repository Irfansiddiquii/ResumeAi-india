import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FEATURES } from "@/lib/features";

/**
 * Optional account-creation prompt shown AFTER analysis. Accounts are a
 * Phase 3 feature, so when ACCOUNTS_ENABLED is false we show a friendly
 * "coming soon" note instead of forcing/hinting a paywall. The core flow
 * never requires an account.
 */
export function SaveReportPrompt() {
  return (
    <Card className="border-dashed bg-muted/30">
      <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bookmark className="h-5 w-5" />
          </span>
          <div>
            <p className="font-medium">
              Want to save your reports and track your progress?
            </p>
            <p className="text-sm text-muted-foreground">
              Create a free account to keep your analysis history. You never
              have to — your report is already free to download.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {FEATURES.ACCOUNTS_ENABLED ? (
            <Button asChild>
              <Link href="/signup">Create Free Account</Link>
            </Button>
          ) : (
            <Button disabled title="Coming soon">
              Accounts coming soon
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
