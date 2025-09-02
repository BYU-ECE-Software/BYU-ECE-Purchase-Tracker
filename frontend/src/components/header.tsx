import { useLayoutEffect, useRef, useState } from 'react';
import BYULogo from '../assets/BYU_monogram_white.svg';
import { Link, useNavigate } from 'react-router-dom';
//import { FaUserCircle } from 'react-icons/fa';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { adminLogout } from '../api/auth';
import '../css/header.css';

const HeaderBar = () => {
  const navigate = useNavigate();
  // const user = { name: 'Demo User' };
  const [mobileOpen, setMobileOpen] = useState(false);

  // refs + measured left padding for desktop white nav
  const logoRef = useRef<HTMLAnchorElement>(null);
  const [navPadLeft, setNavPadLeft] = useState<number>(128); // fallback ~ px-32

  useLayoutEffect(() => {
    const update = () => {
      const el = logoRef.current;
      if (!el) return;

      // Tailwind mr-4 = 1rem; compute in case root font-size changes
      const rem =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const mr4 = 1 * rem;

      // offsetWidth includes border/padding (good); margin-right is not included (we add mr4)
      const pad = el.offsetWidth + mr4;
      setNavPadLeft(pad);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const navLinks = [
    { to: '/purchaseRequest', label: 'Purchase Request Form' },
    { to: '/receiptSubmit', label: 'Submit Receipts' },
    //{ to: '/orderHistory', label: 'Student Order History' },
    //{ to: '/orderDashboard', label: 'Order Dashboard' },
    //{ to: '/admin', label: 'Site Admin' },
  ];

  const handleSignOut = async () => {
    try {
      await adminLogout(); // clears httpOnly cookie on backend
    } finally {
      navigate('/purchaseRequest'); // go to a public page
      // optional: force a reload to re-run your route guard immediately
      // window.location.reload();
    }
  };

  return (
    <div className="w-full sticky top-0 z-50">
      {/* Top navy bar */}
      <header className="relative w-full md:w-screen bg-byuNavy text-white py-4 shadow-md">
        <div className="px-6 flex items-center justify-between">
          {/* Left: BYU Logo + Title */}
          <div className="flex items-center">
            <a
              ref={logoRef} // <-- measure this block
              href="https://www.byu.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="mr-4 border-r-[1px] border-byuRoyal"
            >
              <img src={BYULogo} alt="Logo" className="h-10 w-auto" />
            </a>
            <h1 className="text-2xl">ECE Purchasing</h1>
          </div>

          {/* Right: user + mobile hamburger */}
          <div className="flex items-center gap-3 pr-6 text-base">
            {/*<span className="hidden sm:inline">{user.name}</span> */}
            {/*<span className="hidden sm:inline">
              <FaUserCircle size={25} color="white" />
            </span> */}
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden sm:inline
               text-white/90 underline underline-offset-4 decoration-white/50
               hover:text-white hover:decoration-white
               transition-colors duration-150
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70
               focus-visible:ring-offset-2 focus-visible:ring-offset-byuNavy
               active:opacity-80"
            >
              Sign out
            </button>
            <button
              className="inline-flex items-center justify-center p-2 rounded md:hidden hover:bg-white/10 focus:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <AiOutlineClose size={22} />
              ) : (
                <AiOutlineMenu size={22} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden w-full bg-white text-byuNavy shadow border-t"
        >
          {/* Profile row at the top */}
          <div className="flex items-center gap-3 px-6 py-4 border-b">
            {/*<span>
              <FaUserCircle size={24} color="#0b2a5b" />
            </span> */}
            <div className="flex-1">
              {/*<div className="font-medium">{user.name}</div>*/}
              {/* <div className="text-sm text-gray-500">user@email.com</div> */}
            </div>
            <button className="underline" onClick={handleSignOut}>
              Sign out
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col py-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="px-6 py-4 hover:bg-[#FAFAFA]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* White nav bar – desktop only */}
      <nav className="hidden md:block w-full bg-white text-byuNavy shadow">
        {/* match header px-6, then add measured left pad so first link text lines with "ECE Purchasing" */}
        <div
          className="flex text-base font-medium px-6"
          style={{ paddingLeft: navPadLeft }}
        >
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
          {/*<Link
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
          </Link>*/}
        </div>
      </nav>
    </div>
  );
};

export default HeaderBar;
