import React, { useContext, useEffect, useRef, useState } from 'react'
import Quill from 'quill';
import { assets } from '../../assets/LMS_assets/assets/assets';

import { AppContext } from "../../context/AppContext";
import { useNavigate, useParams } from 'react-router-dom';

const AddCourse = () => {

  const createId = () => crypto.randomUUID();

  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const { getToken, request, fetchAllCourses } = useContext(AppContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [category, setCategory] = useState('General');
  const [isPublished, setIsPublished] = useState(false);
  const [image, setImage] = useState(null);

  const [chapters, setChapters] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);


  const [lectureDetails,setLectureDetails] = useState({
    lectureTitle:'',
    lectureDuration:'',
    lectureUrl:'',
    isPreviewFree:false
  });



  // Quill Editor

  useEffect(()=>{

    if(!quillRef.current && editorRef.current){

      quillRef.current = new Quill(
        editorRef.current,
        {
          theme:'snow'
        }
      );


      quillRef.current.on(
        'text-change',
        ()=>{
          setCourseDescription(
            quillRef.current.root.innerHTML
          )
        }
      )

    }

  },[]);

  useEffect(() => {
    const loadCourse = async () => {
      if (!isEditing) return
      try {
        const token = await getToken()
        const data = await request(`/api/educator/courses/${id}`, { token })
        const course = data.course
        setCourseTitle(course.courseTitle)
        setCourseDescription(course.courseDescription)
        setCoursePrice(course.coursePrice)
        setDiscount(course.discount)
        setCategory(course.category || 'General')
        setIsPublished(course.isPublished)
        setChapters(course.courseContent.map((chapter) => ({ ...chapter, collapsed: false })))
        if (quillRef.current) quillRef.current.root.innerHTML = course.courseDescription
      } catch (error) {
        alert(error.message)
        navigate('/educator/my-courses')
      }
    }
    loadCourse()
  }, [id])



  // Add Course API

  const addCourse = async()=>{

    try{


      const courseData = {

        courseTitle,

        courseDescription,

        coursePrice:Number(coursePrice),

        discount:Number(discount),

        courseContent: chapters,
        category,
        isPublished

      };



      const formData = new FormData();


      formData.append(
        "courseData",
        JSON.stringify(courseData)
      );


      if (image) formData.append("image", image);



      const token = await getToken();

      if (!token) throw new Error('Please sign in again')
      if (!isEditing && !image) throw new Error('Please attach a course thumbnail')
      if (!courseTitle.trim() || !courseDescription.trim()) throw new Error('Course title and description are required')

      await request(isEditing ? `/api/educator/courses/${id}` : '/api/educator/add-course', {
        method: isEditing ? 'PUT' : 'POST', token, body: formData
      })

      await fetchAllCourses()

      alert(isEditing ? 'Course updated successfully' : 'Course added successfully');


        setCourseTitle('');
        setCourseDescription('');
        setCoursePrice(0);
        setDiscount(0);
        setCategory('General');
        setIsPublished(false);
        setImage(null);
        setChapters([]);
        navigate('/educator/my-courses')


    }
    catch(error){

      alert(error.message);

    }

  };



  const handleChapter = (action,chapterId)=>{


    if(action==="add"){

      const title = prompt(
        "Enter Chapter Name:"
      );


      if(title){

        const newChapter={

          chapterId:createId(),

          chapterTitle:title,

          chapterContent:[],

          collapsed:false,

          chapterOrder:
          chapters.length > 0
          ?
          chapters[chapters.length-1].chapterOrder+1
          :
          1

        };


        setChapters([
          ...chapters,
          newChapter
        ]);

      }


    }


    else if(action==="remove"){

      setChapters(
        chapters.filter(
          chapter =>
          chapter.chapterId!==chapterId
        )
      )

    }

    else if (action === 'rename') {
      const chapter = chapters.find((item) => item.chapterId === chapterId)
      const title = prompt('Enter Chapter Name:', chapter?.chapterTitle || '')
      if (title?.trim()) {
        setChapters(chapters.map((item) => item.chapterId === chapterId ? { ...item, chapterTitle: title.trim() } : item))
      }
    }


    else if(action==="toggle"){


      setChapters(

        chapters.map(chapter=>

          chapter.chapterId===chapterId

          ?

          {
            ...chapter,
            collapsed:!chapter.collapsed
          }

          :

          chapter

        )

      )


    }


  };
  const handleLecture = (action, chapterId, lectureIndex) => {


  if(action === "add"){

    setCurrentChapterId(chapterId);

    setShowPopup(true);

  }



  else if(action === "remove"){


    setChapters(

      chapters.map(chapter=>{


        if(chapter.chapterId === chapterId){


          return {

            ...chapter,

            chapterContent:

            chapter.chapterContent.filter(
              (_,index)=>index !== lectureIndex
            )

          }

        }


        return chapter;


      })

    )

  }

  else if (action === 'edit') {
    const chapter = chapters.find((item) => item.chapterId === chapterId)
    const lecture = chapter?.chapterContent[lectureIndex]
    if (!lecture) return
    const lectureTitle = prompt('Lecture title:', lecture.lectureTitle)
    if (lectureTitle === null || !lectureTitle.trim()) return
    const lectureDuration = prompt('Duration (minutes):', lecture.lectureDuration)
    const lectureUrl = prompt('Lecture URL:', lecture.lectureUrl)
    if (lectureDuration === null || lectureUrl === null) return
    setChapters(chapters.map((item) => item.chapterId === chapterId ? {
      ...item,
      chapterContent: item.chapterContent.map((current, index) => index === lectureIndex ? {
        ...current, lectureTitle: lectureTitle.trim(), lectureDuration: Number(lectureDuration), lectureUrl: lectureUrl.trim()
      } : current)
    } : item))
  }


};



return (

<div className='sb-page min-h-screen overflow-y-auto p-4 pt-8 md:p-8 md:pb-12'>


<form className='sb-panel w-full max-w-4xl p-5 md:p-8'>

<h1 className='text-xl font-semibold mb-4'>{isEditing ? 'Edit Course' : 'Add Course'}</h1>


<div className='flex flex-col gap-1'>

<p>Course Title</p>

<input

onChange={e=>setCourseTitle(e.target.value)}

value={courseTitle}

type="text"

placeholder='Type here'

className='sb-input md:py-2.5 py-2 px-3'

required

/>

</div>



<div className='flex flex-col gap-1 mt-4'>

<p>Course Description</p>

<div ref={editorRef}></div>

</div>



<div className='flex items-center justify-between flex-wrap mt-4'>


<div className='flex flex-col gap-1'>

<p>Course Price</p>


<input

onChange={
e=>setCoursePrice(Number(e.target.value))
}

value={coursePrice}

type="number"

placeholder='0'

className='sb-input md:py-2.5 py-2 w-28 px-3'

required

/>


</div>

<div className='flex flex-col gap-1 mt-4'>
<p>Category</p>
<input onChange={e => setCategory(e.target.value)} value={category} type="text" placeholder="e.g. Development" className='sb-input md:py-2.5 py-2 px-3' />
</div>




<div className='flex md:flex-row flex-col items-center gap-3'>


<p>Course Thumbnail</p>


<label htmlFor="thumbnailImage"
className='flex items-center gap-3'>


<img

src={assets.file_upload_icon}

className='p-3 bg-blue-500 rounded'

alt=""

/>


<input

type="file"

id="thumbnailImage"

hidden

accept="image/*"

onChange={
e=>setImage(e.target.files[0])
}

/>



{
image &&

<img

src={URL.createObjectURL(image)}

className='max-h-10'

alt=""

/>

}



</label>


</div>

<label className='flex items-center gap-2 mt-4 cursor-pointer'>
  <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} />
  Publish this course now
</label>


</div>




<div className='flex flex-col gap-1 mt-4'>


<p>Discount %</p>


<input


onChange={
e=>setDiscount(Number(e.target.value))
}


value={discount}


type="number"


min={0}

max={100}


className='sb-input md:py-2.5 py-2 w-28 px-3'


/>


</div>






<div className="mt-8">


{
chapters.map((chapter,chapterIndex)=>(


<div key={chapter.chapterId}

className="sb-panel mb-4 overflow-hidden">


<div className="flex justify-between items-center p-4 border-b">


<div className='flex items-center'>


<img

onClick={()=>
handleChapter(
"toggle",
chapter.chapterId
)
}

src={assets.dropdown_icon}

width={14}

className={`mr-2 cursor-pointer transition-all ${
chapter.collapsed && "-rotate-90"
}`}

alt=""

/>



<span className='font-semibold'>

{chapterIndex+1} {chapter.chapterTitle}

</span>

<button type="button" onClick={() => handleChapter('rename', chapter.chapterId)} className='ml-3 text-xs text-blue-600'>Rename</button>


</div>



<span className='text-gray-500'>

{chapter.chapterContent.length} Lectures

</span>




<img

src={assets.cross_icon}

onClick={()=>
handleChapter(
"remove",
chapter.chapterId
)
}

className='cursor-pointer'

alt=""

/>

</div>





{
!chapter.collapsed &&

<div className="p-4">


{
chapter.chapterContent.map(
(lecture,index)=>(


<div

key={index}

className='flex justify-between items-center mb-2'

>


<span>


{index+1} {lecture.lectureTitle}

-
{lecture.lectureDuration} mins

-

<a

href={lecture.lectureUrl}

target="_blank"

className='text-blue-500'

>

Link

</a>


-

{
lecture.isPreviewFree

?
"Free Preview"

:
"Paid"

}


</span>

<button type="button" onClick={() => handleLecture('edit', chapter.chapterId, index)} className='text-xs text-blue-600 ml-auto mr-3'>Edit</button>




<img

src={assets.cross_icon}

onClick={()=>
handleLecture(
"remove",
chapter.chapterId,
index
)
}

className='cursor-pointer'

alt=""

/>


</div>


)

)

}




<div

onClick={()=>
handleLecture(
"add",
chapter.chapterId
)
}

className='inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2'

>

+ Add Lecture

</div>


</div>

}


</div>


))

}





<div

onClick={()=>
handleChapter("add")
}

className='flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer mb-8'

>

+ Add Chapter


</div>




{
showPopup &&


<div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>


<div className='bg-white text-gray-700 p-4 rounded relative w-full max-w-80'>


<h2 className='text-lg font-semibold mb-4'>

Add Lecture

</h2>



<input

placeholder='Lecture Title'

className='border w-full mb-2 p-2'

value={lectureDetails.lectureTitle}

onChange={
e=>setLectureDetails({
...lectureDetails,
lectureTitle:e.target.value
})
}

/>



<input

placeholder='Duration'

type="number"

className='border w-full mb-2 p-2'

value={lectureDetails.lectureDuration}

onChange={
e=>setLectureDetails({
...lectureDetails,
lectureDuration:e.target.value
})
}

/>




<input

placeholder='Lecture URL'

className='border w-full mb-2 p-2'

value={lectureDetails.lectureUrl}

onChange={
e=>setLectureDetails({
...lectureDetails,
lectureUrl:e.target.value
})
}

/>




<label>

<input

type="checkbox"

checked={lectureDetails.isPreviewFree}

onChange={
e=>setLectureDetails({
...lectureDetails,
isPreviewFree:e.target.checked
})
}

/>

 Free Preview

</label>




<button

type="button"

onClick={()=>{


setChapters(

chapters.map(chapter=>{


if(chapter.chapterId===currentChapterId){


return{

...chapter,

chapterContent:[

...chapter.chapterContent,

{ ...lectureDetails, lectureId: createId() }

]

}


}


return chapter;


})

);



setShowPopup(false);


setLectureDetails({

lectureTitle:'',

lectureDuration:'',

lectureUrl:'',

isPreviewFree:false

});


}}

className='bg-blue-500 text-white w-full mt-4 py-2 rounded'

>

Add

</button>



<img

src={assets.cross_icon}

onClick={()=>
setShowPopup(false)
}

className='absolute top-3 right-3 w-4 cursor-pointer'

alt=""

/>


</div>

</div>


}



</div>





<button

type="button"

onClick={addCourse}

className='sb-button-primary w-max px-8 py-2.5'

>

ADD

</button>



</form>


</div>


)

}


export default AddCourse
