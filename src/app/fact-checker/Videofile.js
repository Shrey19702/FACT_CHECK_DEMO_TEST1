"use client"

import ResultsVideoUI from './ResultVideoUI';
import ResultsAudioUI from './ResultAudioUI';
import Form from './Form';
import { useState} from 'react';
import SidePanel from './SidePanel';

const VideoAnalysisForm = ({user}) => {

    const [user_data, set_user_data] = useState(user);

    //DATA BASED ON FETCH
    const [fileUrl, setfileUrl] = useState(null);
    const [response_data, set_res_data] = useState(null);
    const [file_metadata, set_file_metadata] = useState(null);
    const [chosen_analysis, set_chosen_analysis] = useState({});

    const handle_newCheck = () => {

        URL.revokeObjectURL(fileUrl);
        setfileUrl(null);
        set_res_data(null);

    }

    return (
        <div className=" bg-gradient-to-tr from-indigo-100 to-sky-100 via-blue-100 min-h-screen py-10">
            <SidePanel user_data={user_data}  handle_newCheck={handle_newCheck}/>
            <div className="ml-20 mr-6 xl:ml-28 xl:mr-14 px-4 pt-12 pb-8 mb-4 bg-white/30  rounded shadow-md min-h-[90vh] ">
                <h2 className="text-3xl font-semibold mb-4 ml-4">Manipulation Detection</h2>

                {
                    !fileUrl &&
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
                }

                {/* SHOW RESULT */}
                {fileUrl && file_metadata.type.split("/")[0] === "video" &&
                    <ResultsVideoUI
                        response_data={response_data}
                        fileUrl={fileUrl}
                        file_metadata={file_metadata}
                        analysisTypes={chosen_analysis}
                    />
                }
                {fileUrl && file_metadata.type.split("/")[0] === "audio" &&
                    <ResultsAudioUI
                        response_data={response_data}
                        fileUrl={fileUrl}
                        file_metadata={file_metadata}
                        analysisTypes={chosen_analysis}
                    />
                }
            </div>
        </div>
    );
};

export default VideoAnalysisForm;
