import { useRouter } from "next/router";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import Cookies from "js-cookie";

import { AppBreadcrumb } from "@/components/layouts/breadcrumb";
import TrialBanner from "@/components/layouts/trial-banner";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SIDEBAR_COOKIE_NAME,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// import { usePlan } from "@/lib/swr/use-billing";
// import YearlyUpgradeBanner from "@/components/billing/yearly-upgrade-banner";

import { BlockingModal } from "./blocking-modal";

const DATAROOM_SIDEBAR_COOKIE_NAME = "sidebar:dataroom-state";

/** Route-only default: must match on server and client first paint (no cookies) to avoid hydration mismatch. */
function getDefaultSidebarOpen(isDataroom: boolean): boolean {
  return isDataroom ? false : true;
}

function readSidebarOpenFromCookies(isDataroom: boolean): boolean {
  if (isDataroom) {
    const dataroomCookie = Cookies.get(DATAROOM_SIDEBAR_COOKIE_NAME);
    if (dataroomCookie !== undefined) {
      return dataroomCookie === "true";
    }
    return false;
  }
  const mainCookie = Cookies.get(SIDEBAR_COOKIE_NAME);
  if (mainCookie !== undefined) {
    return mainCookie === "true";
  }
  return true;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isDataroom = router.pathname.startsWith("/datarooms/[id]");

  const [sidebarOpen, setSidebarOpen] = useState(() =>
    getDefaultSidebarOpen(isDataroom),
  );

  const prevIsDataroomRef = useRef(isDataroom);

  // Apply persisted state after mount / route change; cookies are unavailable during SSR.
  useLayoutEffect(() => {
    setSidebarOpen(readSidebarOpenFromCookies(isDataroom));
  }, [isDataroom]);

  useEffect(() => {
    const prev = prevIsDataroomRef.current;
    if (prev && !isDataroom) {
      Cookies.remove(DATAROOM_SIDEBAR_COOKIE_NAME);
    }
    if (isDataroom && Cookies.get(DATAROOM_SIDEBAR_COOKIE_NAME) === undefined) {
      Cookies.set(DATAROOM_SIDEBAR_COOKIE_NAME, "false", { expires: 7 });
    }
    prevIsDataroomRef.current = isDataroom;
  }, [isDataroom]);

  // Handle sidebar state changes - save to appropriate cookie
  const handleSidebarOpenChange = useCallback(
    (open: boolean) => {
      setSidebarOpen(open);
      if (isDataroom) {
        Cookies.set(DATAROOM_SIDEBAR_COOKIE_NAME, String(open), { expires: 7 });
      }
    },
    [isDataroom],
  );

  // const { isAnnualPlan, isFree } = usePlan();
  // const [showYearlyBanner, setShowYearlyBanner] = useState<boolean | null>(null);

  // Show banner only for paid monthly subscribers (not free, not yearly)
  // useEffect(() => {
  //   // Hide banner for free users or yearly subscribers
  //   if (isFree || isAnnualPlan) {
  //     setShowYearlyBanner(false);
  //     return;
  //   }

  //   // Show banner for monthly paid users (if not dismissed)
  //   if (Cookies.get("hideYearlyUpgradeBanner") !== "yearly-upgrade-banner") {
  //     setShowYearlyBanner(true);
  //   } else {
  //     setShowYearlyBanner(false);
  //   }
  // }, [isFree, isAnnualPlan]);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={handleSidebarOpenChange}>
      <div className="flex flex-1 flex-col gap-x-1 bg-gray-50 dark:bg-black md:flex-row">
        <AppSidebar />
        <SidebarInset className="ring-1 ring-gray-200 dark:ring-gray-800">
          <header className="flex h-10 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-1 h-4" />
              <AppBreadcrumb />
            </div>
          </header>
          <TrialBanner />
          <BlockingModal />
          <main className="flex-1">{children}</main>
        </SidebarInset>
      </div>
      {/* {showYearlyBanner && (
        <YearlyUpgradeBanner setShowBanner={setShowYearlyBanner} />
      )} */}
    </SidebarProvider>
  );
}
