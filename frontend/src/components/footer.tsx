import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';

// Footer bar to be used on every page
const FooterBar = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#002E5D] text-white py-8 px-6">
      <div className="grid items-start grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-32">
        {/* Left Section: Helpful Links */}
        <div className="text-center">
          <h2 className="text-xl font-bold">Helpful Links</h2>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <a
                href="https://www.byu.edu"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-white"
              >
                BYU Homepage
              </a>
            </li>
            <li>
              <a
                href="https://www.byu.edu/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-white"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="https://www.byu.edu/accessibility"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-white"
              >
                Accessibility
              </a>
            </li>
            <li>
              <a
                href="https://www.ece.byu.edu"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-white"
              >
                ECE Department
              </a>
            </li>
          </ul>
        </div>

        {/* Middle Section: University Info */}
        <div className="text-center">
          <h1 className="text-xl font-bold">Brigham Young University</h1>
          <p className="mt-2 text-sm text-white">
            450 Engineering Building
            <br />
            Provo, UT 84602
            <br />
            (801) 422-4012
          </p>
        </div>

        {/* Right Section: Social Media */}
        <div className="text-center">
          <h2 className="text-xl font-bold">Connect With Us</h2>
          <div className="mt-2 flex justify-center space-x-4">
            <a
              href="https://www.facebook.com/BYUECE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white"
            >
              <FaFacebook />
            </a>
            <a
              href="https://twitter.com/BYUECE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white"
            >
              <FaTwitter />
            </a>
            <a
              href="https://www.linkedin.com/school/byu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white"
            >
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Disclaimer */}
      <div className="mt-8 text-center text-xs text-gray-400">
        © {currentYear} Brigham Young University. All rights reserved.
      </div>
    </footer>
  );
};

export default FooterBar;
