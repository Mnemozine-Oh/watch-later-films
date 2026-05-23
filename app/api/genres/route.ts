import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export async function GET() {
  let sql;
  try {
    sql = getSql();
  } catch {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured" },
      { status: 500 }
    );
  }

  const genres = await sql`
    SELECT id, name
    FROM genre_enum
    ORDER BY name ASC
  `;

  return NextResponse.json(genres);
}

export async function POST(request: Request) {
  let sql;
  try {
    sql = getSql();
  } catch {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  await sql`
    INSERT INTO genre_enum (name)
    VALUES (${name})
    ON CONFLICT (name) DO NOTHING
  `;

  const [genre] = await sql`
    SELECT id, name
    FROM genre_enum
    WHERE name = ${name}
  `;

  return NextResponse.json(genre, { status: 201 });
}
