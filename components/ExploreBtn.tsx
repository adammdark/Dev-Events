'use client'

import Image from "next/image"

const ExploreBtn = () => {
  return (
    <button className="mt-7 mx-auto" id="explore-btn" type='button'onClick={()=>console.log('helo')}>
       <a href="#events">
        Explore Events
        <Image src='/icons/arrow-down.svg' alt="arrow-down" width={24} height={10}/>
       </a>
    </button>
  )
}

export default ExploreBtn