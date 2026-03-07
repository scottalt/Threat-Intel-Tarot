import { NextResponse } from "next/server";
import { fetchNews } from "@/lib/news";

export const revalidate = 21600;

export async function GET() {
  const articles = await fetchNews();
  return NextResponse.json(articles);
}
