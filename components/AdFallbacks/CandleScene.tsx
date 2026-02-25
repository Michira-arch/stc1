import React from 'react';

const css = `
  .cs-wrapper {
    position: relative;
    width: 100%;
    min-height: 160px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  .cs-origin {
    position: relative;
    transform: scale(0.65) translateY(40px);
  }
  .cs-floor {
    position: absolute; left: 0; top: 0;
    width: 350px; height: 5px;
    background: #673c63;
    transform: translate(-50%, -50%);
    box-shadow: 0px 2px 5px #111;
    z-index: 2;
  }
  .cs-candles {
    position: absolute; left: 0; top: 0;
    width: 250px; height: 150px;
    transform: translate(-50%, -100%);
    z-index: 1;
  }
  .cs-c1 {
    position: absolute; left: 50%; top: 50%;
    width: 35px; height: 100px;
    background: #fff; border: 3px solid #673c63;
    border-bottom: 0; border-radius: 3px;
    transform-origin: center right;
    transform: translate(60%, -25%);
    box-shadow: -2px 0px 0px #95c6f2 inset;
    animation: cs-expand-body 3s infinite linear;
  }
  .cs-stick1, .cs-stick2 {
    position: absolute; left: 50%; top: 0%;
    width: 3px; height: 15px;
    background: #673c63; border-radius: 8px;
    transform: translate(-50%, -100%);
  }
  .cs-stick2 {
    height: 12px;
    transform-origin: bottom center;
    animation: cs-stick 3s infinite linear;
  }
  .cs-eyes1, .cs-eyes2 {
    position: absolute; left: 50%; top: 0%;
    width: 35px; height: 30px;
    transform: translate(-50%, 0%);
  }
  .cs-eye1a {
    position: absolute; left: 30%; top: 20%;
    width: 5px; height: 5px;
    border-radius: 100%; background: #673c63;
    transform: translate(-70%, 0%);
    animation: cs-blink 3s infinite linear;
  }
  .cs-eye1b {
    position: absolute; left: 70%; top: 20%;
    width: 5px; height: 5px;
    border-radius: 100%; background: #673c63;
    transform: translate(-70%, 0%);
    animation: cs-blink 3s infinite linear;
  }
  .cs-mouth {
    position: absolute; left: 40%; top: 20%;
    width: 0; height: 0;
    border-radius: 20px; background: #673c63;
    transform: translate(-50%, -50%);
    animation: cs-uff 3s infinite linear;
  }
  .cs-smoke1 {
    position: absolute; left: 30%; top: 50%;
    width: 30px; height: 3px;
    background: grey;
    transform: translate(-50%, -50%);
    animation: cs-move-left 3s infinite linear;
  }
  .cs-smoke2 {
    position: absolute; left: 30%; top: 40%;
    width: 10px; height: 10px;
    border-radius: 10px; background: grey;
    transform: translate(-50%, -50%);
    animation: cs-move-top 3s infinite linear;
  }
  .cs-c2 {
    position: absolute; left: 20%; top: 65%;
    width: 42px; height: 60px;
    background: #fff; border: 3px solid #673c63;
    border-bottom: 0; border-radius: 3px;
    transform: translate(60%, -15%);
    transform-origin: center right;
    box-shadow: -2px 0px 0px #95c6f2 inset;
    animation: cs-shake 3s infinite linear;
  }
  .cs-eye2a {
    position: absolute; left: 30%; top: 50%;
    width: 5px; height: 5px;
    border-radius: 100%; background: #673c63;
    transform: translate(-80%, 0%);
    animation: cs-to-lower 3s infinite linear;
  }
  .cs-eye2b {
    position: absolute; left: 70%; top: 50%;
    width: 5px; height: 5px;
    border-radius: 100%; background: #673c63;
    transform: translate(-80%, 0%);
    animation: cs-to-greater 3s infinite linear;
  }
  .cs-light {
    position: absolute; top: 35%; left: 35%;
    width: 75px; height: 75px;
    border-radius: 100%;
    transform: translate(-25%, -50%) scale(2.5, 2.5);
    border: 2px solid rgba(255,255,255,0.2);
    animation: cs-expand-light 3s infinite linear;
  }
  .cs-fire {
    position: absolute; top: 50%; left: 38.5%;
    width: 16px; height: 20px;
    background: #ff9800;
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    transform: translate(-50%, -50%);
    animation: cs-fire 3s infinite linear;
  }

  @keyframes cs-blink {
    0%,35%  { opacity: 1;  transform: translate(-70%,0%);  }
    36%,39% { opacity: 0;  transform: translate(-70%,0%);  }
    40%     { opacity: 1;  transform: translate(-70%,0%);  }
    50%,65% { transform: translate(-140%,0%); }
    66%     { transform: translate(-70%,0%);  }
  }
  @keyframes cs-expand-body {
    0%,40%  { transform: scale(1,1)     translate(60%,-25%); }
    45%,55% { transform: scale(1.1,1.1) translate(60%,-28%); }
    60%     { transform: scale(.89,.89) translate(60%,-25%); }
    65%     { transform: scale(1,1)     translate(60%,-25%); }
    70%     { transform: scale(.95,.95) translate(60%,-25%); }
    75%     { transform: scale(1,1)     translate(60%,-25%); }
  }
  @keyframes cs-uff {
    0%,40%  { width:0;   height:0;  }
    50%,54% { width:15px; height:15px; left:30%; }
    59%     { width:5px;  height:5px;  left:20%; }
    62%     { width:2px;  height:2px;  left:20%; }
    67%     { width:0;    height:0;    left:30%; }
  }
  @keyframes cs-move-left {
    0%,59%,100% { width:0;   left:40%; }
    60%         { width:30px; left:30%; }
    68%         { width:0;   left:20%; }
  }
  @keyframes cs-move-top {
    0%,64%,100% { width:0;   height:0;   top:0%; }
    65%         { width:10px; height:10px; top:40%; left:40%; }
    80%         { width:0;   height:0;   top:20%; }
  }
  @keyframes cs-shake {
    0%,40%  { left:20%; transform:translate(60%,-15%); }
    62%     { left:18%; transform:translate(60%,-15%); }
    65%     { left:21%; transform:translate(60%,-15%); }
    67%     { left:20%; transform:translate(60%,-15%); }
    75%     { left:20%; transform:scale(1.15,.85) translate(60%,-15%); background:#fff; border-color:#673c63; }
    91%     { left:20%; transform:scale(1.18,.82) translate(60%,-10%); background:#f44336; border-color:#f44336; }
    92%     { left:20%; transform:scale(.85,1.15) translate(60%,-15%); }
    95%     { left:20%; transform:scale(1.05,.95) translate(60%,-15%); }
    97%     { left:20%; transform:scale(1,1)       translate(60%,-15%); }
  }
  @keyframes cs-stick {
    62%     { transform:rotateZ(-15deg) translate(-50%,-100%); }
    65%     { transform:rotateZ(15deg) translate(-50%,-100%);  }
    70%     { transform:rotateZ(-5deg) translate(-50%,-100%);  }
    72%     { transform:rotateZ(5deg)  translate(-50%,-100%);  }
    74%,84% { transform:rotateZ(0deg)  translate(-50%,-100%);  }
    85%     { transform:rotateZ(180deg) translate(0%,120%);    }
    92%     { transform:translate(-50%,-100%); }
    0%      { transform:translate(-50%,-100%); }
  }
  @keyframes cs-expand-light {
    0%,28%,58%,100% { transform:translate(-25%,-50%) scale(2.5,2.5); border:2px solid rgba(255,255,255,.2); }
    10%,29%,59%,89% { transform:translate(-25%,-50%) scale(0,0);     border:2px solid rgba(255,255,255,0); }
    90%,20%,50%     { transform:translate(-25%,-50%) scale(1,1); }
    95%,96%,26%,27%,56%,57% { transform:translate(-25%,-50%) scale(2,2); border:2px solid rgba(255,255,255,.5); }
  }
  @keyframes cs-fire {
    59%,89%  { left:38.5%; width:0;   height:0;  }
    0%,7%,15%,23%,31%,39%,47%,55%,90% { left:38.3%; width:16px; height:20px; background:#ffc107; }
    3%,11%,19%,27%,35%,43%,51%,58%,94% { left:38.7%; width:16px; height:20px; background:#ff9800; }
  }
  @keyframes cs-to-lower {
    0%,70%,90% { border-radius:100%; background:#673c63; border:0; padding:0; transform:translate(-90%,0%); }
    71%,89%    { background:none; border:solid #673c63; border-radius:0; border-width:0 2px 2px 0;
                 padding:1px; transform:rotate(-45deg) translate(-50%,-65%); }
  }
  @keyframes cs-to-greater {
    0%,70%,90% { top:50%; border-radius:100%; background:#673c63; border:0; padding:0; transform:translate(-80%,0%); }
    71%,89%    { top:30%; background:none; border:solid #673c63; border-radius:0; border-width:0 2px 2px 0;
                 padding:1px; transform:rotate(135deg) translate(-80%,20%); }
  }
`;

export const CandleScene: React.FC = () => (
  <>
    <style>{css}</style>
    <div className="cs-wrapper">
      <div className="cs-origin">
        <div className="cs-candles">
          <div className="cs-light" />
          <div className="cs-c1">
            <div className="cs-stick1" />
            <div className="cs-eyes1">
              <span className="cs-eye1a" />
              <span className="cs-eye1b" />
            </div>
            <div className="cs-mouth" />
          </div>
          <div className="cs-c2">
            <div className="cs-stick2" />
            <div className="cs-eyes2">
              <div className="cs-eye2a" />
              <div className="cs-eye2b" />
            </div>
          </div>
          <div className="cs-fire" />
          <div className="cs-smoke1" />
          <div className="cs-smoke2" />
        </div>
        <div className="cs-floor" />
      </div>
    </div>
  </>
);
