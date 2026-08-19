import React, { useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import { NavLink } from 'react-router-dom';
import { assets } from '../../assets/LMS_assets/assets/assets';

const Sidebar = () => {

  const { isEducator } = useContext(AppContext)

  const menuItems = [
    { name: 'Dashboard', path: '/educator', icon: assets.home_icon},
    { name: 'Add Course', path: '/educator/add-course', icon: assets.add_icon},
    { name: 'My Courses', path: '/educator/my-courses', icon: assets.my_course_icon },
    { name: 'Student Enrolled', path: '/educator/student-enrolled', icon: assets.person_tick_icon },

  ];
  return isEducator && (
    <div className='md:w-64 w-16 min-h-screen border-r border-slate-200 bg-white py-3 text-base shadow-sm flex flex-col'>
      {menuItems.map((item)=>(
        <NavLink
        to={item.path}
        key={item.name}
        end={item.path === '/educator'}
        className={({isActive})=> `mx-2 flex items-center gap-3 rounded-xl py-3 md:flex-row md:justify-start md:px-5 flex-col justify-center ${isActive ? 'bg-blue-50 font-semibold text-[#3159d7]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
          <img src={item.icon} alt="" className="w-6 h-6" />
          <p className='md:block hidden text-center'>{item.name}</p>
        </NavLink>
      ))}
    </div>
  )
}

export default Sidebar
