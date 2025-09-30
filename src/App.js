import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [showChat, setShowChat] = useState(false);
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null); // ⭐ chi tiết phim
  const [showModal, setShowModal] = useState(false); // ⭐ popup

  const API_KEY = "bc4af0f7"; 

  useEffect(() => {
    setMessages([{ role: "bot", text: "Xin chào! Hôm nay bạn muốn tìm phim gì? 🎬" }]);
  }, []);

  const searchMovies = async () => {
    if (!query) return;
    try {
      const res = await axios.get(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`
      );
      setMovies(res.data.Search || []);
    } catch (err) {
      console.error(err);
      setMovies([]);
    }
  };

  // ⭐ Lấy chi tiết phim khi click
  const fetchMovieDetail = async (id) => {
    try {
      const res = await axios.get(
        `https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`
      );
      setSelectedMovie(res.data);
      setShowModal(true); // mở popup
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!input) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    let reply = "Xin lỗi, mình chưa hiểu câu hỏi.";
    try {
      const text = input.toLowerCase();
      if (/hành động|action/.test(text)) {
        const res = await axios.get(
          `https://www.omdbapi.com/?apikey=${API_KEY}&s=action&type=movie`
        );
        const movies = res.data.Search?.slice(0, 3) || [];
        reply = "🎬 Gợi ý phim hành động:\n" + movies.map(m => `${m.Title} (${m.Year})`).join("\n");
      }
    } catch {
      reply = "Có lỗi khi tìm phim. 😢";
    }

    setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    setInput("");
  };

  return (
    <div className="app">
      <h1 className="main-title">Hệ Thống Tìm Kiếm Phim Tích Hợp AI 🎬</h1>

      {/* Khung tìm phim */}
      <div className="movie-search">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Nhập tên phim..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchMovies()}
          />
          <button onClick={searchMovies}>Tìm</button>
        </div>

        {/* Danh sách phim */}
        <div className="movie-list">
          {movies.map((m) => (
            <div
              key={m.imdbID}
              className="movie-card"
              onClick={() => fetchMovieDetail(m.imdbID)} // click lấy chi tiết
            >
              <img
                src={m.Poster !== "N/A" ? m.Poster : "https://via.placeholder.com/80x120"}
                alt={m.Title}
              />
              <div className="info">
                <h2>{m.Title}</h2>
                <p>{m.Year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ⭐ Modal hiển thị chi tiết phim */}
      {showModal && selectedMovie && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            <h2 className="font-bold text-center text-[18px] uppercase pb-1">{selectedMovie.Title} ({selectedMovie.Year})</h2>
            <img
              src={selectedMovie.Poster !== "N/A" ? selectedMovie.Poster : "https://via.placeholder.com/150"}
              className="relative left-1/2 -translate-x-1/2 bg-white p-2 rounded-lg shadow-lg mb-1 w-[250px]"
              alt={selectedMovie.Title}
            />
            <p><b>Thể loại:</b> {selectedMovie.Genre}</p>
            <p><b>Quốc gia:</b> {selectedMovie.Country}</p>
            <p><b>Đạo diễn:</b> {selectedMovie.Director}</p>
            <p><b>Diễn viên:</b> {selectedMovie.Actors}</p>
            <p><b>IMDb:</b> {selectedMovie.imdbRating}</p>
            <p><b>Nội dung:</b> {selectedMovie.Plot}</p>
          </div>
        </div>
      )}

      {/* Chat AI */}
      {!showChat && <div className="chat-icon" onClick={() => setShowChat(true)}>🤖</div>}
      {showChat && (
        <div className="chat-widget">
          <div className="chat-header">
            <span>AI Movie Bot</span>
            <button onClick={() => setShowChat(false)}>×</button>
          </div>
          <div className="chat-window">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.role}`}>
                {msg.text.split("\n").map((line,i)=>(<p key={i}>{line}</p>))}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Hỏi AI về phim..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
}
