import React from 'react';
import { MdEmail } from 'react-icons/md';
import { Phone, Twitter, Facebook, Instagram, Linkedin, ShieldCheck, CreditCard, Truck, Heart } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 py-12 relative overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
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
                            <div className="flex flex-col sm:flex-row max-w-md relative gap-3 sm:gap-0">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/80 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:pr-32 transition-all"
                                />
                                <button className="w-full sm:w-auto sm:absolute sm:right-1 sm:top-1 sm:bottom-1 px-5 py-3 sm:py-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium text-sm rounded-lg sm:rounded-md hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links with Animation */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6 pb-2 border-b border-gray-700/50 inline-block relative group">
                            Quick Links
                            <div className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 w-full mt-2 transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></div>
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
                                            className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-emerald-500/20 hover:to-teal-550/20 border border-gray-700/40 hover:border-emerald-500/30 transition-all duration-300 transform hover:-translate-y-1"
                                        >
                                            <Icon size={18} />
                                        </a>
                                    );
                                })}
                            </div>

                            {/* Contact Info */}
                            <div className="pt-4 space-y-3">
                                <div className="flex items-center text-sm gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer">
                                    <span className="text-emerald-500"><MdEmail className="w-4 h-4" /></span>
                                    sadiv120@gmail.com
                                </div>
                                <div className="flex items-center text-sm gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer">
                                    <span className="text-emerald-500"><Phone className="w-4 h-4" /></span>
                                    +91 8409* *****
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-800/50 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 md:space-x-6 text-sm">
                            <span className="flex items-center">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative h-2 w-2 rounded-full bg-green-500"></span>
                                </span>
                                <span className="ml-2 text-gray-300">24/7 Support Available</span>
                            </span>

                            <span className="hidden md:inline text-gray-700">|</span>

                            <span className="flex items-center">
                                <ShieldCheck className="text-emerald-500 mr-2 w-4 h-4" />
                                <span className="text-gray-300">Secure Payment</span>
                            </span>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors hover:underline flex items-center">
                                <CreditCard className="mr-2 w-4 h-4 text-emerald-500" />
                                Payment Methods
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors hover:underline flex items-center">
                                <Truck className="mr-2 w-4 h-4 text-emerald-500" />
                                Shipping Info
                            </a>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="text-center mt-8 pt-6 border-t border-gray-800/30">
                        <p className="text-sm text-gray-500 flex items-center justify-center flex-wrap gap-1">
                            <span>© 2025 Neerman. All rights reserved. | Designed with</span>
                            <Heart className="text-red-500 w-3 h-3 fill-red-500 inline" />
                            <span>for builders</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
