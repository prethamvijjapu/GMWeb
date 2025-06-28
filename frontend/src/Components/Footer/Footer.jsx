import { useState } from 'react';
import instaicon from '../Assets/instagram_icon.png';
import pinster_icon from '../Assets/pintester_icon.png';
import footer_logo from '../Assets/stack_book.jpg';
import whatsapp_icon from '../Assets/whatsapp_icon.png';
import './Footer.css';

const Footer = () => {
    const [showAbout, setShowAbout] = useState(false);
    const [showContact, setShowContact] = useState(false);

    return (
        <div className='footer'>
            <div className="footer-logo">
                <img src={footer_logo} alt="" />
                <p>NextPage</p>
            </div>
            <ul className="footer-links">
                <li
                    onClick={() => setShowAbout(show => !show)}
                    style={{ userSelect: 'none' }}
                >
                    About
                </li>
                <li
                    onClick={() => setShowContact(show => !show)}
                    style={{ userSelect: 'none' }}
                >
                    Contact
                </li>
            </ul>

            {/* About Section */}
            {showAbout && (
                <div className="footer-about">
                    <p>
                        NextPage is your friendly book recommendation companion.
                        Discover new favorites, track your reading, and connect with stories that inspire you.
                        Happy reading!
                    </p>
                </div>
            )}

            {/* Contact Section */}
            {showContact && (
                <div className="footer-contact">
                    <p>
                        Email: <a href="mailto:prethamvvrp@gmail.com">prethamvvrp@gmail.com</a>
                    </p>
                </div>
            )}

            <div className="footer-social-icon">
                <div className="footer-icons-container">
                    <img src={instaicon} alt="Instagram" />
                </div>
                <div className="footer-icons-container">
                    <img src={pinster_icon} alt="Pinterest" />
                </div>
                <div className="footer-icons-container">
                    <img src={whatsapp_icon} alt="WhatsApp" />
                </div>
            </div>
            <div className="footer-copyright">
                <hr />
                <p>Copyright @ 2023 - All Rights Reserved</p>
            </div>
        </div>
    );
};

export default Footer;
