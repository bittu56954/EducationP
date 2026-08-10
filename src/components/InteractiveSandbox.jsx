import React, { useState, useEffect } from 'react';

export const InteractiveSandbox = ({ onOpenDemoModal }) => {
  const [activeTab, setActiveTab] = useState('coding'); // 'coding' | 'math' | 'english'

  // Coding Sandbox State
  const [blocks, setBlocks] = useState([
    { id: 1, text: 'Move Forward 🚀', color: 'sandbox-block-blue', action: 'move' },
    { id: 2, text: 'Turn Right 🔄', color: 'sandbox-block-purple', action: 'turn' },
    { id: 3, text: 'Say "Hello CuriousJr!" 💬', color: 'sandbox-block-green', action: 'say' },
  ]);
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0, angle: 0 });
  const [speechBubble, setSpeechBubble] = useState('Click "Run Code" to test!');
  const [isRunning, setIsRunning] = useState(false);

  // Speed Math State
  const [mathScore, setMathScore] = useState(0);
  const [numA, setNumA] = useState(12);
  const [numB, setNumB] = useState(15);
  const [userAnswer, setUserAnswer] = useState('');
  const [mathFeedback, setMathFeedback] = useState('');

  // English Puzzle State
  const [scrambled, setScrambled] = useState('C U R I O U S');
  const [wordAnswer, setWordAnswer] = useState('');
  const [wordFeedback, setWordFeedback] = useState('');

  // Run Block Code Logic
  const runCode = () => {
    setIsRunning(true);
    setSpeechBubble('Executing code blocks...');
    setRobotPos({ x: 0, y: 0, angle: 0 });

    setTimeout(() => {
      setRobotPos({ x: 40, y: 0, angle: 0 });
      setSpeechBubble('Moving Forward! 🚀');
    }, 400);

    setTimeout(() => {
      setRobotPos({ x: 40, y: 0, angle: 90 });
      setSpeechBubble('Turning Right 90° 🔄');
    }, 1000);

    setTimeout(() => {
      setRobotPos({ x: 40, y: 40, angle: 90 });
      setSpeechBubble('Hello CuriousJr! You are a Coder now! 🎉');
      setIsRunning(false);
    }, 1600);
  };

  const addBlock = (blockType) => {
    const newBlock = {
      id: Date.now(),
      ...blockType,
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  // Math Check
  const checkMath = (e) => {
    e.preventDefault();
    const correct = numA + numB;
    if (parseInt(userAnswer) === correct) {
      setMathScore(mathScore + 10);
      setMathFeedback('Correct! +10 XP 🌟');
      setNumA(Math.floor(Math.random() * 30) + 10);
      setNumB(Math.floor(Math.random() * 30) + 10);
      setUserAnswer('');
    } else {
      setMathFeedback('Try again! 💡');
    }
  };

  // English Check
  const checkWord = (e) => {
    e.preventDefault();
    if (wordAnswer.trim().toUpperCase() === 'CURIOUS') {
      setWordFeedback('Awesome! You solved the Cambridge Word! 🏆');
      setWordAnswer('');
    } else {
      setWordFeedback('Close! Hint: CuriousJr 💡');
    }
  };

  return (
    <section style={{ padding: '5rem 1.5rem', background: 'rgba(15, 23, 42, 0.5)', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="curious-badge-pw" style={{ marginBottom: '0.6rem', display: 'inline-block' }}>
            Interactive Demo Sandbox
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, color: 'var(--text-main)' }}>
            Try CuriousJr Live Learning <span style={{ color: '#ff6d0a' }}>Right Now! 🎮</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '0.4rem auto 0' }}>
            Experience how kids learn Block Coding, Mental Math tricks & Cambridge English through fun, interactive visual challenges!
          </p>

          {/* Sandbox Mode Switcher */}
          <div
            style={{
              display: 'inline-flex',
              gap: '0.5rem',
              background: 'var(--bg-card)',
              padding: '0.4rem',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              marginTop: '1.8rem',
            }}
          >
            <button
              onClick={() => setActiveTab('coding')}
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'coding' ? '#ff6d0a' : 'transparent',
                color: activeTab === 'coding' ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              💻 Block Coding Sandbox
            </button>
            <button
              onClick={() => setActiveTab('math')}
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'math' ? '#ff6d0a' : 'transparent',
                color: activeTab === 'math' ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              ⚡ Mental Math Challenge
            </button>
            <button
              onClick={() => setActiveTab('english')}
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'english' ? '#ff6d0a' : 'transparent',
                color: activeTab === 'english' ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              🗣️ English Vocabulary
            </button>
          </div>
        </div>

        {/* Tab 1: Coding Simulator */}
        {activeTab === 'coding' && (
          <div className="sandbox-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0' }}>
            {/* Left Block Assembly Panel */}
            <div style={{ padding: '1.8rem', background: '#0b1329', borderRight: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>Block Palette</h4>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Click blocks to add</span>
              </div>

              {/* Available Blocks */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                  { text: 'Move Forward 🚀', color: 'sandbox-block-blue', action: 'move' },
                  { text: 'Turn Right 🔄', color: 'sandbox-block-purple', action: 'turn' },
                  { text: 'Change Color 🎨', color: 'sandbox-block-orange', action: 'color' },
                  { text: 'Say "Awesome!" 💬', color: 'sandbox-block-green', action: 'say' },
                ].map((b, i) => (
                  <div key={i} onClick={() => addBlock(b)} className={`sandbox-block ${b.color}`}>
                    + {b.text}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800 }}>Workspace Script</h4>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                  {blocks.length} Blocks
                </span>
              </div>

              {/* Active Script Workspace */}
              <div
                style={{
                  background: '#090d16',
                  borderRadius: '12px',
                  padding: '1rem',
                  minHeight: '160px',
                  border: '1px dashed #334155',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {blocks.map((b) => (
                  <div
                    key={b.id}
                    className={`sandbox-block ${b.color}`}
                    style={{ justifyContent: 'space-between' }}
                  >
                    <span>{b.text}</span>
                    <button
                      onClick={() => removeBlock(b.id)}
                      style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7 }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.8rem' }}>
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="curious-btn-primary"
                  style={{ flex: 1, justifyContent: 'center', opacity: isRunning ? 0.6 : 1 }}
                >
                  {isRunning ? 'Running...' : '▶ Run Code Blocks'}
                </button>
                <button
                  onClick={() => setBlocks([])}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: '#94a3b8',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Right Interactive Canvas Output */}
            <div style={{ padding: '1.8rem', background: '#020617', display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>Stage Canvas Preview</h4>
                <span className="badge badge-live">Live Output</span>
              </div>

              <div
                style={{
                  height: '240px',
                  background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #090d16 100%)',
                  borderRadius: '16px',
                  border: '1px solid #1e293b',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {/* Speech Bubble */}
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    background: '#ff6d0a',
                    color: '#fff',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(255, 109, 10, 0.4)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {speechBubble}
                </div>

                {/* Animated Robot Mascot */}
                <div
                  style={{
                    fontSize: '3.5rem',
                    transform: `translate(${robotPos.x}px, ${robotPos.y}px) rotate(${robotPos.angle}deg)`,
                    transition: 'all 0.5s ease',
                    filter: 'drop-shadow(0 0 15px rgba(255, 109, 10, 0.6))',
                  }}
                >
                  🤖
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Want your kid to build full apps & games?</span>
                <button onClick={() => onOpenDemoModal('Class 5', 'Coding & AI Apps')} className="curious-btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                  Enroll in Live Coding &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Speed Math Challenge */}
        {activeTab === 'math' && (
          <div className="sandbox-container" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fde272' }}>🏆 XP Score: {mathScore}</span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Mental Math Speed Drill</span>
            </div>

            <h3 style={{ fontSize: '2.2rem', color: '#fff', fontWeight: 800, marginBottom: '1rem' }}>
              What is <span style={{ color: '#ff6d0a' }}>{numA}</span> + <span style={{ color: '#38bdf8' }}>{numB}</span>?
            </h3>

            <form onSubmit={checkMath} style={{ display: 'flex', gap: '0.8rem', maxWidth: '400px', margin: '0 auto 1rem' }}>
              <input
                type="number"
                required
                placeholder="Enter answer..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 700 }}
              />
              <button type="submit" className="curious-btn-primary" style={{ padding: '0.7rem 1.4rem' }}>
                Submit
              </button>
            </form>

            {mathFeedback && (
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: mathFeedback.includes('Correct') ? '#10b981' : '#f59e0b' }}>
                {mathFeedback}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: English Vocabulary Puzzle */}
        {activeTab === 'english' && (
          <div className="sandbox-container" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
              Cambridge English Unscramble Challenge
            </span>
            <h3 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, marginBottom: '0.5rem' }}>
              Unscramble the word: <span style={{ color: '#ff6d0a', letterSpacing: '0.2em' }}>{scrambled}</span>
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Hint: Full of eager desire to learn & know!
            </p>

            <form onSubmit={checkWord} style={{ display: 'flex', gap: '0.8rem', maxWidth: '400px', margin: '0 auto 1rem' }}>
              <input
                type="text"
                required
                placeholder="Type word here..."
                value={wordAnswer}
                onChange={(e) => setWordAnswer(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase' }}
              />
              <button type="submit" className="curious-btn-primary" style={{ padding: '0.7rem 1.4rem' }}>
                Check
              </button>
            </form>

            {wordFeedback && (
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
                {wordFeedback}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
