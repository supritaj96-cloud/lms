import React, { useContext, useEffect, useRef, useState } from 'react'
import uniqid from 'uniqid';
import Quill from 'quill';
import { assets } from '../../assets/LMS_assets/assets/assets';

import { AppContext } from "../../context/AppContext";

const AddCourse = () => {

  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const { getToken } = useContext(AppContext);

  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
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



  // Add Course API

  const addCourse = async()=>{

    try{


      const courseData = {

        courseTitle,

        courseDescription,

        coursePrice:Number(coursePrice),

        discount:Number(discount),

        chapters

      };



      const formData = new FormData();


      formData.append(
        "courseData",
        JSON.stringify(courseData)
      );


      formData.append(
        "image",
        image
      );



      const token = await getToken();

console.log(token);

if (!token) {
  alert("Token is null");
  return;
}
      

const response = await fetch(
  "http://localhost:5000/api/educator/add-course",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }
);



      const data = await response.json();


      console.log(data);


      if(data.success){

        alert("Course Added Successfully");


        setCourseTitle('');
        setCourseDescription('');
        setCoursePrice(0);
        setDiscount(0);
        setImage(null);
        setChapters([]);

      }
      else{

        alert(data.message);

      }


    }
    catch(error){

      console.log(error);

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

          chapterId:uniqid(),

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


};



return (

<div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>


<form>


<div className='flex flex-col gap-1'>

<p>Course Title</p>

<input

onChange={e=>setCourseTitle(e.target.value)}

value={courseTitle}

type="text"

placeholder='Type here'

className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500'

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

className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500'

required

/>


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


className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500'


/>


</div>






<div className="mt-8">


{
chapters.map((chapter,chapterIndex)=>(


<div key={chapter.chapterId}

className="bg-white border rounded-lg mb-4">


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

lectureDetails

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

className='bg-black text-white w-max py-2.5 px-8 rounded'

>

ADD

</button>



</form>


</div>


)

}


export default AddCourse