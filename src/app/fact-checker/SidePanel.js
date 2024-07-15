import { useState } from 'react';
import Link from 'next/link';
import { user_logout } from '@/utils/data_fetch';
import Image from 'next/image';

const SidePanel = ({ user_data, handle_newCheck }) => {
    // console.log(user);

    // const { session, loading } = useSession();

    // let user = null;

    // if (session.user.user_metadata) {
    //     user = session.user.user_metadata;
    // }

    const handle_logout = ()=>{
        console.log("logout client");
        user_logout();
    }

    const [show_user_options, set_show_user_options] = useState(false);

    return (
        <div className="h-screen w-16 hover:w-48 hover:shadow-md bg-slate-100/40 backdrop-blur fixed z-50 top-0 px-2 pt-6 pb-4 flex flex-col items-center gap-10 justify-between text-slate-600 duration-300 transition-all overflow-hidden ">

            <div className=" flex flex-col gap-6 w-full ">
                {/* New Check */}
                <div
                    onClick={handle_newCheck}
                    className=" px-1 py-1 flex gap-4 items-center justify-start min-w-44 cursor-pointer hover:text-slate-800 hover:bg-blue-900/20 rounded transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    <div className=" max-w-32 font-medium">
                        New Check
                    </div>
                </div>

                {/* CREDITS */}
                <div className=" px-1 py-1 flex gap-4 items-center justify-start min-w-44 cursor-default hover:text-slate-800 hover:bg-blue-900/20 rounded transition-all">
                    {/* SHOW CREDITS */}
                    {/* 5000 */}

                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="CurrentColor" className="size-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                    </svg>
                    <div className=" max-w-32 font-medium">
                        {user_data.tokens} Tokens
                    </div>

                </div>
            </div>

            <div className=" flex flex-col gap-4 w-full ">
                {/* SETTINGS */}
                <div className=" px-1 py-1 flex gap-4 items-center justify-start min-w-44 cursor-pointer hover:text-slate-800 hover:bg-blue-900/20 rounded transition-all">

                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    <div className=" max-w-32 font-medium">
                        Settings
                    </div>
                </div>

                {/* USER */}
                <div onClick={()=>{set_show_user_options(!show_user_options)}} className=" relative group px-1 py-2 flex flex-col gap-2 min-w-44 cursor-pointer hover:text-slate-800 hover:bg-blue-900/20 rounded transition-all">

                    <div className="flex gap-4 items-center justify-start">
                        {user_data.avatar_url ?
                            <Image src={user_data.avatar_url} height={40} width={40} alt="user_avatar" className="w-10 h-10 rounded-full" />
                            :
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="CurrentColor" className="size-10">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        }
                        <div className=" max-w-32 font-medium overflow-clip">
                            <div>
                                {user_data.full_name ? user_data.full_name : user_data.email.split('@')[0]}
                            </div>
                        </div>
                    </div>
                    <div className=" px-2 overflow-clip opacity-0 group-hover:opacity-100 text-sm transition-all">
                        {user_data.email}
                    </div>

                    {/* logout, profile buttons popup */}
                    <div className={`absolute opacity-0 group-hover:opacity-100 ${show_user_options? "h-20": "h-0"} overflow-hidden top-0 -translate-y-full w-40 rounded bg-slate-100 text-gray-600 transition-all`}>
                        <div className=' flex flex-col divide-y-2 divide-gray-300 w-full p-2'>
                            <div onClick={handle_logout} className='px-2 py-1 hover:bg-slate-200 transition-all '>
                                Logout
                            </div>
                            <Link href={"/profile"} className='px-2 py-1 hover:bg-slate-200 transition-all '>
                                Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SidePanel;