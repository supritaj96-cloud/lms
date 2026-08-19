import React, { useContext } from 'react'
import { assets } from '../../assets/LMS_assets/assets/assets'
import { Link } from 'react-router-dom'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { AppContext } from '../../context/AppContext'
import Brand from '../Brand'

const Navbar = () => {

  const {navigate, isEducator, getToken, request, setIsEducator} = useContext(AppContext)

  const isCourseListPage = location.pathname.includes('/course-list');

  const {openSignIn} = useClerk()
  const {user} = useUser()

  const openEducatorArea = async () => {
    if (!user) return openSignIn()
    if (isEducator) return navigate('/educator')
    try {
      const token = await getToken()
      await request('/api/educator/update-role', { method: 'POST', token })
      await user.reload()
      setIsEducator(true)
      navigate('/educator')
    } catch (error) {
      alert(error.message)
    }
  }



  return (
    <div className={`sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 px-4 py-4 backdrop-blur-xl sm:px-10 md:px-14 lg:px-36 ${isCourseListPage ? 'bg-white/90' : 'bg-[#f5f7fb]/90'}`}>
       <Brand />
       <div className='hidden md:flex items-center gap-5 text-gray-500'>
           <div className='flex items-center gap-5'> 
               { user && <>
                <button onClick={openEducatorArea}>{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
                | <Link to='/my-enrollments'>My Enrollments</Link>
                </>}
           </div>
          {user ? <UserButton /> :
          
            <button onClick={() => openSignIn()} className='sb-button-primary px-5 py-2'>Create Account</button>}
          
       </div>

       {/*for phone screens*/}

       <div className= 'md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
        <div className= 'flex items-center gap-1 sm:gap-2 max-sm:text-xs'>
          { user &&
           <>


          <button onClick={openEducatorArea}>{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>



          |  <Link to='/my-enrollments'>My Enrollments</Link>
          </>}
        </div>
        {
          user ? <UserButton /> 
         : <button onClick={() => openSignIn()}><img src={assets.user_icon} alt="" /></button>
        }
        
      </div>
    </div>
  )
}

export default Navbar
