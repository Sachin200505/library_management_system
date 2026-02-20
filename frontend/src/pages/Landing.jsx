import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import {
    Library, ArrowRight, BookOpen, Users, Shield,
    Book, Search, Sparkles, Globe,
    Zap, Star, Landmark, Quote, ChevronRight,
    Circle, Layers, Lightbulb, Target,
    Moon, Compass, Sun, Cpu, Heart
} from 'lucide-react';

const Landing = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        first_name: '',
        last_name: '',
        roll_number: ''
    });
    const [error, setError] = useState('');

    const themes = [
        {
            gradient: "from-blue-600 via-indigo-700 to-slate-900",
            fact: "The Library of Congress is the largest library in the world, holding over 170 million items.",
            thought: "Imagine having every book in the world at your fingertips. Knowledge is no longer a destination, it's a journey.",
            title: "Global Intelligence",
            icon: Globe,
            label: "WORLD SCALE"
        },
        {
            gradient: "from-emerald-600 via-teal-700 to-slate-900",
            fact: "Reading for just 6 minutes a day can reduce stress levels by 68%.",
            thought: "In a world of noise, books are the ultimate silencers. Your peace of mind starts here.",
            title: "Mindful Discovery",
            icon: Sparkles,
            label: "MENTAL FLOW"
        },
        {
            gradient: "from-amber-600 via-orange-700 to-slate-900",
            fact: "There are more public libraries in the US than McDonald's restaurants.",
            thought: "Knowledge is the only resource that grows when shared. Be part of the growth.",
            title: "Shared Wisdom",
            icon: Landmark,
            label: "LEGACY"
        },
        {
            gradient: "from-rose-600 via-purple-700 to-slate-900",
            fact: "Bibliosmia is the word for the distinct smell of old books.",
            thought: "Digital speed meets classical soul. We preserve the essence of learning in every byte.",
            title: "Timeless Learning",
            icon: BookOpen,
            label: "AUTHENTIC"
        },
        {
            gradient: "from-indigo-600 via-blue-800 to-slate-900",
            fact: "The oldest continuously operating library opened in 859 AD.",
            thought: "Stability in code, agility in mind. Built for the relentless pursuit of excellence.",
            title: "Infinite Progress",
            icon: Zap,
            label: "VELOCITY"
        },
        {
            gradient: "from-purple-600 via-fuchsia-700 to-slate-900",
            fact: "Deep work is a superpower in our increasingly competitive economy. Libraries provide the cockpit.",
            thought: "Focus is the new currency. We provide the distraction-free vault for your deepest research.",
            title: "Neural Focus",
            icon: Target,
            label: "DEEP WORK"
        },
        {
            gradient: "from-cyan-600 via-sky-700 to-slate-900",
            fact: "Curiosity didn't kill the cat; it created the scientist. Every search is a step toward truth.",
            thought: "The more you know, the more you realize how much there is to discover. Stay hungry for data.",
            title: "Infinite Loop",
            icon: Lightbulb,
            label: "CURIOSITY"
        },
        {
            gradient: "from-slate-600 via-gray-700 to-slate-900",
            fact: "Information is the new sunlight. It powers the growth of civilizations and individuals alike.",
            thought: "Data is the new oil, but information is the refined fuel that drives the engine of society.",
            title: "Digital Archive",
            icon: Layers,
            label: "STRUCTURAL"
        },
        {
            gradient: "from-pink-600 via-rose-700 to-slate-900",
            fact: "Libraries are the only places left where you can stay all day for free. True democracy.",
            thought: "Community is the soul of information. Connect with fellow readers and bridge the gap.",
            title: "Social Synergy",
            icon: Users,
            label: "COMMUNITY"
        },
        {
            gradient: "from-lime-600 via-green-700 to-slate-900",
            fact: "The best way to predict the future is to create it, one book and one line of code at a time.",
            thought: "Your future isn't written yet. We just provide the pen, the paper, and the digital ink.",
            title: "Future Architect",
            icon: Shield,
            label: "PROTOCOLS"
        },
        {
            gradient: "from-violet-600 via-indigo-900 to-black",
            fact: "A room without books is like a body without a soul. A system without data is just an empty shell.",
            thought: "Experience the synergy of ancient wisdom and futuristic infrastructure in one place.",
            title: "Zen Workspace",
            icon: Star,
            label: "MINIMALIST"
        },
        {
            gradient: "from-emerald-400 via-teal-600 to-slate-900",
            fact: "Some of the world's most famous libraries, like NYU’s Bobst, are open 24/7.",
            thought: "While the world sleeps, the library remains a beacon for the midnight innovators.",
            title: "Night Scholars",
            icon: Moon,
            label: "NOCTURNAL"
        },
        {
            gradient: "from-orange-400 via-red-600 to-slate-900",
            fact: "The Library of Alexandria was the ancient world's largest repository of knowledge.",
            thought: "Books don't just store information; they ignite the revolutions of the mind.",
            title: "Eternal Flame",
            icon: Sparkles,
            label: "IGNITE"
        },
        {
            gradient: "from-blue-400 via-cyan-600 to-slate-900",
            fact: "Dewey Decimal Classification system is used in 135 countries and in 30 languages.",
            thought: "In an ocean of data, we provide the compass to navigate your academic journey.",
            title: "Knowledge Map",
            icon: Compass,
            label: "NAVIGATE"
        },
        {
            gradient: "from-pink-400 via-purple-600 to-slate-900",
            fact: "The Vatican Apostolic Library holds over 1.1 million books, including the oldest Bible.",
            thought: "Your research is your legacy. We guard it with the highest digital and physical protocols.",
            title: "Data Fortress",
            icon: Shield,
            label: "PROTECTED"
        },
        {
            gradient: "from-yellow-400 via-amber-600 to-slate-900",
            fact: "The oldest printed book, the Diamond Sutra, dates back to 868 AD.",
            thought: "Information should be as accessible as sunlight, powering the growth of every mind.",
            title: "Solar Wisdom",
            icon: Sun,
            label: "ENLIGHTEN"
        },
        {
            gradient: "from-gray-400 via-slate-600 to-slate-900",
            fact: "The Internet Archive stores over 600 billion web pages for future generations.",
            thought: "Connecting ideas across centuries, building a neural network of human achievement.",
            title: "Neural Network",
            icon: Cpu,
            label: "QUANTUM"
        },
        {
            gradient: "from-teal-400 via-green-600 to-slate-900",
            fact: "The Bodleian Library in Oxford has over 13 million printed items on its shelves.",
            thought: "Knowledge is a living organism; it adapts, grows, and evolves with every new reader.",
            title: "Living Archive",
            icon: Layers,
            label: "ORGANIC"
        },
        {
            gradient: "from-indigo-400 via-violet-600 to-slate-900",
            fact: "The first astronomical library was established in ancient Greece to study the stars.",
            thought: "Look beyond the horizon of current theory. The next breakthrough is waiting in the stacks.",
            title: "Galactic Vision",
            icon: Compass,
            label: "FRONTIER"
        },
        {
            gradient: "from-red-400 via-rose-600 to-slate-900",
            fact: "A study found that growing up in a home with books increases adult literacy.",
            thought: "Great libraries aren't just collections of books; they are the heart of civilization.",
            title: "Heart of Learning",
            icon: Heart,
            label: "PASSION"
        }
    ];

    const [currentTheme, setCurrentTheme] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTheme((prev) => (prev + 1) % themes.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [themes.length]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(formData.username, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.username?.[0] || 'Registration failed');
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const active = themes[currentTheme];
    const ThemeIcon = active.icon;

    return (
        <div className="h-screen w-full overflow-hidden relative font-heading selection:bg-white/20 selection:text-white">
            {/* Immersive Theme Background */}
            <div className={`absolute inset-0 transition-all duration-[3000ms] ease-in-out bg-transparent`}>
                {themes.map((t, i) => (
                    <div
                        key={i}
                        className={`absolute inset-0 bg-gradient-to-br ${t.gradient} transition-opacity duration-[2500ms] ${currentTheme === i ? 'opacity-100' : 'opacity-0'}`}
                    >
                        {/* Animated Mesh Gradients */}
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-[120px] animate-pulse-soft"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[150px] animate-pulse-soft delay-1000"></div>
                    </div>
                ))}
            </div>

            {/* Navbar */}
            <nav className="relative z-50 px-12 py-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl hover:bg-white/20 transition-all cursor-pointer group">
                        <Library className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
                    </div>
                    <span className="text-2xl font-black text-white tracking-[0.2em]">LIBSYS</span>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => setIsLoginOpen(true)} className="px-8 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl text-sm font-black hover:bg-white/20 transition-all">
                        LOGIN
                    </button>
                    <button onClick={() => setIsRegisterOpen(true)} className="px-8 py-3 bg-white text-slate-900 rounded-2xl text-sm font-black hover:scale-105 transition-all shadow-2xl shadow-white/10">
                        GET STARTED
                    </button>
                </div>
            </nav>

            {/* Main Interactive Stage */}
            <main className="relative z-10 h-[calc(100vh-160px)] flex flex-col lg:flex-row items-center px-12 lg:px-24">

                {/* Left: Huge Impact Messaging */}
                <div className="flex-1 space-y-12">
                    <div className="overflow-hidden">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 animate-fade-in-up ml-40 mt-6">
                            <span className="px-2 py-0.5 bg-white text-slate-900 text-[10px] font-black rounded-full uppercase tracking-widest">
                                {active.label}
                            </span>
                            <span className="text-[11px] font-black text-white/80 uppercase tracking-[0.3em]">
                                Level Up Your Research
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-7xl lg:text-[140px] font-black leading-[0.8] tracking-tighter text-white animate-fade-in-up delay-100">
                            READ. <br />
                            LEARN. <br />
                            <span className="text-white/30 hover:text-white transition-colors cursor-default">LEAD.</span>
                        </h1>
                        <p className="text-xl lg:text-2xl text-white/60 font-medium max-w-xl animate-fade-in-up delay-200">
                            The world's most advanced library workspace, meticulously crafted for the modern scholar.
                        </p>
                    </div>

                    <div className="flex items-center gap-8 animate-fade-in-up delay-300 relative z-50 mb-12">
                        <button onClick={() => setIsRegisterOpen(true)} className="group px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-base hover:scale-105 transition-all shadow-xl border border-slate-100 flex items-center gap-3 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            Start Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        {/* The Living Book Component - Refined & Realistic */}
                        <div className="book-container w-40 h-32 flex items-center justify-center cursor-pointer group/book -translate-y-8" onClick={() => navigate('/books')}>
                            <div className="absolute inset-0 bg-white/5 blur-[80px] rounded-full scale-125 animate-pulse-soft"></div>

                            <div className={`book-cover w-28 h-32 bg-slate-900 rounded-r-xl border-y border-r border-white/10 shadow-3xl relative flex items-center justify-center ${currentTheme !== themes.length - 1 ? 'book-open' : ''}`}>
                                {/* Book Spine Detail */}
                                <div className="absolute left-0 top-0 w-4 h-full bg-gradient-to-r from-black/60 to-transparent rounded-l-sm border-r border-white/5"></div>

                                {/* Realistic Page Stacking */}
                                <div className="book-stack-pages !top-[3px] !left-[3px] !bottom-[3px]"></div>

                                {/* Front Cover Content */}
                                {currentTheme === themes.length - 1 && (
                                    <div className="flex flex-col items-center gap-4 text-white animate-fade-in-up scale-75">
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                            <Library size={24} className="text-white/60" />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-[9px] font-black tracking-[0.5em] text-white/40 uppercase block mb-2 font-heading">Archived State</span>
                                            <div className="h-[1px] w-12 bg-white/10 mx-auto"></div>
                                        </div>
                                    </div>
                                )}

                                {/* Open Pages Layering */}
                                {currentTheme < themes.length - 1 && (
                                    <div className="book-page-wrap w-full h-full rounded-r-lg border border-slate-200 p-4 flex flex-col justify-between overflow-hidden shadow-inner book-page-content">
                                        {/* Animated Page Flip Layer */}
                                        <div key={currentTheme} className={`absolute inset-0 bg-slate-100 border-l-2 border-slate-300 origin-left ${currentTheme > 0 ? 'page-anim' : ''}`}>
                                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper.png')]"></div>
                                        </div>

                                        <div className="relative z-10 scale-90 origin-top">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="p-1 px-1.5 bg-slate-900 rounded shadow-xl shrink-0">
                                                        <ThemeIcon size={12} className="text-white" />
                                                    </div>
                                                    <span className="text-[8px] font-black text-slate-300 tracking-widest leading-none">{active.label}</span>
                                                </div>
                                                <div className="h-[1px] w-full bg-slate-100/30"></div>
                                                <h4 className="text-[11px] font-black text-slate-800 tracking-tight leading-tight uppercase font-heading line-clamp-2">
                                                    {active.title}
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="relative z-10 space-y-2 scale-75 origin-bottom">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full border border-slate-900 flex items-center justify-center">
                                                    <span className="text-[9px] font-black text-slate-900">{currentTheme + 1}</span>
                                                </div>
                                                <div className="h-[1px] flex-1 bg-slate-200"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Dynamic Thought Engine */}
                <div className="flex-1 w-full max-w-2xl relative">
                    {/* The Centerpiece Glass Card */}
                    <div className="aspect-[4/5] lg:aspect-square bg-white/5 backdrop-blur-[100px] border border-white/10 rounded-[80px] p-12 flex flex-col justify-between shadow-2xl relative group hover:border-white/30 transition-all duration-700 mb-24">
                        {/* Decorative HUD Elements */}
                        <div className="absolute top-12 left-12 flex gap-4">
                            {[1, 2, 3].map(i => <div key={i} className={`h-1 w-12 rounded-full transition-all duration-1000 ${currentTheme >= i - 1 ? 'bg-white' : 'bg-white/20'}`}></div>)}
                        </div>

                        <div className="space-y-12 mt-8">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-white text-slate-900 rounded-3xl shadow-2xl animate-float">
                                    <ThemeIcon size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight">{active.title}</h2>
                                    <p className="text-white/40 text-sm font-black uppercase tracking-widest leading-loose">Automated Ecosystem</p>
                                </div>
                            </div>

                            <p className="text-3xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight transition-all duration-1000">
                                {active.thought}
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-4 p-6 bg-white/10 rounded-[40px] border border-white/10 group-hover:bg-white/20 transition-all">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <Lightbulb className="text-white w-5 h-5" />
                                </div>
                                <p className="text-white font-bold leading-snug">
                                    <span className="text-white/40 block text-[10px] font-black uppercase tracking-widest mb-1">FACT OF THE ARCHIVE</span>
                                    {active.fact}
                                </p>
                            </div>

                            <div className="flex justify-center gap-3">
                                {themes.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-2 rounded-full transition-all duration-700 ${currentTheme === i ? 'w-12 bg-white' : 'w-2 bg-white/20'}`}
                                    ></div>
                                ))}
                            </div>
                        </div>

                        {/* Floating Labels */}
                        <div className="absolute -top-12 -right-12 p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] animate-float delay-500 hidden lg:block">
                            <div className="flex items-center gap-4">
                                <div className="space-y-1">
                                    <div className="h-1 w-12 bg-white/20 rounded-full"></div>
                                    <div className="h-1 w-8 bg-white/40 rounded-full"></div>
                                </div>
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">SYNCED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Locked Visual Footer */}
            <div className="absolute bottom-12 left-12 z-0 opacity-40">
                <div className="flex items-center gap-6 text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">
                    <span>STATUS: 200 OK</span>
                    <div className="h-1 w-1 bg-white/20 rounded-full"></div>
                    <span>MEMBERS: 12.4K</span>
                    <div className="h-1 w-1 bg-white/20 rounded-full"></div>
                    <span>BOOKS: 82K+</span>
                </div>
            </div>

            <div className="absolute bottom-6 right-12 z-0 opacity-40">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] hover:text-white transition-colors cursor-default">
                    READ BOOKS, CHANGE WORLDS
                </p>
            </div>

            {/* Auth Modals - Enhanced Polish */}
            <AuthModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} title="AUTHENTICATE">
                <form onSubmit={handleLogin} className="space-y-6">
                    {error && <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-[12px] font-black animate-shake">{error}</div>}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Identity</label>
                        <input type="text" name="username" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all font-bold" placeholder="username" onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Protocol</label>
                        <input type="password" name="password" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all font-bold" placeholder="••••••••" onChange={handleChange} />
                    </div>
                    <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-2xl shadow-slate-900/40 active:scale-95 transition-all">SIGN IN</button>
                    <p className="text-center text-xs text-slate-400 font-bold">
                        NEW TO THE SYSTEM? <button type="button" onClick={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }} className="text-slate-900 font-black hover:underline underline-offset-4">REGISTER ACCESS</button>
                    </p>
                </form>
            </AuthModal>

            <AuthModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="INITIALIZE ACCESS">
                <form onSubmit={handleRegister} className="grid grid-cols-2 gap-4">
                    <div className="col-span-1 space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                        <input type="text" name="first_name" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-900 outline-none font-bold" onChange={handleChange} />
                    </div>
                    <div className="col-span-1 space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                        <input type="text" name="last_name" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-900 outline-none font-bold" onChange={handleChange} />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Neural ID (Username)</label>
                        <input type="text" name="username" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-900 outline-none font-bold" onChange={handleChange} />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                        <input type="email" name="email" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-900 outline-none font-bold" onChange={handleChange} />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Key (Password)</label>
                        <input type="password" name="password" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-900 outline-none font-bold" onChange={handleChange} />
                    </div>
                    <button type="submit" className="col-span-2 py-5 bg-slate-900 text-white rounded-2xl font-black text-xl transition-all active:scale-95 shadow-2xl mt-2">CONFIRM INITIALIZATION</button>
                    <p className="col-span-2 text-center text-[10px] text-slate-400 font-bold mt-2">
                        ALREADY HAVE ACCESS? <button type="button" onClick={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }} className="text-slate-900 font-black">LOG IN</button>
                    </p>
                </form>
            </AuthModal>
        </div>
    );
};

export default Landing;
