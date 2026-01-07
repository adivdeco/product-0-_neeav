



import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { loginUser, registerUser } from '../redux/slice/authSlice';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useAuth0 } from "@auth0/auth0-react";

const schema = z.object({
    email: z.string().email({ message: "Invalid email" }).min(1, { message: "Email is required" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
    const { loginWithRedirect } = useAuth0();

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });

    // watch email and password to enable/disable submit button when fields are empty
    const email = watch('email', '');
    const password = watch('password', '');
    const isDisabled = loading || !email?.trim() || !password?.trim();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = (data) => {
        dispatch(loginUser(data));
    };

    return (
        <div
            className="relative min-h-screen overflow-hidden"
            style={{
                backgroundImage: "url('/login.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <Toaster position="bottom-center" />

            {/* Optional semi-transparent overlay to improve contrast */}
            <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>

            {/* Glowing Orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-7/12 left-70 w-96 h-96 bg-gray-600 rounded-full filter blur-3xl opacity-50"></div>
                <div className="absolute top-1/12 right-3/12 w-64 h-64 bg-white rounded-full filter blur-3xl opacity-40"></div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-2">
                <div className="w-full max-w-md">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl mt-10 shadow-2xl overflow-hidden px-8 py-4">
                        {/* Header */}
                        <div className="text-center mb-3">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-gradient-to-br from-purple-600/70 to-blue-600/35 shadow-lg">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h2 className="mt-2 text-md text-white/70 font-sans">
                                Your Dream Our Prommise.
                            </h2>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-white/50 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-white/50" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        className={`block w-full pl-10 pr-3 py-2 rounded-lg border-none bg-white/5 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all ${errors.email ? "ring-2 ring-red-500" : "ring-1 ring-white/10"
                                            }`}
                                        placeholder="john@example.com"
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email?.message && (
                                    <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-white/50 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-white/50" />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        className={`block w-full pl-10 pr-10 py-2 rounded-lg border-none bg-white/5 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all ${errors.password ? "ring-2 ring-red-500" : "ring-1 ring-white/10"
                                            }`}
                                        placeholder="••••••••"
                                        {...register('password')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-white/50 hover:text-white/80" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-white/50 hover:text-white/80" />
                                        )}
                                    </button>
                                </div>
                                {errors.password?.message && (
                                    <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isDisabled}
                                    className={`w-full py-3 font-medium rounded-lg transition-all  border-1 hover:bg-black text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 
                                         ${isDisabled ? "opacity-80  cursor-not-allowed" : " hover:text-black hover:border hover:bg-white hover:border-white hover:shadow-[0_0_12px_rgba(255,255,255,0.85)]"}`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Importing your Account...
                                            </>
                                        ) : (
                                            <>
                                                Login In
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </form>

                        {/* import {useAuth0} from "@auth0/auth0-react";

                        // ... inside component ...
                        const {loginWithRedirect} = useAuth0();

                        // ... existing code ... */}

                        {/* Social Login Buttons */}
                        <div className="mt-6 space-y-3">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-transparent text-white/70">Or continue with</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => loginWithRedirect({ authorizationParams: { connection: 'google-oauth2' } })}
                                    type="button"
                                    className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors border border-white/10"
                                >
                                    <FaGoogle className="w-4 h-4" />
                                    <span>Google</span>
                                </button>

                                <button
                                    onClick={() => loginWithRedirect({ authorizationParams: { connection: 'github' } })}
                                    type="button"
                                    className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors border border-white/10"
                                >
                                    <FaGithub className="h-4 w-4" />
                                    <span>GitHub</span>
                                </button>
                            </div>

                        </div>

                        {/* Login Link */}
                        <div className="text-center text-sm text-white/50 mt-4">
                            Don’t have an account?{' '}
                            <NavLink
                                to="/register"
                                className="font-medium text-white hover:text-purple-200 transition-colors"
                            >
                                register
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 text-center text-white/50 text-xs p-4">
                © {new Date().getFullYear()} Nirmarn. All rights reserved.
            </div>

            {/* Error Message */}
            {error && (
                <div className="fixed bottom-4 right-4 py-2 px-4 bg-red-900/90 border border-red-700 rounded-lg text-red-200 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
}

export default Login;