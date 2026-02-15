"use client";

import { useState } from "react";

type Film = {
  name: string;
  genre: string;
};

export default function Home() {
  const [films, setFilms] = useState<Film[]>([]);
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");

  const [selectedGenre, setSelectedGenre] = useState("");
  const [randomFilm, setRandomFilm] = useState<Film | null>(null);

  function addFilm() {
    if (!name || !genre) return;

    setFilms([...films, { name, genre }]);
    setName("");
    setGenre("");
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
      <h1 className="text-2xl font-bold">🎬 Watch Later Films</h1>

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

      <br /><br />

      <button className="bg-blue-600 p-2 text-white font-semiboldpx-5 py-2 rounded-lg hover:bg-blue-700 cursor-pointer" onClick={addFilm}>Add Film</button>

      <ul className="list-disk list-inside space-y-1">
        {films.map((film, index) => (
          <li key={index}>
            {film.name} ({film.genre})
          </li>
        ))}
      </ul>

      <hr className="my-6 border-gray-200" />

      <h2 className="text-xl font-semibold">🎲 Pick a random film</h2>

      <input className="border p-2 m-2 border-gray-300 rounded-md px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Genre"
        value={selectedGenre}
        onChange={(e) => setSelectedGenre(e.target.value)}
      />

      <br /><br />

      <button className="bg-blue-600 p-2 text-white font-semiboldpx-5 py-2 rounded-lg hover:bg-blue-700 cursor-pointer" onClick={pickRandomFilm}>
        Pick random film
      </button>

      {randomFilm && (
        <p>
          You should watch: <strong>{randomFilm.name}</strong>
        </p>
      )}
    </main>
  );
}