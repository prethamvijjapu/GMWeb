// src/Components/SearchBooks.jsx
import { useState } from "react";
import all_books from "../Assets/books";
import Item from "../Item/Item";
import "./SearchBox.css";

const INITIAL_ITEM_COUNT = 6;      // Number of books shown initially
const ITEM_INCREMENT = 4;          // Books added each “Show More” click
const INITIAL_GENRE_COUNT = 4;     // Number of genres shown initially
const GENRE_INCREMENT = 4;         // Genres added each “Show More” click

function SearchBooks() {
    const [query, setQuery] = useState("");
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [visibleItemsCount, setVisibleItemsCount] = useState(INITIAL_ITEM_COUNT);
    const [visibleGenresCount, setVisibleGenresCount] = useState(INITIAL_GENRE_COUNT);

    // Gather unique genres
    const allGenres = Array.from(
        new Set(all_books.flatMap(book => book.genres))
    );

    // Filter books according to query and selected genre
    const filteredBooks = all_books.filter(book => {
        const matchesQuery =
            !searchPerformed ||
            query.trim() === "" ||
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase());
        const matchesGenre = !selectedGenre || book.genres.includes(selectedGenre);
        return matchesQuery && matchesGenre;
    });

    // Sliced arrays for display
    const visibleItems = filteredBooks.slice(0, visibleItemsCount);
    const visibleGenres = allGenres.slice(0, visibleGenresCount);

    // Handlers
    const handleSearch = e => {
        e.preventDefault();
        setSearchPerformed(true);
        setVisibleItemsCount(INITIAL_ITEM_COUNT);
        setVisibleGenresCount(INITIAL_GENRE_COUNT);
    };

    const handleClearAll = () => {
        setQuery("");
        setSelectedGenre(null);
        setSearchPerformed(false);
        setVisibleItemsCount(INITIAL_ITEM_COUNT);
        setVisibleGenresCount(INITIAL_GENRE_COUNT);
    };

    const handleShowMoreItems = () => {
        setVisibleItemsCount(prev =>
            Math.min(prev + ITEM_INCREMENT, filteredBooks.length)
        );
    };

    const handleShowLessItems = () => {
        setVisibleItemsCount(INITIAL_ITEM_COUNT);
    };

    const handleShowMoreGenres = () => {
        setVisibleGenresCount(prev =>
            Math.min(prev + GENRE_INCREMENT, allGenres.length)
        );
    };

    const handleShowLessGenres = () => {
        setVisibleGenresCount(INITIAL_GENRE_COUNT);
    };

    return (
        <div className="search-books-container">
            {/* Search & Reset */}
            <form className="search-form" onSubmit={handleSearch}>
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="Search by title or author…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
                <button type="submit" className="search-btn">
                    Search
                </button>
                <button
                    type="button"
                    className="reset-btn"
                    onClick={handleClearAll}
                >
                    Reset All
                </button>
            </form>

            {/* Genre Tags */}
            <div className="genre-tags">
                {visibleGenres.map(genre => (
                    <button
                        key={genre}
                        className={`genre-tag${selectedGenre === genre ? " selected" : ""}`}
                        onClick={() =>
                            setSelectedGenre(prev => (prev === genre ? null : genre))
                        }
                    >
                        {genre}
                    </button>
                ))}
                {allGenres.length > INITIAL_GENRE_COUNT && (
                    visibleGenresCount < allGenres.length ? (
                        <button className="toggle-btn" onClick={handleShowMoreGenres}>
                            Show More Genres
                        </button>
                    ) : (
                        <button className="toggle-btn" onClick={handleShowLessGenres}>
                            Show Less Genres
                        </button>
                    )
                )}
            </div>

            {/* Search Results */}
            {searchPerformed && (
                <div className="results-section">
                    <h3>
                        {filteredBooks.length} book
                        {filteredBooks.length !== 1 && "s"} found
                    </h3>
                    <div className="items-grid">
                        {visibleItems.map(item => (
                            <Item key={item.id} item={item} onLikeChanged={() => { }} />
                        ))}
                    </div>
                    {filteredBooks.length > INITIAL_ITEM_COUNT && (
                        <>
                            {visibleItemsCount < filteredBooks.length ? (
                                <button className="toggle-btn" onClick={handleShowMoreItems}>
                                    Show More Books
                                </button>
                            ) : (
                                <button className="toggle-btn" onClick={handleShowLessItems}>
                                    Show Less Books
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchBooks;
