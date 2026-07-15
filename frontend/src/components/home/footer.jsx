import React from 'react';
import { MdEmail } from 'react-icons/md';
import { Phone, Twitter, Facebook, Instagram, Linkedin } from "lucide-react";



export default function Footer() {


    return (
        <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 py-12 relative overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center  pointer-events-none"
                style={{ backgroundImage: 'url(/lake.svg)' }}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center space-x-3 group cursor-pointer">
                            <div className="relative">
                                {/* Main Logo Box */}
                                <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all duration-300">
                                    <span className="text-white font-extrabold text-2xl tracking-tighter">N</span>
                                </div>
                                {/* Subtle Hover Glow Effect */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-0 group-hover:opacity-40 transition duration-300 -z-10"></div>
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white">
                                Neer<span className="text-emerald-400">man</span>
                            </span>
                        </div>

                        <p className="text-gray-400 leading-relaxed max-w-md text-sm sm:text-base">
                            Empowering local businesses and homeowners with cutting-edge AI technology
                            for a seamless build experience. Building tomorrow, today.
                        </p>

                        {/* Newsletter Subscription */}
                        <div className="space-y-3 mt-8">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Stay Updated</h4>
                            <div className="flex max-w-md relative">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/80 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 pr-32 transition-all"
                                />
                                <button className="absolute right-1 top-1 bottom-1 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium text-sm rounded-md hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links with Animation */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6 pb-2 border-b border-gray-700/50 inline-block">
                            Quick Links
                            <div className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 w-full mt-2 transform origin-left transition-transform duration-300 hover:scale-x-100 scale-x-0 group-hover:scale-x-100"></div>
                        </h4>
                        <ul className="space-y-4">
                            {['About Us', 'Careers', 'Contact', 'Blog', 'FAQs'].map((item, index) => (
                                <li key={item} className="group">
                                    <a
                                        href="#"
                                        className="flex items-center text-gray-400 hover:text-white transition-all duration-300 transform hover:translate-x-2"
                                        style={{ transitionDelay: `${index * 50}ms` }}
                                    >
                                        <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        {item}
                                        <span className="ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6 pb-2 border-b border-gray-700/50 inline-block">
                            Legal
                        </h4>
                        <ul className="space-y-4">
                            {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Refund Policy', 'Accessibility'].map((item, index) => (
                                <li key={item} className="group">
                                    <a
                                        href="#"
                                        className="flex items-center text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2"
                                        style={{ transitionDelay: `${index * 50}ms` }}
                                    >
                                        <span className="w-1 h-1 bg-gray-600 rounded-full mr-3 group-hover:bg-blue-400 transition-colors"></span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social & Contact */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6 pb-2 border-b border-gray-700/50 inline-block">
                            Connect
                        </h4>
                        <div className="space-y-4">
                            {/* Social Media Icons */}
                            <div className="flex space-x-4">
                                {[
                                    { name: 'twitter', icon: Twitter },
                                    { name: 'facebook', icon: Facebook },
                                    { name: 'instagram', icon: Instagram },
                                    { name: 'linkedin', icon: Linkedin },
                                ].map((platform) => {
                                    const Icon = platform.icon;
                                    return (
                                        <a
                                            key={platform.name}
                                            // href="#"
                                            className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 transition-all duration-300 transform hover:-translate-y-1"
                                        >
                                            <Icon size={18} />
                                        </a>
                                    );
                                })}
                            </div>

                            {/* Contact Info */}
                            <div className="pt-4 space-y-3">
                                <div className="flex items-center text-sm gap-3 text-gray-400 hover:text-white transition-colors">
                                    <span className=""><MdEmail className=" w-4 h-4 " /></span>
                                    sadiv120@gmail.com
                                </div>
                                <div className="flex items-center text-sm gap-3 text-gray-400 hover:text-white transition-colors">
                                    <span className="w-8"><Phone className=" w-4 h-4 " /></span>
                                    +91 8409* *****
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-800/50 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-6 text-sm">
                            <span className="flex items-center">
                                <span className="flex h-2 w-2">
                                    <span className="animate-ping absolute h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative h-2 w-2 rounded-full bg-green-500"></span>
                                </span>
                                <span className="ml-2">24/7 Support Available</span>
                            </span>

                            <span className="hidden md:inline">|</span>

                            <span className="flex items-center">
                                <i className="fas fa-shield-alt text-blue-400 mr-2"></i>
                                <span>Secure Payment</span>
                            </span>
                        </div>

                        <div className="flex items-center space-x-6 text-sm">
                            <a href="#" className="hover:text-white transition-colors hover:underline">
                                <i className="fas fa-credit-card mr-2"></i>
                                Payment Methods
                            </a>
                            <a href="#" className="hover:text-white transition-colors hover:underline">
                                <i className="fas fa-truck mr-2"></i>
                                Shipping Info
                            </a>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="text-center mt-8 pt-6 border-t border-gray-800/30">
                        <p className="text-sm text-gray-500">
                            © 2025 Neerman. All rights reserved. |
                            <span className="ml-2 text-gray-600">
                                Designed with <i className="fas fa-heart text-red-400 mx-1"></i> for builders
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}






