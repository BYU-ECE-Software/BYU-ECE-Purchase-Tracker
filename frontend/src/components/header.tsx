import BYULogo from '../assets/BYU_monogram_white.svg';
import { Link } from 'react-router-dom';
import '../css/header.css';

const HeaderBar = () => {
  return (
    <div className="w-full sticky top-0 z-50">
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
        <div className="flex px-32 text-base font-medium">
          <div className="px-3 py-4 hover:bg-[#FAFAFA] rounded-md nav-link-hover">
            <Link to="/purchaseRequest" className="block h-full w-full">
              Purchase Request Form
            </Link>
          </div>
          <div className="px-8 py-4 hover:bg-[#FAFAFA] rounded-md nav-link-hover">
            <Link to="/admin" className="block h-full w-full">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default HeaderBar;
