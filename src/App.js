import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [showChat, setShowChat] = useState(false);
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // State cho modal phim chi tiết
  const [selectedMovie, setSelectedMovie] = useState(null);

  const API_KEY = "bc4af0f7"; // Thay bằng API key OMDb của bạn

  // Khi load lần đầu → bot nhắn trước
  useEffect(() => {
    const welcomeMsg = {
      role: "bot",
      text: "Xin chào! Hôm nay bạn muốn tìm phim gì? 🎬",
    };
    setMessages([welcomeMsg]);
  }, []);

  // Tìm phim theo tên
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

  // Lấy chi tiết phim khi click
  const fetchMovieDetail = async (id) => {
    try {
      const res = await axios.get(
        `https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`
      );
      setSelectedMovie(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Chat AI chuyên về phim
  const sendMessage = async () => {
    if (!input) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    // Thêm bot "đang gõ..."
    const loadingMsg = { role: "bot", reply: { type: "text", text: "⏳ Đang tìm phim..." } };
    setMessages((prev) => [...prev, loadingMsg]);

    let reply = { type: "text", text: "Xin lỗi, mình chưa hiểu câu hỏi." };

    try {
      const text = input.toLowerCase();
      let res, movies;

      if (/hành động|action/gi.test(text)) {
        res = await axios.get(`https://www.omdbapi.com/?apikey=${API_KEY}&s=action&type=movie`);
        movies = res.data.Search?.slice(0, 3) || [];
        reply = { type: "list", title: "🎬 Gợi ý phim hành động:", data: movies };
      } else if (/hài|comedy/gi.test(text)) {
        res = await axios.get(`https://www.omdbapi.com/?apikey=${API_KEY}&s=comedy&type=movie`);
        movies = res.data.Search?.slice(0, 3) || [];
        reply = { type: "list", title: "😂 Gợi ý phim hài:", data: movies };
      } else if (/tình cảm|romance/gi.test(text)) {
        res = await axios.get(`https://www.omdbapi.com/?apikey=${API_KEY}&s=romance&type=movie`);
        movies = res.data.Search?.slice(0, 3) || [];
        reply = { type: "list", title: "🎬 Gợi ý phim tình cảm:", data: movies };
      } else if (/kinh dị|horror/gi.test(text)) {
        res = await axios.get(`https://www.omdbapi.com/?apikey=${API_KEY}&s=horror&type=movie`);
        movies = res.data.Search?.slice(0, 3) || [];
        reply = { type: "list", title: "🎬 Gợi ý phim kinh dị:", data: movies };
      } else if (/hoạt hình|animation/gi.test(text)) {
        res = await axios.get(`https://www.omdbapi.com/?apikey=${API_KEY}&s=animation&type=movie`);
        movies = res.data.Search?.slice(0, 3) || [];
        reply = { type: "list", title: "🎬 Gợi ý phim hoạt hình:", data: movies };
      } else if (/Khoa học viễn tưởng|sci-fi/gi.test(text)) {
        res = await axios.get(`https://www.omdbapi.com/?apikey=${API_KEY}&s=sci-fi&type=movie`);
        movies = res.data.Search?.slice(0, 3) || [];
        reply = { type: "list", title: "🎬 Gợi ý phim Khoa học viễn tưởng:", data: movies };
      } else if (/Phiêu lưu|adventure/gi.test(text)) {
        res = await axios.get(`https://www.omdbapi.com/?apikey=${API_KEY}&s=adventure&type=movie`);
        movies = res.data.Search?.slice(0, 3) || [];
        reply = { type: "list", title: "🎬 Gợi ý phim Phiêu lưu:", data: movies };
      } else if (/tìm phim|phim/gi.test(text)) {
        const keyword = text.replace(/tìm phim|phim/gi, "").trim();
        res = await axios.get(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${keyword}`);
        movies = res.data.Search?.slice(0, 3) || [];
        reply = movies.length > 0
          ? { type: "list", title: "🎬 Mình tìm được những phim này:", data: movies }
          : { type: "text", text: "Không tìm thấy phim phù hợp 😢" };
      }
    } catch (err) {
      console.error(err);
      reply = { type: "text", text: "Có lỗi khi tìm phim. 😢" };
    }

    // Xóa tin nhắn loading, thêm kết quả
    setMessages((prev) => [...prev.filter((m) => m !== loadingMsg), { role: "bot", reply }]);
    setInput("");
  };


  return (
    <div className="app">
      {/* Tiêu đề lớn */}
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
        <div className="movie-list">
          {movies.map((m) => (
            <div
              key={m.imdbID}
              className="movie-card"
              onClick={() => fetchMovieDetail(m.imdbID)}
            >
              <img
                src={
                  m.Poster !== "N/A"
                    ? m.Poster
                    : "https://via.placeholder.com/80x120"
                }
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

      {/* Chat icon */}
      {!showChat && (
        <div className="chat-icon" onClick={() => setShowChat(true)}>
          🤖
        </div>
      )}

      {/* Chat widget */}
      {showChat && (
        <div className="chat-widget">
          <div className="chat-header">
            <span>AI Movie Bot</span>
            <button onClick={() => setShowChat(false)}>×</button>
          </div>
          <div className="chat-window">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.role}`}>
                {/* Nếu reply là text */}
                {msg.reply?.type === "text" ? (
                  <p>{msg.reply.text}</p>
                ) : msg.reply?.type === "list" ? (
                  <div>
                    <p>{msg.reply.title}</p>
                    {msg.reply.data.map((m) => (
                      <button
                        key={m.imdbID}
                        className="chat-movie-btn"
                        onClick={() => {
                          setQuery(m.Title);
                          searchMovies();
                          setShowChat(false); // đóng chat để xem kết quả
                        }}
                      >
                        {m.Title} ({m.Year})
                      </button>
                    ))}
                  </div>
                ) : (
                  msg.text?.split("\n").map((line, i) => <p key={i}>{line}</p>)
                )}
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

      {/* Modal chi tiết phim */}
      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // chặn click trong modal
          >
            <button
              className="modal-close"
              onClick={() => setSelectedMovie(null)}
            >
              ×
            </button>

            <img
              src={
                selectedMovie.Poster !== "N/A"
                  ? selectedMovie.Poster
                  : "https://via.placeholder.com/200x300"
              }
              alt={selectedMovie.Title}
            />

            <div className="modal-info">
              <h2>
                {selectedMovie.Title} ({selectedMovie.Year})
              </h2>
              <p><b>Đạo diễn:</b> {selectedMovie.Director}</p>
              <p><b>Diễn viên:</b> {selectedMovie.Actors}</p>
              <p><b>Thể loại:</b> {selectedMovie.Genre}</p>
              <p><b>Nội dung:</b> {selectedMovie.Plot}</p>
              <p><b>IMDb:</b> ⭐ {selectedMovie.imdbRating}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
