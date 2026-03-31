import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const DAILY_LIMIT = 10;

function todayKST(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("daily_usage")
    .select("count")
    .eq("user_email", session.user.email)
    .eq("date", todayKST())
    .single();

  const count = data?.count ?? 0;
  return NextResponse.json({ count, limit: DAILY_LIMIT, remaining: DAILY_LIMIT - count });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;
  const date = todayKST();

  const { data: existing } = await supabase
    .from("daily_usage")
    .select("count")
    .eq("user_email", email)
    .eq("date", date)
    .single();

  const currentCount = existing?.count ?? 0;
  if (currentCount >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: `오늘 사용 횟수를 모두 소진했습니다 (${DAILY_LIMIT}/${DAILY_LIMIT})` },
      { status: 403 }
    );
  }

  await supabase
    .from("daily_usage")
    .upsert(
      { user_email: email, date, count: currentCount + 1 },
      { onConflict: "user_email,date" }
    );

  const newCount = currentCount + 1;
  return NextResponse.json({ count: newCount, limit: DAILY_LIMIT, remaining: DAILY_LIMIT - newCount });
}
