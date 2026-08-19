import React, { useState } from 'react'
import { assets } from '../../assets/LMS_assets/assets/assets'
import { useNavigate } from 'react-router-dom'


const SearchBar = ({data}) => {

  const navigate = useNavigate()
  const [input, setInput] = useState(data ? data : '')

  const onSearchHandler = (e)=>{
    e.preventDefault()
    navigate('/course-list/' + input)
  }


  return (

      <form onSubmit={onSearchHandler} className='flex h-12 w-full max-w-xl items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/60 md:h-14'>
        <img src={assets.search_icon} alt="search_icon" className='md:w-auto w-10 px-3' />

        <input onChange={e => setInput(e.target.value)} value={input}
        type="text" placeholder='Search for courses' className='h-full w-full bg-transparent outline-none text-slate-600 placeholder:text-slate-400' />

        <button type='submit' className='rounded-xl bg-[#3159d7] px-5 py-2 font-semibold text-white transition hover:bg-[#243aa6] md:px-8'>Search</button>
      </form>

  )
}

export default SearchBar
