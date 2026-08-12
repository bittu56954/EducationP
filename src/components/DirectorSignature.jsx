import React from 'react';

export function DirectorSignature({ width = 180, height = 55, style = {}, showTitle = true }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', ...style }}>
      {/* Authentic Handwritten Signature SVG */}
      <svg 
        viewBox="0 0 320 100" 
        width={width} 
        height={height} 
        style={{ overflow: 'visible', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="#1d4ed8" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Letter 'B' */}
          <path d="M 38 28 L 38 78" />
          <path d="M 38 28 C 55 24, 68 36, 58 48 C 48 52, 38 50, 38 50" />
          <path d="M 38 50 C 58 48, 72 62, 58 76 C 48 79, 32 78, 42 78" />
          
          {/* Letter 'i' */}
          <path d="M 72 45 L 72 76 C 72 77, 75 79, 78 77" />
          <circle cx="72" cy="33" r="2.4" fill="#1d4ed8" />
          
          {/* First 't' */}
          <path d="M 90 32 L 90 76 C 90 78, 93 79, 96 76" />
          <path d="M 83 48 L 98 48" />
          
          {/* Second 't' */}
          <path d="M 108 32 L 108 76 C 108 78, 112 79, 115 76" />
          <path d="M 102 48 L 116 48" />
          
          {/* Letter 'u' */}
          <path d="M 124 50 L 124 72 C 124 78, 136 78, 137 72 L 138 50 L 138 76" />
          
          {/* Letter 'k' */}
          <path d="M 162 25 L 162 78" />
          <path d="M 178 52 C 172 52, 163 60, 163 62 C 167 62, 178 78, 180 78" />
          <path d="M 163 56 C 170 50, 178 50, 176 58 C 174 63, 165 63, 163 63" />
          
          {/* Letter 'u' */}
          <path d="M 190 52 L 190 72 C 190 78, 201 78, 202 72 L 202 52 L 202 76" />
          
          {/* Letter 'm' */}
          <path d="M 212 52 L 212 76" />
          <path d="M 212 56 C 215 50, 224 50, 225 57 L 225 76" />
          <path d="M 225 56 C 228 50, 238 50, 239 57 L 239 76" />
          
          {/* Letter 'a' */}
          <path d="M 258 63 C 258 53, 246 53, 246 63 C 246 75, 258 75, 258 64 L 258 76" />
          
          {/* Letter 'r' */}
          <path d="M 268 53 L 268 76" />
          <path d="M 268 57 C 271 51, 279 50, 282 54 C 285 58, 280 64, 275 64 C 282 66, 290 72, 298 70" />
          
          {/* Authentic Ink Flow Underline */}
          <path d="M 38 88 C 110 83, 210 87, 295 82" strokeWidth="2" opacity="0.85" />
        </g>
      </svg>

      {/* Optional Title Line */}
      {showTitle && (
        <div style={{ textAlign: 'center', marginTop: '-4px' }}>
          <div style={{ borderTop: '1.5px solid #64748b', width: '100%', minWidth: '150px', marginBottom: '4px' }} />
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
            Bittu Kumar
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
            Director & Head of Academics
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectorSignature;
