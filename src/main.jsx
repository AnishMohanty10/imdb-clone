import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'

// eslint-disable-next-line react-refresh/only-export-components
function App() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1); 
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const API_KEY = "b36e5cdfe4e53d00b3baaa3b9cc61415";

useEffect(() => {
  if (isSearching) return;


  const currentPage = page || 1;

  fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&page=${currentPage}`)
    .then(res => {
      if (!res.ok) {
        throw new Error("Network response failed");
      }
      return res.json();
    })
    .then(data => {
      if (!data.results) return;

      setMovies(prev =>
        currentPage === 1 ? data.results : [...prev, ...data.results]
      );
    })
    .catch(err => console.error("Error:", err));
}, [page, isSearching]);

// Load favorites from localStorage on mount
useEffect(() => {
  const savedFavorites = localStorage.getItem('movieFavorites');
  if (savedFavorites) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(JSON.parse(savedFavorites));
  }
}, []);

// Fetch genres on mount
useEffect(() => {
  fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => setGenres(data.genres))
    .catch(err => console.error("Error fetching genres:", err));
}, []);

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

  function toggleFavorite(movie) {
    const isFavorite = favorites.some(fav => fav.id === movie.id);
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter(fav => fav.id !== movie.id);
    } else {
      newFavorites = [...favorites, movie];
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('movieFavorites', JSON.stringify(newFavorites));
  }

  function handleGenreFilter(genreId) {
    if (selectedGenre === genreId) {
      setSelectedGenre(null);
      setPage(1);
      setIsSearching(false);
      setMovies([]);
      return;
    }

    setSelectedGenre(genreId);
    setPage(1);
    setIsSearching(false);
    
    fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=1`)
      .then(res => res.json())
      .then(data => {
        setMovies(data.results);
      })
      .catch(err => console.error("Error filtering by genre:", err));
  }

  function getMovieDetails(movieId) {
    fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        setSelectedMovie(data);
      })
      .catch(err => console.error("Error fetching movie details:", err));
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at top, #1e293b 0%, #0f172a 55%, #020617 100%)",
      color: "#f8fafc",
      padding: "32px 20px 48px",
      boxSizing: "border-box",
      fontFamily: "Inter, system-ui, sans-serif",
      maxWidth: "100%",
      margin: "0 auto",
    }}>
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
        setMovies([]);
        setPage(1);
        setIsSearching(false);
        setSelectedGenre(null);
        setShowFavorites(false);

      }} style={{ marginLeft: "10px", padding: "10px", cursor: "pointer", fontWeight: "bold" }}>
        Clear
      </button>
      <button 
        onClick={() => setShowFavorites(!showFavorites)}
        style={{ 
          marginLeft: "10px", 
          padding: "10px", 
          cursor: "pointer",
          backgroundColor: showFavorites ? "#ff6b6b" : "#4ecdc4",
          color: "white",
          border: "none",
          borderRadius: "5px"
        }}>
        {showFavorites ? "Show All" : `Favorites (${favorites.length})`}
      </button>
      
      {!showFavorites && !isSearching && (
        <div style={{ margin: "20px 0", display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <span style={{ color: "#f8fafc", fontWeight: "bold" }}>Filter by Genre:</span>
          {genres.slice(0, 8).map(genre => (
            <button
              key={genre.id}
              onClick={() => handleGenreFilter(genre.id)}
              style={{
                padding: "5px 10px",
                cursor: "pointer",
                backgroundColor: selectedGenre === genre.id ? "#ff6b6b" : "#4ecdc4",
                color: "white",
                border: "none",
                borderRadius: "15px",
                fontSize: "12px"
              }}>
              {genre.name}
            </button>
          ))}
        </div>
      )}
      
      <h1>{showFavorites ? "My Favorite Movies" : selectedGenre ? `${genres.find(g => g.id === selectedGenre)?.name} Movies` : "Top Rated Movies"}</h1>
      
      <div style={{display: "grid",gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",gap: "20px",padding: "20px"
      }}>
        {(showFavorites ? favorites : movies).map(movie => (
          <div key={movie.id} style={{ position: "relative", cursor: "pointer" }} onClick={() => getMovieDetails(movie.id)}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(movie);
              }}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(0,0,0,0.7)",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                color: favorites.some(fav => fav.id === movie.id) ? "#ff6b6b" : "#f8fafc",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
              ♥
            </button>
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


      {selectedMovie && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }} onClick={() => setSelectedMovie(null)}>
          <div style={{
            backgroundColor: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            maxWidth: "600px",
            maxHeight: "80vh",
            overflow: "auto",
            color: "#f8fafc",
            position: "relative"
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedMovie(null)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                color: "#f8fafc",
                fontSize: "24px",
                cursor: "pointer"
              }}>
              ×
            </button>
            <h2>{selectedMovie.title}</h2>
            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
              <img
                src={
                  selectedMovie.poster_path
                    ? `https://image.tmdb.org/t/p/w300${selectedMovie.poster_path}`
                    : "https://via.placeholder.com/300x450"
                }
                alt={selectedMovie.title}
                style={{ borderRadius: "10px" }}
              />
              <div>
                <p><strong>Release Date:</strong> {selectedMovie.release_date}</p>
                <p><strong>Rating:</strong> ⭐ {selectedMovie.vote_average}/10</p>
                <p><strong>Runtime:</strong> {selectedMovie.runtime} minutes</p>
                <p><strong>Genres:</strong> {selectedMovie.genres?.map(g => g.name).join(", ")}</p>
              </div>
            </div>
            <h3>Overview</h3>
            <p>{selectedMovie.overview}</p>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", margin: "20px" }}>
        {!isSearching && !showFavorites && !selectedGenre && (
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