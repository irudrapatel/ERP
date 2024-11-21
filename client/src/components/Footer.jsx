import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt, FaTwitter } from "react-icons/fa";

// Import your images
import logo from "C:/Users/rapat/OneDrive/Desktop/GITHUB/E-commerce/client/src/assets/logo.png";
import googlePlay from "C:/Users/rapat/OneDrive/Desktop/GITHUB/E-commerce/client/src/assets/Google Play Stor.png";
import appStore from "C:/Users/rapat/OneDrive/Desktop/GITHUB/E-commerce/client/src/assets/App-Store.png";
import paymentCard from "C:/Users/rapat/OneDrive/Desktop/GITHUB/E-commerce/client/src/assets/Payment Card.png";

const Footer = () => {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-6 py-10 text-gray-600 flex flex-col lg:flex-row lg:justify-between gap-10">
        
        {/* Left Section */}
        <div className="flex flex-col items-start">
          <div className="flex items-center mb-4">
            <img src={logo} alt="Logo" className="h-10" />
          </div>
          <p className="text-gray-500 mb-4">
            We're Online Trendig Product Shop.
          </p>
          <div className="flex items-center mb-2">
            <span className="bg-green-500 rounded-full p-2 text-white">
              <FaMapMarkerAlt />
            </span>
            <span className="ml-3">125 Himmatlal Park, Shivranjani, Ahmedabad, IND</span>
          </div>
          <div className="flex items-center mb-2">
            <span className="bg-green-500 rounded-full p-2 text-white">
              <FaPhone />
            </span>
            <span className="ml-3">+91 81608 73680</span>
          </div>
          <div className="flex items-center">
            <span className="bg-green-500 rounded-full p-2 text-white">
              <FaEnvelope />
            </span>
            <span className="ml-3">rapatel11623@gmail.com</span>
          </div>
        </div>
        
        {/* Links Section */}
        <div className="flex flex-wrap gap-10 justify-between">
          <div>
            <h5 className="text-gray-900 font-semibold mb-3">Information</h5>
            <ul className="space-y-2 text-gray-500">
              <li><a href="/vendor" className="hover:text-green-600">Become a Vendor</a></li>
              <li><a href="/affiliate-program" className="hover:text-green-600">Affiliate Program</a></li>
              <li><a href="/privacy-policy" className="hover:text-green-600">Privacy Policy</a></li>
              <li><a href="/suppliers" className="hover:text-green-600">Our Suppliers</a></li>
              <li><a href="/extended-plan" className="hover:text-green-600">Extended Plan</a></li>
              <li><a href="/community" className="hover:text-green-600">Community</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-gray-900 font-semibold mb-3">Customer Support</h5>
            <ul className="space-y-2 text-gray-500">
              <li><a href="/help-center" className="hover:text-green-600">Help Center</a></li>
              <li><a href="/contact" className="hover:text-green-600">Contact Us</a></li>
              <li><a href="/report-abuse" className="hover:text-green-600">Report Abuse</a></li>
              <li><a href="/submit-dispute" className="hover:text-green-600">Submit and Dispute</a></li>
              <li><a href="/policies" className="hover:text-green-600">Policies & Rules</a></li>
              <li><a href="/online-shopping" className="hover:text-green-600">Online Shopping</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-gray-900 font-semibold mb-3">My Account</h5>
            <ul className="space-y-2 text-gray-500">
              <li><a href="/my-account" className="hover:text-green-600">My Account</a></li>
              <li><a href="/order-history" className="hover:text-green-600">Order History</a></li>
              <li><a href="/shopping-cart" className="hover:text-green-600">Shopping Cart</a></li>
              <li><a href="/compare" className="hover:text-green-600">Compare</a></li>
              <li><a href="/help-ticket" className="hover:text-green-600">Help Ticket</a></li>
              <li><a href="/wishlist" className="hover:text-green-600">Wishlist</a></li>
            </ul>
          </div>
          {/* Shop on The Go Section */}
          <div>
            <h5 className="text-gray-900 font-semibold mb-3">Shop on The Go</h5>
            <p className="text-gray-500 mb-4">App is available. Get it now</p>
            <div className="flex space-x-3 mb-6">
              <img src={appStore} alt="App Store" className="h-10" />
              <img src={googlePlay} alt="Google Play" className="h-10" />
            </div>
            <div className="flex space-x-3 text-3xl text-gray-600"> {/* Increased icon size */}
              <a href="#" className="hover:text-green-600"><FaFacebook /></a>
              <a href="#" className="hover:text-green-600"><FaTwitter /></a>
              <a href="#" className="hover:text-green-600"><FaInstagram /></a>
              <a href="#" className="hover:text-green-600"><FaLinkedin /></a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row items-center justify-between text-gray-500 py-4 border-t px-6 gap-2">
        <p className="text-center md:text-left">© All Rights Reserved 2024.</p>
        <div className="flex items-center space-x-2 text-center md:text-right">
          <span className="text-sm">We Are Accepting</span>
          <img src={paymentCard} alt="Payment Methods" className="h-6 w-auto" /> {/* Responsive height */}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
