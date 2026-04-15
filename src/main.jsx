import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'

function App() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1); 
  const API_KEY = "b36e5cdfe4e53d00b3baaa3b9cc61415";

  useEffect(() => {
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

  return (
    <div>
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
        <button onClick={() => setPage(page + 1)} style={{padding: "10px 20px",fontSize: "16px",cursor: "pointer"}}>
          Load More
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <App />
);