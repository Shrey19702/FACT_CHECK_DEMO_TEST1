"use client"

import ResultsVideoUI from '@/app/fact-checker/ResultVideoUI';
import ResultsAudioUI from '@/app/fact-checker/ResultAudioUI';
import { useState, useEffect } from 'react';

const Result_container = ({res_data}) => {
    // console.log(res_data);
    const model_responses = JSON.parse(res_data["models_responses"]);

    const handle_newCheck = () => {
        if (typeof window !== 'undefined') {
            window.location.href = '/fact-checker';
        }
    }

    return (<>
        <div className=' pt-16 pb-10 px-12'>
            {/* VERIFIER COMMENT */}
            {
                res_data["verifier_metadata"]["ShowCommentToUser"] &&
                <div className=' mt-6 py-4 px-3 bg-primary/10 border-2 border-primary/20 rounded-xl'>
                    <span className=' px-3 font-semibold'>
                        Note:
                    </span>
                    {res_data["verifier_metadata"]["verifierComment"]}
                </div>
            }

            {
                res_data["input_request"]["upload_type"] === "video" &&

                <ResultsVideoUI
                    response_data={{
                        "frameCheck": res_data["verifier_metadata"]["showFrameCheck"]? 
                         model_responses["results"]["frame"][res_data["verifier_metadata"]["FrameCheckModelUse"]]
                         : undefined,
                        "audioAnalysis": res_data["verifier_metadata"]["showAudioCheck"]?
                         model_responses["results"]["audio"][res_data["verifier_metadata"]["AudioCheckModelUse"]]
                         : undefined,
                    }}
                    fileUrl={res_data["signedUrl"]}
                    file_metadata={res_data["file_metadata"]}
                    analysisTypes={res_data["input_request"]["analysis_types"]}
                    handle_newCheck={handle_newCheck}
                />
            }
            {
                res_data["input_request"]["upload_type"] === "audio" &&

                <ResultsAudioUI
                    response_data={{
                        "audioAnalysis": model_responses["results"]["audio"][res_data["verifier_metadata"]["AudioCheckModelUse"]],
                    }}
                    fileUrl={res_data["signedUrl"]}
                    file_metadata={res_data["file_metadata"]}
                    handle_newCheck={handle_newCheck}
                />
            }

        </div>
    </>);
}
//
export default Result_container;