/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Mic, Eye, ShieldAlert, Play, RefreshCw, Activity } from 'lucide-react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AppState = 'splash' | 'menu' | 'permission' | 'game' | 'result';

export default function App() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (appState === 'splash') {
      const timer = setTimeout(() => setAppState('menu'), 2500);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden selection:bg-[#00E5FF]/30 flex items-center justify-center">
      <div className="w-full max-w-md h-[100dvh] sm:h-[850px] sm:rounded-[40px] sm:border-[8px] border-[#1a1a1a] bg-[#050505] relative overflow-hidden shadow-2xl shadow-[#00E5FF]/10 flex flex-col">
        <AnimatePresence mode="wait">
          {appState === 'splash' && <SplashScreen key="splash" />}
          {appState === 'menu' && <MainMenu key="menu" onStart={() => setAppState('permission')} />}
          {appState === 'permission' && <PermissionScreen key="permission" onGranted={() => setAppState('game')} />}
          {appState === 'game' && <GameScreen key="game" onGameOver={(time) => { setScore(time); setAppState('result'); }} />}
          {appState === 'result' && <ResultScreen key="result" score={score} onRetry={() => setAppState('menu')} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-black"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-[#00E5FF] blur-[60px] opacity-20 rounded-full" />
        <Eye className="w-24 h-24 text-[#00E5FF] relative z-10" strokeWidth={1.5} />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-3xl font-bold tracking-widest text-white uppercase"
        style={{ textShadow: '0 0 20px rgba(0, 229, 255, 0.5)' }}
      >
        BlinkEye <span className="text-[#00E5FF]">AI</span>
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-12 flex items-center gap-2 text-[#00E5FF]/50 text-xs tracking-widest uppercase font-mono"
      >
        <Activity className="w-4 h-4 animate-pulse" />
        Initializing Engine...
      </motion.div>
    </motion.div>
  );
}

function MainMenu({ onStart }: { onStart: () => void; key?: React.Key }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute inset-0 flex flex-col items-center justify-between p-8 bg-black"
    >
      <div className="w-full flex justify-between items-center mt-4">
        <div className="flex items-center gap-2">
          <Eye className="w-6 h-6 text-[#00E5FF]" />
          <span className="font-bold tracking-wider text-sm">BLINKEYE</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30">
          <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
          <span className="text-[10px] text-[#00E5FF] font-mono uppercase tracking-wider">Calibrated</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00E5FF]/5 to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10 w-full max-w-[280px] aspect-square rounded-full border border-[#00E5FF]/20 flex items-center justify-center bg-black/50 backdrop-blur-xl shadow-[0_0_50px_rgba(0,229,255,0.1)]">
          <div className="absolute inset-2 rounded-full border border-[#00E5FF]/10 border-dashed animate-[spin_20s_linear_infinite]" />
          <div className="text-center">
            <div className="text-5xl font-light text-white mb-2">0.00</div>
            <div className="text-xs text-[#00E5FF]/70 font-mono uppercase tracking-widest">Best Time</div>
          </div>
        </div>
      </div>

      <div className="w-full mb-8">
        <button
          onClick={onStart}
          className="w-full relative group overflow-hidden rounded-2xl bg-[#00E5FF] text-black font-bold text-lg py-4 transition-transform active:scale-95 cursor-pointer"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative flex items-center justify-center gap-2">
            <Play className="w-5 h-5 fill-black" />
            START CHALLENGE
          </span>
        </button>
        <p className="text-center text-[#00E5FF]/40 text-xs mt-4 font-mono uppercase tracking-wider">
          AI Vision Engine v2.4
        </p>
      </div>
    </motion.div>
  );
}

function PermissionScreen({ onGranted }: { onGranted: () => void; key?: React.Key }) {
  const [requesting, setRequesting] = useState(false);

  const handleRequest = async () => {
    setRequesting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      onGranted();
    } catch (err) {
      console.error("Permission denied", err);
      alert("Permissions are required to play.");
      setRequesting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/90 backdrop-blur-md z-50"
    >
      <ShieldAlert className="w-16 h-16 text-[#00E5FF] mb-6" />
      <h2 className="text-2xl font-bold mb-4 text-center">Hardware Access</h2>
      <p className="text-center text-gray-400 mb-8 text-sm leading-relaxed">
        Required for real-time AI eye-tracking and facial landmark analysis.
      </p>
      
      <div className="w-full space-y-3 mb-8">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <Camera className="w-6 h-6 text-[#00E5FF]" />
          <div className="flex-1">
            <div className="font-semibold text-sm">Camera</div>
            <div className="text-xs text-gray-500">For blink detection</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <Mic className="w-6 h-6 text-[#00E5FF]" />
          <div className="flex-1">
            <div className="font-semibold text-sm">Microphone</div>
            <div className="text-xs text-gray-500">For ambient analysis</div>
          </div>
        </div>
      </div>

      <button
        onClick={handleRequest}
        disabled={requesting}
        className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold py-4 transition-colors border border-white/20 cursor-pointer"
      >
        {requesting ? 'Requesting...' : 'Grant Access'}
      </button>
    </motion.div>
  );
}

function GameScreen({ onGameOver }: { onGameOver: (time: number) => void; key?: React.Key }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Initialize MediaPipe
  useEffect(() => {
    let active = true;
    async function initModel() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
        if (active) {
          landmarkerRef.current = faceLandmarker;
          setIsModelLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load model", err);
      }
    }
    initModel();
    return () => { active = false; };
  }, []);

  // Initialize Camera
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user", width: 640, height: 480 },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };
        }
      } catch (err) {
        console.error("Camera error", err);
      }
    }
    setupCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Game Loop
  useEffect(() => {
    if (!isModelLoaded || !videoRef.current) return;

    let lastVideoTime = -1;
    let blinkFrames = 0;
    let active = true;

    const detect = () => {
      if (!active) return;
      
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const currentTime = videoRef.current.currentTime;
        if (currentTime !== lastVideoTime) {
          const results = landmarkerRef.current?.detectForVideo(videoRef.current, performance.now());
          
          if (results && results.faceBlendshapes && results.faceBlendshapes.length > 0) {
            setFaceDetected(true);
            
            // Start timer if not started
            if (!isPlaying) {
              setIsPlaying(true);
              startTimeRef.current = performance.now();
            }

            // Check for blink using blendshapes
            const blendshapes = results.faceBlendshapes[0].categories;
            const eyeBlinkLeft = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')?.score || 0;
            const eyeBlinkRight = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')?.score || 0;

            // Threshold for blink
            if (eyeBlinkLeft > 0.4 || eyeBlinkRight > 0.4) {
              blinkFrames++;
              if (blinkFrames > 2) {
                // Game Over
                const finalTime = (performance.now() - startTimeRef.current) / 1000;
                active = false;
                onGameOver(finalTime);
                return;
              }
            } else {
              blinkFrames = 0;
            }
          } else {
            setFaceDetected(false);
          }
          lastVideoTime = currentTime;
        }
      }

      if (isPlaying && active) {
        setTime((performance.now() - startTimeRef.current) / 1000);
      }

      if (active) {
        requestRef.current = requestAnimationFrame(detect);
      }
    };

    requestRef.current = requestAnimationFrame(detect);

    return () => {
      active = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isModelLoaded, isPlaying, onGameOver]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center bg-black"
    >
      {/* Header */}
      <div className="w-full flex justify-between items-center p-6 z-20">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", faceDetected ? "bg-[#00E5FF] animate-pulse" : "bg-red-500")} />
          <span className="text-xs font-mono uppercase tracking-wider text-white/70">
            {faceDetected ? 'Face Detected' : 'Searching...'}
          </span>
        </div>
        <div className="text-[#00E5FF] font-mono text-xl">
          {time.toFixed(2)}s
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 w-full flex items-center justify-center relative z-10">
        <div className="relative w-[300px] h-[300px] rounded-full overflow-hidden border-2 border-[#00E5FF]/30 shadow-[0_0_50px_rgba(0,229,255,0.15)]">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover -scale-x-100"
            playsInline
            muted
          />
          
          {/* Scanning Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00E5FF]/10 to-transparent animate-scan pointer-events-none" />
          
          {/* Crosshairs */}
          <div className="absolute top-1/2 left-0 w-4 h-[1px] bg-[#00E5FF]/50" />
          <div className="absolute top-1/2 right-0 w-4 h-[1px] bg-[#00E5FF]/50" />
          <div className="absolute top-0 left-1/2 w-[1px] h-4 bg-[#00E5FF]/50" />
          <div className="absolute bottom-0 left-1/2 w-[1px] h-4 bg-[#00E5FF]/50" />
        </div>

        {!isModelLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-30">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="w-8 h-8 text-[#00E5FF] animate-spin" />
              <div className="text-[#00E5FF] font-mono text-sm uppercase tracking-widest">Loading AI Model...</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="w-full p-8 pb-12 z-20 text-center">
        <div className="text-white/50 text-sm font-mono uppercase tracking-widest mb-2">Status</div>
        <div className={cn(
          "text-2xl font-bold uppercase tracking-widest transition-colors",
          faceDetected ? "text-[#00E5FF]" : "text-red-500"
        )}>
          {faceDetected ? "Don't Blink" : "Align Face"}
        </div>
      </div>
    </motion.div>
  );
}

function ResultScreen({ score, onRetry }: { score: number, onRetry: () => void; key?: React.Key }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black z-50"
    >
      <div className="text-red-500 font-bold text-xl tracking-widest uppercase mb-8 animate-pulse">
        Blink Detected
      </div>
      
      <div className="relative w-full max-w-[280px] aspect-square rounded-full border border-[#00E5FF]/30 flex flex-col items-center justify-center bg-[#00E5FF]/5 backdrop-blur-xl shadow-[0_0_80px_rgba(0,229,255,0.15)] mb-12">
        <div className="text-[#00E5FF]/70 text-sm font-mono uppercase tracking-widest mb-2">Final Time</div>
        <div className="text-6xl font-light text-white">{score.toFixed(2)}</div>
        <div className="text-[#00E5FF]/50 text-xs font-mono uppercase tracking-widest mt-2">Seconds</div>
      </div>

      <button
        onClick={onRetry}
        className="w-full relative group overflow-hidden rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-lg py-4 transition-transform active:scale-95 hover:bg-white/20 cursor-pointer"
      >
        <span className="relative flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5" />
          TRY AGAIN
        </span>
      </button>
    </motion.div>
  );
}

