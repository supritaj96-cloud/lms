import React from 'react'
import Hero from '../../Components/student/Hero'
import Companies from '../../Components/student/Companies'
import CoursesSection from '../../Components/student/CoursesSection'
import TestimonialsSection from '../../Components/student/TestimonialsSection'
import CallToAction from '../../Components/student/CallToAction'
import Footer from '../../Components/student/Footer'

const Home = () => {
  return (
    <div className='flex flex-col items-center space-y-7 text-center'>
      <Hero/>
      <Companies />
      <CoursesSection />
      <TestimonialsSection />
      <CallToAction />
      <Footer />
    </div>
  )
}

export default Home