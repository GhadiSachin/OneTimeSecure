import { useState } from 'react';
import { Shield, Lock, Copy, CheckCircle2, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import { generateEncryptionKey, encryptSecret, decryptSecret, exportKeyToUrlFragment, importKeyFromUrlFragment } from '../../../packages/crypto/index';

function App() {
  const path = window.location.pathname;
  const isView = path.startsWith('/s/');

  return (
    <div className="min-h-screen bg-background flex flex-col font-outfit text-textMain selection:bg-primary/30">
      {/* Navbar */}
      <header className="border-b border-white/5 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <Shield className="text-primary" size={24} />
            <span className="font-bold text-xl tracking-tight text-white">OneTime<span className="text-primary">Secure</span></span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-textMuted hover:text-white transition-colors">
              Source
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-8 relative">
        {/* Background Effects */}
        <div className="absolute top-1/4 left-0 w-full h-1/2 bg-primary/5 blur-[120px] pointer-events-none rounded-full transform -skew-y-12" />
        
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center z-10">
          
          {/* Left Column: Copy / Info (Hidden on mobile if viewing secret, shown otherwise) */}
          <div className={`lg:col-span-5 space-y-6 ${isView ? 'hidden lg:block' : 'block'}`}>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Share secrets <br />
              <span className="text-primary">securely.</span>
            </h1>
            <p className="text-textMuted text-lg sm:text-xl leading-relaxed">
              End-to-end encrypted, zero-knowledge secret sharing. Generate a link that automatically self-destructs after a single use.
            </p>
            
            <ul className="space-y-4 pt-4">
              {[
                'Zero-knowledge encryption in the browser',
                'Keys are never sent to our servers',
                'Atomic self-destruction on first view',
                'Open-source and self-hostable'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-textMain/90">
                  <ShieldCheck className="text-primary shrink-0" size={20} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Interactive Card */}
          <div className="lg:col-span-7 w-full">
            <div className="bg-card/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/50">
              {/* Card Header (subtle gradient line) */}
              <div className="h-1 w-full bg-gradient-to-r from-primary via-blue-500 to-primary/20" />
              
              <div className="p-6 sm:p-10">
                {isView ? <ViewSecret token={path.split('/s/')[1]} /> : <CreateSecret />}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-textMuted text-sm">
        <p>Built with Fastify, React, and Tailwind CSS. End-to-end encrypted.</p>
      </footer>
    </div>
  );
}

function CreateSecret() {
  const [secretText, setSecretText] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretText.trim()) return;
    setLoading(true);

    try {
      const key = await generateEncryptionKey();
      const encryptedPayload = await encryptSecret(key, secretText);

      const response = await fetch('http://localhost:3000/api/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encrypted_payload: encryptedPayload, expires_in_minutes: 60 })
      });

      if (!response.ok) throw new Error('Failed to save');
      
      const data = await response.json();
      const keyFragment = await exportKeyToUrlFragment(key);
      setGeneratedUrl(`${window.location.origin}/s/${data.token}#${keyFragment}`);
    } catch (err) {
      alert('Error creating secret.');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (generatedUrl) {
    return (
      <div className="animate-fade-in-up space-y-6">
        <div className="flex items-center gap-3 text-primary mb-2">
          <CheckCircle2 size={28} />
          <h2 className="text-2xl font-bold text-white">Link Generated</h2>
        </div>
        
        <p className="text-textMuted">
          Your secret has been encrypted locally. Share this URL with the recipient. It will work exactly once.
        </p>

        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:bg-primary/30 transition-all duration-300 -z-10" />
          <input 
            type="text" 
            readOnly 
            value={generatedUrl} 
            className="w-full bg-[#071120] border border-primary/30 text-primary p-4 pr-16 rounded-xl font-mono text-sm sm:text-base outline-none cursor-pointer focus:ring-2 ring-primary/50"
            onClick={(e) => (e.target as HTMLInputElement).select()} 
          />
          <button 
            onClick={handleCopy}
            className="absolute right-2 top-2 p-2.5 bg-primary text-gray-900 hover:bg-[#52ffd0] rounded-lg transition-colors font-bold shadow-sm flex items-center justify-center"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
          </button>
        </div>

        <button 
          onClick={() => { setGeneratedUrl(''); setSecretText(''); }} 
          className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 mt-4"
        >
          <RefreshCw size={18} /> Create Another Secret
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">New Secret</h2>
        <p className="text-textMuted text-sm mb-6">Enter the sensitive information you wish to share securely.</p>
        
        <div className="relative">
          <textarea 
            value={secretText}
            onChange={(e) => setSecretText(e.target.value)}
            placeholder="Paste passwords, API keys, or private notes..."
            className="w-full h-40 sm:h-56 bg-[#071120] border border-white/10 focus:border-primary/50 p-4 rounded-xl text-white outline-none resize-none transition-all focus:ring-2 focus:ring-primary/20 font-mono text-sm"
            required
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-primary/70 bg-primary/10 px-2 py-1 rounded">
            <Lock size={12} /> E2E Encrypted
          </div>
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={loading || !secretText.trim()} 
        className="w-full py-4 bg-primary text-[#0a192f] font-bold text-lg rounded-xl hover:bg-[#52ffd0] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(100,255,218,0.2)] hover:shadow-[0_0_30px_rgba(100,255,218,0.4)]"
      >
        {loading ? (
          <RefreshCw className="animate-spin" size={20} />
        ) : (
          <>
            Generate Secure Link <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}

function ViewSecret({ token }: { token: string }) {
  const [secretText, setSecretText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConsume = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/public/secrets/${token}/consume`, { method: 'POST' });
      if (!response.ok) throw new Error('Secret not found, expired, or already consumed.');
      
      const data = await response.json();
      
      const keyFragment = window.location.hash.substring(1);
      if (!keyFragment) throw new Error('Decryption key missing from URL.');

      const key = await importKeyFromUrlFragment(keyFragment);
      const plaintext = await decryptSecret(key, data.encrypted_payload);
      
      setSecretText(plaintext);
    } catch (err: any) {
      setError(err.message || 'The secret has been destroyed or the link is invalid.');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if(secretText) {
      navigator.clipboard.writeText(secretText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (secretText) {
    return (
      <div className="animate-scale-in space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="text-primary" size={24} /> Decrypted
          </h2>
          <button 
            onClick={handleCopy}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 text-white"
          >
            {copied ? <CheckCircle2 size={16} className="text-primary"/> : <Copy size={16} />} 
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        
        <div className="relative">
          <textarea 
            readOnly 
            value={secretText} 
            className="w-full h-48 sm:h-64 bg-[#071120] border border-white/10 rounded-xl p-5 text-white outline-none resize-none font-mono text-sm leading-relaxed" 
          />
        </div>
        
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 items-start">
          <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-200/90 leading-relaxed">
            This secret has been <strong className="text-red-400">permanently destroyed</strong>. 
            If you refresh or close this page, the content will be lost forever.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center animate-scale-in">
        <div className="inline-flex p-4 bg-red-500/10 rounded-full mb-6">
          <AlertTriangle size={48} className="text-red-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Secret Unavailable</h2>
        <p className="text-textMuted text-base sm:text-lg max-w-md mx-auto leading-relaxed">{error}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white font-medium inline-flex items-center gap-2"
        >
          Create a new secret <ExternalLink size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="py-4 text-center sm:text-left animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
        <div className="p-4 bg-primary/10 rounded-2xl shrink-0">
          <Lock size={32} className="text-primary" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Secure Secret</h2>
          <p className="text-textMuted text-base">You received a single-use encrypted message.</p>
        </div>
      </div>
      
      <div className="bg-[#071120] border border-white/5 p-5 rounded-xl mb-8 flex flex-col sm:flex-row gap-4 items-start text-left shadow-inner">
        <AlertTriangle className="text-primary shrink-0 mt-1" size={24} />
        <p className="text-textMuted text-sm leading-relaxed">
          This secret is locked and can be viewed <strong className="text-primary font-semibold">only once</strong>. 
          The decryption key is in your URL and will never be sent to the server. 
          After you click the button below, the secret will be instantly and irreversibly destroyed from the database.
        </p>
      </div>

      <button 
        onClick={handleConsume} 
        disabled={loading}
        className="w-full py-4 bg-primary text-[#0a192f] font-bold text-lg rounded-xl hover:bg-[#52ffd0] hover:shadow-[0_0_20px_rgba(100,255,218,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
      >
        {loading ? (
          <RefreshCw className="animate-spin" size={20} />
        ) : (
          <>
            Decrypt & View Secret <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </div>
  );
}

export default App;