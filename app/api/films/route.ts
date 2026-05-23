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

  const films = await sql`
    SELECT id, name, genre
    FROM films
    ORDER BY created_at ASC
  `;

  return NextResponse.json(films);
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
  const genre = typeof body.genre === "string" ? body.genre.trim() : "";

  if (!name || !genre) {
    return NextResponse.json(
      { error: "name and genre are required" },
      { status: 400 }
    );
  }

  const [film] = await sql`
    INSERT INTO films (name, genre)
    VALUES (${name}, ${genre})
    RETURNING id, name, genre
  `;

  return NextResponse.json(film, { status: 201 });
}
