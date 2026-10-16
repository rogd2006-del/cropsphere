import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('learn');
  const [streak, setStreak] = useState(5);
  const [gems, setGems] = useState(480);
  const [hearts, setHearts] = useState(5);
  const [activeLesson, setActiveLesson] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect' | null
  const [progressIndex, setProgressIndex] = useState(0);

  // Gamified lessons for CropSphere / Smart Agriculture & Cloud
  const lessons = {
    unit1: [
      {
        id: 1,
        title: 'Crop Rotation 101',
        icon: '🌱',
        state: 'completed', // completed, active, locked
        xp: 15,
        questions: [
          {
            prompt: 'Which crop family adds nitrogen back into the soil?',
            options: ['Legumes (Beans & Peas)', 'Cereals (Corn & Wheat)', 'Nightshades (Tomatoes)', 'Brassicas (Cabbage)'],
            correct: 0,
            tip: 'Legumes form symbiotic relationships with rhizobia bacteria to fix atmospheric nitrogen!'
          },
          {
            prompt: 'What is the primary benefit of rotating crops each season?',
            options: ['Prevents soil nutrient depletion', 'Makes watering unnecessary', 'Guarantees no insects will exist', 'Speeds up sun exposure'],
            correct: 0,
            tip: 'Different crops absorb different nutrients, preventing soil exhaustion.'
          }
        ]
      },
      {
        id: 2,
        title: 'Smart Soil Sensors',
        icon: '📡',
        state: 'active',
        xp: 20,
        questions: [
          {
            prompt: 'Which metric is most crucial for automated IoT drip irrigation?',
            options: ['Volumetric Soil Moisture Content', 'Leaf Color Pigmentation', 'Wind Direction', 'Seed Shell Thickness'],
            correct: 0,
            tip: 'Soil moisture sensors report exact volumetric water percentage to prevent overwatering.'
          },
          {
            prompt: 'What wireless protocol is best for long-range, low-power farm sensors?',
            options: ['LoRaWAN', 'High-speed Bluetooth 5.0', '5G Ultra-Wideband only', 'HDMI over Air'],
            correct: 0,
            tip: 'LoRaWAN can transmit sensor telemetry across kilometers with multi-year battery life.'
          }
        ]
      },
      {
        id: 3,
        title: 'Cloud Marketplace Pricing',
        icon: '💰',
        state: 'locked',
        xp: 25,
        questions: [
          {
            prompt: 'How does FarmDirect Cloud help local farmers avoid middlemen fees?',
            options: ['By providing direct farm-to-consumer escrow orders', 'By fixing prices nationally', 'By eliminating delivery shipping', 'By banning retail buyers'],
            correct: 0,
            tip: 'Direct cloud contracts connect buyers to harvest batches transparently.'
          }
        ]
      },
      {
        id: 4,
        title: 'Weather & Drone AI',
        icon: '🛸',
        state: 'locked',
        xp: 30,
        questions: []
      },
      {
        id: 5,
        title: 'Unit 1 Mastery Trophy',
        icon: '🏆',
        state: 'locked',
        xp: 50,
        questions: []
      }
    ]
  };

  const startLesson = (lesson) => {
    if (lesson.state === 'locked') return;
    setActiveLesson(lesson);
    setProgressIndex(0);
    setSelectedOption(null);
    setFeedback(null);
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    const currentQ = activeLesson.questions[progressIndex];
    if (selectedOption === currentQ.correct) {
      setFeedback('correct');
      setGems(g => g + 5);
    } else {
      setFeedback('incorrect');
      setHearts(h => Math.max(0, h - 1));
    }
  };

  const handleNext = () => {
    if (feedback === 'correct') {
      if (progressIndex + 1 < activeLesson.questions.length) {
        setProgressIndex(p => p + 1);
        setSelectedOption(null);
        setFeedback(null);
      } else {
        // Complete lesson
        setActiveLesson(null);
        setStreak(s => s + 1);
        alert('🎉 Lesson completed! +20 XP and Streak updated!');
      }
    } else {
      setSelectedOption(null);
      setFeedback(null);
    }
  };

  return (
    <div className="app-container">
      {/* Duolingo Left Navigation Bar */}
      <aside className="sidebar">
        <div className="logo-area" onClick={() => setActiveTab('learn')}>
          <span style={{ fontSize: '32px' }}>🦉</span>
          <span className="logo-title">croplingo</span>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-item ${activeTab === 'learn' ? 'active' : ''}`}
            onClick={() => setActiveTab('learn')}
          >
            <span className="nav-icon">🏡</span>
            <span>LEARN</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <span className="nav-icon">🏆</span>
            <span>LEADERBOARDS</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'quests' ? 'active' : ''}`}
            onClick={() => setActiveTab('quests')}
          >
            <span className="nav-icon">🎯</span>
            <span>QUESTS</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => setActiveTab('shop')}
          >
            <span className="nav-icon">🛒</span>
            <span>MARKET</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-icon">👤</span>
            <span>PROFILE</span>
          </button>
        </nav>
      </aside>

      {/* Main Learning Map Area */}
      <main className="main-viewport">
        <div className="content-center">
          {/* Top stats bar for mobile & desktop */}
          <div className="stats-bar" style={{ width: '100%', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div className="stat-chip streak" title="Daily Farming Streak">
              <span>🔥</span>
              <span>{streak} DAYS</span>
            </div>
            <div className="stat-chip gems" title="AgriGems">
              <span>💎</span>
              <span>{gems}</span>
            </div>
            <div className="stat-chip hearts" title="Remaining Energy">
              <span>❤️</span>
              <span>{hearts}</span>
            </div>
          </div>

          {activeTab === 'learn' && (
            <>
              {/* Unit 1 Header Banner */}
              <div className="unit-banner">
                <div>
                  <h2>Section 1: Smart Agriculture Basics</h2>
                  <p>Learn crop cycles, smart irrigation, and cloud telemetry</p>
                </div>
                <button className="duo-btn duo-btn-white" style={{ padding: '10px 16px', fontSize: '14px' }}>
                  📖 GUIDEBOOK
                </button>
              </div>

              {/* Stepping Stones / Duolingo Path */}
              <div className="path-container">
                {lessons.unit1.map((item, idx) => {
                  // Duolingo characteristic winding path offsets
                  const offsets = [0, 48, -48, 24, 0];
                  const xOffset = offsets[idx % offsets.length];

                  let btnClass = 'node-locked';
                  if (item.state === 'completed') btnClass = 'node-gold';
                  else if (item.state === 'active') btnClass = 'node-green';

                  return (
                    <div 
                      key={item.id} 
                      className="node-row" 
                      style={{ transform: `translateX(${xOffset}px)` }}
                    >
                      <button 
                        className={`node-btn ${btnClass}`}
                        onClick={() => startLesson(item)}
                      >
                        {item.state === 'active' && (
                          <div className="node-tooltip">
                            START +{item.xp} XP
                          </div>
                        )}
                        <span>{item.icon}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Unit 2 Preview Banner */}
              <div className="unit-banner unit-banner-purple" style={{ marginTop: '24px' }}>
                <div>
                  <h2>Section 2: Precision Drones & AI Harvest</h2>
                  <p>Master NDVI imaging, yield prediction & direct market escrow</p>
                </div>
                <button className="duo-btn duo-btn-white" style={{ padding: '10px 16px', fontSize: '14px', opacity: 0.8 }}>
                  🔒 LOCKED
                </button>
              </div>
            </>
          )}

          {activeTab === 'leaderboard' && (
            <div style={{ width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '64px' }}>🛡️</span>
                <h2 style={{ fontSize: '28px', fontWeight: 900 }}>Emerald League</h2>
                <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Top 10 advance to the Diamond League!</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { rank: 1, name: 'Farmer_Joe99', xp: '1,420 XP', avatar: '👨‍🌾', badge: '🥇' },
                  { rank: 2, name: 'You (Roger)', xp: '1,280 XP', avatar: '🦉', badge: '🥈', current: true },
                  { rank: 3, name: 'AgriTech_Elena', xp: '1,150 XP', avatar: '👩‍🔬', badge: '🥉' },
                  { rank: 4, name: 'GreenValley_Rob', xp: '940 XP', avatar: '🚜' },
                  { rank: 5, name: 'OrganicMaya', xp: '820 XP', avatar: '🌻' }
                ].map(user => (
                  <div 
                    key={user.rank}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 20px',
                      borderRadius: '16px',
                      border: user.current ? '2px solid var(--color-primary)' : '2px solid var(--border-light)',
                      backgroundColor: user.current ? '#f0fdf4' : '#ffffff',
                      fontWeight: 800
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ width: '24px', color: 'var(--text-muted)' }}>{user.badge || `#${user.rank}`}</span>
                      <span style={{ fontSize: '24px' }}>{user.avatar}</span>
                      <span style={{ fontSize: '16px', color: user.current ? 'var(--color-primary-dark)' : 'inherit' }}>{user.name}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>{user.xp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'quests' && (
            <div style={{ width: '100%' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '20px' }}>Daily Quests 🎯</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { title: 'Earn 50 XP in Soil Management', progress: 35, max: 50, reward: '💎 20' },
                  { title: 'Complete 2 lessons with >90% accuracy', progress: 1, max: 2, reward: '⚡ 15m Boost' },
                  { title: 'Spend 15 minutes learning telemetry', progress: 12, max: 15, reward: '❤️ Full Health' }
                ].map((quest, i) => (
                  <div key={i} className="widget-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 800 }}>{quest.title}</span>
                      <span style={{ fontWeight: 800, color: 'var(--color-gold-dark)' }}>{quest.reward}</span>
                    </div>
                    <div className="progress-track" style={{ height: '14px' }}>
                      <div className="progress-fill" style={{ width: `${(quest.progress / quest.max) * 100}%` }}></div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '6px' }}>
                      {quest.progress} / {quest.max} completed
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shop' && (
            <div style={{ width: '100%' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '20px' }}>AgriPower Shop 🛒</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                {[
                  { title: 'Refill Energy (5 Hearts)', cost: '💎 350', desc: 'Instantly restore your hearts so you can keep harvesting lessons.', icon: '❤️' },
                  { title: 'Streak Freeze', cost: '💎 200', desc: 'Protect your farming streak if you miss a day in the fields.', icon: '🧊' },
                  { title: 'Super Duo Agro Drone', cost: '💎 1200', desc: 'Unlock autonomous telemetry analysis & double XP on all units.', icon: '🛸' }
                ].map((item, i) => (
                  <div key={i} className="widget-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{ fontSize: '40px' }}>{item.icon}</span>
                      <div>
                        <h4 style={{ fontSize: '18px', fontWeight: 800 }}>{item.title}</h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{item.desc}</p>
                      </div>
                    </div>
                    <button className="duo-btn duo-btn-blue" style={{ padding: '10px 18px', whiteSpace: 'nowrap' }}>
                      {item.cost}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ddf4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', border: '3px solid var(--color-blue)' }}>
                  👨‍🌾
                </div>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 900 }}>Roger's Smart Farm</h2>
                  <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Joined October 2026 • Emerald League</p>
                </div>
              </div>
              <div className="widget-card">
                <h3>Statistics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 900 }}>🔥 {streak}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700 }}>Day streak</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 900 }}>⚡ 1,280</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700 }}>Total XP</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 900 }}>💎 {gems}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700 }}>Gems collected</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 900 }}>🏆 #2</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700 }}>League standing</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Widgets */}
        <aside className="content-right">
          <div className="widget-card" style={{ background: '#f7f7f7', borderColor: '#e5e5e5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>Unlock Super CropLingo</h3>
              <span style={{ fontSize: '24px' }}>✨</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
              Unlimited hearts, personalized mistakes review, and ad-free cloud telemetry!
            </p>
            <button className="duo-btn duo-btn-green" style={{ width: '100%', padding: '14px 0' }}>
              TRY 2 WEEKS FREE
            </button>
          </div>

          <div className="widget-card">
            <h3>Active Farm Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}>
                <span>🌱 Soil Moisture:</span>
                <span style={{ color: 'var(--color-primary-dark)' }}>68% Optimal</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}>
                <span>☁️ MongoDB Cloud sync:</span>
                <span style={{ color: 'var(--color-blue)' }}>Live Connected</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}>
                <span>🌤️ Microclimate:</span>
                <span>24°C Sunny</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Interactive Duolingo Interactive Quiz Modal */}
      {activeLesson && (
        <div className="lesson-overlay">
          <header className="lesson-header">
            <button 
              className="duo-btn duo-btn-white" 
              style={{ padding: '8px 12px', fontSize: '18px', border: 'none', boxShadow: 'none' }}
              onClick={() => setActiveLesson(null)}
            >
              ✕
            </button>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${((progressIndex + (feedback === 'correct' ? 1 : 0)) / activeLesson.questions.length) * 100}%` 
                }} 
              />
            </div>
            <div className="stat-chip hearts" style={{ padding: 0 }}>
              <span>❤️</span>
              <span>{hearts}</span>
            </div>
          </header>

          <div className="lesson-content">
            <h2 className="question-title">
              {activeLesson.questions[progressIndex]?.prompt}
            </h2>

            <div className="mascot-bubble">
              <span style={{ fontSize: '64px', animation: 'bounce 2s infinite' }}>🦉</span>
              <div className="speech-bubble">
                Select the correct answer to grow your harvest!
              </div>
            </div>

            <div className="options-grid">
              {activeLesson.questions[progressIndex]?.options.map((opt, i) => (
                <div 
                  key={i}
                  className={`option-card ${selectedOption === i ? 'selected' : ''}`}
                  onClick={() => {
                    if (feedback === null) setSelectedOption(i);
                  }}
                >
                  <span>{opt}</span>
                  <span style={{ 
                    width: '28px', 
                    height: '28px', 
                    border: '2px solid var(--border-light)', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '13px',
                    color: 'var(--text-muted)'
                  }}>
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <footer className={`lesson-footer ${
            feedback === 'correct' ? 'footer-correct' : feedback === 'incorrect' ? 'footer-incorrect' : ''
          }`}>
            {feedback === null ? (
              <>
                <button 
                  className="duo-btn duo-btn-white"
                  style={{ padding: '14px 28px' }}
                  onClick={() => setSelectedOption(0)}
                >
                  SKIP
                </button>
                <button 
                  className={`duo-btn ${selectedOption !== null ? 'duo-btn-green' : 'duo-btn-white'}`}
                  style={{ 
                    padding: '14px 36px',
                    opacity: selectedOption !== null ? 1 : 0.5,
                    cursor: selectedOption !== null ? 'pointer' : 'not-allowed'
                  }}
                  disabled={selectedOption === null}
                  onClick={handleCheck}
                >
                  CHECK
                </button>
              </>
            ) : (
              <>
                <div className={`feedback-msg ${feedback === 'correct' ? 'feedback-correct' : 'feedback-incorrect'}`}>
                  <span style={{ fontSize: '36px' }}>{feedback === 'correct' ? '🎉' : '❌'}</span>
                  <div>
                    <h3>{feedback === 'correct' ? 'Nicely done!' : 'Correct solution:'}</h3>
                    <p style={{ fontWeight: 700, fontSize: '15px' }}>
                      {feedback === 'correct' 
                        ? activeLesson.questions[progressIndex].tip 
                        : activeLesson.questions[progressIndex].options[activeLesson.questions[progressIndex].correct]}
                    </p>
                  </div>
                </div>
                <button 
                  className={`duo-btn ${feedback === 'correct' ? 'duo-btn-green' : 'duo-btn-red'}`}
                  style={{ padding: '14px 40px' }}
                  onClick={handleNext}
                >
                  CONTINUE
                </button>
              </>
            )}
          </footer>
        </div>
      )}
    </div>
  );
}
