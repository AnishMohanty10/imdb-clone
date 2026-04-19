import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'

// eslint-disable-next-line react-refresh/only-export-components
function App() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [watchLater, setWatchLater] = useState([]);
  const [showWatchLater, setShowWatchLater] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [movieReviews, setMovieReviews] = useState({});
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
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

    const savedWatchLater = localStorage.getItem('movieWatchLater');
    if (savedWatchLater) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWatchLater(JSON.parse(savedWatchLater));
    }

    const savedReviews = localStorage.getItem('movieReviews');
    if (savedReviews) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMovieReviews(JSON.parse(savedReviews));
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

  function toggleWatchLater(movie) {
    const isInWatchLater = watchLater.some(mov => mov.id === movie.id);
    let newWatchLater;

    if (isInWatchLater) {
      newWatchLater = watchLater.filter(mov => mov.id !== movie.id);
    } else {
      newWatchLater = [...watchLater, movie];
    }

    setWatchLater(newWatchLater);
    localStorage.setItem('movieWatchLater', JSON.stringify(newWatchLater));
  }

  function addReview(movieId) {
    if (userRating === 0 || !reviewText.trim()) {
      alert("Please provide a rating and review text");
      return;
    }

    const newReviews = { ...movieReviews };
    if (!newReviews[movieId]) {
      newReviews[movieId] = [];
    }

    newReviews[movieId].push({
      rating: userRating,
      text: reviewText,
      date: new Date().toLocaleDateString()
    });

    setMovieReviews(newReviews);
    localStorage.setItem('movieReviews', JSON.stringify(newReviews));
    setUserRating(0);
    setReviewText("");
  }

  function sortMovies(moviesToSort) {
    const sorted = [...moviesToSort];

    if (sortBy === 'rating') {
      sorted.sort((a, b) => b.vote_average - a.vote_average);
    } else if (sortBy === 'release') {
      sorted.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
    } else if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    return sorted;
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

  function getMovieDetails(movie) {
    // Open modal immediately with data we already have
    setSelectedMovie(movie);
    setMovieDetails(null);
    setDetailsLoading(true);

    // Fetch extra details (runtime, genres) in background
    fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        setMovieDetails(data);
        setDetailsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching movie details:", err);
        setDetailsLoading(false);
      });
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: isDarkMode
        ? "linear-gradient(180deg, #05070d 0%, #070a12 50%, #020306 100%)"
        : "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
      color: isDarkMode ? "#e2e8f0" : "#1e293b",
      padding: "0",
      boxSizing: "border-box",
      fontFamily: "Inter, system-ui, sans-serif",
      maxWidth: "100%",
      margin: "0 auto",
      transition: "background 0.3s ease"
    }}>
      {/* Top Navigation Bar */}
      <div style={{
        backgroundColor: isDarkMode ? "#05080f" : "#ffffff",
        borderBottom: isDarkMode ? "1px solid #111827" : "1px solid #e2e8f0",
        padding: "14px 32px",
        transition: "all 0.3s ease"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "18px",
          flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
            <span style={{ fontSize: "26px", lineHeight: 1 }}>🎬</span>
            <div>
              <div style={{
                fontWeight: "800",
                fontSize: "20px",
                letterSpacing: "-0.5px",
                background: "linear-gradient(135deg, #2dd4bf, #06d6a0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>MovieHub</div>
              <div style={{ color: "#64748b", fontSize: "11px", fontWeight: "400", letterSpacing: "0.5px" }}>Discover · Explore · Enjoy</div>
            </div>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            minWidth: "280px",
            maxWidth: "560px",
            backgroundColor: isDarkMode ? "#07101f" : "#f1f5f9",
            border: isDarkMode ? "1px solid #112131" : "1px solid #cbd5e1",
            borderRadius: "999px",
            padding: "6px 10px"
          }}>
            <input
              type="text"
              placeholder="Search movies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              style={{
                padding: "10px 12px",
                flex: 1,
                border: "none",
                background: "transparent",
                color: isDarkMode ? "#e2e8f0" : "#1e293b",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg, #2dd4bf, #06d6a0)",
                color: "#022c22",
                border: "none",
                borderRadius: "999px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "13px",
                letterSpacing: "0.3px",
                boxShadow: "0 2px 10px rgba(45, 212, 191, 0.3)",
                transition: "all 0.3s ease"
              }}>
              Search
            </button>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              width: "42px",
              height: "42px",
              backgroundColor: isDarkMode ? "#111827" : "#f8fafc",
              color: isDarkMode ? "#f8fafc" : "#0f172a",
              border: isDarkMode ? "1px solid #334155" : "1px solid #cbd5e1",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "18px",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div style={{
        backgroundColor: isDarkMode ? "#0c1220" : "#f1f5f9",
        borderBottom: isDarkMode ? "1px solid #111827" : "1px solid #e2e8f0",
        padding: "16px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap",
        transition: "all 0.3s ease"
      }}>
        <div style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <button
            onClick={() => {
              setQuery("");
              setMovies([]);
              setPage(1);
              setIsSearching(false);
              setSelectedGenre(null);
              setShowFavorites(false);
              setShowWatchLater(false);
            }}
            style={{
              padding: "10px 16px",
              background: "linear-gradient(135deg, #0d9488, #14b8a6)",
              color: "#f0fdfa",
              border: "none",
              borderRadius: "999px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
              boxShadow: "0 2px 8px rgba(20, 184, 166, 0.25)",
              transition: "all 0.3s ease"
            }}>
            Clear
          </button>
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            style={{
              padding: "10px 16px",
              cursor: "pointer",
              background: showFavorites ? "linear-gradient(135deg, #2dd4bf, #06d6a0)" : "linear-gradient(135deg, #0d9488, #14b8a6)",
              color: showFavorites ? "#022c22" : "#f0fdfa",
              border: "none",
              borderRadius: "999px",
              fontWeight: "600",
              fontSize: "13px",
              boxShadow: showFavorites ? "0 2px 12px rgba(45, 212, 191, 0.4)" : "0 2px 8px rgba(20, 184, 166, 0.25)",
              transition: "all 0.3s ease"
            }}>
            ❤️ Favorites ({favorites.length})
          </button>
          <button
            onClick={() => {
              setShowWatchLater(!showWatchLater);
              setShowFavorites(false);
            }}
            style={{
              padding: "10px 16px",
              cursor: "pointer",
              background: showWatchLater ? "linear-gradient(135deg, #2dd4bf, #06d6a0)" : "linear-gradient(135deg, #0d9488, #14b8a6)",
              color: showWatchLater ? "#022c22" : "#f0fdfa",
              border: "none",
              borderRadius: "999px",
              fontWeight: "600",
              fontSize: "13px",
              boxShadow: showWatchLater ? "0 2px 12px rgba(45, 212, 191, 0.4)" : "0 2px 8px rgba(20, 184, 166, 0.25)",
              transition: "all 0.3s ease"
            }}>
            ⏱ Watch Later ({watchLater.length})
          </button>
        </div>

        {!showFavorites && !showWatchLater && !isSearching && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "6px",
              border: isDarkMode ? "1px solid #1f2937" : "1px solid #cbd5e1",
              backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
              color: isDarkMode ? "#f8fafc" : "#1e293b",
              cursor: "pointer",
              fontSize: "13px",
              transition: "all 0.3s ease"
            }}>
            <option value="rating">📊 Rating (High to Low)</option>
            <option value="release">📅 Release Date (Newest)</option>
            <option value="title">🔤 Title (A-Z)</option>
          </select>
        )}
      </div>

      {/* Genre Filter Bar */}
      <div style={{
        padding: "16px 32px",
        borderBottom: isDarkMode ? "1px solid #111827" : "1px solid #e2e8f0",
        transition: "all 0.3s ease"
      }}>
        {!showFavorites && !isSearching && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
            <span style={{ fontWeight: "bold", fontSize: "13px", minWidth: "100px", color: isDarkMode ? "#cbd5e1" : "#475569" }}>Genres:</span>
            {genres.slice(0, 8).map(genre => (
              <button
                key={genre.id}
                onClick={() => handleGenreFilter(genre.id)}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  backgroundColor: selectedGenre === genre.id ? "#0ea5e9" : (isDarkMode ? "#111827" : "#e2e8f0"),
                  color: selectedGenre === genre.id ? "white" : (isDarkMode ? "white" : "#334155"),
                  border: selectedGenre === genre.id ? "none" : (isDarkMode ? "1px solid #1f2937" : "1px solid #cbd5e1"),
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "500",
                  transition: "all 0.3s ease"
                }}>
                {genre.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ padding: "32px" }}>

        <h1 style={{
          marginBottom: "25px",
          fontSize: "28px",
          fontWeight: "bold",
          color: isDarkMode ? "#f8fafc" : "#1a1a1a",
          transition: "color 0.3s ease"
        }}>{showFavorites ? "❤️ My Favorite Movies" : showWatchLater ? "⏱ Watch Later" : selectedGenre ? `🎭 ${genres.find(g => g.id === selectedGenre)?.name} Movies` : "🎬 Top Rated Movies"}</h1>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "20px", rowGap: "40px", padding: "20px 0"
        }}>
          {sortMovies(showFavorites ? favorites : showWatchLater ? watchLater : movies).map(movie => (
            <div key={movie.id} style={{
              cursor: "pointer",
              height: "100%",
              display: "flex",
              flexDirection: "column"
            }}>
              <div style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "10px",
                marginBottom: "10px",
                flex: 1,
                minHeight: "225px"
              }} onClick={() => getMovieDetails(movie)}>
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "https://via.placeholder.com/500x750"
                  }
                  alt={movie.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <h3 style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                lineHeight: "1.3",
                minHeight: "42px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                color: isDarkMode ? "#f8fafc" : "#1a1a1a",
                transition: "color 0.3s ease"
              }} onClick={() => getMovieDetails(movie)}>
                {movie.title}
              </h3>

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px"
              }}>
                <p style={{
                  margin: 0,
                  fontSize: "14px",
                  color: isDarkMode ? "#f8fafc" : "#1a1a1a"
                }}>⭐ {movie.vote_average}</p>

                <div style={{ display: "flex", gap: "5px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(movie);
                    }}
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      border: "none",
                      borderRadius: "5px",
                      width: "28px",
                      height: "28px",
                      cursor: "pointer",
                      color: favorites.some(fav => fav.id === movie.id) ? "#ff6b6b" : "#f8fafc",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s"
                    }}
                    title="Add to Favorites">
                    ♥
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchLater(movie);
                    }}
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      border: "none",
                      borderRadius: "5px",
                      width: "28px",
                      height: "28px",
                      cursor: "pointer",
                      color: watchLater.some(mov => mov.id === movie.id) ? "#ffa500" : "#f8fafc",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s"
                    }}
                    title="Add to Watch Later">
                    ⏱
                  </button>
                </div>
              </div>
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
              backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
              padding: "30px",
              borderRadius: "12px",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflow: "auto",
              color: isDarkMode ? "#f8fafc" : "#1a1a1a",
              position: "relative",
              transition: "all 0.3s ease"
            }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedMovie(null)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "none",
                  border: "none",
                  color: isDarkMode ? "#f8fafc" : "#1a1a1a",
                  fontSize: "24px",
                  cursor: "pointer"
                }}>
                ×
              </button>
              <h2 style={{ marginTop: 0 }}>{selectedMovie.title}</h2>
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
                  <p><strong>Runtime:</strong> {detailsLoading ? "Loading..." : movieDetails?.runtime ? `${movieDetails.runtime} minutes` : "N/A"}</p>
                  <p><strong>Genres:</strong> {detailsLoading ? "Loading..." : movieDetails?.genres?.map(g => g.name).join(", ") || "N/A"}</p>
                </div>
              </div>
              <h3>Overview</h3>
              <p>{selectedMovie.overview}</p>

              <h3>Your Rating & Review</h3>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "10px" }}>Rate this movie:</label>
                <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setUserRating(rating)}
                      style={{
                        padding: "8px 10px",
                        cursor: "pointer",
                        backgroundColor: userRating === rating ? "#ff6b6b" : "#4ecdc4",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        fontSize: "12px"
                      }}>
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Write your review..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: isDarkMode ? "1px solid #334155" : "1px solid #cbd5e1",
                  backgroundColor: isDarkMode ? "#0f172a" : "#f5f7fa",
                  color: isDarkMode ? "#f8fafc" : "#1a1a1a",
                  minHeight: "80px",
                  fontFamily: "inherit",
                  marginBottom: "10px",
                  boxSizing: "border-box",
                  transition: "all 0.3s ease"
                }}
              />
              <button
                onClick={() => addReview(selectedMovie.id)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4ecdc4",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginBottom: "15px",
                  fontWeight: "bold",
                  transition: "all 0.3s ease"
                }}>
                Add Review
              </button>

              {movieReviews[selectedMovie.id] && movieReviews[selectedMovie.id].length > 0 && (
                <div>
                  <h3>Your Reviews</h3>
                  {movieReviews[selectedMovie.id].map((review, idx) => (
                    <div key={idx} style={{
                      backgroundColor: isDarkMode ? "#0f172a" : "#f5f7fa",
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      border: isDarkMode ? "1px solid #334155" : "1px solid #cbd5e1",
                      transition: "all 0.3s ease"
                    }}>
                      <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>⭐ {review.rating}/10 — {review.date}</p>
                      <p style={{ margin: 0 }}>{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", margin: "40px 20px" }}>
          {!isSearching && !showFavorites && !showWatchLater && !selectedGenre && (
            <button
              onClick={() => setPage(page + 1)}
              style={{
                padding: "14px 36px",
                background: "linear-gradient(135deg, #2dd4bf, #06d6a0)",
                color: "#022c22",
                border: "none",
                borderRadius: "999px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "15px",
                letterSpacing: "0.3px",
                boxShadow: "0 2px 12px rgba(45, 212, 191, 0.35)",
                transition: "all 0.3s ease"
              }}>
              Load More
            </button>
          )}
        </div>
      </div>


    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <App />
);