import { useState } from "react"

const Info_setup = ({children})=>{

    const [show, setshow] = useState();

    return (
        <>

            <div className={` ${show? "  ": " hidden "} absolute `} >

                {/* click background */}
                <div 
                    onClick={()=>{setshow(!show)}}
                    className={` ${show? " h-screen w-screen bg-black/40": " hidden "}`} 
                />

                {/* INFO */}
                <div className=" relative h-40 w-40 bg-red-700 text-white ">
                    {children}
                </div>
            </div>
        </>
    )
}

export default Info_setup;