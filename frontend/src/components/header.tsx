import BYULogo from '../assets/BYU_monogram_white.svg';
import { Link } from 'react-router-dom';
import '../css/header.css';

// Header Bar to be used on every page
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
            className="mr-4 border-r-[1px] border-byuRoyal"
          >
            <img src={BYULogo} alt="Logo" className="h-10 w-auto" />
          </a>
          <h1 className="text-2xl">ECE Purchasing</h1>
        </div>
      </header>

      {/* White nav bar with links to every page */}
      <nav className="w-full bg-white text-byuNavy shadow">
        <div className="flex px-32 text-base font-medium">
          <Link
            to="/purchaseRequest"
            className="px-8 py-4 hover:bg-[#FAFAFA] rounded-md block nav-link-hover"
          >
            Purchase Request Form
          </Link>
          <Link
            to="/receiptSubmit"
            className="px-8 py-4 hover:bg-[#FAFAFA] rounded-md block nav-link-hover"
          >
            Submit Receipts
          </Link>
          <Link
            to="/admin"
            className="px-8 py-4 hover:bg-[#FAFAFA] rounded-md block nav-link-hover"
          >
            Orders
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default HeaderBar;
