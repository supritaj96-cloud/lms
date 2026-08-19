import { Link } from 'react-router-dom'

const Brand = ({ light = false, className = '' }) => (
  <Link to='/' className={`inline-flex items-center gap-2 font-bold tracking-tight ${light ? 'text-white' : 'text-slate-900'} ${className}`} aria-label='SkillBridge home'>
    <span className='grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg font-black text-white shadow-lg shadow-blue-500/25'>S</span>
    <span className='text-xl'>Skill<span className='text-blue-600'>Bridge</span></span>
  </Link>
)

export default Brand
