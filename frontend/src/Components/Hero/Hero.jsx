import { useNavigate } from 'react-router-dom';
import stack_book from "../Assets/stack_book.jpg";
import "./Hero.css";

const Hero = () => {
    const navigate = useNavigate();

    return (
        <div className="hero">
            <div className="hero-content">
                <h1>Discover Your Next Great Read</h1>
                <p>
                    Personalized book recommendations tailored to your taste. 
                    Explore trending titles, find hidden gems, and track your reading journey.
                </p>
                <div className="hero-buttons">
                    <button
                        className="cta-btn"
                        onClick={() => navigate('/recomended')}
                    >
                        Get Recommendations
                    </button>
                    <button
                        className="secondary-btn"
                        onClick={() => navigate('/allBooks')}
                    >
                        Browse All Books
                    </button>
                </div>
            </div>
            <div className="hero-image">
                <img
                    src={stack_book}
                    alt="Stack of books"
                />
            </div>
        </div>
    );
}

export default Hero;
