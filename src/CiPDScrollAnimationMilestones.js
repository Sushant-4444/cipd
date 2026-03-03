import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const StoryHero = () => {
  const containerRef = useRef(null);
  const videoRefs = [useRef(null), useRef(null), useRef(null)];
  const sectionRefs = [useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=400%", // Length of the scroll story
        scrub: 1,      // Smoothly ties animation to scrollbar
        pin: true,     // Keeps the section fixed on screen
      }
    });

    // Animate Video Transitions & Text Overlays
    tl.to(videoRefs[0].current, { opacity: 0, duration: 1 })
      .to(videoRefs[1].current, { opacity: 1, duration: 1 }, "<")
      .fromTo(sectionRefs[1].current, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
      
      .to(videoRefs[1].current, { opacity: 0, duration: 1, delay: 1 })
      .to(videoRefs[2].current, { opacity: 1, duration: 1 }, "<")
      .fromTo(sectionRefs[2].current, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1 });

  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black text-white">
      {/* Background Videos */}
      <div className="absolute inset-0">
        <video ref={videoRefs[0]} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0">
          <source src="/videos/1.mp4" type="video/mp4" />
        </video>
        <video ref={videoRefs[1]} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-0">
          <source src="/videos/2.mp4" type="video/mp4" />
        </video>
        <video ref={videoRefs[2]} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-0">
          <source src="/videos/3.mp4" type="video/mp4" />
        </video>
        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-black/50 z-10" />
      </div>

      {/* Story Sections (The Text) */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center">
        <div ref={sectionRefs[0]} className="absolute text-center px-6">
          <h1 className="text-7xl font-bold">CiPD</h1>
          <p className="text-2xl mt-4 italic">Innovation Begins with an Idea.</p>
        </div>
        
        <div ref={sectionRefs[1]} className="absolute text-center px-6 opacity-0">
          <h2 className="text-5xl font-semibold">We Build the Future</h2>
          <p className="text-xl mt-4 max-w-lg">Transforming academic research into intelligent hardware at IIIT-Delhi.</p>
        </div>

        <div ref={sectionRefs[2]} className="absolute text-center px-6 opacity-0">
          <h2 className="text-5xl font-semibold">Industry Ready</h2>
          <p className="text-xl mt-4 max-w-lg">Bridging the gap from lab prototypes to production-grade products.</p>
        </div>
      </div>
    </div>
  );
};

export default StoryHero;