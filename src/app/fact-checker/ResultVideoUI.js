import LineChart from './LineChart';
import React, { useState, useRef } from 'react';
import Waveform from './Waveform';

import generatePDF from 'react-to-pdf';

const ResultsVideoUI = ({ response_data, fileUrl, file_metadata, analysisTypes }) => {

    const text_val = {
        frameCheck: "Frame Check",
        audioAnalysis: "Audio Analysis"
    };

    const videoRef = useRef(null);
    const pdfRef = useRef(null);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);

    const [videoError, setVideoError] = useState(null);

    //output results
    const [chartData, setChartData] = useState(null);
    const [curr_analysis, set_curr_analysis] = useState(Object.keys(response_data)[0]);

    const handleVideoLoadedMetadata = () => {

        const video_duration = videoRef.current.duration;
        setDuration(video_duration);
        console.log(response_data);

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
                        data: response_data['frameCheck'].table_values,
                        backgroundColor: response_data['frameCheck'].table_values.map((val, idx) => { return val >= 0 ? "rgba(0,255,0,0.2)" : "rgba(255,0,0,0.2)" }),
                        // borderColor: response_data['frameCheck'].table_values.map((val, idx) => { return val >= 0 ? "rgba(0,255,0,0.3)" : "rgba(255,0,0,0.3)" }),
                        // borderWidth: 0.75,
                        barPercentage: 1,
                        borderRadius: 100,
                        inflateAmount: 1
                    },
                    {
                        type: 'line',
                        borderColor: "rgba(0,0,100, 0.3)",
                        pointRadius: 0,
                        fill: {
                            target: 'origin',
                            above: "rgba(0,255,0,0.3)",   // Area above the origin
                            below: "rgba(255,0,0,0.3)"    // below the origin
                        },
                        lineTension: 0.4,
                        data: response_data['frameCheck'].table_values,
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
                        inflateAmount: 1
                    },
                    {
                        type: 'line',
                        borderColor: "rgba(0,0,100, 0.3)",
                        pointRadius: 0,
                        fill: {
                            target: 'origin',
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

    const handleMuteUnmute = () => {
        if (muted) {
            videoRef.current.muted = false;
            setMuted(false);
        } else {
            videoRef.current.muted = true;
            setMuted(true);
        }
    };

    const handleSliderChange = (event) => {
        const newTime = (event.target.value * duration) / 100;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleTimeUpdate = () => {
        if (videoRef.current.currentTime >= duration) {
            handlePlayPause();
        }
        // console.log(duration, videoRef.current.currentTime);

        setCurrentTime(videoRef.current.currentTime);
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

        return (
            <>
                {/* TITLE + METADATA */}
                {/* <div className=' py-6 px-10 mt-10 rounded-lg w-full flex flex-col gap-10 transition-all duration-500'> */}

                {/* </div> */}

                {/* ANALYSIS */}
                <div ref={pdfRef} className="w-full flex flex-col lg:gap-3 items-center bg-slate-100 ">
                    {/* <span className=' text-3xl mt-10'>
                        Deepfake Check Results
                    </span> */}

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
                                            <div key={idx} className={` flex flex-col w-fit items-center gap-3 min-w-96 px-5 py-2 rounded-lg shadow ${(result) > threshold ? " shadow-green-700" : " shadow-red-700"}  `}>
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
                            <div className=' w-full flex items-center '>
                                {/* SIDE TABS  */}
                                <div className=' h-full flex gap-2 relative top-3 -left-4 '>
                                    {
                                        Object.keys(analysisTypes).map((val, idx) => {
                                            if (analysisTypes[val] === true) {
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={` ${curr_analysis === val ? "bg-sky-200 " : "bg-sky-100 "} hover:bg-indigo-100 px-3 py-3 rounded-t-xl cursor-pointer border border-gray-200 transition-all`}
                                                        onClick={() => { if(playing) handlePlayPause(); set_curr_analysis(val); }}
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

                                {/* buttons */}
                                <div className="flex items-center gap-4 mb-3 xl:m-0 ">
                                    <button
                                        onClick={handlePlayPause}
                                        className="bg-sky-500 hover:bg-sky-600 text-white text-4xl font-bold py-3 px-3 rounded-full transition-all duration-300 "
                                    >
                                        {playing ?
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                                            </svg>
                                            :
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                                            </svg>

                                        }
                                    </button>
                                    <button
                                        onClick={handleMuteUnmute}
                                        className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-3 rounded-full transition-all duration-300"
                                    >
                                        {muted ?
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                            </svg>

                                            :
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                            </svg>
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* VIDEO */}
                        <div className=' w-full flex justify-center'>
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

                    </div>

                    {/* GRAPH AND SLIDER */}
                    <div className=' relative z-10 flex flex-row justify-stretch w-full bg-gradient-to-bl from-indigo-200 to-sky-200 border-gray-300 border px-3 pb-4 pt-3 rounded-b '>

                        {/* data chart and slider */}
                        <div className="w-full ">

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

                {/* VIDEO META DATA */}
                <div className=' mt-10 mb-6 bg-slate-100 py-4 px-5 border rounded-lg w-fit min-w-[40vw] flex flex-col gap-4 shadow hover:shadow-sky-500 transition-all duration-300'>
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

                <div 
                    onClick={  ()=>{generatePDF(pdfRef, {filename: 'file.pdf'})}  } 
                    className=' flex items-center gap-4 w-fit rounded text-gray-700  text-lg px-10 py-4 bg-blue-300 hover:bg-sky-300 shadow transition-all duration-500 cursor-pointer '
                >
                    Save PDF of currently visible Analysis
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>

                </div>
            </>
        )
    }
    else {
        return (<>
            <div className='flex flex-col px-24 py-16'>
                <div className='text-xl bg-red-500 px-2' >ERROR OCCURED</div>
                <div className='text-lg bg-red-800 text-white px-2' >{response_data["message"]}</div>
            </div>
        </>)
    }
}

export default ResultsVideoUI;