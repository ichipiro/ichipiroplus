import { triggerTaskReminderNotifications } from "@/features/webpush/actions";
import { type NextRequest, NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "../_lib/authorizeCron";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await triggerTaskReminderNotifications();
  return NextResponse.json(result);
}
