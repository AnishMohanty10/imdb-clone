import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'

function App() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1); 
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const API_KEY = "b36e5cdfe4e53d00b3baaa3b9cc61415";

  useEffect(() => {
    if (isSearching) return;
    fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&page=${page}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Network response failed");
        }
        return res.json();
      })
      .then(data => {
        if (!data.results) return;


        setMovies(prev => [...prev, ...data.results]);
      })
      .catch(err => console.error("Error:", err));
  }, [page]); 
  
  function handleSearch() {
  if (!query.trim()) return;

  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`)
    .then(res => res.json())
    .then(data => {
      setMovies(data.results);
      setIsSearching(true);
    })
    .catch(err => console.error(err));
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "10px", width: "300px", margin: "20px" }}
      />
      <button
        onClick={handleSearch}
        style={{ padding: "10px", cursor: "pointer" }}>
        Search
      </button>
              <button onClick={() => {
          setQuery("");
          setIsSearching(false);
          setMovies([]);
          setPage(1);
        }} style={{ marginLeft: "10px" }}>
          Clear
        </button>
      <h1>Top Rated Movies</h1>
      
      <div style={{display: "grid",gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",gap: "20px",padding: "20px"
      }}>
        {movies.map(movie => (
          <div key={movie.id}>
            <h3>{movie.title}</h3>
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "https://via.placeholder.com/500x750"
              }
              alt={movie.title}
              style={{ width: "100%", borderRadius: "10px" }}
            />
            <p>⭐ {movie.vote_average}</p>
          </div>
        ))}
      </div>


      <div style={{ textAlign: "center", margin: "20px" }}>
        {!isSearching && (
        <button onClick={() => setPage(page + 1)}>
          Load More
        </button>
        )}
      </div>
      

    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <App />
);