import { Link, Route, Routes } from "react-router-dom";
import { Home } from "./Pages/Home";
import { Bpaper } from "./Pages/Bpaper";
import { Bcard } from "./Pages/Bcard";
import "./Main.css";

function Main() {
  return (
    <>
      <nav className="direction">
        <ul>
          <li>
            <Link to="/home">Home</Link>
          </li>
          <li>
            <Link to="/">Bcard</Link>
          </li>
          <li>
            <Link to="/bpaper">Bpaper</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/bpaper" element={<Bpaper />} />
        <Route path="/" element={<Bcard />} />
      </Routes>
    </>
  );
}

export default Main;
