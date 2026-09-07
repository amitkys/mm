"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { signIn } from "@/lib/auth-client";

// Ambient Firefly / Spore particle
interface Spore {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  hue: number;
  life: number;
  maxLife: number;
}

// Flowing Water Particle
interface WaterBubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  wobbleSpeed: number;
}

// Distant soaring bird
interface FlyingBird {
  x: number;
  y: number;
  speed: number;
  size: number;
  wingPhase: number;
  wingSpeed: number;
  curveY: number;
  targetY: number;
}

// Dragonfly hovering near stream
interface Dragonfly {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  wingAngle: number;
  color: string;
}

function GoogleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const waterCanvasRef = useRef<HTMLCanvasElement>(null);
  const faunaCanvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction coordinates & states
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, rawX: 0, rawY: 0 });

  // Life cycle states for living creatures
  const [shoebillBlink, setShoebillBlink] = useState(false);
  const [shoebillHeadAngle, setShoebillHeadAngle] = useState(0);
  const [saigaBreathing, setSaigaBreathing] = useState(0);
  const [saigaEarTwitch, setSaigaEarTwitch] = useState(false);
  const [pangolinClawStep, setPangolinClawStep] = useState(0);
  const [jerboaTwitch, setJerboaTwitch] = useState(0);
  const [headsLook, setHeadsLook] = useState({ h1: 0, h2: 0, h3: 0 });

  const handleAuth = async () => {
    setLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/home",
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // Subtle mouse tracking for parallax & creature gaze
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 14;
    const y = (clientY / innerHeight - 0.5) * 14;
    setMousePos({ x, y, rawX: clientX, rawY: clientY });

    // Shoebill turns head slightly towards the observer
    const shoebillX = innerWidth * 0.72;
    const dx = clientX - shoebillX;
    const angle = Math.max(-12, Math.min(12, (dx / innerWidth) * 20));
    setShoebillHeadAngle(angle);

    // Three-headed bird curious head reactions
    const birdX = innerWidth * 0.32;
    const birdDx = (clientX - birdX) / innerWidth;
    setHeadsLook({
      h1: birdDx * 12,
      h2: -birdDx * 8,
      h3: birdDx * 10,
    });
  };

  // Autonomous biological timers: Blinking, breathing, twitches
  useEffect(() => {
    // 1. Shoebill realistic infrequent eerie blink
    const blinkInterval = setInterval(() => {
      setShoebillBlink(true);
      setTimeout(() => setShoebillBlink(false), 240);
    }, 4500 + Math.random() * 3000);

    // 2. Saiga ear flick & chewing
    const earInterval = setInterval(() => {
      setSaigaEarTwitch(true);
      setTimeout(() => setSaigaEarTwitch(false), 350);
    }, 3200 + Math.random() * 2500);

    // 3. Jerboa nervous rodent sniff/hops
    const jerboaInterval = setInterval(() => {
      setJerboaTwitch(1);
      setTimeout(() => setJerboaTwitch(2), 150);
      setTimeout(() => setJerboaTwitch(0), 400);
    }, 2800 + Math.random() * 2000);

    // 4. Pangolin claw shifting step cycle
    const pangolinInterval = setInterval(() => {
      setPangolinClawStep((prev) => (prev + 1) % 4);
    }, 1800);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(earInterval);
      clearInterval(jerboaInterval);
      clearInterval(pangolinInterval);
    };
  }, []);

  // Continuous breathing oscillation
  useEffect(() => {
    let animId: number;
    const breathLoop = () => {
      const time = Date.now() * 0.0018; // smooth breathing rate (~14 breaths/min)
      setSaigaBreathing(Math.sin(time));
      animId = requestAnimationFrame(breathLoop);
    };
    animId = requestAnimationFrame(breathLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Water Flow & River Current Simulation (Living Stream)
  useEffect(() => {
    const canvas = waterCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // River flow particles & surface ripples
    const currentStreaks: Array<{
      x: number;
      y: number;
      len: number;
      speed: number;
      width: number;
      alpha: number;
      curve: number;
    }> = [];

    // Stream bounding area in screen proportions (roughly bottom 28% across middle/left)
    const initStreaks = () => {
      for (let i = 0; i < 65; i++) {
        currentStreaks.push({
          x: Math.random() * width,
          y: height * (0.72 + Math.random() * 0.26),
          len: Math.random() * 60 + 25,
          speed: Math.random() * 1.8 + 0.8, // gentle horizontal river flow
          width: Math.random() * 2.2 + 0.6,
          alpha: Math.random() * 0.4 + 0.15,
          curve: (Math.random() - 0.5) * 0.8,
        });
      }
    };
    initStreaks();

    // Rising aquatic bubbles in the pond
    const bubbles: WaterBubble[] = [];
    for (let i = 0; i < 22; i++) {
      bubbles.push({
        x: width * (0.28 + Math.random() * 0.38),
        y: height * (0.8 + Math.random() * 0.18),
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.8 - 0.5,
        radius: Math.random() * 3.5 + 1.2,
        alpha: Math.random() * 0.6 + 0.2,
        wobbleSpeed: Math.random() * 0.05 + 0.02,
      });
    }

    let time = 0;
    let animId: number;

    const renderWater = () => {
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw flowing river currents (water stream simulation)
      // Stream path runs horizontally with natural meandering
      ctx.save();
      for (const s of currentStreaks) {
        s.x -= s.speed; // Flowing leftward down the creek
        s.y += Math.sin(time + s.x * 0.01) * 0.3; // gentle river eddy

        // Wrap around stream boundary
        if (s.x < width * 0.1) {
          s.x = width * 0.85;
          s.y = height * (0.72 + Math.random() * 0.26);
        }

        const grad = ctx.createLinearGradient(s.x, s.y, s.x + s.len, s.y);
        grad.addColorStop(0, "rgba(120, 215, 235, 0)");
        grad.addColorStop(0.5, `rgba(160, 240, 255, ${s.alpha})`);
        grad.addColorStop(1, "rgba(90, 180, 210, 0)");

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.moveTo(s.x, s.y);
        ctx.bezierCurveTo(
          s.x + s.len * 0.33,
          s.y + s.curve * 4,
          s.x + s.len * 0.66,
          s.y - s.curve * 4,
          s.x + s.len,
          s.y
        );
        ctx.stroke();
      }

      // 2. Caustic light glimmer dancing on water surface
      for (let c = 0; c < 18; c++) {
        const cx = width * (0.28 + (c / 18) * 0.45) + Math.sin(time * 1.2 + c) * 15;
        const cy = height * (0.75 + Math.sin(time * 0.8 + c * 2) * 0.12);
        const cr = 12 + Math.sin(time * 2 + c) * 6;

        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(2, cr), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 250, 255, ${0.08 + Math.sin(time * 1.5 + c) * 0.05})`;
        ctx.fill();
      }

      // 3. Underwater bubbles rising from Axolotl and riverbed
      for (const b of bubbles) {
        b.y += b.vy;
        b.x += Math.sin(time * 3 + b.y * 0.1) * 0.5;

        // Reset bubble when reaching water surface
        if (b.y < height * 0.72) {
          b.y = height * (0.92 + Math.random() * 0.06);
          b.x = width * (0.3 + Math.random() * 0.35);
        }

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180, 245, 255, ${b.alpha * 0.7})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = `rgba(220, 255, 255, ${b.alpha * 0.25})`;
        ctx.fill();
      }
      ctx.restore();

      animId = requestAnimationFrame(renderWater);
    };

    animId = requestAnimationFrame(renderWater);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Living Fauna & Aerial Atmosphere Simulation (Birds, Dragonflies, Spores)
  useEffect(() => {
    const canvas = faunaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // 1. Distant flock of birds soaring through the ancient ruins and canopy
    const birds: FlyingBird[] = [];
    for (let i = 0; i < 5; i++) {
      birds.push({
        x: width * 0.1 + i * 45,
        y: height * 0.18 + (Math.random() - 0.5) * 40,
        speed: 1.1 + Math.random() * 0.5,
        size: 7 + Math.random() * 4,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 0.12 + Math.random() * 0.04,
        curveY: (Math.random() - 0.5) * 0.3,
        targetY: height * 0.18,
      });
    }

    // 2. Bioluminescent dragonflies skimming over the water & mushrooms
    const dragonflies: Dragonfly[] = [
      {
        x: width * 0.4,
        y: height * 0.7,
        targetX: width * 0.45,
        targetY: height * 0.68,
        vx: 0,
        vy: 0,
        wingAngle: 0,
        color: "rgba(120, 240, 255, 0.9)",
      },
      {
        x: width * 0.25,
        y: height * 0.65,
        targetX: width * 0.28,
        targetY: height * 0.62,
        vx: 0,
        vy: 0,
        wingAngle: 0,
        color: "rgba(255, 215, 120, 0.9)",
      },
    ];

    // 3. Bioluminescent forest spores & drifting embers
    const spores: Spore[] = [];
    for (let i = 0; i < 45; i++) {
      spores.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.1,
        size: Math.random() * 2.8 + 1,
        alpha: Math.random() * 0.6 + 0.2,
        maxAlpha: Math.random() * 0.6 + 0.3,
        hue: 45 + Math.random() * 20,
        life: 0,
        maxLife: 200 + Math.random() * 200,
      });
    }

    let time = 0;
    let animId: number;

    const renderFauna = () => {
      time += 0.04;
      ctx.clearRect(0, 0, width, height);

      // A. Render soaring distant birds
      for (const bird of birds) {
        bird.x += bird.speed;
        bird.wingPhase += bird.wingSpeed;
        bird.y += Math.sin(time * 0.8 + bird.x * 0.005) * 0.4 + bird.curveY;

        // Loop bird flight path across the misty sky
        if (bird.x > width + 40) {
          bird.x = -50;
          bird.y = height * (0.12 + Math.random() * 0.14);
        }

        const wingFlap = Math.sin(bird.wingPhase) * (bird.size * 0.65);

        ctx.save();
        ctx.strokeStyle = "rgba(40, 55, 60, 0.65)";
        ctx.fillStyle = "rgba(30, 45, 50, 0.75)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        // Left wing
        ctx.moveTo(bird.x, bird.y);
        ctx.quadraticCurveTo(
          bird.x - bird.size * 0.6,
          bird.y - wingFlap,
          bird.x - bird.size,
          bird.y - wingFlap * 0.5
        );
        // Right wing
        ctx.moveTo(bird.x, bird.y);
        ctx.quadraticCurveTo(
          bird.x + bird.size * 0.6,
          bird.y - wingFlap,
          bird.x + bird.size,
          bird.y - wingFlap * 0.5
        );
        ctx.stroke();
        ctx.restore();
      }

      // B. Render fluttering dragonflies
      for (const df of dragonflies) {
        // Organic erratic hovering movement
        const dx = df.targetX - df.x;
        const dy = df.targetY - df.y;
        df.vx += dx * 0.02;
        df.vy += dy * 0.02;
        df.vx *= 0.9;
        df.vy *= 0.9;
        df.x += df.vx;
        df.y += df.vy;
        df.wingAngle += 1.2;

        if (Math.hypot(dx, dy) < 15 || Math.random() < 0.015) {
          // Pick a new curious hover point
          df.targetX = width * (0.22 + Math.random() * 0.45);
          df.targetY = height * (0.58 + Math.random() * 0.22);
        }

        // Draw dragonfly body
        ctx.save();
        ctx.beginPath();
        ctx.arc(df.x, df.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = df.color;
        ctx.shadowColor = df.color;
        ctx.shadowBlur = 8;
        ctx.fill();

        // Fluttering gossamer wings
        const wingSpan = Math.abs(Math.sin(df.wingAngle)) * 8;
        ctx.strokeStyle = "rgba(230, 255, 255, 0.65)";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.ellipse(df.x - 4, df.y - 2, wingSpan, 2.5, 0.4, 0, Math.PI * 2);
        ctx.ellipse(df.x + 4, df.y - 2, wingSpan, 2.5, -0.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // C. Render glowing spores drifting up from mushrooms & flora
      for (let i = spores.length - 1; i >= 0; i--) {
        const p = spores[i];
        p.x += p.vx + Math.sin(time + p.y * 0.02) * 0.25;
        p.y += p.vy;
        p.life++;

        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const progress = p.life / p.maxLife;
        const currentAlpha =
          progress < 0.2
            ? (progress / 0.2) * p.maxAlpha
            : progress > 0.8
            ? ((1 - progress) / 0.2) * p.maxAlpha
            : p.maxAlpha;

        if (progress >= 1) {
          p.life = 0;
          p.y = height * (0.7 + Math.random() * 0.3);
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${currentAlpha})`;
        ctx.shadowColor = `hsla(${p.hue}, 95%, 60%, ${currentAlpha * 0.8})`;
        ctx.shadowBlur = p.size * 3;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(renderFauna);
    };

    animId = requestAnimationFrame(renderFauna);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-screen h-screen overflow-hidden select-none bg-[#090b0d]"
    >
      {/* Dynamic SVG Distortion Filters for Realistic Living Fluid Motion */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* Water flowing current turbulence */}
          <filter id="water-current-flow" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015 0.045"
              numOctaves="2"
              result="turbulence"
            >
              <animate
                attributeName="baseFrequency"
                dur="16s"
                values="0.015 0.045; 0.022 0.06; 0.015 0.045"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="7"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Gentle wind swaying for canopy and botanicals */}
          <filter id="foliage-wind" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.005 0.01"
              numOctaves="1"
              result="wind"
            >
              <animate
                attributeName="baseFrequency"
                dur="8s"
                values="0.005 0.01; 0.008 0.016; 0.005 0.01"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="wind"
              scale="4"
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>

      {/* 1. Base Masterpiece Layer with 3D Parallax */}
      <div
        className="absolute inset-[-40px] pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * -1}px, ${mousePos.y * -1}px, 0) scale(1.05)`,
        }}
      >
        <Image
          src="/beasts-painting.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter contrast-[1.03] saturate-[1.08] brightness-[0.98]"
        />

        {/* 2. LIVING WATER CURRENT OVERLAY: Applied precisely over the flowing stream */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            clipPath:
              "polygon(0% 70%, 25% 68%, 55% 72%, 75% 82%, 100% 88%, 100% 100%, 0% 100%)",
            filter: "url(#water-current-flow)",
            opacity: 0.9,
          }}
        >
          <Image
            src="/beasts-painting.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center mix-blend-screen opacity-65"
          />
        </div>

        {/* Style block for GPU-accelerated organic wildlife animations */}
        <style>{`
          @keyframes axolotl-swim-motion {
            0%, 100% { transform: translate3d(0px, 0px, 0) rotate(0deg); }
            33% { transform: translate3d(12px, -4px, 0) rotate(2deg); }
            66% { transform: translate3d(-10px, 4px, 0) rotate(-2deg); }
          }
          @keyframes gill-flutter-left {
            0%, 100% { transform: rotate(-25deg); }
            50% { transform: rotate(-15deg); }
          }
          @keyframes gill-flutter-right {
            0%, 100% { transform: rotate(15deg); }
            50% { transform: rotate(25deg); }
          }
          @keyframes bird-head-bob-1 {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(3px); }
          }
          @keyframes bird-head-bob-3 {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }
        `}</style>

        {/* 3. LIVING CREATURE ANIMATIONS: Integrated seamlessly on the painting */}

        {/* A. LIVING AXOLOTL (Swimming undulating in the stream) */}
        <div
          className="absolute left-[31%] bottom-[4%] w-[22%] h-[12%] pointer-events-none transition-transform duration-1000 ease-in-out"
          style={{
            animation: "axolotl-swim-motion 7s ease-in-out infinite",
          }}
        >
          {/* External frilly gills undulating in the water flow */}
          <div className="absolute left-[44%] top-[18%] flex gap-2 opacity-85">
            <span
              className="w-3 h-5 bg-gradient-to-t from-pink-500 to-rose-300 rounded-full blur-[0.6px] animate-[pulse_2.2s_ease-in-out_infinite]"
              style={{ animation: "gill-flutter-left 3.2s ease-in-out infinite" }}
            />
            <span
              className="w-3 h-6 bg-gradient-to-t from-pink-400 to-rose-200 rounded-full blur-[0.6px] animate-[pulse_2.6s_ease-in-out_infinite]"
              style={{ animation: "gill-flutter-right 2.8s ease-in-out infinite" }}
            />
          </div>
          {/* Subtle water ripple ring radiating around axolotl */}
          <div className="absolute inset-0 rounded-full border border-cyan-300/20 animate-ping opacity-25" />
        </div>

        {/* B. LIVING SHOEBILL STORK (Eye blinks, predatory head tilt, breathing chest) */}
        <div
          className="absolute right-[17%] top-[16%] w-[21%] h-[65%] pointer-events-none transition-transform duration-500 ease-out"
          style={{
            transform: `rotate(${shoebillHeadAngle * 0.35}deg)`,
            transformOrigin: "center 80%",
          }}
        >
          {/* Piercing golden eye blink */}
          <div
            className="absolute left-[37%] top-[18%] w-3 h-3 rounded-full bg-amber-400 transition-all duration-75"
            style={{
              transform: shoebillBlink ? "scaleY(0.08)" : "scaleY(1)",
              boxShadow: "0 0 8px rgba(251, 191, 36, 0.8)",
            }}
          >
            {/* Pupil */}
            <div className="w-1.5 h-1.5 rounded-full bg-black mx-auto mt-[2px]" />
          </div>

          {/* Majestic chest feather heave (breathing) */}
          <div
            className="absolute left-[20%] top-[45%] w-[60%] h-[35%] rounded-full bg-cyan-500/5 blur-xl transition-transform duration-1000"
            style={{
              transform: `scale(${1 + saigaBreathing * 0.04})`,
            }}
          />
        </div>

        {/* C. LIVING SAIGA ANTELOPE (Chest heaving, proboscis twitch, flicking ear) */}
        <div
          className="absolute left-[44%] top-[34%] w-[26%] h-[38%] pointer-events-none"
        >
          {/* Flank expansion breathing */}
          <div
            className="absolute left-[25%] top-[15%] w-[55%] h-[60%] rounded-3xl bg-amber-500/5 blur-lg transition-transform duration-700 ease-in-out"
            style={{
              transform: `scale(${1 + saigaBreathing * 0.05}, ${1 + saigaBreathing * 0.03})`,
            }}
          />

          {/* Bulbous nose/proboscis expansion twitch */}
          <div
            className="absolute left-[2%] bottom-[22%] w-5 h-8 rounded-full bg-amber-700/10 blur-[1px] transition-transform duration-300"
            style={{
              transform: `scale(${1 + Math.abs(saigaBreathing) * 0.08})`,
            }}
          />

          {/* Flicking ear */}
          <div
            className="absolute left-[12%] top-[25%] w-4 h-6 rounded-full bg-amber-200/20 blur-[0.8px] transition-transform duration-200"
            style={{
              transform: saigaEarTwitch ? "rotate(-18deg) scaleY(1.2)" : "rotate(0deg)",
              transformOrigin: "bottom center",
            }}
          />
        </div>

        {/* D. LIVING THREE-HEADED CHIMERA BIRD (Independent look-around routines) */}
        <div className="absolute left-[27%] top-[23%] w-[12%] h-[19%] pointer-events-none">
          {/* Head 1 (Left head looking down towards pangolin) */}
          <div
            className="absolute left-[10%] top-[35%] w-4 h-4 rounded-full bg-amber-400/15 blur-[1px] transition-transform duration-700 ease-out"
            style={{
              transform: `translate(${headsLook.h1 * 0.5}px, 0px)`,
              animation: "bird-head-bob-1 3.5s ease-in-out infinite",
            }}
          />
          {/* Head 2 (Center head looking up into canopy) */}
          <div
            className="absolute left-[45%] top-[12%] w-4 h-4 rounded-full bg-cyan-400/15 blur-[1px] transition-transform duration-700 ease-out"
            style={{
              transform: `translate(${headsLook.h2 * 0.4}px, ${-Math.abs(headsLook.h2 * 0.3)}px)`,
            }}
          />
          {/* Head 3 (Right head looking at user) */}
          <div
            className="absolute right-[10%] top-[25%] w-4 h-4 rounded-full bg-emerald-400/15 blur-[1px] transition-transform duration-700 ease-out"
            style={{
              transform: `translate(${headsLook.h3 * 0.5}px, 0px)`,
              animation: "bird-head-bob-3 4s ease-in-out infinite",
            }}
          />
        </div>

        {/* E. LIVING PANGOLIN (Iridescent scale shimmer moving along back) */}
        <div className="absolute left-[12%] top-[33%] w-[18%] h-[27%] pointer-events-none overflow-hidden rounded-2xl">
          {/* Shimmer light band travelling across scaly back */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/15 to-transparent skew-x-12 animate-[shimmer_5s_linear_infinite]"
            style={{
              transform: `translateX(${(pangolinClawStep * 25) - 30}%)`,
            }}
          />
        </div>

        {/* F. LIVING JERBOA (Nervous mouse sniffing & alert stance) */}
        <div
          className="absolute left-[14%] bottom-[9%] w-[12%] h-[20%] pointer-events-none transition-transform duration-200"
          style={{
            transform:
              jerboaTwitch === 1
                ? "translateY(-4px) scale(1.03)"
                : jerboaTwitch === 2
                ? "translateY(-1px) scale(1.01)"
                : "translateY(0px) scale(1)",
          }}
        >
          {/* Whisker twitch aura */}
          <div className="absolute right-[22%] top-[38%] w-2 h-2 rounded-full bg-amber-300/20 blur-[0.5px] animate-ping" />
        </div>

        {/* Atmospheric Fine Art Vignette */}
        <div className="absolute inset-0 bg-radial-[at_50%_50%] from-transparent via-black/15 to-black/85 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/55 pointer-events-none" />
      </div>

      {/* 4. Real-time Canvas Sim: Flowing River Currents & Caustic Glimmers */}
      <canvas
        ref={waterCanvasRef}
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* 5. Real-time Canvas Sim: Soaring Birds, Dragonflies & Drifting Forest Spores */}
      <canvas
        ref={faunaCanvasRef}
        className="absolute inset-0 pointer-events-none z-20"
      />

      {/* 6. Clean Floating Action Bar: Absolutely Zero Extraneous Text */}
      <div className="absolute bottom-9 inset-x-0 flex items-center justify-center px-4 z-30 pointer-events-none">
        <div className="pointer-events-auto group relative w-full max-w-[340px] sm:max-w-[420px] p-[1.5px] rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_45px_rgba(251,191,36,0.3)]">
          {/* Subtle Gilded Ambient Border Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/40 via-emerald-400/40 to-amber-500/40 opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-[spin_14s_linear_infinite]" />

          {/* Frosted Obsidian Enclosure */}
          <div className="relative w-full rounded-full backdrop-blur-2xl bg-black/65 p-2 border border-white/10 shadow-2xl">
            <Button
              size="lg"
              onClick={handleAuth}
              disabled={loading}
              className="w-full h-13 px-8 rounded-full bg-white/95 text-neutral-900 hover:bg-white hover:text-black font-semibold text-base tracking-wide shadow-xl border-0 transition-all duration-300 active:scale-[0.99] disabled:opacity-75 cursor-pointer flex items-center justify-center"
            >
              <LoadingSwap className="flex items-center justify-center gap-3.5 text-base font-semibold" isLoading={loading}>
                <GoogleIcon className="size-5 shrink-0" />
                <span>Sign In with Google</span>
              </LoadingSwap>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
