import BYULogo from '../assets/BYU_monogram_white.svg';
import { Link } from 'react-router-dom';

const HeaderBar = () => {
  return (
    <div className="w-full">
      {/* Top navy bar */}
      <header className="w-screen bg-byuNavy text-white py-4 px-6 shadow-md">
        <div className="flex items-center">
          <a
            href="https://www.byu.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="mr-4"
          >
            <img src={BYULogo} alt="Logo" className="h-10 w-auto" />
          </a>
          <h1 className="text-2xl">ECE Purchasing</h1>
        </div>
      </header>

      {/* White nav bar */}
      <nav className="w-full bg-white text-byuNavy shadow">
        <div className="flex space-x-10 px-20 py-4 text-base font-medium">
          <Link to="/purchaseRequest" className="hover_underline">
            Purchase Request Form
          </Link>
          <Link to="/admin" className="hover_underline">
            Admin Dashboard
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default HeaderBar;
