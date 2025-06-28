import popular_books from '../Assets/popular';
import Item from '../Item/Item';
import './Popular.css';

const Popular = () => {
    return (
        <div className='popular'>
            <h1>Popular Books</h1>
            <hr/>
            <div className='popular-item'>
                {popular_books.map((item, i) => {
                    return <Item key={i} item={item} />
                })}
            </div>
        </div>
    )
}

export default Popular;
