import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../redux/slice/authSlice';
import { useEffect, useState, useCallback } from 'react';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { FaGithub, FaGoogle } from "react-icons/fa";

const passwordSchema = z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" });

const schema = z.object({
    name: z.string()
        .min(2, { message: "Name must be at least 2 characters" })
        .max(50, { message: "Name must be less than 50 characters" })
        .regex(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces" }),
    email: z.string()
        .email({ message: "Please enter a valid email address" })
        .min(1, { message: "Email is required" }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
    terms: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and conditions",
    }),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['confirmPassword'],
            message: "Passwords do not match",
        });
    }
});

const PasswordStrengthIndicator = ({ password }) => {
    const getStrength = (pwd) => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;
        return strength;
    };

    const strength = getStrength(password);
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthColors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-yellow-500',
        'bg-blue-500',
        'bg-green-500',
        'bg-emerald-500'
    ];

    return (
        <div className="mt-2 space-y-2">
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((index) => (
                    <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${index <= strength ? strengthColors[strength] : 'bg-gray-600'
                            }`}
                    />
                ))}
            </div>
            <p className={`text-xs font-medium ${strength >= 4 ? 'text-green-400' :
                strength >= 2 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                Password strength: {strengthLabels[strength]}
            </p>
        </div>
    );
};

const PasswordRequirement = ({ met, children }) => (
    <div className="flex items-center gap-2 text-xs">
        {met ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
            <XCircle className="w-4 h-4 text-red-400" />
        )}
        <span className={met ? 'text-green-400' : 'text-red-400'}>{children}</span>
    </div>
);

const PasswordRequirements = ({ password }) => {
    const requirements = [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'One lowercase letter', met: /[a-z]/.test(password) },
        { label: 'One number', met: /[0-9]/.test(password) },
        { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
    ];

    return (
        <div className="mt-2 space-y-1">
            {requirements.map((req, index) => (
                <PasswordRequirement key={index} met={req.met}>
                    {req.label}
                </PasswordRequirement>
            ))}
        </div>
    );
};

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        resolver: zodResolver(schema),
        mode: 'onChange'
    });

    // Watch all fields for button disabled state
    const name = watch('name', '');
    const email = watch('email', '');
    const watchedPassword = watch('password', '');
    const confirmPassword = watch('confirmPassword', '');
    const terms = watch('terms', false);

    const isDisabled = loading || !name?.trim() || !email?.trim() || !watchedPassword?.trim() || !confirmPassword?.trim() || !terms;

    useEffect(() => {
        setPassword(watchedPassword);
    }, [watchedPassword]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = (data) => {
        dispatch(registerUser(data));
    };

    const handleFeatureInProgress = (featureName) => {
        toast.error(`${featureName} login is currently under development.`, {
            duration: 2000,
            position: 'bottom-right',
            icon: '🚧',
        });
    };

    const inputBaseClasses = "block w-full pl-10 pr-10 py-2 rounded-lg border-none bg-white/5 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all ring-1 ring-white/10";
    const inputErrorClasses = "ring-2 ring-red-500";
    const inputSuccessClasses = "ring-1 ring-green-500/50";

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

            {/* Semi-transparent overlay */}
            <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>

            {/* Glowing Orbs - same as login */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-7/12 left-70 w-96 h-96 bg-gray-600 rounded-full filter blur-3xl opacity-50"></div>
                <div className="absolute top-1/12 right-3/12 w-64 h-64 bg-white rounded-full filter blur-3xl opacity-40"></div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-2">
                <div className="w-full max-w-md">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl mt-10 shadow-2xl overflow-hidden px-8 py-4">

                        {/* Header - matching login style */}
                        <div className="text-center mb-3">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-gradient-to-br from-purple-600/70 to-blue-600/35 shadow-lg">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h2 className="mt-2 text-md text-white/70 font-sans">
                                Join Our Community
                            </h2>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Name Field */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-white/50 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-white/50" />
                                    </div>
                                    <input
                                        id="name"
                                        type="text"
                                        className={`${inputBaseClasses} ${errors.name ? inputErrorClasses : ''}`}
                                        placeholder="John Doe"
                                        {...register('name')}
                                    />
                                    {name && !errors.name && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <CheckCircle className="h-5 w-5 text-green-400" />
                                        </div>
                                    )}
                                </div>
                                {errors.name?.message && (
                                    <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                                )}
                            </div>

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
                                        className={`${inputBaseClasses} ${errors.email ? inputErrorClasses : ''}`}
                                        placeholder="john@example.com"
                                        {...register('email')}
                                    />
                                    {email && !errors.email && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <CheckCircle className="h-5 w-5 text-green-400" />
                                        </div>
                                    )}
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
                                        className={`${inputBaseClasses} ${errors.password ? inputErrorClasses : ''}`}
                                        placeholder="••••••••"
                                        {...register('password')}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                {password && (
                                    <>
                                        <PasswordStrengthIndicator password={password} />
                                        <PasswordRequirements password={password} />
                                    </>
                                )}
                                {errors.password?.message && (
                                    <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/50 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-white/50" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        className={`${inputBaseClasses} ${errors.confirmPassword ? inputErrorClasses : ''}`}
                                        placeholder="••••••••"
                                        {...register('confirmPassword')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-white/50 hover:text-white/80" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-white/50 hover:text-white/80" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword?.message && (
                                    <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            {/* Terms and Conditions */}
                            <div className="flex items-start space-x-3">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    className="mt-1 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900"
                                    {...register('terms')}
                                />
                                <label htmlFor="terms" className="text-sm text-white/70">
                                    I agree to the{' '}
                                    <a href="#" className="text-purple-300 hover:text-purple-200 underline transition-colors">
                                        Terms and Conditions
                                    </a>{' '}
                                    and{' '}
                                    <a href="#" className="text-purple-300 hover:text-purple-200 underline transition-colors">
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>
                            {errors.terms?.message && (
                                <p className="text-sm text-red-400">{errors.terms.message}</p>
                            )}

                            {/* Submit Button - matching login style */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isDisabled}
                                    className={`w-full py-3 font-medium rounded-lg transition-all border-1 hover:bg-black text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 
                                        ${isDisabled ? "opacity-80 cursor-not-allowed" : "hover:text-black hover:border hover:bg-white hover:border-white hover:shadow-[0_0_12px_rgba(255,255,255,0.85)]"}`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating your Account...
                                            </>
                                        ) : (
                                            <>
                                                Create Account
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </form>

                        {/* Social Login Buttons - matching login style */}
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
                                    onClick={() => handleFeatureInProgress('Google')}
                                    type="button"
                                    className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors border border-white/10"
                                >
                                    <FaGoogle className="w-4 h-4" />
                                    <span>Google</span>
                                </button>

                                <button
                                    onClick={() => handleFeatureInProgress('GitHub')}
                                    type="button"
                                    className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors border border-white/10"
                                >
                                    <FaGithub className="h-4 w-4" />
                                    <span>GitHub</span>
                                </button>
                            </div>
                        </div>

                        {/* Login Link - matching login style */}
                        <div className="text-center text-sm text-white/50 mt-4">
                            Already have an account?{' '}
                            <NavLink
                                to="/"
                                className="font-medium text-white hover:text-purple-200 transition-colors"
                            >
                                Sign in
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

export default Register;