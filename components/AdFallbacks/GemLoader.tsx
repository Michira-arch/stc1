import React from 'react';

const css = `
  @keyframes gem-bounce {
    0%, 100% { translate: 0px 36px; }
    50%       { translate: 0px 46px; }
  }
  @keyframes gem-bounce2 {
    0%, 100% { translate: 0px 46px; }
    50%       { translate: 0px 56px; }
  }
  @keyframes gem-umbral {
    0%   { stop-color: #d3a5102e; }
    50%  { stop-color: rgba(211,165,16,0.52); }
    100% { stop-color: #d3a5102e; }
  }
  @keyframes gem-particles {
    0%, 100% { translate: 0px 16px; }
    50%       { translate: 0px 6px; }
  }
  #gem-particles  { animation: gem-particles 4s ease-in-out infinite; }
  #gem-animStop   { animation: gem-umbral    4s infinite; }
  #gem-bounce     { animation: gem-bounce  4s ease-in-out infinite; translate: 0px 36px; }
  #gem-bounce2    { animation: gem-bounce2 4s ease-in-out infinite; translate: 0px 46px; animation-delay: 0.5s; }
`;

export const GemLoader: React.FC = () => (
    <>
        <style>{css}</style>
        <svg xmlns="http://www.w3.org/2000/svg" height={200} width={200}>
            <defs>
                <linearGradient y2="100%" x2="10%" y1="0%" x1="0%" id="gem-grad1">
                    <stop style={{ stopColor: '#1e2026', stopOpacity: 1 }} offset="20%" />
                    <stop style={{ stopColor: '#414750', stopOpacity: 1 }} offset="60%" />
                </linearGradient>
                <linearGradient y2="100%" x2="0%" y1="-17%" x1="10%" id="gem-grad2">
                    <stop style={{ stopColor: '#d3a51000', stopOpacity: 1 }} offset="20%" />
                    <stop style={{ stopColor: '#d3a51054', stopOpacity: 1 }} offset="100%" id="gem-animStop" />
                </linearGradient>
                <linearGradient y2="100%" x2="10%" y1="0%" x1="0%" id="gem-grad3">
                    <stop style={{ stopColor: '#d3a51000', stopOpacity: 1 }} offset="20%" />
                    <stop style={{ stopColor: '#d3a51054', stopOpacity: 1 }} offset="100%" />
                </linearGradient>
            </defs>

            <g style={{ order: -1 }}>
                {/* Bouncing outlines */}
                <polygon transform="rotate(45 100 100)" strokeWidth={1} stroke="#d3a410" fill="none"
                    points="70,70 148,50 130,130 50,150" id="gem-bounce" />
                <polygon transform="rotate(45 100 100)" strokeWidth={1} stroke="#d3a410" fill="none"
                    points="70,70 148,50 130,130 50,150" id="gem-bounce2" />

                {/* Main faces */}
                <polygon transform="rotate(45 100 100)" strokeWidth={2} stroke="none" fill="#414750"
                    points="70,70 150,50 130,130 50,150" />
                <polygon strokeWidth={2} stroke="none" fill="url(#gem-grad1)"
                    points="100,70 150,100 100,130 50,100" />

                {/* Side panels */}
                <polygon transform="translate(20, 31)" strokeWidth={2} stroke="none" fill="#b7870f"
                    points="80,50 80,75 80,99 40,75" />
                <polygon transform="translate(20, 31)" strokeWidth={2} stroke="none" fill="url(#gem-grad2)"
                    points="40,-40 80,-40 80,99 40,75" />
                <polygon transform="rotate(180 100 100) translate(20, 20)" strokeWidth={2} stroke="none" fill="#d3a410"
                    points="80,50 80,75 80,99 40,75" />
                <polygon transform="rotate(0 100 100) translate(60, 20)" strokeWidth={2} stroke="none" fill="url(#gem-grad3)"
                    points="40,-40 80,-40 80,85 40,110.2" />

                {/* Sparkle particles */}
                <polygon transform="rotate(45 100 100) translate(80, 95)" strokeWidth={2} stroke="none" fill="#ffe4a1"
                    points="5,0 5,5 0,5 0,0" id="gem-particles" />
                <polygon transform="rotate(45 100 100) translate(80, 55)" strokeWidth={2} stroke="none" fill="#ccb069"
                    points="6,0 6,6 0,6 0,0" id="gem-particles" />
                <polygon transform="rotate(45 100 100) translate(70, 80)" strokeWidth={2} stroke="none" fill="#fff"
                    points="2,0 2,2 0,2 0,0" id="gem-particles" />

                {/* Base shadow */}
                <polygon strokeWidth={2} stroke="none" fill="#292d34"
                    points="29.5,99.8 100,142 100,172 29.5,130" />
                <polygon transform="translate(50, 92)" strokeWidth={2} stroke="none" fill="#1f2127"
                    points="50,50 120.5,8 120.5,35 50,80" />
            </g>
        </svg>
    </>
);
