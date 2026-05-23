"use client";

import { useEffect, useState } from "react";

type Film = {
  id: number;
  name: string;
  genre: string;
};

export default function Home() {
  const [films, setFilms] = useState<Film[]>([]);
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedGenre, setSelectedGenre] = useState("");
  const [randomFilm, setRandomFilm] = useState<Film | null>(null);

  useEffect(() => {
    fetch("/api/films")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load films");
        }
        return res.json();
      })
      .then((data: Film[]) => setFilms(data))
      .catch((err: Error) => setLoadError(err.message));
  }, []);

  async function addFilm() {
    if (!name || !genre) return;

    const res = await fetch("/api/films", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, genre }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoadError(data.error ?? "Failed to add film");
      return;
    }

    const film: Film = await res.json();
    setFilms([...films, film]);
    setName("");
    setGenre("");
    setLoadError(null);
  }

  function pickRandomFilm() {
    const filteredFilms = films.filter(
      (film) => film.genre === selectedGenre
    );

    if (filteredFilms.length === 0) {
      setRandomFilm(null);
      return;
    }

    const randomIndex = Math.floor(
      Math.random() * filteredFilms.length
    );

    setRandomFilm(filteredFilms[randomIndex]);
  }

  return (
    <main className="p-5">
      {/* <stack>

        <title/>

        <stack>
          <stack>
            <input/>
            <input/>
          </stack>

          <button/>
        </stack>
        
        <title/>
        <stack>
          <input/>
          <button/>
        </stack>
      </stack> */}


      <div className="flex flex-col items-left justify-left">
        <h1 className="text-2xl font-bold">🎬 Watch Later Films</h1>

        {loadError && (
          <p className="text-red-600 mt-2">{loadError}</p>
        )}

        <div className="flex flex-col items-left justify-left">
          <div>
            <input className="border m-2 border-gray-300 rounded-md px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Film name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <br /><br />

            <input className="border m-2 border-gray-300 rounded-md px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
          </div>
          <br /><br />

          <button className="bg-blue-600 w-[140px] p-2 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 cursor-pointer" onClick={addFilm}>Add Film</button>
        </div>
        <ul className="list-disk list-inside space-y-1">
          {films.map((film) => (
            <li key={film.id}>
              {film.name} ({film.genre})
            </li>
          ))}
        </ul>

        <hr className="my-6 border-gray-200" />

        <h2 className="text-xl font-semibold">🎲 Pick a random film</h2>
        <div>
          <input className="border p-2 m-2 border-gray-300 rounded-md px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Genre"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          />

          <br /><br />

          <button className="bg-blue-800 w-[150px] p-2 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 cursor-pointer" onClick={pickRandomFilm}>
            Pick random film
          </button>
        </div>
        {randomFilm && (
          <p>
            You should watch: <strong>{randomFilm.name}</strong>
          </p>
        )}
      </div>
    </main>
  );
}