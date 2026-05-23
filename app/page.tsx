"use client";

import { useEffect, useState } from "react";
import { GenreMultiSelect, type Genre } from "@/components/GenreMultiSelect";

type Film = {
  id: number;
  name: string;
  genres: string[];
};

export default function Home() {
  const [films, setFilms] = useState<Film[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [name, setName] = useState("");
  const [selectedGenreNames, setSelectedGenreNames] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [filterGenreNames, setFilterGenreNames] = useState<string[]>([]);
  const [randomFilm, setRandomFilm] = useState<Film | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/films").then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load films");
        }
        return res.json() as Promise<Film[]>;
      }),
      fetch("/api/genres").then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load genres");
        }
        return res.json() as Promise<Genre[]>;
      }),
    ])
      .then(([filmsData, genresData]) => {
        setFilms(filmsData);
        setGenres(genresData);
      })
      .catch((err: Error) => setLoadError(err.message));
  }, []);

  async function createGenre(genreName: string): Promise<Genre> {
    const res = await fetch("/api/genres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: genreName }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to create genre");
    }

    const genre: Genre = await res.json();
    setGenres((prev) => {
      if (prev.some((g) => g.id === genre.id)) return prev;
      return [...prev, genre].sort((a, b) => a.name.localeCompare(b.name));
    });
    return genre;
  }

  async function addFilm() {
    if (!name || selectedGenreNames.length === 0) return;

    const res = await fetch("/api/films", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, genreNames: selectedGenreNames }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoadError(data.error ?? "Failed to add film");
      return;
    }

    const film: Film = await res.json();
    setFilms([...films, film]);
    setName("");
    setSelectedGenreNames([]);
    setLoadError(null);
  }

  function pickRandomFilm() {
    if (filterGenreNames.length === 0) {
      setRandomFilm(null);
      return;
    }

    const filteredFilms = films.filter((film) =>
      filterGenreNames.every((name) => film.genres.includes(name))
    );

    if (filteredFilms.length === 0) {
      setRandomFilm(null);
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredFilms.length);
    setRandomFilm(filteredFilms[randomIndex]);
  }

  const noMatchingFilms =
    filterGenreNames.length > 0 &&
    !films.some((film) =>
      filterGenreNames.every((name) => film.genres.includes(name))
    );

  return (
    <main className="p-5">
      <div className="flex flex-col items-left justify-left">
        <h1 className="text-2xl font-bold">🎬 Watch Later Films</h1>

        {loadError && <p className="text-red-600 mt-2">{loadError}</p>}

        <div className="flex flex-col items-left justify-left">
          <div>
            <input
              className="border m-2 border-gray-300 rounded-md px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Film name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <GenreMultiSelect
              options={genres}
              value={selectedGenreNames}
              onChange={setSelectedGenreNames}
              onCreateGenre={createGenre}
              placeholder="Genres"
            />
          </div>
          <br />
          <br />

          <button
            className="bg-blue-600 w-[140px] p-2 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={addFilm}
            disabled={!name || selectedGenreNames.length === 0}
          >
            Add Film
          </button>
        </div>
        <ul className="list-disk list-inside space-y-1">
          {films.map((film) => (
            <li key={film.id}>
              {film.name} ({film.genres.join(", ")})
            </li>
          ))}
        </ul>

        <hr className="my-6 border-gray-200" />

        <h2 className="text-xl font-semibold">🎲 Pick a random film</h2>
        <div>
          <GenreMultiSelect
            options={genres}
            value={filterGenreNames}
            onChange={setFilterGenreNames}
            onCreateGenre={createGenre}
            placeholder="Filter by genres"
          />

          <br />
          <br />

          <button
            className="bg-blue-800 w-[150px] p-2 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={pickRandomFilm}
            disabled={filterGenreNames.length === 0}
          >
            Pick random film
          </button>
        </div>
        {noMatchingFilms && (
          <p className="text-gray-600 mt-2">No films match all selected genres.</p>
        )}
        {randomFilm && (
          <p>
            You should watch: <strong>{randomFilm.name}</strong>
          </p>
        )}
      </div>
    </main>
  );
}
