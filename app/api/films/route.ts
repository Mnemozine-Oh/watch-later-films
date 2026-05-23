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

  const rows = await sql`
    SELECT
      f.id,
      f.name,
      COALESCE(
        array_agg(fg.genre_name ORDER BY fg.genre_name)
          FILTER (WHERE fg.genre_name IS NOT NULL),
        '{}'
      ) AS genres
    FROM films f
    LEFT JOIN film_genres fg ON fg.film_id = f.id
    GROUP BY f.id, f.name, f.created_at
    ORDER BY f.created_at ASC
  `;

  return NextResponse.json(rows);
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
  const rawNames: unknown[] = Array.isArray(body.genreNames)
    ? body.genreNames
    : [];
  const genreNames = [
    ...new Set(
      rawNames
        .filter((g): g is string => typeof g === "string")
        .map((g) => g.trim())
        .filter(Boolean)
    ),
  ];

  if (!name || genreNames.length === 0) {
    return NextResponse.json(
      { error: "name and at least one genre are required" },
      { status: 400 }
    );
  }

  const existing = await sql`
    SELECT name FROM genre_enum WHERE name = ANY(${genreNames})
  `;
  const existingNames = new Set(
    existing.map((r) => String(r.name))
  );
  const unknown = genreNames.filter((g) => !existingNames.has(g));
  if (unknown.length > 0) {
    return NextResponse.json(
      { error: `Unknown genres: ${unknown.join(", ")}` },
      { status: 400 }
    );
  }

  const [film] = await sql`
    INSERT INTO films (name)
    VALUES (${name})
    RETURNING id, name
  `;

  for (const genreName of genreNames) {
    await sql`
      INSERT INTO film_genres (film_id, genre_name)
      VALUES (${film.id}, ${genreName})
    `;
  }

  return NextResponse.json(
    { id: film.id, name: film.name, genres: genreNames.sort() },
    { status: 201 }
  );
}
