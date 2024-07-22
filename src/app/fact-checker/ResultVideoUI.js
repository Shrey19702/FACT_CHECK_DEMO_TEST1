import LineChart from './LineChart';
import React, { useState, useRef } from 'react';
import Waveform from './Waveform';

const ResultsVideoUI = ({ response_data, fileUrl, file_metadata, analysisTypes, pdfRef }) => {

    const text_val = {
        frameCheck: "Frame Check",
        audioAnalysis: "Audio Analysis"
    };

    const videoRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);

    const [bbox_idx, set_bbox_idx] = useState(0);
    const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
    const bboxes = response_data?.frameCheck?.bboxes || [];
    const total_frames = response_data?.frameCheck?.table_idx.length || 0;

    const [duration, setDuration] = useState(0);

    const [playing, setPlaying] = useState(false);

    const [videoError, setVideoError] = useState(null);

    //output results
    const [chartData, setChartData] = useState(null);
    const [curr_analysis, set_curr_analysis] = useState(Object.keys(response_data)[0]);

    const handleVideoLoadedMetadata = () => {

        const video_duration = videoRef.current.duration;
        setDuration(video_duration);
        const { videoWidth, videoHeight } = videoRef.current;
        setVideoDimensions({ width: videoWidth, height: videoHeight });

        let last_frame = {};
        if (response_data["frameCheck"] !== undefined)
            last_frame["frameCheck"] = Math.max(...response_data['frameCheck'].table_idx);
        if (response_data["audioAnalysis"] !== undefined)
            last_frame["audioAnalysis"] = Math.max(...response_data['audioAnalysis'].table_idx);

        let temp_chart_data = {};

        if (response_data["frameCheck"]) {
            const frame_chart_data = {
                labels: response_data['frameCheck'].table_idx.map(
                    (val, idx) => {
                        const time = video_duration * (val / last_frame["frameCheck"]);
                        return formatTime(time);
                    }
                ),
                datasets: [

                    {
                        label: "Probablility of tampering (-ve value deems suspicious)",
                        data: response_data['frameCheck'].table_values.map((val, idx)=>{
                            return typeof(val) === "boolean"? 0.7: val
                        }),
                        backgroundColor: response_data['frameCheck'].table_values.map((val, idx) => {
                            if (typeof(val) === 'boolean')
                                return "rgba(100,100,100,0.2)"
                            return val >= 0.7 ? "rgba(0,255,0,0.2)" : "rgba(255,0,0,0.2)" 
                        }),
                        // borderColor: response_data['frameCheck'].table_values.map((val, idx) => { return val >= 0 ? "rgba(0,255,0,0.3)" : "rgba(255,0,0,0.3)" }),
                        // borderWidth: 0.75,
                        barPercentage: 1,
                        borderRadius: 100,
                        inflateAmount: 1,
                        base: 0.7
                    },
                    {
                        type: 'line',
                        borderColor: "rgba(0,0,100, 0.3)",
                        pointRadius: 0,
                        fill: {
                            target: { value: 0.7 },
                            above: "rgba(0,255,0,0.3)",   // Area above the origin
                            below: "rgba(255,0,0,0.3)"    // below the origin
                        },
                        lineTension: 0.4,
                        data: response_data['frameCheck'].table_values.filter((val, idx)=>{
                            return typeof(val) !== "boolean"
                        }),
                        borderWidth: 1,

                    },
                ]
            };
            temp_chart_data["frameCheck"] = frame_chart_data;
        }
        if (response_data["audioAnalysis"]) {

            const audio_chart_data = {
                labels: response_data['audioAnalysis'].table_idx.map(
                    (val, idx) => {
                        const time = video_duration * (val / last_frame["audioAnalysis"]);
                        return formatTime(time);
                    }
                ),
                datasets: [
                    {
                        label: "Probablility of tampering (-ve value deems suspicious)",
                        data: response_data['audioAnalysis'].table_values,
                        backgroundColor: response_data['audioAnalysis'].table_values.map((val, idx) => { return val >= 0 ? "rgba(0,255,0,0.2)" : "rgba(255,0,0,0.2)" }),
                        // borderColor: response_data['audioAnalysis'].table_values.map((val, idx) => { return val >= 0 ? "rgba(0,255,0,0.3)" : "rgba(255,0,0,0.3)" }),
                        // borderWidth: 0.5,
                        barPercentage: 1,
                        borderRadius: 100,
                        inflateAmount: 1,
                        base: -1.3
                    },
                    {
                        type: 'line',
                        borderColor: "rgba(0,0,100, 0.3)",
                        pointRadius: 0,
                        fill: {
                            target: { value: -1.3 },
                            above: "rgba(0,255,0,0.3)",   // Area above the origin
                            below: "rgba(255,0,0,0.3)"    // below the origin
                        },
                        lineTension: 0.4,
                        data: response_data['audioAnalysis'].table_values,
                        borderWidth: 1,

                    },
                ]
            }
            temp_chart_data["audioAnalysis"] = audio_chart_data
        }

        setChartData(temp_chart_data);
    };

    const handleVideoError = (event) => {
        setVideoError(event.target.error);
    };

    const handlePlayPause = () => {
        if (playing) {
            videoRef.current.pause();
            setPlaying(false);
        } else {
            videoRef.current.play();
            setPlaying(true);
        }
    };

    const handleSliderChange = (event) => {
        const newTime = (event.target.value * duration) / 100;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        let new_idx = Math.floor(newTime * total_frames / duration)
        // we have fixed frames (0-last_frame),
        set_bbox_idx(new_idx>=total_frames? total_frames-1 : new_idx);
    };

    const handleTimeUpdate = () => {
        if (videoRef.current.currentTime >= duration) {
            handlePlayPause();
        }
        // console.log(duration, videoRef.current.currentTime);

        setCurrentTime(videoRef.current.currentTime);
        //bbox update
        //ensure it doesnt exceed total frames
        let new_idx = Math.floor(videoRef.current.currentTime * total_frames / duration)
        set_bbox_idx(new_idx>=total_frames? total_frames-1: new_idx);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const humanFileSize = (bytes, si = true, dp = 2) => {
        const thresh = si ? 1000 : 1024;

        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }

        const units = si
            ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        const r = 10 ** dp;

        do {
            bytes /= thresh;
            ++u;
        } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

        return bytes.toFixed(dp) + ' ' + units[u];
    }

    if (response_data["message"] === undefined) {
        // console.log(response_data);
        return (
            <>
                {/* ANALYSIS */}
                <div ref={pdfRef} className="w-full flex flex-col lg:gap-3 items-center bg-slate-50 rounded-lg overflow-hidden ">

                    {/* VIDEO + VIDEO STUFF */}
                    <div className=' flex gap-10 justify-between px-8 items-end relative pt-10 w-full '>

                        {/* RESULT + SIDE TABS + BUTTONS */}
                        <div className=' w-full max-w-[40vw] flex flex-col h-[60vh] justify-between '>
                            {/* RESULT */}
                            <div className=' flex w-full justify-center flex-wrap'>
                                {/* BOTH AUDIO AND VIDEO 4-CASES */}
                                {
                                    response_data["frameCheck"] !== undefined && response_data["audioAnalysis"] !== undefined
                                    &&
                                    (
                                        <>
                                            {/* BOTH OK */}
                                            {
                                                response_data["frameCheck"].result.toFixed(3) >= 0.7 && response_data["audioAnalysis"].result.toFixed(3) >= -1.3 &&
                                                <span className='flex gap-1 items-center'>
                                                    <span className='font-medium bg-green-200 px-2 py-1 rounded-full w-fit'>No manipulation detected</span>
                                                    in both
                                                    <span className='font-medium'>Video and Audio</span>
                                                </span>
                                            }
                                            {/* FRAME OK AUDIO BAD */}
                                            {
                                                response_data["frameCheck"].result.toFixed(3) >= 0.7 && response_data["audioAnalysis"].result.toFixed(3) < -1.3 &&
                                                <span className='flex gap-1 items-center'>

                                                    <span className='font-medium bg-red-200 px-2 py-1 rounded-full w-fit'>Manipulation detected</span>
                                                    in <span className='font-medium'>Audio</span>,
                                                    <br />
                                                    <span className='font-medium bg-green-200 px-2 py-1 rounded-full w-fit'>NO Manipulation detected</span>
                                                    in <span className='font-medium'>Video</span>,
                                                </span>
                                            }

                                            {/* FRAME BAD AUDIO OK */}
                                            {
                                                response_data["frameCheck"].result.toFixed(3) < 0.7 && response_data["audioAnalysis"].result.toFixed(3) >= -1.3 &&
                                                <span className='flex gap-1 items-center'>

                                                    <span className='font-medium bg-red-200 px-2 py-1 rounded-full w-fit'>Manipulation detected</span>
                                                    in <span className='font-medium'>Video</span>,
                                                    <br />
                                                    <span className='font-medium bg-green-200 px-2 py-1 rounded-full w-fit'>NO Manipulation detected</span>
                                                    in <span className='font-medium'>Audio</span>,
                                                </span>
                                            }
                                            {/* BOTH OK */}
                                            {
                                                response_data["frameCheck"].result.toFixed(3) < 0.7 && response_data["audioAnalysis"].result.toFixed(3) < -1.3 &&
                                                <span className='flex gap-1 items-center'>
                                                    <span className='font-medium bg-red-200 px-2 py-1 rounded-full w-fit'>Manipulation detected</span>
                                                    in both
                                                    <span className='font-medium'>Video and Audio</span>
                                                </span>
                                            }
                                        </>
                                    )
                                }
                                {/* ONLY VIDEO 2-CASES */}
                                {
                                    response_data["frameCheck"] !== undefined && response_data["audioAnalysis"] === undefined
                                    &&
                                    (
                                        <>
                                            {/* VIDEO OK */}
                                            {
                                                response_data["frameCheck"].result.toFixed(3) >= 0.7 &&
                                                <span className='flex gap-1 items-center'>
                                                    <span className='font-medium bg-green-200 px-2 py-1 rounded-full w-fit'>No manipulation detected</span>
                                                    in
                                                    <span className='font-medium'>Video</span>
                                                </span>
                                            }
                                            {/* VIDEO BAD */}
                                            {
                                                response_data["frameCheck"].result.toFixed(3) < 0.7 &&
                                                <span className='flex gap-1 items-center'>
                                                    <span className='font-medium bg-red-200 px-2 py-1 rounded-full w-fit'>Manipulation detected</span>
                                                    in
                                                    <span className='font-medium'>Video</span>
                                                </span>
                                            }

                                        </>
                                    )
                                }
                                {/* ONLY AUDIO 2-CASES */}
                                {
                                    response_data["frameCheck"] === undefined && response_data["audioAnalysis"] !== undefined
                                    &&
                                    (
                                        <>
                                            {/* AUDIO OK */}
                                            {
                                                response_data["audioAnalysis"].result.toFixed(3) >= -1.3 &&
                                                <span className='flex gap-1 items-center'>
                                                    <span className='font-medium bg-green-200 px-2 py-1 rounded-full w-fit'>No manipulation detected</span>
                                                    in<span className='font-medium'>Audio</span>
                                                </span>
                                            }
                                            {/* AUDIO OK */}
                                            {
                                                response_data["audioAnalysis"].result.toFixed(3) < -1.3 &&
                                                <span className='flex gap-1 items-center'>
                                                    <span className='font-medium bg-red-200 px-2 py-1 rounded-full w-fit'>Manipulation detected</span>
                                                    in<span className='font-medium'>Audio</span>
                                                </span>
                                            }
                                        </>
                                    )
                                }
                            </div>
                            <div className=' flex flex-col items-center py-4 gap-4 '>
                                {
                                    // result of all analysis
                                    Object.keys(response_data).map((val, idx) => {
                                        const result = (response_data[val].result).toFixed(3);
                                        let threshold = 0;
                                        if (val === "frameCheck")
                                            threshold = 0.7
                                        else if (val === 'audioAnalysis')
                                            threshold = -1.3
                                        return (
                                            <div key={idx} className={` bg-white flex flex-col w-fit items-center gap-3 min-w-96 px-5 py-2 rounded-lg shadow ${(result) > threshold ? " shadow-green-700" : " shadow-red-700"}  `}>
                                                <span className=' text-xl'>
                                                    {
                                                        val === "frameCheck" &&
                                                        (`Frame Check Result`)
                                                    }
                                                    {
                                                        val === "audioAnalysis" &&
                                                        (`Audio Check Result`)
                                                    }
                                                </span>
                                                <span className={` text-2xl px-6 py-2 rounded-full font-semibold ${(result) > threshold ? " bg-green-200  text-green-700" : " bg-red-200 text-red-700"}`}>
                                                    {result}
                                                </span>
                                                <span className=' text-xs'>
                                                    {
                                                        val === "frameCheck" &&
                                                        (`< 0.7 deems it suspicious of forgery`)
                                                    }
                                                    {
                                                        val === "audioAnalysis" &&
                                                        (`< -1.3 deems it suspicious of forgery`)
                                                    }
                                                </span>
                                            </div>
                                        )
                                    })
                                }
                            </div>

                            {/* SIDE TABS + BUTTONS */}
                            {/* <div className=' w-full flex items-center '> */}
                            {/* SIDE TABS  */}
                            <div className=' h-fit flex gap-2 relative top-3 -left-4 '>
                                {
                                    Object.keys(analysisTypes).map((val, idx) => {
                                        if (analysisTypes[val] === true) {
                                            return (
                                                <div
                                                    key={idx}
                                                    className={` ${curr_analysis === val ? "bg-primary hover:shadow-inner shadow-white text-white " : " text-primary border-t border-x border-primary "} font-medium p-3 rounded-t-xl cursor-pointer transition-all`}
                                                    onClick={() => { if (playing) handlePlayPause(); set_curr_analysis(val); }}
                                                >
                                                    {text_val[val]}
                                                </div>
                                            )
                                        }
                                        return (
                                            <div key={idx}>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            {/* </div> */}
                        </div>

                        {/* VIDEO */}
                        <div className='relative w-full flex flex-col items-center justify-center'>
                            <div className='relative'>
                                {/* BBOX */}
                                {curr_analysis === 'frameCheck' && bboxes.length > 0 && typeof(bboxes[bbox_idx])!=="boolean" && (
                                    <div
                                        style={{
                                            top: `${(bboxes[bbox_idx][0][1] / videoDimensions.height) * 100}%`,
                                            left: `${(bboxes[bbox_idx][0][0] / videoDimensions.width) * 100}%`,
                                            width: `${((bboxes[bbox_idx][0][2] - bboxes[bbox_idx][0][0]) / videoDimensions.width) * 100}%`,
                                            height: `${((bboxes[bbox_idx][0][3] - bboxes[bbox_idx][0][1]) / videoDimensions.height) * 100}%`,
                                        }}
                                        className={` z-10 absolute border-4 rounded ${response_data["frameCheck"]["table_values"][bbox_idx] >= 0.7 ? " border-green-500 " : "border-red-500"} transition-all duration-75 `}
                                    />
                                )}
                                <video
                                    ref={videoRef}
                                    src={fileUrl}
                                    controls={false} // Disable inbuilt video player buttons and interactions
                                    onError={handleVideoError}
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={handleVideoLoadedMetadata}
                                    className=" w-fit max-w-3xl h-[60vh] "
                                />
                            </div>

                            {
                                curr_analysis === 'frameCheck' && bboxes.length > 0 && typeof(bboxes[bbox_idx])!=="boolean" && (

                                    <div className={` ${response_data["frameCheck"]["table_values"][bbox_idx] >= 0.7 ? "bg-green-300" : "bg-red-300"} rounded-lg py-1 px-5 `}>
                                        {
                                            response_data["frameCheck"]["table_values"][bbox_idx] >= 0.7 ?
                                                "Current frame seems ok"
                                                :
                                                "Current frame seems suspicious"
                                        }
                                    </div>
                                )
                            }
                        </div>

                    </div>

                    {/* GRAPH AND SLIDER */}
                    <div className=' relative z-10 flex flex-row justify-stretch w-full bg-primary border-gray-300 px-3 pb-4 pt-3 rounded-b '>

                        {/* data chart and slider */}
                        <div className="w-full ">

                            {/* buttons */}
                            <button
                                onClick={handlePlayPause}
                                className=" ml-10 mb-2 border-2 outline-none text-white text-4xl font-bold py-1 px-3 rounded-full transition-all duration-300 "
                            >
                                {playing ?
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="#" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                                    </svg>
                                    :
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                                    </svg>
                                }
                            </button>

                            {/* slider with buttons */}
                            <div className={`relative pl-10 pr-4 ${curr_analysis === "audioAnalysis" ? 'h-0' : 'h-10'} overflow-hidden duration-500 transition-all`}>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={(currentTime / duration) * 100 || 0}
                                    onChange={handleSliderChange}
                                    className=" win10-thumb  w-full rounded-md outline-none transition-all duration-300 cursor-pointer"
                                />
                            </div>

                            {
                                curr_analysis === "audioAnalysis" &&
                                videoRef !== null &&
                                <Waveform videoRef={videoRef} />
                            }

                            {
                                chartData !== null &&
                                <div className=' bg-white max-h-64 w-full px-3 mt-2 rounded-md'>
                                    <LineChart chartData={chartData[curr_analysis]} />
                                </div>
                            }
                        </div>

                    </div>
                    {videoError && (
                        <p className="text-red-500 mt-2">Error playing video: {videoError.message}</p>
                    )}
                </div>


                <div className=' flex gap-5 pt-4 items-end '>

                    {/* VIDEO META DATA */}
                    <div className=' bg-slate-100 py-4 px-5 border rounded-lg w-fit min-w-[40vw] flex flex-col gap-4 shadow hover:shadow-primary transition-all duration-300'>
                        <span className=' text-xl'>
                            Video Metadata
                        </span>
                        <div className='flex flex-col break-words'>
                            {/* <div>
                                <span className=' font-medium pr-2' >Last Modified: </span>
                                <span>{file_metadata.lastModifiedDate.toDateString()}</span>
                            </div> */}
                            <div>
                                <span className=' font-medium pr-2' >FileName: </span>
                                <span>{file_metadata.name}</span>
                            </div>
                            <div>
                                <span className=' font-medium pr-2' > Size: </span>
                                <span>{humanFileSize(file_metadata.size)}</span>
                            </div>
                            <div>
                                <span className=' font-medium pr-2' >Video type: </span>
                                <span>{file_metadata.type}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </>
        )
    }
    else {
        console.log(response_data);
        return (<>
            <div className='flex flex-col px-24 py-16'>
                <div className='text-xl bg-red-500 px-2' >ERROR OCCURED</div>
                <div className='text-lg bg-red-800 text-white px-2' >{response_data["message"]}</div>
            </div>
        </>)
    }
}

export default ResultsVideoUI;