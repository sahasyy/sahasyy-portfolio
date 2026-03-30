"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import NightMode from "./NightMode";
import ScrollRevealText from "./ScrollRevealText";


function DitheredSkyline({ src, nightMode }: { src: string; nightMode?: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (typeof window === "undefined" || typeof window.IntersectionObserver === "undefined") {
      const timeoutId = window.setTimeout(() => setShouldRender(true), 0);
      return () => window.clearTimeout(timeoutId);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "520px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldRender) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let timeoutId: number | null = null;
    let idleId: number | null = null;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const render = () => {
        const maxWidth = 1200;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetW = Math.max(300, Math.round(img.width * scale));
        const targetH = Math.max(80, Math.round(img.height * scale));
        canvas.width = targetW;
        canvas.height = targetH;
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const bayer = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
        const dotR = nightMode ? 247 : 26;
        const dotG = nightMode ? 245 : 26;
        const dotB = nightMode ? 242 : 26;
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            const a = data[i + 3];
            if (a < 10) { data[i]=0; data[i+1]=0; data[i+2]=0; data[i+3]=0; continue; }
            const gray = data[i]*0.299 + data[i+1]*0.587 + data[i+2]*0.114;
            const threshold = ((bayer[y%4][x%4])/16)*255 + 80;
            data[i]=dotR; data[i+1]=dotG; data[i+2]=dotB; data[i+3] = gray > threshold ? 0 : a;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      };
      const w = window as Window & { requestIdleCallback?: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number; cancelIdleCallback?: (id: number) => void };
      if (w.requestIdleCallback) idleId = w.requestIdleCallback(() => render(), { timeout: 1400 });
      else timeoutId = window.setTimeout(render, 220);
    };
    img.src = src;
    return () => {
      img.onload = null;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      const w = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (idleId !== null && w.cancelIdleCallback) w.cancelIdleCallback(idleId);
    };
  }, [src, nightMode, shouldRender]);
  return <div className="city-skyline-wrapper" ref={wrapperRef}><canvas ref={canvasRef} className="city-skyline" /></div>;
}

function DitheredStill({ src, className, nightMode }: { src: string; className?: string; nightMode?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    if (typeof window === "undefined" || typeof window.IntersectionObserver === "undefined") {
      const timeoutId = window.setTimeout(() => setShouldRender(true), 0);
      return () => window.clearTimeout(timeoutId);
    }
    const rootMargin = className?.includes("hero-seagull") ? "260px 0px" : "420px 0px";
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [className]);

  useEffect(() => {
    if (!shouldRender) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsReady(false);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let timeoutId: number | null = null;
    let idleId: number | null = null;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const render = () => {
        const maxRenderSide = className?.includes("experience-lily")
          ? 720
          : className?.includes("projects-dino")
            ? 760
            : className?.includes("hero-seagull")
              ? 520
              : 960;
        const longestSide = Math.max(img.width, img.height);
        const scale = longestSide > maxRenderSide ? maxRenderSide / longestSide : 1;
        const targetW = Math.max(64, Math.round(img.width * scale));
        const targetH = Math.max(64, Math.round(img.height * scale));
        canvas.width = targetW;
        canvas.height = targetH;
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const bayer = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
        const isNight = nightMode ?? document.body.classList.contains("night-mode");
        const dotR = isNight ? 247 : 26;
        const dotG = isNight ? 245 : 26;
        const dotB = isNight ? 242 : 26;
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            const a = data[i + 3];
            if (a < 10) { data[i]=0; data[i+1]=0; data[i+2]=0; data[i+3]=0; continue; }
            const gray = data[i]*0.299 + data[i+1]*0.587 + data[i+2]*0.114;
            const threshold = ((bayer[y%4][x%4])/16)*255 + 80;
            data[i]=dotR; data[i+1]=dotG; data[i+2]=dotB; data[i+3] = gray > threshold ? 0 : a;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        setIsReady(true);
      };
      const w = window as Window & { requestIdleCallback?: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number; cancelIdleCallback?: (id: number) => void };
      const isHero = Boolean(className?.includes("hero-seagull"));
      if (w.requestIdleCallback) idleId = w.requestIdleCallback(() => render(), { timeout: isHero ? 1200 : 900 });
      else timeoutId = window.setTimeout(render, isHero ? 380 : 120);
    };
    img.src = src;
    return () => {
      img.onload = null;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      const w = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (idleId !== null && w.cancelIdleCallback) w.cancelIdleCallback(idleId);
    };
  }, [src, nightMode, className, shouldRender]);
  return <canvas ref={canvasRef} className={`${className ?? ""}${isReady ? " dither-ready" : ""}`} />;
}

const cities = [
  { src: "/city-nyc-opt.png" }, { src: "/city-jerseycity.png" },
  { src: "/city-chicago.png" }, { src: "/city-mumbai.png" }, { src: "/city-dallas.png" },
];
const siteAnnouncement = {
  href: "https://medium.com/@sahassharma19/the-future-of-ai-isnt-bigger-models-it-s-better-systems-3feba84bc985",
  text: "just published on medium:",
  linkLabel: "read it here",
};
const KONAMI_CODE = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

function getGreeting(): string {
  const now = new Date();
  const hour = now.getHours();
  const lateNight = [
    "Up late. Same.",
    "Burning the midnight oil,",
    "The quiet hours hit different,",
    "Stars out, ideas flowing,",
    "Night owl mode,",
    "The moon's keeping us company,",
  ];
  const m = [
    "Good morning,",
    "Hey, early start today,",
    "Morning. Let's get into it,",
    "Fresh day ahead,",
    "Morning, let's see what we can do,",
    "Hey, good morning,",
    "Glad you're here,",
  ];
  const a = [
    "Good afternoon,",
    "Hey, hope the day's been good,",
    "Let's keep it going,",
    "Good to have you here,",
    "Hey there,",
    "Ready when you are,",
    "Afternoon, let's do this,",
  ];
  const e = [
    "Good evening,",
    "Hey, good to see you,",
    "Hope today was a good one,",
    "Hey, welcome in,",
    "Evening. Let's get into it,",
    "Settling in for the night,",
    "Good evening, glad you're here,",
  ];
  const dayOfYear = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(now.getFullYear(), 0, 0)) / 86400000);
  const minuteWindow = Math.floor(now.getMinutes() / 10);
  const pickStable = (arr: string[]) => {
    const seed = dayOfYear * 31 + hour * 7 + minuteWindow;
    return arr[seed % arr.length];
  };
  if (hour < 5) return pickStable(lateNight);
  if (hour < 12) return pickStable(m);
  if (hour < 18) return pickStable(a);
  return pickStable(e);
}

interface ModalData {
  title: string; subtitle: string; image: string;
  body: React.ReactNode; links: { label: string; url: string }[];
  preloadImages?: string[];
  imageClassName?: string;
}

interface SpotifyData { isPlaying: boolean; title?: string; artist?: string; url?: string; }

const experiences: { role: string; prev?: string; org: string; date: string; image: string; modal: ModalData; }[] = [
  {
    role: "Machine Learning Engineer Intern", org: "Colossal Biosciences", date: "January 2026 – Present", image: "/colossal-cover.jpg",
    modal: {
      title: "Colossal Biosciences", subtitle: "Machine Learning Engineer Intern · January 2026 – Present", image: "/colossal-cover.jpg",
      preloadImages: ["/colossal-cover.jpg"],
      body: (
        <>
          <p className="modal-body">Working with some really cool tech at the intersection of biology and AI. Building a knowledge-augmented graph system, integrating LLMs into the biomedical research pipeline, and learning a ton about the space every day.</p>
        </>
      ),
      links: [{ label: "Colossal", url: "https://colossal.com" }],
    },
  },
  {
    role: "sponsorships & experience", org: "HackUTD", date: "January 2025 – Present", image: "/hackutd-2025.jpg",
    modal: {
      title: "HackUTD", subtitle: "sponsorships & experience · January 2025 – Present", image: "/hackutd1-drawer.jpg",
      preloadImages: ["/hackutd1-drawer.jpg", "/hackutd2-drawer.jpg"],
      body: (
        <>
          <div className="modal-split">
            <img src="/hackutd2-drawer.jpg" alt="HackUTD event" className="modal-split-image" loading="eager" fetchPriority="high" decoding="async" />
            <div className="modal-split-text">
              <h3 className="modal-section-title">The Tavern & Point System</h3>
              <p className="modal-body">
                {"I got the inspiration for the point system we ended up using at last HackUTD from Hack The North, where they turned their entire hackathon into a game with quests, rewards, and community hubs. You can "}
                <a href="https://hackthenorth.medium.com/honk-how-goose-games-turned-hack-the-north-into-a-game-2bf222419f35" target="_blank" rel="noopener noreferrer" className="modal-inline-link">read about it here</a>.
                {" We built The Tavern as a community hub to reward exploration, collaboration, and creative participation beyond just the final submission."}
              </p>
            </div>
          </div>
          <p className="modal-body">
            {"Designing technical workshops for 1,500+ hackers at America's largest first-major collegiate hackathon. Previously served as Experience Coordinator, raising project-completion 30% and satisfaction 25% through structured tutorials and hands-on support."}
          </p>
        </>
      ),
      links: [{ label: "HackUTD", url: "https://hackutd.co/" }],
    },
  },
  {
    role: "Research Director & Lead", org: "Association for Computing Machinery", date: "January 2024 – January 2026", image: "/researchbanner.png",
    modal: {
      title: "ACM Research", subtitle: "Director (Jan 2025 – Jan 2026) · Lead (May 2024 – Dec 2024)", image: "/research-banner-modal.jpg",
      preloadImages: ["/research1-modal.jpg"],
      body: (
        <>
          <div className="modal-split">
            <div className="modal-split-text">
              <p className="modal-body">As Research Director, I increased the project-completion rate by 25% for 80+ researchers by introducing a two-stage proposal review and weekly stand-ups — which also doubled symposium turnout. Applications jumped from 200 to 400 per semester, and we made it prestigious: only 10% were accepted.</p>
            </div>
            <img src="/research1-modal.jpg" alt="ACM Research" className="modal-split-image" loading="lazy" decoding="async" />
          </div>
          <p className="modal-body">
            As Research Lead, I guided a 5-member team to a 1st-place win with NeuroVision — a hybrid CNN-GNN pipeline for EEG classification that boosted accuracy from 65% to 75% and has since been adopted by six other research teams.
          </p>
        </>
      ),
      links: [{ label: "ACM @ UTD", url: "https://acmutd.co/research" }],
    },
  },
  {
    role: "Co-founder", org: "Sola", date: "April 2025 – October 2025", image: "/sola-cover.png",
    modal: {
      title: "Sola", subtitle: "Co-founder · Telora Finalist · April 2025 – October 2025", image: "/sola-sahas-modal.jpg",
      preloadImages: ["/telora-sola.png"],
      body: (
        <>
          <p className="modal-body">What started as a Google Meet turned into a flight to Miami. Telora Decision Day gathered about twenty of the sharpest student founders in one room, and I was humbled to be there — one intense day of ideas, honest feedback, and mentorship that left me more determined than ever to grow Sola into something special.</p>
          <div className="modal-split">
            <div className="modal-split-text">
              <p className="modal-body">Sola is a semantic search engine for undergrads, grads, and PhDs — making it effortless to discover research labs, faculty advisors, papers, and funding opportunities. We shipped a full-stack MVP with React, Next.js, Firebase, LangChain, and OpenAI, indexing over 1,000 labs, clubs, and grants across universities.</p>
            </div>
            <img src="/telora-sola.png" alt="Sola team at Telora" className="modal-split-image" loading="lazy" decoding="async" />
          </div>
          <p className="modal-body">{"Leading an 8-member cross-campus team (UT Austin & Purdue) via GitHub Projects with weekly sprints. Cut merge conflicts by 35%, onboarded 50+ beta users, secured faculty pilot agreements at UT Austin and Purdue, and initiated MIT outreach. Back to work — big updates soon."}</p>
        </>
      ),
      links: [{ label: "Site", url: "https://www.joinsola.live/" }],
    },
  },
];

const projects: { name: string; tag: string; tech: string; image: string; modal: ModalData; }[] = [
  {
    name: "NeuroVision", tag: "1st Place Best Research", tech: "Python · PyTorch · EEGNet", image: "/neurovision-card.jpg",
    modal: {
      title: "NeuroVision", subtitle: "1st Place Best Research · ACM Research Symposium · August 2024", image: "/research2-modal.jpg",
      preloadImages: ["/neurovision2-modal.jpg"],
      body: (
        <>
          <p className="modal-body">As the lead on this project, I had the privilege of guiding our team as we developed an innovative hybrid model combining Graph Convolutional Networks and Compact CNNs to analyze EEG signals. Our research focused on enhancing the accuracy and generalization of EEG-based classification, paving the way for advancements in Brain-Computer Interfaces for seizure detection and motor imagery tasks.</p>
          <div className="modal-split">
            <div className="modal-split-text">
              <p className="modal-body">We raised PhysioNet EEG classification accuracy from 65% to 75% while shrinking parameters by 40%. The reusable CNN-GNN pipeline has since been adopted by six other research teams. Led a 5-person team with a Git-based workflow and faculty mentorship from Dr. Jiahui Guo, delivering reproducible Jupyter notebooks.</p>
            </div>
            <img src="/neurovision2-modal.jpg" alt="NeuroVision results" className="modal-split-image" loading="lazy" decoding="async" />
          </div>
        </>
      ),
      links: [],
    },
  },
  {
    name: "Doculabubu", tag: "1st Healthcare · 1st Video", tech: "TwelveLabs · Gemini · Flask", image: "/doculabubu-card.jpg",
    modal: {
      title: "Doculabubu", subtitle: "1st Place Best Healthcare App · 1st Place Best Video App · HackRice", image: "/doculabubu-banner-modal.jpg",
      preloadImages: ["/docu-modal.jpg"],
      body: (
        <>
          <p className="modal-body">Remember your telehealth visits, effortlessly. Doculabubu is an AI-powered telehealth assistant that helps patients remember and understand their doctor visits through intelligent voice queries and video analysis. Ask a question, get a 12–20 second video clip with captions showing exactly where your doctor answered — no hallucinations, just video receipts.</p>
          <div className="modal-split reverse">
            <img src="/docu-modal.jpg" alt="Doculabubu demo" className="modal-split-image" loading="lazy" decoding="async" />
            <div className="modal-split-text">
              <p className="modal-body">Built with TwelveLabs Pegasus + Marengo for semantic video search, Zoom API for automatic recording fetch, Gemini for quiz synthesis, and Google Cloud TTS for care-plan read-back. Also includes a gamified teach-back mode with a 3-heart system where patients answer questions about their visit to reinforce understanding.</p>
            </div>
          </div>
          <p className="modal-body">We were invited to the TwelveLabs Multimodal Seminar to demo the app to their team and community. Because no patient should have to say {"\"I forgot what my doctor told me.\""}</p>
        </>
      ),
      links: [{ label: "GitHub", url: "https://github.com/ChauhanSai/hackrice25" }, { label: "Demo", url: "https://devpost.com/software/matcha-bzrgx3" }],
    },
  },
  {
    name: "CatchUp", tag: "Best Pitch · 3rd Overall", tech: "Flask · GPT-4 · RAG", image: "/catchup-card.jpg",
    modal: {
      title: "CatchUp", subtitle: "1st Place Best Pitch · 3rd Place Overall · 1st Place Nebula Track · HackAI · March 2025", image: "/catchup1-modal.jpg",
      preloadImages: ["/catchup2-modal.jpg"],
      body: (
        <>
          <p className="modal-body">Get the full combo meal out of college. Too many students leave with just the burger — a degree — but miss the fries and drink. CatchUp is an AI-powered student optimization platform that helps you get the most out of your college experience: classes, clubs, labs, and professors, all wrapped into one smart, personalized combo.</p>
          <div className="modal-split">
            <div className="modal-split-text">
              <h3 className="modal-section-title">How it works</h3>
              <p className="modal-body">Upload your transcript and answer a few goal-driven questions. CatchUp uses RAG (LangChain + GPT-4) to parse transcript PDFs via Tesseract OCR, cross-index 5 campus data sources including the UTD Nebula API, and return personalized recommendations. The Professor Playground lets you compare professors by GPA trends, sentiment analysis, and schedules — simulate different combos until you find the right taste.</p>
            </div>
            <img src="/catchup2-modal.jpg" alt="CatchUp interface" className="modal-split-image" loading="lazy" decoding="async" />
          </div>
        </>
      ),
      links: [{ label: "GitHub", url: "https://github.com/sahasyy/HackAI" }, { label: "Demo", url: "https://devpost.com/software/mustard-837e9k" }],
    },
  },
  {
    name: "Earth2Echo", tag: "Best Use of Gemini", tech: "Gemini 2.5 · Lyria · Python", image: "/earth2echo.png",
    modal: {
      title: "Earth2Echo", subtitle: "Best Use of Gemini · HackTX", image: "/e2e-banner-modal.jpg",
      preloadImages: ["/e2e-modal.jpg"],
      body: (
        <>
          <p className="modal-body">{"Earth2Echo empowers creators, musicians, and filmmakers to transform live celestial or visual data into evolving, controllable soundscapes — blending Gemini 2.5's multimodal capabilities with Lyria's music generation for a truly universal experience."}</p>
          <div className="modal-split reverse">
            <img src="/e2e-modal.jpg" alt="Earth2Echo demo" className="modal-split-image" loading="lazy" decoding="async" />
            <div className="modal-split-text">
              <p className="modal-body">{"After winning Best Use of Gemini at HackTX, we had an investor call and a meeting with the Google DeepMind team to demo the app. The project sits at the intersection of generative AI, astronomy, and creative tooling — and it was one of the most fun things I've ever built."}</p>
            </div>
          </div>
        </>
      ),
      links: [{ label: "GitHub", url: "https://github.com/emw8105/hacktx-25" }],
    },
  },
  {
    name: "SecureCheck", tag: "1st Place · Goldman Sachs", tech: "TensorFlow · Flask · DNN", image: "/securecheck-card.jpg",
    modal: {
      title: "SecureCheck", subtitle: "1st Place · HackUNT · Goldman Sachs Track · November 2024", image: "/secure1-modal.jpg",
      preloadImages: ["/secure2-modal.jpg"],
      body: (
        <>
          <p className="modal-body">A three-pronged approach to fraud prevention: an AI-driven detection model for credit card transactions, an interactive quiz to educate users on identifying scams, and advanced audio/text analysis for detecting fraudulent calls and messages.</p>
          <div className="modal-split">
            <div className="modal-split-text">
              <p className="modal-body">We trained a custom DNN on public, MIT-licensed credit card transaction data, applying state-of-the-art techniques to handle class imbalance — achieving 96% validation accuracy. Built with Flask, HTML/CSS/JS, and Python. Spooky-season themed UI included (and a corporate version for the judges).</p>
            </div>
            <img src="/secure2-modal.jpg" alt="SecureCheck" className="modal-split-image" loading="lazy" decoding="async" />
          </div>
        </>
      ),
      links: [{ label: "GitHub", url: "https://github.com/sahasyy/SecureCheck" }],
    },
  },
  {
    name: "WhatDoesDaFoxSay", tag: "Best Use of Auth0", tech: "ElevenLabs · Gemini · MediaPipe", image: "/fox-card.jpg",
    modal: {
      title: "WhatDoesDaFoxSay", subtitle: "Best Use of Auth0 Platform", image: "/fox-banner.png",
      preloadImages: ["/fox2-modal.jpg"],
      body: (
        <>
          <p className="modal-body">Read with confidence, grow with patience. A calm, playful reading companion designed for children with dyslexia. It combines speech recognition, micro-expression analysis, and eye-tracking to create a personalized reading experience — while empowering parents with trust and transparency through Fox Mode, a serene space offering articles, scientific studies, and model explainability.</p>
          <div className="modal-split reverse">
            <img src="/fox2-modal.jpg" alt="WhatDoesDaFoxSay interface" className="modal-split-image" loading="lazy" decoding="async" />
            <div className="modal-split-text">
              <p className="modal-body">Built with ElevenLabs for speech recognition, Gemini for adaptive feedback, MediaPipe + OpenFace for gaze and emotion detection, and Auth0 for secure family accounts. The three-layer focus funnel (paragraph → sentence → word) pinpoints exactly where comprehension breaks down. Because no child should feel slow for learning differently.</p>
            </div>
          </div>
        </>
      ),
      links: [{ label: "GitHub", url: "https://github.com/veermshah/25HackUTA" }],
    },
  },
  {
    name: "ParkGuard", tag: "1st Place · ParkHub Track", tech: "YOLOv11 · PyTorch · OpenCV", image: "/park-card.jpg",
    modal: {
      title: "ParkGuard", subtitle: "1st Place · HackSMU · ParkHub Track", image: "/parkguard-modal.jpg",
      body: (
        <>
          <p className="modal-body">An AI-powered monitoring system that helps property owners find and correct ADA parking violations. Uses YOLOv11 for real-time detection of the International Symbol of Access on license plates, windows, and decals — processing at 300 fps with 3ms per frame inference, far exceeding the required 33ms threshold.</p>
          <p className="modal-body">{"Also includes a multimodal model for detecting obstructed spots and illegal parking. We created our own custom dataset combining open-source data and self-recorded footage when we couldn't find what we needed."}</p>
        </>
      ),
      links: [{ label: "GitHub", url: "https://github.com/sudocanttype/hacksmu2025" }],
    },
  },
  {
    name: "Fingertip Fluency", tag: "1st Place Best Research", tech: "Conformer · ASL · ML", image: "/fingerspell.jpg",
    modal: {
      title: "Fingertip Fluency", subtitle: "1st Place Best Research · ACM Research Symposium", image: "/fingertip-modal.jpg",
      preloadImages: ["/fingertip-modal.jpg"],
      body: (
        <p className="modal-body">Streamlining American Sign Language to text translation using a Conformer model. Our research explored innovative ways to enhance the efficiency and accuracy of ASL translation, leveraging cutting-edge machine learning techniques to make communication more accessible for the Deaf and Hard of Hearing community. Won first place at the ACM Research Symposium.</p>
      ),
      links: [],
    },
  },
];

const humanCards: { emoji: string; label: string; text: string; hoverImage: string; modal: ModalData }[] = [
  {
    emoji: "🎨", label: "Art", text: "How I slow down and see the world differently.",
    hoverImage: "/sketch-card.jpg",
    modal: {
      title: "Art", subtitle: "Sketching, painting, and seeing differently", image: "/sketch-card.jpg",
      preloadImages: ["/sketch-card.jpg"],
      body: (<p className="modal-body">{"Art has always been my way of slowing down. Whether it's sketching in a notebook or painting something on a canvas, it forces me to actually live in the present. I don't think of myself as an artist at all it's more like a practice. A way to stay grounded."}</p>),
      links: [],
    },
  },
  {
    emoji: "✍️", label: "Poetry", text: "Writing as a way to process, and reflect on my emotions.",
    hoverImage: "/poetry.png",
    modal: {
      title: "Poetry", subtitle: "Finding words for the things that don't have them", image: "/poetry.png",
      body: (<p className="modal-body">{"Writing poetry is how I process things I can't quite articulate in conversation. It's not about being a poet it's more about sitting with a feeling long enough to understand it. Some of the best clarity I've ever had came from trying to fit an emotion into a few lines."}</p>),
      links: [],
    },
  },
  {
    emoji: "🍳", label: "Cooking", text: "I love trying new recipes and cuisines from around the world.",
    hoverImage: "/cooking1-card.jpg",
    modal: {
      title: "Cooking", subtitle: "Tasting flavors from everywhere", image: "/cooking.jpg",
      preloadImages: ["/cooking.jpg"],
      imageClassName: "modal-image-cooking",
      body: (<p className="modal-body">{"I grew up around incredible food, my mom's cooking, Bombay street food, NYC Pizza, food adventures in Texas. Cooking is how I stay connected to all these places. I love the improvasation to it. There's something deeply satisfying about feeding people something you made. Follow my food journey on Beli! @sahasyy."}</p>),
      links: [],
    },
  },
  {
    emoji: "🎬", label: "Films", text: "A curated list of films that shaped how I see the world.",
    hoverImage: "/films-card.jpg",
    modal: {
      title: "Films", subtitle: "The ones that stayed with me", image: "/films-card.jpg",
      preloadImages: ["/gotf-poster.jpg", "/surfs-up.png", "/superman.png", "/lunchbox-poster.jpg", "/cars-poster.jpg"],
      body: (
        <div className="film-list">
          <div className="film-item"><span className="film-rank">1</span><img src="/gotf-poster.jpg" alt="Grave of the Fireflies" className="film-poster" loading="lazy" decoding="async" /><div className="film-info"><h4 className="film-title-text">Grave of the Fireflies</h4><p className="film-year">1988 · Studio Ghibli</p><p className="film-desc">{"The most devastating film I've ever seen. Isao Takahata's story of two siblings trying to survive in wartime Japan isn't just an anti-war film — it's a meditation on innocence, pride, and what we lose when the world falls apart around us. I've never cried harder."}</p></div></div>
          <div className="film-item"><span className="film-rank">2</span><img src="/surfs-up.png" alt="Surf's Up" className="film-poster" loading="lazy" decoding="async" /><div className="film-info"><h4 className="film-title-text">{"Surf's Up"}</h4><p className="film-year">2007 · Sony Pictures Animation</p><p className="film-desc">{"I know what you're thinking. But hear me out, Surf's Up is a mockumentary about penguins who surf, and it has no business being as emotionally intelligent as it is. It's about finding your own reason to do the thing you love, not for the trophy. Cody is my spirit animal."}</p></div></div>
          <div className="film-item"><span className="film-rank">3</span><img src="/superman.png" alt="Superman" className="film-poster" loading="lazy" decoding="async" /><div className="film-info"><h4 className="film-title-text">Superman</h4><p className="film-year">2025 · James Gunn</p><p className="film-desc">{"James Gunn brought back the Superman I needed: sincere, hopeful, and unafraid to be corny. In a world of dark, brooding superheroes, this film reminded me that the most radical thing you can be is kind. David Corenswet nailed it, and Krypto stole every scene."}</p></div></div>
          <div className="film-item"><span className="film-rank">4</span><img src="/lunchbox-poster.jpg" alt="The Lunchbox" className="film-poster" loading="lazy" decoding="async" /><div className="film-info"><h4 className="film-title-text">The Lunchbox</h4><p className="film-year">2013 · Ritesh Batra</p><p className="film-desc">{"A quiet, deeply human Bollywood film about two lonely people who connect through letters accidentally delivered in a lunchbox. It's tender and restrained, with performances that feel intimate and real."}</p></div></div>
          <div className="film-item"><span className="film-rank">5</span><img src="/cars-poster.jpg" alt="Cars" className="film-poster" loading="lazy" decoding="async" /><div className="film-info"><h4 className="film-title-text">Cars</h4><p className="film-year">2006 · Pixar Animation Studios</p><p className="film-desc">{"Pure comfort cinema for me. I'm a sucker for nostalgia, and Cars always takes me straight back to my childhood and that early Pixar magic."}</p></div></div>
        </div>
      ),
      links: [],
    },
  },
];

const monthlyQuote = {
  monthLabel: "February 2026",
  text: "Ultimately, i must be brave",
  polaroidKey: "quote-feb-2026",
  polaroidSrc: "/punch.jpg",
  polaroidCaption: "resiliant like punch",
};

type PolaroidLook = "amber" | "saffron" | "cyan" | "sunset" | "sage" | "petal" | "punch";
const POLAROID_LOOK_BY_KEY: Record<string, PolaroidLook> = {
  base: "amber",
  bombay: "saffron",
  jc: "cyan",
  dallas: "sunset",
  utd: "sage",
  dogs: "petal",
  "quote-feb-2026": "punch",
};
const FALLBACK_POLAROID_LOOKS: PolaroidLook[] = ["amber", "saffron", "cyan", "sunset", "sage", "petal", "punch"];
function getPolaroidLook(key: string): PolaroidLook {
  const known = POLAROID_LOOK_BY_KEY[key];
  if (known) return known;
  const seed = key.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return FALLBACK_POLAROID_LOOKS[seed % FALLBACK_POLAROID_LOOKS.length];
}

export default function Home() {
  const [greeting, setGreeting] = useState("");
  const nameRef = useRef<HTMLSpanElement>(null);
  const [activeModal, setActiveModal] = useState<ModalData | null>(null);
  const [modalSection, setModalSection] = useState<string>("");
  const openModal = (modal: ModalData, section: string) => { setActiveModal(modal); setModalSection(section); };
  const [spotify, setSpotify] = useState<SpotifyData>({ isPlaying: false });
  const [menuOpen, setMenuOpen] = useState(false);
  const [randomCity] = useState(() => cities[Math.floor(Math.random() * cities.length)]);
  const [activeSection, setActiveSection] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [showBuildNote, setShowBuildNote] = useState(false);
  const [interactionReady, setInteractionReady] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const skylineRef = useRef<HTMLDivElement>(null);
  const footerEndRef = useRef<HTMLDivElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const buildNoteCloseRef = useRef<HTMLButtonElement>(null);
  const drawerTriggerRef = useRef<HTMLElement | null>(null);
  const konamiRef = useRef<string[]>([]);
  const polaroidIdRef = useRef(1);
  const cursorRafRef = useRef<number>(0);
  const cursorPendingRef = useRef<{ x: number; y: number } | null>(null);
  const cursorLabelRef = useRef<HTMLDivElement>(null);
  const siteCursorRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLSpanElement>(null);
  const activeSectionRef = useRef("");
  const showBackToTopRef = useRef(false);
  const decodedDrawerImagesRef = useRef<Set<string>>(new Set());
  const [drawerImageReady, setDrawerImageReady] = useState(false);
  const [drawerBodyReady, setDrawerBodyReady] = useState(false);

  // Client-only greeting avoids SSR/CSR phrase mismatches and visual stutter.
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  // Delay non-critical warmups until interaction (or a short timeout) to keep first paint smooth.
  useEffect(() => {
    let done = false;
    const activate = () => {
      if (done) return;
      done = true;
      setInteractionReady(true);
    };
    const timer = window.setTimeout(activate, 2800);
    window.addEventListener("pointerdown", activate, { passive: true, once: true });
    window.addEventListener("keydown", activate, { once: true });
    window.addEventListener("scroll", activate, { passive: true, once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", activate);
      window.removeEventListener("keydown", activate);
      window.removeEventListener("scroll", activate);
    };
  }, []);

  const [polaroidStack, setPolaroidStack] = useState<{ id: number; key: string; src: string; caption: string; rotation: number; offsetX: number; offsetY: number; look: PolaroidLook; isNew: boolean }[]>([
    { id: 0, key: "base", src: "/me.jpg", caption: "NYC 12/24/25", rotation: 2.5, offsetX: 0, offsetY: 0, look: getPolaroidLook("base"), isNew: true },
  ]);

  const ensureDrawerImageDecoded = useCallback(async (src: string) => {
    if (!src || decodedDrawerImagesRef.current.has(src)) return;
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    try {
      if (typeof img.decode === "function") {
        await img.decode();
      } else {
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }
    } catch {
      // no-op
    } finally {
      decodedDrawerImagesRef.current.add(src);
    }
  }, []);

  const warmModalAssets = useCallback((modal: ModalData) => {
    const targets = [modal.image, ...(modal.preloadImages ?? [])].filter(Boolean);
    targets.forEach((src) => { void ensureDrawerImageDecoded(src); });
  }, [ensureDrawerImageDecoded]);

  // Warm only the first likely drawer interaction; other modals warm on hover/focus.
  useEffect(() => {
    if (!interactionReady) return;
    let timeoutId: number | null = null;
    let idleId: number | null = null;
    let cancelled = false;
    const prewarmQueue = [
      "/hackutd1-drawer.jpg",
      "/hackutd2-drawer.jpg",
    ];
    let index = 0;
    const warmNext = () => {
      if (cancelled || index >= prewarmQueue.length) return;
      const src = prewarmQueue[index++];
      void ensureDrawerImageDecoded(src).finally(() => {
        if (cancelled) return;
        if (index >= prewarmQueue.length) return;
        if (w.requestIdleCallback) idleId = w.requestIdleCallback(() => warmNext(), { timeout: 1600 });
        else timeoutId = window.setTimeout(warmNext, 90);
      });
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) idleId = w.requestIdleCallback(() => warmNext(), { timeout: 1200 });
    else timeoutId = window.setTimeout(warmNext, 220);
    return () => {
      cancelled = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      if (idleId !== null && w.cancelIdleCallback) w.cancelIdleCallback(idleId);
    };
  }, [ensureDrawerImageDecoded, interactionReady]);

  useEffect(() => {
    const hasNew = polaroidStack.some((p) => p.isNew);
    if (!hasNew) return;
    const timer = setTimeout(() => {
      setPolaroidStack((prev) => prev.map((p) => ({ ...p, isNew: false })));
    }, 7000);
    return () => clearTimeout(timer);
  }, [polaroidStack]);

  const togglePolaroid = useCallback((key: string, src: string, caption: string) => {
    setPolaroidStack((prev) => {
      const exists = prev.find((p) => p.key === key);
      if (exists) return prev.filter((p) => p.key !== key);
      const id = polaroidIdRef.current++;
      return [...prev, { id, key, src, caption, rotation: (Math.random() - 0.5) * 8, offsetX: (Math.random() - 0.5) * 16, offsetY: (Math.random() - 0.5) * 12, look: getPolaroidLook(key), isNew: true }];
    });
  }, []);

  const getMaxScroll = useCallback(() => Math.max(0, document.documentElement.scrollHeight - window.innerHeight), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (nightMode && e.key === "Escape") { setNightMode(false); return; }
      konamiRef.current.push(e.key);
      if (konamiRef.current.length > 10) konamiRef.current.shift();
      if (konamiRef.current.length === 10 && konamiRef.current.every((k, i) => k === KONAMI_CODE[i])) {
        setNightMode((prev) => !prev);
        konamiRef.current = [];
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nightMode]);

  // ── Unified scroll handler ──────────────────────────────────────────
  // One listener, one rAF, one layout read per frame. Handles:
  // • active section detection
  // • scroll progress bar + back-to-top visibility
  // • scroll-driven background color
  const scrollBgRef = useRef("");
  const sectionColors = useRef([
    { selector: ".section-hero", color: "#f6ecdc" },
    { selector: ".section-about", color: "#f5e9da" },
    { selector: ".section-experience", color: "#f4e8d9" },
    { selector: ".section-projects", color: "#f3e7d8" },
    { selector: ".section-human", color: "#f5eadb" },
    { selector: ".section-footer", color: "#f6ecdc" },
  ]);
  const sectionElsRef = useRef<Array<{ el: HTMLElement | null; color: string }>>([]);

  useEffect(() => {
    if (nightMode) {
      document.body.style.backgroundColor = "#1a1a1a";
      document.body.style.transition = "";
    } else {
      document.body.style.transition = "background-color 1.1s ease";
    }

    const resolveSectionElements = () => {
      sectionElsRef.current = sectionColors.current.map((s) => ({
        color: s.color,
        el: document.querySelector(s.selector) as HTMLElement | null,
      }));
    };
    resolveSectionElements();

    let rafId = 0;
    const tick = () => {
      rafId = 0;
      const y = window.scrollY;
      const maxScroll = getMaxScroll();
      const viewMid = window.innerHeight * 0.5;

      // 1) Scroll progress + back-to-top
      const progress = maxScroll > 0 ? Math.min(1, y / maxScroll) : 0;
      if (progressFillRef.current) {
        progressFillRef.current.style.transform = `scaleX(${progress})`;
      }
      const shouldShowBackToTop = y > 560;
      if (showBackToTopRef.current !== shouldShowBackToTop) {
        showBackToTopRef.current = shouldShowBackToTop;
        setShowBackToTop(shouldShowBackToTop);
      }

      // 2) Active section
      let nextSection = "";
      for (const id of ["about", "experience", "projects", "human"]) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= viewMid && rect.bottom > viewMid) nextSection = id;
        }
      }
      if (activeSectionRef.current !== nextSection) {
        activeSectionRef.current = nextSection;
        setActiveSection(nextSection);
      }

      // 3) Scroll-driven background color
      if (!nightMode) {
        let activeBg = sectionColors.current[0]?.color ?? "#f6ecdc";
        for (const s of sectionElsRef.current) {
          const el = s.el;
          if (el && el.getBoundingClientRect().top <= viewMid) activeBg = s.color;
        }
        if (activeBg !== scrollBgRef.current) {
          scrollBgRef.current = activeBg;
          document.body.style.backgroundColor = activeBg;
        }
      }

      // Scroll clamp removed — browser handles bounds natively
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(tick);
    };
    const onResize = () => {
      resolveSectionElements();
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    onScroll(); // initial run

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.body.style.transition = "";
    };
  }, [nightMode, getMaxScroll]);

  // Night mode body class
  useEffect(() => { if (nightMode) document.body.classList.add("night-mode"); else document.body.classList.remove("night-mode"); return () => document.body.classList.remove("night-mode"); }, [nightMode]);

  // Site-only plus cursor for desktop/fine-pointer devices.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => {
      document.body.classList.toggle("custom-cursor-on", mq.matches);
      if (!mq.matches) {
        document.body.classList.remove("custom-cursor-visible");
        if (cursorLabelRef.current) cursorLabelRef.current.classList.remove("visible");
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      document.body.classList.remove("custom-cursor-on");
      document.body.classList.remove("custom-cursor-visible");
    };
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => { const h = () => { if (window.innerWidth > 700) setMenuOpen(false); }; window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);

  // Spotify polling
  useEffect(() => { async function f() { try { const r = await fetch("/api/music"); setSpotify(await r.json()); } catch { setSpotify({ isPlaying: false }); } } f(); const i = setInterval(f, 30000); return () => clearInterval(i); }, []);

  useEffect(() => {
    const showSiteCursor = () => {
      if (document.body.classList.contains("custom-cursor-on")) {
        document.body.classList.add("custom-cursor-visible");
      }
    };
    const hideSiteCursor = () => {
      document.body.classList.remove("custom-cursor-visible");
      if (cursorLabelRef.current) cursorLabelRef.current.classList.remove("visible");
    };
    const flushCursor = () => {
      cursorRafRef.current = 0;
      const pending = cursorPendingRef.current;
      if (!pending) return;
      if (cursorLabelRef.current) {
        cursorLabelRef.current.style.transform = `translate3d(${pending.x + 16}px, ${pending.y + 16}px, 0)`;
      }
      if (siteCursorRef.current) {
        siteCursorRef.current.style.transform = `translate3d(${pending.x - 17}px, ${pending.y - 17}px, 0)`;
      }
      cursorPendingRef.current = null;
    };
    const onPointerMove = (e: PointerEvent) => {
      showSiteCursor();
      cursorPendingRef.current = { x: e.clientX, y: e.clientY };
      if (!cursorRafRef.current) cursorRafRef.current = window.requestAnimationFrame(flushCursor);
    };
    const onRootMouseEnter = () => showSiteCursor();
    const onRootMouseLeave = () => hideSiteCursor();
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") hideSiteCursor();
    };
    const onWindowBlur = () => hideSiteCursor();
    const rootEl = document.documentElement;
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    rootEl.addEventListener("mouseenter", onRootMouseEnter);
    rootEl.addEventListener("mouseleave", onRootMouseLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      rootEl.removeEventListener("mouseenter", onRootMouseEnter);
      rootEl.removeEventListener("mouseleave", onRootMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      if (cursorRafRef.current) window.cancelAnimationFrame(cursorRafRef.current);
      document.body.classList.remove("custom-cursor-visible");
    };
  }, []);


  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!nameRef.current) return;
    const r = nameRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    nameRef.current.style.backgroundPosition = `${x}% ${y}%`;
  }, []);
  const closeModal = useCallback(() => { setActiveModal(null); setModalSection(""); if (drawerTriggerRef.current) { drawerTriggerRef.current.focus(); drawerTriggerRef.current = null; } }, []);

  useEffect(() => {
    if (!activeModal) {
      setDrawerImageReady(false);
      setDrawerBodyReady(false);
      return;
    }
    const decodeTargets = [activeModal.image, ...(activeModal.preloadImages ?? [])].filter(Boolean);
    const uniqueTargets = [...new Set(decodeTargets)];
    setDrawerImageReady(false);
    setDrawerBodyReady(false);
    let cancelled = false;
    Promise.all(uniqueTargets.map((src) => ensureDrawerImageDecoded(src))).then(() => {
      if (cancelled) return;
      setDrawerImageReady(true);
      // let drawer animation settle first frame before heavy content paints
      requestAnimationFrame(() => {
        if (!cancelled) setDrawerBodyReady(true);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [activeModal, ensureDrawerImageDecoded]);

  useEffect(() => {
    if (!activeModal && !showBuildNote) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      if (activeModal) drawerCloseRef.current?.focus();
      else if (showBuildNote) buildNoteCloseRef.current?.focus();
    }, 100);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [activeModal, showBuildNote]);

  useEffect(() => {
    if (!activeModal) return;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeModal(); return; }
      if (e.key !== "Tab") return;
      const drawer = document.querySelector(".drawer.drawer-open") as HTMLElement;
      if (!drawer) return;
      const focusable = drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    };
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [activeModal, closeModal]);

  useEffect(() => {
    if (!showBuildNote) return;
    const handleBuildNoteKeys = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setShowBuildNote(false); return; }
      if (e.key !== "Tab") return;
      const modal = document.querySelector(".build-note-modal.open") as HTMLElement | null;
      if (!modal) return;
      const focusable = modal.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", handleBuildNoteKeys);
    return () => window.removeEventListener("keydown", handleBuildNoteKeys);
  }, [showBuildNote]);

  const scrollTo = (id: string) => { setMenuOpen(false); const section = document.getElementById(id); if (!section) return; const sectionTop = section.getBoundingClientRect().top + window.scrollY; const runwayPadding = parseFloat(getComputedStyle(section).paddingTop) || 114; const targetTop = sectionTop + runwayPadding - 56 - 120; window.scrollTo({ top: Math.max(0, Math.min(targetTop, getMaxScroll())), behavior: "smooth" }); };
  const showCursor = useCallback((t: string) => {
    const el = cursorLabelRef.current;
    if (!el) return;
    if (el.textContent !== t) el.textContent = t;
    el.classList.add("visible");
  }, []);
  const hideCursor = useCallback(() => {
    const el = cursorLabelRef.current;
    if (!el) return;
    el.classList.remove("visible");
  }, []);
  const openModalFrom = (modal: ModalData, section: string, e: React.MouseEvent | React.KeyboardEvent) => { drawerTriggerRef.current = e.currentTarget as HTMLElement; openModal(modal, section); };
  const handleCardKey = (e: React.KeyboardEvent, modal: ModalData, section: string) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModalFrom(modal, section, e); } };

  const [sectionRevealed, setSectionRevealed] = useState<Record<string, boolean>>({});
  const handleSectionProgress = useCallback((key: string) => (progress: number) => { setSectionRevealed(prev => { const should = progress > 0.56; if (prev[key] === should) return prev; return { ...prev, [key]: should }; }); }, []);
  const showLandingAnnouncement = showAnnouncement && activeSection === "" && !showBackToTop && !menuOpen;

  return (
    <div className="site-shell">
      <a href="#about" className="skip-link" onClick={(e) => { e.preventDefault(); scrollTo("about"); }}>Skip to content</a>

      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-bar">
          <div className="navbar-inner">
            <a href="#top" className="navbar-name" onClick={(e) => { e.preventDefault(); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <img src="/hirono-nav.png" alt="Sahas Sharma — home" style={{ height: "32px", width: "auto", display: "block" }} />
            </a>
            <div className="navbar-links" role="list">
              <button role="listitem" className={`navbar-link ${activeSection === "experience" ? "active" : ""}`} onClick={() => scrollTo("experience")}>Experience</button>
              <button role="listitem" className={`navbar-link ${activeSection === "projects" ? "active" : ""}`} onClick={() => scrollTo("projects")}>Projects</button>
              <a role="listitem" href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="navbar-link">Résumé</a>
              <a role="listitem" href="https://www.linkedin.com/in/sahassharma/" target="_blank" rel="noopener noreferrer" className="navbar-link">LinkedIn</a>
            </div>
            <button className={`hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" aria-expanded={menuOpen}>
              <span className="hamburger-line" /><span className="hamburger-line" /><span className="hamburger-line" />
            </button>
          </div>
        </div>
        <div className="navbar-feather" aria-hidden="true"><div className="navbar-feather-inner" /></div>
        <div className="scroll-progress" aria-hidden="true"><span ref={progressFillRef} className="scroll-progress-fill" /></div>
      </nav>

      {showLandingAnnouncement && (
        <div className="landing-announcement-shell">
          <div className="site-banner" role="status" aria-live="polite">
            <div className="site-banner-inner">
              <span className="site-banner-copy">
                {siteAnnouncement.text}{" "}
                <a href={siteAnnouncement.href} target="_blank" rel="noopener noreferrer" className="site-banner-link">
                  {siteAnnouncement.linkLabel}
                </a>
              </span>
            </div>
            <button type="button" className="site-banner-close" aria-label="Dismiss update banner" onClick={() => setShowAnnouncement(false)}>
              ×
            </button>
          </div>
        </div>
      )}

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`} role="menu" aria-hidden={!menuOpen}>
        <div className="mobile-menu-grid">
          <button role="menuitem" className="mobile-menu-link" onClick={() => scrollTo("experience")}>Experience</button>
          <button role="menuitem" className="mobile-menu-link" onClick={() => scrollTo("projects")}>Projects</button>
          <a role="menuitem" href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>Résumé</a>
          <a role="menuitem" href="https://www.linkedin.com/in/sahassharma/" target="_blank" rel="noopener noreferrer" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>LinkedIn</a>
        </div>
      </div>

      <main id="top">
        {/* Hero */}
        <div className="scroll-runway section-hero">
          <div className="sticky-panel">
            <div className="section-inner">
              <section className="hero" aria-label="Introduction">
                <div className="hero-layout">
                  <div className="hero-copy">
                    <div className="hero-line hero-line-1">
                      <h1 className="greeting" aria-live="polite">
                        {greeting ? (
                          <span className="greeting-phrase">
                            {greeting.split(" ").map((word, i) => (
                              <span key={`${greeting}-${word}-${i}`} className="greeting-word" style={{ "--word-index": i } as React.CSSProperties}>
                                {word}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span className="greeting-placeholder" aria-hidden="true">{"\u00A0"}</span>
                        )}
                      </h1>
                    </div>
                    <div className="hero-line hero-line-2"><h1 className="hero-name" onMouseMove={handleMouseMove}>{"I'm "}<span ref={nameRef} className="gradient-name">Sahas Sharma.</span></h1></div>
                  </div>
                  <div className="hero-seagull" aria-hidden="true"><DitheredStill src="/seagull.png" className="hero-seagull-canvas" nightMode={nightMode} /></div>
                </div>
              </section>
            </div>
            <div className="scroll-hint" aria-hidden="true"><span className="scroll-hint-arrow" /></div>
          </div>
        </div>

        {/* About */}
        <div className="scroll-runway section-about" id="about">
          <div className="sticky-panel">
            <div className="section-inner">
              <section aria-label="About me">
                <ScrollRevealText text="About" className="section-title" startSize={140} endSize={52} onProgress={handleSectionProgress("about")} />
                <div className={`section-content ${sectionRevealed.about ? "revealed" : ""}`}>
                  <div className="about-container">
                    <div className="about-text about-text-reveal">
                      <p className="body-text">{"Originally from "}<span className={`about-keyword ${polaroidStack.some(p => p.key === "bombay") ? "about-keyword-active" : ""}`} onClick={() => togglePolaroid("bombay", "/mumbai.jpg", "eating a gola")} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePolaroid("bombay", "/mumbai.jpg", "eating a gola"); } }}>Bombay</span>{", raised in "}<span className={`about-keyword ${polaroidStack.some(p => p.key === "jc") ? "about-keyword-active" : ""}`} onClick={() => togglePolaroid("jc", "/jersey.jpg", "jersey city, nj")} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePolaroid("jc", "/jersey.jpg", "jersey city, nj"); } }}>Jersey City</span>{", and now based in "}<span className={`about-keyword ${polaroidStack.some(p => p.key === "dallas") ? "about-keyword-active" : ""}`} onClick={() => togglePolaroid("dallas", "/dallas.jpg", "dallas, tx")} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePolaroid("dallas", "/dallas.jpg", "dallas, tx"); } }}>Dallas, Texas</span>{", I've called a lot of places home. I'm a computer science student at "}<span className={`about-keyword ${polaroidStack.some(p => p.key === "utd") ? "about-keyword-active" : ""}`} onClick={() => togglePolaroid("utd", "/utdallas.jpg", "ut dallas")} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePolaroid("utd", "/utdallas.jpg", "ut dallas"); } }}>UT Dallas</span>{" on the AI track, with a deep interest in machine learning and the systems that power it."}</p>
                      <p className="body-text" style={{ marginTop: "0.75rem" }}>{"Outside of work, I help care for two service dogs, "}<span className={`about-keyword ${polaroidStack.some(p => p.key === "dogs") ? "about-keyword-active" : ""}`} onClick={() => togglePolaroid("dogs", "/idris-ling.jpg", "idris & ling 🐾")} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePolaroid("dogs", "/idris-ling.jpg", "idris & ling 🐾"); } }}>Idris and Ling</span>{", and try to lead with kindness in everything I do. I believe the best technology is built by people who care about other people."}</p>
                      <p className="about-monthly-quote"><span className="about-monthly-quote-label">{monthlyQuote.monthLabel}:</span>{" "}<span className={`about-monthly-quote-link ${polaroidStack.some((p) => p.key === monthlyQuote.polaroidKey) ? "about-monthly-quote-link-active" : ""}`} onClick={() => togglePolaroid(monthlyQuote.polaroidKey, monthlyQuote.polaroidSrc, monthlyQuote.polaroidCaption)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePolaroid(monthlyQuote.polaroidKey, monthlyQuote.polaroidSrc, monthlyQuote.polaroidCaption); } }}>&ldquo;{monthlyQuote.text}&rdquo;</span></p>
                    </div>
                    <div className="polaroid-wrapper polaroid-drop-reveal" aria-hidden="true">
                      <div className="polaroid-stack">
                        {polaroidStack.map((p, i) => (
                          <div key={p.id} className={`polaroid polaroid-stacked polaroid-look-${p.look} ${p.isNew && i > 0 ? "polaroid-entering" : ""}`} style={{ zIndex: i + 1, transform: `rotate(${p.rotation}deg) translate(${p.offsetX}px, ${p.offsetY}px)` }}>
                            <div className="polaroid-image-wrapper"><img src={p.src} alt={p.caption} className="polaroid-image" loading="lazy" decoding="async" />{p.isNew && <div className={`polaroid-develop ${p.id === 0 ? "polaroid-develop-initial" : ""}`} />}</div>
                            <p className="polaroid-caption">{p.caption}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Experience */}
      <div className="scroll-runway section-experience" id="experience">
          <div className="sticky-panel">
            <div className="section-inner">
              <section aria-label="Work experience" className="experience-section-wrap">
                <div className={`experience-lily ${sectionRevealed.experience ? "revealed" : ""}`} aria-hidden="true">
                  <DitheredStill src="/lily-lite.png" className="experience-lily-canvas" nightMode={nightMode} />
                </div>
                <ScrollRevealText text="Experience" className="section-title" startSize={140} endSize={52} onProgress={handleSectionProgress("experience")} />
                <div className={`section-content ${sectionRevealed.experience ? "revealed" : ""}`}>
                  <div className="experience-grid" role="list">
                    {experiences.map((exp, i) => (
                      <div key={i} className="experience-card" role="listitem" tabIndex={0} onClick={(e) => openModalFrom(exp.modal, "experience", e)} onKeyDown={(e) => handleCardKey(e, exp.modal, "experience")} onMouseEnter={() => { showCursor("View details"); warmModalAssets(exp.modal); }} onMouseLeave={hideCursor} onFocus={() => warmModalAssets(exp.modal)} onTouchStart={() => warmModalAssets(exp.modal)} style={{ animationDelay: `${i * 60}ms` }}>
                        <img src={exp.image} alt="" className="experience-card-bg" loading="lazy" decoding="async" />
                        <div className="experience-card-content">
                          <div className="experience-left"><span className="experience-role">{exp.role}{exp.prev && <span className="experience-prev">{" · "}{exp.prev}</span>}</span><span className="experience-org">{exp.org}</span></div>
                          <span className="experience-date">{exp.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="scroll-runway section-projects" id="projects">
          <div className="sticky-panel">
            <div className="section-inner">
              <section aria-label="Projects">
                <ScrollRevealText text="Projects" className="section-title" startSize={140} endSize={52} onProgress={handleSectionProgress("projects")} />
                <div className={`section-content ${sectionRevealed.projects ? "revealed" : ""}`}>
                  <div className="project-grid-wrap">
                    <div className={`projects-dino ${sectionRevealed.projects ? "revealed" : ""}`} aria-hidden="true">
                      <DitheredStill src="/dino.png" className="projects-dino-canvas" nightMode={nightMode} />
                    </div>
                    <div className={`project-route-lines ${sectionRevealed.projects ? "revealed" : ""}`} aria-hidden="true">
                      <span className="project-route route-a" />
                      <span className="project-route route-b" />
                    </div>
                    <div className="project-grid" role="list">
                    {projects.map((proj, i) => (
                      <div key={i} className="project-card" role="listitem" tabIndex={0} onClick={(e) => openModalFrom(proj.modal, "projects", e)} onKeyDown={(e) => handleCardKey(e, proj.modal, "projects")} onMouseEnter={() => { showCursor("View project"); warmModalAssets(proj.modal); }} onMouseLeave={hideCursor} onFocus={() => warmModalAssets(proj.modal)} onTouchStart={() => warmModalAssets(proj.modal)} style={{ animationDelay: `${i * 50}ms` }}>
                        <img src={proj.image} alt="" className="project-card-bg" loading="lazy" decoding="async" />
                        <div className="project-card-content"><span className="project-tag">{proj.tag}</span><h3 className="project-name">{proj.name}</h3><p className="project-tech">{proj.tech}</p></div>
                      </div>
                    ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Human */}
        <div className="scroll-runway section-human" id="human">
          <div className="sticky-panel">
            <div className="section-inner">
              <section aria-label="Personal interests">
                <ScrollRevealText text="Human" className="section-title" startSize={110} endSize={44} onProgress={handleSectionProgress("human")} />
                <div className={`section-content ${sectionRevealed.human ? "revealed" : ""}`}>
                  <div className="human-grid" role="list">
                    {humanCards.map((item, i) => (
                      <div key={i} className="human-card" role="listitem" tabIndex={0} onClick={(e) => openModalFrom(item.modal, "human", e)} onKeyDown={(e) => handleCardKey(e, item.modal, "human")} onMouseEnter={() => warmModalAssets(item.modal)} onFocus={() => warmModalAssets(item.modal)} onTouchStart={() => warmModalAssets(item.modal)} style={{ animationDelay: `${i * 60}ms` }}>
                        <img src={item.hoverImage} alt="" className="human-card-bg" loading="lazy" decoding="async" />
                        <div className="human-card-content"><span className="human-note" aria-hidden="true">{`field note ${String(i + 1).padStart(2, "0")}`}</span><h3 className="human-label">{item.label}</h3><p className="body-text">{item.text}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="scroll-runway runway-footer section-footer">
        <div className="sticky-panel">
          <footer className="footer" role="contentinfo">
            <div className="footer-inner">
              <span className="footer-text">{"© 2026 Sahas Sharma. Built with care."}</span>
              <div className="footer-links">
                <a href="https://github.com/sahasyy" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
                <button
                  type="button"
                  className={`footer-link footer-link-button ${showBuildNote ? "active" : ""}`}
                  onClick={() => setShowBuildNote(true)}
                  aria-expanded={showBuildNote}
                  aria-controls="build-note-modal"
                  aria-haspopup="dialog"
                >
                  Build
                </button>
                <a href="mailto:sahassharma19@gmail.com" className="footer-link">Email</a>
              </div>
              <div className="footer-spotify" aria-live="polite">
                {spotify.isPlaying && spotify.title ? (<><span className="spotify-dot" aria-hidden="true" />{"Currently listening to "}<a href={spotify.url} target="_blank" rel="noopener noreferrer" className="spotify-track">{spotify.title}</a>{" by "}{spotify.artist}</>) : (<><span className="spotify-dot offline" aria-hidden="true" />{"Not playing anything right now"}</>)}
              </div>
              <div className="footer-webring"><a href="https://cs.utdring.com/#sahassharma.com?nav=prev" className="webring-arrow-link" aria-label="Previous in CS Webring">←</a><a href="https://cs.utdring.com/#sahassharma.com" target="_blank" rel="noopener noreferrer" className="webring-logo-link"><img src="https://cs.utdring.com/icon.black.svg" alt="CS Webring" className="webring-logo" loading="lazy" decoding="async" /></a><a href="https://cs.utdring.com/#sahassharma.com?nav=next" className="webring-arrow-link" aria-label="Next in CS Webring">→</a></div>
            </div>
            <div className="skyline-full-bleed" ref={skylineRef} aria-hidden="true"><DitheredSkyline src={nightMode ? "/earth.png" : randomCity.src} nightMode={nightMode} /></div>
            <div ref={footerEndRef} aria-hidden="true" />
          </footer>
        </div>
      </div>

      <div className={`build-note-modal-backdrop ${showBuildNote ? "open" : ""}`} onClick={() => setShowBuildNote(false)} aria-hidden="true" />
      <div
        id="build-note-modal"
        className={`build-note-modal ${showBuildNote ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="build-note-title"
        aria-hidden={!showBuildNote}
        onClick={() => setShowBuildNote(false)}
      >
        <aside className="build-note build-note-modal-card" role="note" aria-label="Build details" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="build-note-close" onClick={() => setShowBuildNote(false)} aria-label="Close build details" ref={buildNoteCloseRef}>✕</button>
          <p className="build-note-title" id="build-note-title">Build notes</p>
          <p className="build-note-line">This was built using TypeScript and custom CSS.</p>
          <p className="build-note-line">Dither effect overlay on images.</p>
          <p className="build-note-line">Colors: background #f3eee8, text #372e28, muted #6a6056, accent #a35b3c, border #c9beb2, amber focus #c98a34.</p>
          <p className="build-note-line">Amber theme.</p>
          <p className="build-note-line">Fonts: Neco and Architekt.</p>
          <p className="build-note-line">Last updated March 10, 2026.</p>
        </aside>
      </div>

      {/* Drawer */}
      <div className={`drawer-backdrop ${activeModal ? "drawer-open" : ""}`} onClick={closeModal} aria-hidden="true" />
      <div className={`drawer ${activeModal ? "drawer-open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer-frame" aria-hidden="true" />
        <div className="drawer-header">
          <span className="drawer-tab">{modalSection}</span>
          <button className="modal-close" onClick={closeModal} aria-label="Close drawer" ref={drawerCloseRef}>✕</button>
        </div>
        {activeModal && (
          <div className="drawer-body">
            <img
              src={activeModal.image}
              alt=""
              className={`modal-image ${drawerImageReady ? "ready" : "pending"} ${activeModal.imageClassName ?? ""}`}
              loading="eager"
              decoding="async"
            />
            <h2 className="modal-title" id="drawer-title">{activeModal.title}</h2>
            <p className="modal-subtitle">{activeModal.subtitle}</p>
            {drawerBodyReady ? activeModal.body : <div className="drawer-body-placeholder" aria-hidden="true" />}
            {activeModal.links.length > 0 && (
              <div className="modal-links">
                {activeModal.links.map((l, i) => (
                  <a key={i} href={l.url} className="modal-link" target="_blank" rel="noopener noreferrer">{l.label}<span className="dotted-arrow dotted-arrow-up-right" aria-hidden="true" /></a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div ref={siteCursorRef} className="site-cursor-plus" aria-hidden="true" />
      <div ref={cursorLabelRef} className="cursor-label" aria-hidden="true" />
      <button className={`back-to-top ${showBackToTop ? "visible" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">Back to top</button>

      <NightMode active={nightMode} />
    </div>
  );
}
