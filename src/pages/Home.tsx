import React from 'react';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Services from '../components/sections/Services';
import Gallery from '../components/sections/Gallery';
import Testimonials from '../components/sections/Testimonials';
import Showcase from '../components/sections/Showcase';
import Footer from '../components/layout/Footer';
import { Project } from '../types';

const Home = () => {
  return (
    <>
      <Hero />
      <About />
      <Gallery />
      <Services />
      <Testimonials />
      <Showcase />
      <Footer />
    </>
  );
};

export default Home;
