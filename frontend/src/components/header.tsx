import BYULogo from '../assets/BYU_monogram_white.svg';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import '../css/header.css';

// Header Bar to be used on every page
const HeaderBar = () => {
  // Mock user data
  const user = {
    name: 'Demo User',
  };

  return (
    <div className="w-full sticky top-0 z-50">
      {/* Top navy bar */}
      <header className="w-screen bg-byuNavy text-white py-4 px-6 shadow-md">
        <div className="flex items-center justify-between">
          {/* Left: BYU Logo + Title */}
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

          {/* Right: Mock user info */}
          <div className="flex items-center space-x-3 pr-6 text-base">
            <span>{user.name}</span>
            <FaUserCircle size={25} color="white" />
            <button
              onClick={() => console.log('Sign out clicked')} // placeholder
              className="underline hover:text-gray-200 transition"
            >
              Sign out
            </button>
          </div>
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
            to="/orderHistory"
            className="px-8 py-4 hover:bg-[#FAFAFA] rounded-md block nav-link-hover"
          >
            Student Order History
          </Link>
          <Link
            to="/orderDashboard"
            className="px-8 py-4 hover:bg-[#FAFAFA] rounded-md block nav-link-hover"
          >
            Order Dashboard
          </Link>
          <Link
            to="/admin"
            className="px-8 py-4 hover:bg-[#FAFAFA] rounded-md block nav-link-hover"
          >
            Site Admin
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default HeaderBar;
