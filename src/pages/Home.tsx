import React from 'react';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Services from '../components/sections/Services';
import Gallery from '../components/sections/Gallery';
import Testimonials from '../components/sections/Testimonials';
import Footer from '../components/layout/Footer';
import { Project } from '../types';

const Home = () => {
  return (
    <div className="bg-white">
      <Hero />
      <div className="space-y-0">
        <About />
        <Services />
        <Gallery />
        <Testimonials />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
