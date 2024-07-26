"use client"

// import outfit_font from "Outfit.ttf"
import ResultsVideoUI from './ResultVideoUI';
import ResultsAudioUI from './ResultAudioUI';
import Form from './Form';
import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { user_logout } from '@/utils/data_fetch';

// import generatePDF from 'react-to-pdf';


const VideoAnalysisForm = ({ user }) => {

    const test_ref = useRef(null);
    const test_result_ref = useRef(null);

    const pdfRef = useRef(null);

    const [user_data, set_user_data] = useState(user);
    const [show_user_options, set_show_user_options] = useState(false);

    //DATA BASED ON FETCH
    const [fileUrl, setfileUrl] = useState(null);
    const [response_data, set_res_data] = useState({});
    const [file_metadata, set_file_metadata] = useState(null);
    const [chosen_analysis, set_chosen_analysis] = useState({});

    const handle_newCheck = () => {
        URL.revokeObjectURL(fileUrl);
        setfileUrl(null);
        set_res_data({});
    }

    const handle_logout = () => {
        user_logout();
    }

    const handle_cross_message = () => {
        set_res_data({});
    }

    return (
        <div className="min-h-screen">

            {/* NAVBAR */}
            <div className='fixed z-50 top-0 bg-white  shadow flex items-center gap-10 w-full justify-between px-16 py-2'>
                <div className=' text-primary w-full text-xl font-bold flex justify-start items-center gap-3'>
                    <Image ref={test_ref} src={'/logo.svg'} width={30} height={20} alt="LOGO" />
                    Contrails AI
                </div>

                <div className=' flex gap-8'>
                    <div className=' text-xl font-medium flex items-center gap-2 '>
                        {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="CurrentColor" className="size-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                        </svg> */}
                        <span>Tokens:</span>
                        <span>{user_data.tokens}</span>
                    </div>

                    <div onClick={() => { set_show_user_options(!show_user_options) }} className=''>

                        {user_data.avatar_url ?
                            <Image src={user_data.avatar_url} height={40} width={40} alt="user_avatar" className=" cursor-pointer min-w-10 min-h-10 rounded-full" />
                            :
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="CurrentColor" className=" cursor-pointer size-10">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        }

                        {/* logout, profile buttons popup */}
                        <div className={`absolute z-30 group-hover:opacity-100 ${show_user_options ? "h-20" : "h-0"} overflow-hidden top-12 right-10  w-40 rounded bg-slate-100 text-gray-600 shadow transition-all`}>
                            <div className=' flex flex-col divide-gray-300 w-full p-2'>
                                <div onClick={handle_logout} className='px-2 py-1 cursor-pointer hover:bg-slate-200 transition-all '>
                                    Logout
                                </div>
                                <Link href={"/profile"} className='px-2 py-1 hover:bg-slate-200 transition-all '>
                                    Profile
                                </Link>
                            </div>
                        </div>

                        <div onClick={() => { set_show_user_options(!show_user_options) }} className={` ${show_user_options ? "" : "hidden"} absolute top-0 left-0 h-screen w-screen `} />
                    </div>
                </div>
            </div>


            {/* <SidePanel user_data={user_data}  handle_newCheck={handle_newCheck}/> */}
            <div className=" bg-white  px-10 min-h-[94vh] pt-16 pb-10 ">
                {
                    !fileUrl &&
                    <>
                        <h2 className=" w-full text-3xl font-semibold px-5 pt-3 py-6">Manipulation Detection</h2>
                        <Form
                            user_data={user_data}
                            set_user_data={set_user_data}
                            response_data={response_data}
                            set_res_data={set_res_data}
                            fileUrl={fileUrl}
                            setfileUrl={setfileUrl}
                            set_file_metadata={set_file_metadata}
                            set_chosen_analysis={set_chosen_analysis}
                        />
                    </>
                }

                {/* SHOW RESULT */}
                {fileUrl && file_metadata.type.split("/")[0] === "video" &&
                    <ResultsVideoUI
                        response_data={response_data}
                        fileUrl={fileUrl}
                        file_metadata={file_metadata}
                        analysisTypes={chosen_analysis}
                        pdfRef={pdfRef}
                        handle_newCheck={handle_newCheck}
                    />
                }
                {fileUrl && file_metadata.type.split("/")[0] === "audio" &&
                    <ResultsAudioUI
                        response_data={response_data}
                        fileUrl={fileUrl}
                        file_metadata={file_metadata}
                        analysisTypes={chosen_analysis}
                        pdfRef={pdfRef}
                    />
                }
            </div>

            {/* ERROR related messages */}
            {
                response_data.message !== undefined
                &&
                <>
                    {/* MESSAGES (ERRORS) */}
                    <div className=' fixed right-6 bottom-16 z-10 '>

                        <div className=' flex flex-col items-end rounded-lg h-24 w-52 border-2 border-gray-300  bg-white px-3 py-2 '>

                            <svg onClick={handle_cross_message} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className=" absolute cursor-pointer size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>

                            <div className=' w-full flex flex-col gap-2'>
                                <div className=' underline underline-offset-2'>Message:</div>
                                <div>
                                    {response_data.message}
                                </div>
                            </div>
                        </div>

                    </div>
                </>
            }

            {/* FOOTER */}
            <div className=' bg-white flex gap-3 py-2 justify-center items-center border-t border-primary '>
                <Link href={'https://contrails.ai'} target='_blank' className='hover:underline'>
                    Contrails AI
                </Link>
                ©2024
            </div>
        </div>
    );
};

export default VideoAnalysisForm;
