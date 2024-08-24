"use client"

import ResultsVideoUI from '@/app/fact-checker/ResultVideoUI';
import ResultsAudioUI from '@/app/fact-checker/ResultAudioUI';
import { useState, useEffect } from 'react';
import { get_result_for_id, verify_case } from "@/utils/data_fetch"
import { useParams } from 'next/navigation';

const Result_container = ({user_data}) => {

    const { id } = useParams();

    const [loading, set_loading] = useState(true);
    const [res_data, set_res_data] = useState([]);

    useEffect(() => {
        const send_req = async () => {
            const data = await get_result_for_id(id);
            set_res_data(data);
            console.log(data)
            set_loading(false);
        };
        send_req()
    }, [])

    const handle_newCheck = () => {
        if (typeof window !== 'undefined') {
            window.location.href = '/fact-checker';
        }
    }

    const verify_true = async ()=>{
        await verify_case(id)
        alert("Case Verified")
    }

    return (<>
        <div className=' pt-16 pb-10 px-12'>
            {
                loading ?
                    <>
                        LOADING
                    </>
                    :
                    <>
                        {
                            ( !res_data["verified"] && !user_data["verifier"]) &&
                            <div className=' text-xl py-10 px-4'>
                                <span className=' underline px-2'>
                                    Status:
                                </span>
                                <span className=' font-light'>
                                    No Model Response
                                </span>
                            </div>
                        }
                        {
                            (res_data["verified"] || user_data["verifier"]) && res_data["input_request"]["upload_type"] === "video" &&
                            <>
                                <ResultsVideoUI
                                    response_data={JSON.parse(res_data["models_responses"])}
                                    fileUrl={res_data["signedUrl"]}
                                    file_metadata={res_data["file_metadata"]}
                                    analysisTypes={res_data["input_request"]["analysis_types"]}
                                    handle_newCheck={handle_newCheck}
                                />
                                {
                                    (user_data.verifier && !res_data["verified"]) && 
                                    <div onClick={verify_true} className=' mx-auto text-xl bg-primary w-fit  text-white px-10 py-2 rounded-full mt-10 cursor-pointer'>
                                        Verify
                                    </div>
                                }
                            </>
                        }
                        {
                            (res_data["verified"] || user_data["verifier"]) && res_data["input_request"]["upload_type"] === "audio" &&
                            <>
                                <ResultsAudioUI
                                    response_data={JSON.parse(res_data["models_responses"])}
                                    fileUrl={res_data["signedUrl"]}
                                    file_metadata={res_data["file_metadata"]}
                                    handle_newCheck={handle_newCheck}
                                />
                                {
                                    (user_data.verifier && !res_data["verified"]) && 
                                    <div onClick={verify_true} className=' mx-auto text-xl bg-primary w-fit  text-white px-6 py-2 rounded mt-10 cursor-pointer'>
                                        Verify
                                    </div>
                                }
                            </>
                        }
                    </>
            }

        </div>
    </>);
}
//
export default Result_container;