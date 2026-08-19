import React from 'react'
import { assets } from '../../assets/LMS_assets/assets/assets';
import { UserButton, useUser } from '@clerk/clerk-react'
import Brand from '../Brand';


const Navbar = () => {
  const { user } = useUser()

  return (
    <div className='sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl md:px-8'>
      <Brand />
      <div className="flex items-center gap-5 text-gray-500 relative">
        <p>Hi! {user ? user.fullName : 'Developers'}</p>
        {user ? <UserButton /> : <img className='max-w-8' src={assets.profile_img} />}
      </div>
    </div>
  )
}

export default Navbar
