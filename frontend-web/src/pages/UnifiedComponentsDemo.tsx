import React, { useState } from 'react';

// Import the SHARED components from mobile/src/shared!
// This demonstrates the unified web+mobile approach
import { NepalButton, SportCard, TempleGoldButton, PrayerFlagButton } from '../../mobile/src/shared/components/nepal-ui';
import { GameCreationWizard, GameCreationData } from '../../mobile/src/shared/components/GameCreationWizard';
import { NepalColors, NepalGradients } from '../../mobile/src/design-system/nepal-theme';

const UnifiedComponentsDemo: React.FC = () => {
  const [showGameWizard, setShowGameWizard] = useState(false);

  const handleCreateGame = async (gameData: GameCreationData) => {
    console.log('Creating game with data:', gameData);
    // Here you would integrate with your backend API
    // This is the SAME function that mobile will call!
    alert(`Game created: ${gameData.sport} ${gameData.format} at ${gameData.location.venue}`);
    setShowGameWizard(false);
  };

  if (showGameWizard) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* This is the SAME GameCreationWizard used by mobile! */}
        <GameCreationWizard
          onComplete={handleCreateGame}
          onCancel={() => setShowGameWizard(false)}
        />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${NepalColors.primary}, ${NepalColors.secondary})`,
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          color: NepalColors.snow_white, 
          fontSize: '32px', 
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)' 
        }}>
          🇳🇵 Unified Web + Mobile Demo
        </h1>
        <p style={{ 
          color: NepalColors.snow_white, 
          fontSize: '18px',
          opacity: 0.9,
          fontFamily: 'Noto Sans Devanagari'
        }}>
          समान कोडबेस, समान डिजाइन, दुवै प्लेटफर्म
        </p>
        <p style={{ 
          color: NepalColors.himalayan_gold, 
          fontSize: '16px',
          marginTop: '10px'
        }}>
          Same codebase, same design, both platforms
        </p>
      </div>

      {/* Nepal Cultural Buttons Demo */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '30px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ 
          color: NepalColors.snow_white, 
          marginBottom: '20px',
          fontSize: '24px'
        }}>
          Nepal Cultural Buttons
        </h2>
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <NepalButton
            title="Primary Nepal"
            nepaliTitle="मुख्य नेपाल"
            onPress={() => alert('Primary Nepal Button!')}
            variant="primary"
          />
          <NepalButton
            title="Secondary"
            nepaliTitle="द्वितीयक"
            onPress={() => alert('Secondary Button!')}
            variant="secondary"
          />
          <TempleGoldButton
            title="Temple Gold"
            nepaliTitle="मन्दिरको सुन"
            onPress={() => alert('Temple Gold Button!')}
          />
          <PrayerFlagButton
            title="Prayer Flags"
            nepaliTitle="प्रार्थना झण्डा"
            onPress={() => alert('Prayer Flag Button!')}
          />
          <NepalButton
            title="Outline"
            nepaliTitle="रूपरेखा"
            onPress={() => alert('Outline Button!')}
            variant="outline"
          />
        </div>
      </div>

      {/* Sports Cards Demo */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '30px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ 
          color: NepalColors.snow_white, 
          marginBottom: '20px',
          fontSize: '24px'
        }}>
          Cultural Sport Cards (Same as Mobile!)
        </h2>
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          overflowX: 'auto',
          paddingBottom: '10px'
        }}>
          <SportCard
            sport="futsal"
            gameCount={45}
            onPress={() => alert('Futsal selected! फुटसल')}
            showNepaliText={true}
          />
          <SportCard
            sport="cricket"
            gameCount={32}
            onPress={() => alert('Cricket selected! क्रिकेट')}
            showNepaliText={true}
          />
          <SportCard
            sport="basketball"
            gameCount={28}
            onPress={() => alert('Basketball selected! बास्केटबल')}
            showNepaliText={true}
          />
          <SportCard
            sport="volleyball"
            gameCount={19}
            onPress={() => alert('Volleyball selected! भलिबल')}
            showNepaliText={true}
          />
          <SportCard
            sport="tennis"
            gameCount={15}
            onPress={() => alert('Tennis selected! टेनिस')}
            showNepaliText={true}
          />
        </div>
      </div>

      {/* Game Creation Demo */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        borderRadius: '16px',
        padding: '30px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ 
          color: NepalColors.snow_white, 
          marginBottom: '20px',
          fontSize: '24px'
        }}>
          Game Creation Wizard (8-Step Process)
        </h2>
        <p style={{ 
          color: NepalColors.snow_white, 
          marginBottom: '20px',
          opacity: 0.8
        }}>
          This is the SAME 8-step wizard that mobile users will experience!
          Same Nepal cultural design, same flow, same backend integration.
        </p>
        <TempleGoldButton
          title="Start Game Creation"
          nepaliTitle="खेल सिर्जना सुरु गर्नुहोस्"
          onPress={() => setShowGameWizard(true)}
          size="lg"
        />
      </div>

      {/* Architecture Info */}
      <div style={{ 
        backgroundColor: 'rgba(0,0,0,0.2)', 
        borderRadius: '16px',
        padding: '25px',
        marginTop: '30px',
        border: `2px solid ${NepalColors.himalayan_gold}`
      }}>
        <h3 style={{ 
          color: NepalColors.himalayan_gold, 
          marginBottom: '15px',
          fontSize: '20px'
        }}>
          🏗️ Unified Architecture in Action
        </h3>
        <div style={{ 
          color: NepalColors.snow_white,
          lineHeight: '1.6'
        }}>
          <p><strong>✅ Shared Components:</strong> All UI components imported from <code>mobile/src/shared/</code></p>
          <p><strong>✅ Same Design System:</strong> Nepal cultural theme applied consistently</p>
          <p><strong>✅ Same Business Logic:</strong> GameCreationWizard handles the same 8-step process</p>
          <p><strong>✅ Same Backend Integration:</strong> Both platforms will call the same APIs</p>
          <p><strong>✅ Cultural Elements:</strong> Nepali text, prayer flag colors, temple gold throughout</p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedComponentsDemo;
