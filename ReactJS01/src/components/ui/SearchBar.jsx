import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const SearchBar = ({ placeholder = "Tìm bánh ngon..." }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative flex items-center w-full max-w-sm"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-5 pr-12 py-2.5 bg-bakery-bg/60 border border-bakery-beige/60 text-bakery-dark placeholder-gray-400 rounded-2xl text-sm font-semibold focus:outline-none focus:bg-white focus:border-bakery-primary focus:ring-2 focus:ring-bakery-primary/10 transition-all duration-300 shadow-sm"
      />
      <button
        type="submit"
        className="absolute right-2.5 p-2 rounded-xl text-bakery-dark hover:text-bakery-primary hover:bg-bakery-bg transition-colors duration-200"
      >
        <Search className="w-4 h-4 stroke-[2.5]" />
      </button>
    </form>
  );
};

export default SearchBar;
