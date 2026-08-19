import React, { useContext } from 'react'
import { assets } from '../../assets/LMS_assets/assets/assets'
import { AppContext } from '../../context/AppContext'
import { Link } from 'react-router-dom'


const CourseCard = ({course}) => {

  const {currency, calculateRating } = useContext(AppContext)
  return (
    <Link to={'/course/' + course._id} onClick={() => scrollTo(0,0)}
    className='group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80'>
      <img className='aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-105' src={course.courseThumbnail} alt={`${course.courseTitle} thumbnail`} />
      <div className='p-4'>
        <div className='mb-2 flex items-center justify-between gap-2'><span className='rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700'>{course.category || 'General'}</span>{course.discount > 0 && <span className='text-xs font-semibold text-emerald-600'>{course.discount}% off</span>}</div>
        <h3 className='line-clamp-2 text-base font-semibold text-slate-800'>{course.courseTitle}</h3>
        <p className='mt-1 text-sm text-slate-500'>{course.educator?.name || 'SkillBridge Instructor'}</p>
        <div className='flex items-center space-x-2'>
          <p>{calculateRating(course)}</p>
          <div className='flex'>
            {[...Array(5)].map((_, i)=>(<img key={i} src={i < Math.floor(calculateRating(course)) ? assets.star : assets.star_blank} alt='' className='w-3.5 h-3.5' />))}
          </div>
          <p className='text-gray-500'>{course.courseRatings.length} </p>
        </div>
        <div className='mt-3 flex items-baseline gap-2'><p className='text-lg font-bold text-slate-900'>{currency}{(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}</p>{course.discount > 0 && <p className='text-xs text-slate-400 line-through'>{currency}{course.coursePrice.toFixed(2)}</p>}</div>
      </div>
    </Link>
  )
}

export default CourseCard
