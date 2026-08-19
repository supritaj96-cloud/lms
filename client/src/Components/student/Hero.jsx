import React from 'react'
import { assets } from '../../assets/LMS_assets/assets/assets'
import SearchBar  from './SearchBar'

const Hero = () => {
  return (
    <div className='flex min-h-[500px] flex-col items-center justify-center w-full px-7 pt-20 text-center space-y-7 bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eef2ff_36%,#f5f7fb_75%)] md:pt-32 md:px-0'>
      <h1 className='relative mx-auto max-w-[700px] text-[28px] font-bold leading-[1.1] text-gray-800 sm:text-5xl md:text-[56px]'>
        Empower your future with the courses designed to
        <span className='mt-2 block text-[#3159d7]'>fit your choice.</span>
        <img src={assets.sketch} alt="sketch" className='md:block hidden absolute -bottom-7 right-0'/>
      </h1>

      <p className='md:block hidden text-gray-500 max-w-2xl mx-auto'>We bring together world-class instructors, interactive content, and a supportive community to help you achieve your personal and professional goals.</p>

      <p className='md:hidden text-gray-500 max-w-sm mx-auto'>We bring together world-class instructors to help you achieve your professional goals.</p>
      <SearchBar/>
    </div>
  )
}

export default Hero
