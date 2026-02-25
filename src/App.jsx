import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Wheat, ChefHat, Settings, Plus, Trash2, Edit2, Save, X, Moon, Sun, 
  Calculator, TrendingUp, AlertCircle, Printer, Download, Search, ChevronRight, 
  PieChart, DollarSign, Loader2, LogOut, Mail, Lock, User
} from 'lucide-react';

// IMPORTAÇÕES DO FIREBASE (Configurado internamente para testes)
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { 
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut 
} from 'firebase/auth';

// --- CONFIGURAÇÃO FIREBASE ---
// Substitua pelas chaves do seu projeto ao fazer o deploy
const firebaseConfig = {
  apiKey: "AIzaSyDSaBnGk5bW3WkGLA8T8kThrtEFFhVdjck",
  authDomain: "custocerto-eb1ab.firebaseapp.com",
  projectId: "custocerto-eb1ab",
  storageBucket: "custocerto-eb1ab.firebasestorage.app",
  messagingSenderId: "530648528302",
  appId: "1:530648528302:web:f149157e8bc64cc098c43f"
}; 

let app, db, auth;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.warn("Firebase não inicializado. Chaves ausentes.");
}

// --- UTILITÁRIOS ---
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const formatPercent = (value) => new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2 }).format((value || 0) / 100);
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- COMPONENTES UI REUTILIZÁVEIS ---
const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, type = 'button', disabled = false }) => {
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-emerald-400',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 disabled:opacity-50',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 disabled:opacity-50',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${variants[variant]} ${className}`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Input = ({ label, type = 'text', value, onChange, placeholder, className = '', prefix, suffix, required, icon: Icon, name, defaultValue, min, step }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label} {required && '*'}</label>}
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-3 text-slate-400 text-sm">{prefix}</span>}
      {Icon && <Icon size={18} className="absolute left-3 text-slate-400" />}
      <input
        type={type} name={name} value={value} defaultValue={defaultValue} onChange={onChange} placeholder={placeholder} required={required} min={min} step={step}
        className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all
          ${prefix || Icon ? 'pl-10' : ''} ${suffix ? 'pr-8' : ''}`}
      />
      {suffix && <span className="absolute right-3 text-slate-400 text-sm">{suffix}</span>}
    </div>
  </div>
);

// --- TELA DE LOGIN ---
const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.includes('auth/invalid-credential') ? 'E-mail ou senha incorretos.' : 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError('Erro ao fazer login com o Google.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/30 mb-4">
            <ChefHat size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CustoCerto</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-center">
            {isLogin ? 'Faça login para gerenciar suas receitas' : 'Crie sua conta gratuitamente'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 flex items-center gap-2 border border-red-200 dark:border-red-800">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <Input 
            type="email" placeholder="Seu melhor e-mail" value={email} 
            onChange={(e) => setEmail(e.target.value)} required icon={Mail}
          />
          <Input 
            type="password" placeholder="Sua senha secreta" value={password} 
            onChange={(e) => setPassword(e.target.value)} required icon={Lock}
          />
          <Button type="submit" className="w-full py-3 mt-2" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Entrar na Plataforma' : 'Criar Conta')}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Ou continue com</span></div>
          </div>

          <button 
            onClick={handleGoogleAuth} disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-600 font-semibold hover:underline focus:outline-none">
            {isLogin ? "Cadastre-se" : "Faça Login"}
          </button>
        </p>
      </Card>
    </div>
  );
};


// --- APP PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);

  // Monitorar Estado de Autenticação
  useEffect(() => {
    if (!auth) { setAuthLoading(false); return; }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Buscar dados isolados por usuário
  useEffect(() => {
    if (!user || !db) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Caminho isolado: users/USER_ID/ingredients
        const ingSnapshot = await getDocs(collection(db, "users", user.uid, "ingredients"));
        const ingData = ingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setIngredients(ingData);

        const recSnapshot = await getDocs(collection(db, "users", user.uid, "recipes"));
        const recData = recSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecipes(recData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Se estiver validando login, mostra tela de carregamento
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  // Se não tem usuário logado, mostra tela de Auth
  if (!user) {
    return <AuthScreen />;
  }

  // --- FUNÇÕES CRUD FIREBASE (COM ISOLAMENTO POR USUÁRIO) ---
  const handleSaveIngredient = async (newIng) => {
    try {
      if (db) await setDoc(doc(db, "users", user.uid, "ingredients", newIng.id), newIng);
      setIngredients(prev => {
        const exists = prev.find(i => i.id === newIng.id);
        if (exists) return prev.map(i => i.id === newIng.id ? newIng : i);
        return [...prev, newIng];
      });
    } catch (error) { console.error("Erro ao salvar:", error); }
  };

  const handleDeleteIngredient = async (id) => {
    try {
      if (db) await deleteDoc(doc(db, "users", user.uid, "ingredients", id));
      setIngredients(prev => prev.filter(i => i.id !== id));
    } catch (error) { console.error("Erro ao deletar:", error); }
  };

  const handleSaveRecipe = async (newRecipe) => {
    try {
      if (db) await setDoc(doc(db, "users", user.uid, "recipes", newRecipe.id), newRecipe);
      setRecipes(prev => {
        const exists = prev.find(r => r.id === newRecipe.id);
        if (exists) return prev.map(r => r.id === newRecipe.id ? newRecipe : r);
        return [...prev, newRecipe];
      });
    } catch (error) { console.error("Erro ao salvar:", error); }
  };

  const handleDeleteRecipe = async (id) => {
    try {
      if (db) await deleteDoc(doc(db, "users", user.uid, "recipes", id));
      setRecipes(prev => prev.filter(r => r.id !== id));
    } catch (error) { console.error("Erro ao deletar:", error); }
  };


  // Lógica Global de Cálculos
  const calculateRecipeCosts = (recipe) => {
    let totalIngredientsCost = 0;
    recipe.ingredients.forEach(ri => {
      const ing = ingredients.find(i => i.id === ri.ingredientId);
      if (ing) {
        let multiplier = 1;
        if (ing.unit === 'kg' && ri.unit === 'g') multiplier = 0.001;
        if (ing.unit === 'l' && ri.unit === 'ml') multiplier = 0.001;
        totalIngredientsCost += ri.qty * multiplier * ing.unitCost;
      }
    });

    const baseCost = totalIngredientsCost + Number(recipe.laborCost || 0) + Number(recipe.indirectCosts || 0);
    const costWithLoss = baseCost * (1 + (Number(recipe.lossPct || 0) / 100));
    const totalPackagingCost = Number(recipe.packagingCost || 0) * Number(recipe.yield || 1);
    
    const totalCost = costWithLoss + totalPackagingCost;
    const unitCost = totalCost / (Number(recipe.yield) || 1);
    
    let suggestedPrice = 0;
    const marginDec = Number(recipe.desiredMargin || 0) / 100;
    
    if (marginDec >= 1) suggestedPrice = unitCost * (1 + marginDec);
    else suggestedPrice = unitCost / (1 - marginDec);

    const finalSalePrice = recipe.manualSalePrice > 0 ? Number(recipe.manualSalePrice) : suggestedPrice;
    const cmvPercent = finalSalePrice > 0 ? (unitCost / finalSalePrice) * 100 : 0;
    const unitProfit = finalSalePrice - unitCost;
    const totalProfit = unitProfit * Number(recipe.yield || 1);
    const actualMargin = finalSalePrice > 0 ? (unitProfit / finalSalePrice) * 100 : 0;

    return { totalIngredientsCost, totalCost, unitCost, suggestedPrice, finalSalePrice, cmvPercent, unitProfit, totalProfit, actualMargin };
  };

  return (
    <div className={`flex h-screen w-full font-sans bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200`}>
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col z-10 hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
          <div className="bg-emerald-600 p-2 rounded-lg text-white">
            <ChefHat size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight">CustoCerto</h1>
        </div>
        
        <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Dashboard" />
          <NavItem active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} icon={Calculator} label="Fichas Técnicas" />
          <NavItem active={activeTab === 'ingredients'} onClick={() => setActiveTab('ingredients')} icon={Wheat} label="Insumos" />
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* Menu de Usuário */}
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-4">
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full"><User size={18} /></div>
            <div className="flex-1 overflow-hidden">
               <p className="text-xs text-slate-500 font-medium">Conectado como:</p>
               <p className="text-sm font-semibold truncate" title={user.email}>{user.email}</p>
            </div>
          </div>
          
          <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span className="font-medium">{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
          
          <button onClick={() => signOut(auth)} className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors">
            <LogOut size={18} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
             <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        )}
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* Mobile Header */}
          <div className="flex items-center justify-between md:hidden mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <ChefHat size={20} className="text-emerald-600" />
              <span className="font-bold">CustoCerto</span>
            </div>
            <div className="flex gap-2">
               <button onClick={() => setActiveTab('dashboard')} className={`p-2 rounded-md ${activeTab === 'dashboard' ? 'bg-emerald-100 text-emerald-600' : ''}`}><LayoutDashboard size={20}/></button>
               <button onClick={() => setActiveTab('recipes')} className={`p-2 rounded-md ${activeTab === 'recipes' ? 'bg-emerald-100 text-emerald-600' : ''}`}><Calculator size={20}/></button>
               <button onClick={() => setActiveTab('ingredients')} className={`p-2 rounded-md ${activeTab === 'ingredients' ? 'bg-emerald-100 text-emerald-600' : ''}`}><Wheat size={20}/></button>
               <button onClick={() => signOut(auth)} className="p-2 text-rose-500 rounded-md"><LogOut size={20}/></button>
            </div>
          </div>

          {activeTab === 'dashboard' && <DashboardView recipes={recipes} ingredients={ingredients} calculateRecipeCosts={calculateRecipeCosts} />}
          {activeTab === 'ingredients' && <IngredientsView ingredients={ingredients} onSave={handleSaveIngredient} onDelete={handleDeleteIngredient} />}
          {activeTab === 'recipes' && <RecipesView recipes={recipes} ingredients={ingredients} calculateRecipeCosts={calculateRecipeCosts} onSave={handleSaveRecipe} onDelete={handleDeleteRecipe} />}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTES DE NAVEGAÇÃO ---
const NavItem = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
    <Icon size={20} className={active ? 'text-emerald-600 dark:text-emerald-400' : ''} />
    {label}
  </button>
);


// --- VIEWS DE CONTEÚDO (MANTIDAS DO PROJETO ANTERIOR) ---
const DashboardView = ({ recipes, ingredients, calculateRecipeCosts }) => {
  const stats = useMemo(() => {
    let totalProfit = 0, avgMarginSum = 0, recipesCalculated = 0, highCmvCount = 0;
    recipes.forEach(r => {
      const costs = calculateRecipeCosts(r);
      totalProfit += costs.totalProfit;
      avgMarginSum += costs.actualMargin;
      recipesCalculated++;
      if (costs.cmvPercent > 35) highCmvCount++;
    });
    return {
      totalRecipes: recipes.length, totalIngredients: ingredients.length,
      avgMargin: recipesCalculated ? (avgMarginSum / recipesCalculated) : 0,
      monthlyPotencialProfit: totalProfit * 30, highCmvCount
    };
  }, [recipes, ingredients]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Visão Geral</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Acompanhe a saúde financeira da sua produção.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={TrendingUp} label="Margem Média" value={formatPercent(stats.avgMargin)} color="emerald" subtitle="Sobre o preço de venda" />
        <StatCard icon={PieChart} label="Receitas" value={stats.totalRecipes} color="indigo" />
        <StatCard icon={AlertCircle} label="CMV Alto (>35%)" value={stats.highCmvCount} color={stats.highCmvCount > 0 ? "rose" : "slate"} subtitle="Fichas para revisar" />
        <StatCard icon={Wheat} label="Insumos Ativos" value={stats.totalIngredients} color="amber" />
      </div>

      <div className="mt-8">
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <DollarSign className="text-emerald-500" size={20} />
              Desempenho por Ficha Técnica
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold whitespace-nowrap">Produto</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Custo Unit.</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Preço Venda</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Lucro Unit.</th>
                  <th className="p-4 font-semibold whitespace-nowrap">CMV</th>
                  <th className="p-4 font-semibold whitespace-nowrap min-w-[150px]">Margem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {recipes.length === 0 && (<tr><td colSpan="6" className="p-8 text-center text-slate-500">Nenhuma receita cadastrada ainda.</td></tr>)}
                {recipes.map(recipe => {
                  const costs = calculateRecipeCosts(recipe);
                  const isHighCmv = costs.cmvPercent > 35;
                  return (
                    <tr key={recipe.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-medium whitespace-nowrap">{recipe.name}</td>
                      <td className="p-4 whitespace-nowrap">{formatCurrency(costs.unitCost)}</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">{formatCurrency(costs.finalSalePrice)}</td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{formatCurrency(costs.unitProfit)}</td>
                      <td className={`p-4 font-medium whitespace-nowrap ${isHighCmv ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
                        {formatPercent(costs.cmvPercent)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                            <div className={`h-full ${costs.actualMargin > 30 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(costs.actualMargin, 100)}%` }} />
                          </div>
                          <span className="text-sm font-medium">{formatPercent(costs.actualMargin)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, subtitle, color }) => {
  const colorMap = {
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    rose: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };
  return (
    <Card className="p-6 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${colorMap[color]}`}><Icon size={24} /></div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </Card>
  );
};

const IngredientsView = ({ ingredients, onSave, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const filtered = ingredients.filter(i => (i.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target);
    const price = parseFloat(formData.get('price'));
    const pkgQty = parseFloat(formData.get('pkgQty'));
    
    const newIng = {
      id: editingIngredient ? editingIngredient.id : generateId(),
      name: formData.get('name'), category: formData.get('category'),
      unit: formData.get('unit'), price: price, pkgQty: pkgQty, unitCost: price / pkgQty
    };

    await onSave(newIng);
    setIsSaving(false); setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div><h2 className="text-3xl font-bold">Banco de Insumos</h2></div>
        <Button onClick={() => { setEditingIngredient(null); setIsModalOpen(true); }} icon={Plus}>Novo Insumo</Button>
      </header>

      <Card className="p-4">
        <div className="flex gap-4 mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="Buscar insumo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Nome</th>
                <th className="p-4 font-semibold">Categoria</th>
                <th className="p-4 font-semibold text-right">Preço</th>
                <th className="p-4 font-semibold text-right">Custo Unitário</th>
                <th className="p-4 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filtered.map(ing => (
                <tr key={ing.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-medium">{ing.name}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs">{ing.category}</span></td>
                  <td className="p-4 text-right">{formatCurrency(ing.price)}</td>
                  <td className="p-4 text-right font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(ing.unitCost)} / {ing.unit}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => setEditingIngredient(ing) || setIsModalOpen(true)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={18}/></button>
                      <button onClick={() => { if(window.confirm('Excluir?')) onDelete(ing.id); }} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingIngredient ? 'Editar Insumo' : 'Novo Insumo'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input label="Nome" name="name" defaultValue={editingIngredient?.name} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Preço Embalagem" name="price" type="number" step="0.01" prefix="R$" defaultValue={editingIngredient?.price} required />
                <Input label="Quant. na Embalagem" name="pkgQty" type="number" step="0.001" defaultValue={editingIngredient?.pkgQty} required />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Unidade</label>
                  <select name="unit" defaultValue={editingIngredient?.unit || 'kg'} className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="kg">kg</option><option value="g">g</option><option value="l">L</option><option value="ml">ml</option><option value="un">un</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Categoria</label>
                  <select name="category" defaultValue={editingIngredient?.category || 'Farinhas'} className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="Farinhas">Farinhas</option><option value="Secos">Secos</option><option value="Laticínios">Laticínios</option><option value="Outros">Outros</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" icon={isSaving ? Loader2 : Save} disabled={isSaving}>Salvar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

const RecipesView = ({ recipes, ingredients, calculateRecipeCosts, onSave, onDelete }) => {
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (editingRecipe) {
    return <RecipeForm 
              recipe={editingRecipe} ingredients={ingredients} calculateCosts={calculateRecipeCosts}
              onSave={async (savedRecipe) => { await onSave(savedRecipe); setEditingRecipe(null); }}
              onCancel={() => setEditingRecipe(null)}
            />;
  }

  const filteredRecipes = recipes.filter(r => (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div><h2 className="text-3xl font-bold">Fichas Técnicas</h2></div>
        <Button onClick={() => setEditingRecipe({ id: generateId(), name: '', yield: 1, ingredients: [], desiredMargin: 40 })} icon={Plus}>Nova Ficha</Button>
      </header>

      <Card className="p-4 mb-6">
        <div className="flex gap-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar ficha técnica..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <Calculator size={48} className="mb-4 opacity-20 text-slate-400" />
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
              {recipes.length === 0 ? 'Nenhuma ficha técnica cadastrada.' : 'Nenhuma ficha encontrada na busca.'}
            </p>
            <p className="text-sm mt-1 text-slate-500">
              {recipes.length === 0 ? 'Clique em "Nova Ficha" no topo da tela para começar.' : 'Tente usar palavras-chave diferentes.'}
            </p>
          </div>
        ) : (
          filteredRecipes.map(recipe => {
            const costs = calculateRecipeCosts(recipe);
            return (
              <Card key={recipe.id} className="hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-lg leading-tight">{recipe.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">Rende: {recipe.yield} und</p>
                </div>
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex justify-between items-center text-sm"><span className="text-slate-500">Custo Unit.</span><span className="font-medium">{formatCurrency(costs.unitCost)}</span></div>
                  <div className="flex justify-between items-center text-sm"><span className="text-slate-500">Preço Sugerido</span><span className="font-bold text-emerald-600">{formatCurrency(costs.finalSalePrice)}</span></div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-between">
                  <Button variant="ghost" onClick={() => { if(window.confirm('Excluir?')) onDelete(recipe.id); }} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2"><Trash2 size={18} /></Button>
                  <Button variant="secondary" onClick={() => setEditingRecipe(recipe)} icon={Edit2}>Editar</Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

const RecipeForm = ({ recipe, ingredients, onSave, onCancel, calculateCosts }) => {
  const [formData, setFormData] = useState({ ...recipe, manualSalePrice: recipe.manualSalePrice || 0 });
  const [liveCosts, setLiveCosts] = useState(() => calculateCosts(recipe));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { setLiveCosts(calculateCosts(formData)); }, [formData]); 

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const addIngredientLine = () => setFormData(prev => ({ ...prev, ingredients: [...(prev.ingredients || []), { id: generateId(), ingredientId: '', qty: 0, unit: 'g' }] }));
  const updateIngredientLine = (id, field, value) => setFormData(prev => ({ ...prev, ingredients: prev.ingredients.map(ing => ing.id === id ? { ...ing, [field]: value } : ing) }));
  const removeIngredientLine = (id) => setFormData(prev => ({ ...prev, ingredients: prev.ingredients.filter(ing => ing.id !== id) }));

  return (
    <form onSubmit={async (e) => { e.preventDefault(); setIsSaving(true); await onSave(formData); setIsSaving(false); }} className="h-full flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-6 overflow-y-auto">
        <div className="flex items-center gap-4 mb-2">
          <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full"><ChevronRight size={24} className="rotate-180" /></button>
          <h2 className="text-2xl font-bold">{recipe.name ? 'Editar Receita' : 'Nova Ficha'}</h2>
        </div>

        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-lg border-b border-slate-100 pb-2">Informações</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome" value={formData.name} onChange={(e) => updateField('name', e.target.value)} required />
            <Input label="Rendimento (und)" type="number" min="1" value={formData.yield} onChange={(e) => updateField('yield', e.target.value)} required />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
            <h3 className="font-bold text-lg">Ingredientes</h3>
            <Button variant="secondary" onClick={addIngredientLine} icon={Plus} className="text-sm py-1">Adicionar Insumo</Button>
          </div>
          <div className="space-y-3">
            {formData.ingredients?.map((ingLine) => (
              <div key={ingLine.id} className="flex flex-col sm:flex-row gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border">
                <select required value={ingLine.ingredientId} onChange={(e) => updateIngredientLine(ingLine.id, 'ingredientId', e.target.value)} className="flex-1 bg-white dark:bg-slate-900 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Selecione...</option>
                  {ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                <Input type="number" step="0.001" value={ingLine.qty} onChange={(e) => updateIngredientLine(ingLine.id, 'qty', e.target.value)} className="w-24" />
                <select value={ingLine.unit} onChange={(e) => updateIngredientLine(ingLine.id, 'unit', e.target.value)} className="w-24 bg-white dark:bg-slate-900 border rounded-lg px-3 py-2 text-sm outline-none">
                  <option value="kg">kg</option><option value="g">g</option><option value="l">L</option><option value="ml">ml</option><option value="un">un</option>
                </select>
                <button type="button" onClick={() => removeIngredientLine(ingLine.id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="w-full lg:w-96 flex flex-col gap-4">
        <Card className="p-6 bg-slate-900 text-white shadow-xl sticky top-8 border-none">
          <h3 className="font-bold text-lg text-slate-200 mb-6 flex items-center gap-2"><Calculator size={20} className="text-emerald-400" /> Análise Financeira</h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-700 pb-3"><span className="text-sm text-slate-400">Custo Total</span><span className="text-xl font-medium">{formatCurrency(liveCosts.totalCost)}</span></div>
            <div className="flex justify-between border-b border-slate-700 pb-3"><span className="text-sm text-slate-400">Custo Unitário</span><span className="text-xl font-bold text-amber-400">{formatCurrency(liveCosts.unitCost)}</span></div>
            <div className="bg-slate-800 rounded-lg p-4">
              <span className="text-xs text-slate-400 uppercase">Preço Sugerido</span>
              <div className="text-3xl font-black text-emerald-400 break-all">{formatCurrency(liveCosts.finalSalePrice)}</div>
            </div>
            <Input label="Margem Desejada (%)" type="number" step="0.1" value={formData.desiredMargin} onChange={(e) => updateField('desiredMargin', e.target.value)} className="mt-4" />
          </div>
        </Card>
        <div className="flex gap-3">
          <Button variant="ghost" type="button" className="flex-1 bg-white dark:bg-slate-800 border" onClick={onCancel} disabled={isSaving}>Cancelar</Button>
          <Button type="submit" className="flex-1" icon={isSaving ? Loader2 : Save} disabled={isSaving}>Salvar Ficha</Button>
        </div>
      </div>
    </form>
  );
};