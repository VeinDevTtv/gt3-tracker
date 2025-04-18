import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet';
import ComingSoon from '../components/ComingSoon';

export default function ComingSoonPage({
  theme,
  title = "Feature Coming Soon",
  description = "This section is currently under development"
}) {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>{title} | GT3 Savings Tracker</title>
      </Helmet>

      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'} p-6 transition-colors duration-200`}>
        <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/')} 
              className="rounded-full"
            >
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-porsche-black'}`}>
                {title}
              </h1>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {description}
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto">
          <ComingSoon 
            title={title}
            description={description}
            theme={theme}
          />
        </main>
      </div>
    </>
  );
} 