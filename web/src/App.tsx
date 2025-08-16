import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { MOMGenerator } from './components/MOMGenerator';
import { Login } from './components/Login';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brown-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-brown-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-brown-700 font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brown-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-brown-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-brown-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <h1 className="text-3xl font-bold text-brown-900 tracking-tight">MOM Generator</h1>
            </div>
            {user && (
              <div className="flex items-center space-x-6">
                <span className="text-sm text-brown-600 font-medium">{user.email}</span>
                <button
                  onClick={() => auth.signOut()}
                  className="bg-brown-600 hover:bg-brown-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="py-8">
        {user ? <MOMGenerator auth={auth} /> : <Login auth={auth} />}
      </main>
    </div>
  );
}

export default App;