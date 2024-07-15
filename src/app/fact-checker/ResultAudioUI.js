import LineChart from './LineChart';
import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';

const ResultsAudioUI = ({ response_data, fileUrl, file_metadata, analysisTypes }) => {

    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);

    //output results
    const [chartData, setChartData] = useState(null);

    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    useEffect(() => {
        // create wavesurf
        if (waveformRef.current) {

            wavesurferRef.current = WaveSurfer.create({
                container: waveformRef.current,
                url: fileUrl,
                waveColor: '#4f88c8',
                progressColor: '#2222ee',
                height: "auto",
                barHeight: 1,
                dragToSeek: true,
                barWidth: 2,
                barGap: 1,
                barRadius: 2,
            });

            wavesurferRef.current.on('ready', () => {
                const audio_duration = wavesurferRef.current.getDuration();

                console.log(response_data);

                let last_frame = {};
                if (response_data["audioAnalysis"] !== undefined)
                    last_frame["audioAnalysis"] = Math.max(...response_data['audioAnalysis'].table_idx);

                let temp_chart_data = {};

                if (response_data["audioAnalysis"]) {
                    const audio_chart_data = {
                        labels: response_data['audioAnalysis'].table_idx.map(
                            (val, idx) => {
                                const time = audio_duration * (val / last_frame["audioAnalysis"]);
                                return formatTime(time);
                            }
                        ),
                        datasets: [
                            {
                                label: "Probablility of tampering (-ve value deems suspicious)",
                                data: response_data['audioAnalysis'].table_values,
                                backgroundColor: response_data['audioAnalysis'].table_values.map((val, idx) => { return val >= 0 ? "rgba(0,255,0,0.2)" : "rgba(255,0,0,0.2)" }),
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
            });
        }

        return () => {
            if (wavesurferRef.current) {
                wavesurferRef.current.destroy();
                wavesurferRef.current = null;
            }
        };

    }, [waveformRef])


    const handlePlayPause = () => {
        if (wavesurferRef.current.isPlaying()) {
            wavesurferRef.current.pause();
            setPlaying(false);
        } else {
            wavesurferRef.current.play();
            setPlaying(true);
        }
    };

    const handleMuteUnmute = () => {
        const curr_state = wavesurferRef.current.getMuted();
        wavesurferRef.current.setMuted(!curr_state)
        setMuted(!curr_state)
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
                {/* <div className=' py-6 px-10 mt-10 rounded-lg w-full flex flex-col gap-10 transition-all duration-500'>

                    <span className=' text-3xl'>
                        Deepfake Check Results
                    </span>
                </div> */}

                {/* ANALYSIS */}
                <div className="w-full flex flex-col lg:gap-3 items-center bg-slate-100 ">

                    <div className=' mt-10 w-full px-10'>
                        {
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
                        }
                    </div>

                    {/* RESULT + BUTTONS + METADATA */}
                    <div className=' w-full flex justify-between items-end px-8 gap-10 '>
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

                        <div className='flex gap-10 justify-end w-full items-center'>
                            {/* RESULT */}
                            <div className=' flex flex-col items-center w-full '>
                                {
                                    // result of all analysis
                                    Object.keys(response_data).map((val, idx) => {
                                        const result = (response_data[val].result).toFixed(3);
                                        return (
                                            <div key={idx} className={` flex flex-col w-fit items-center gap-3 min-w-96 px-5 py-2 rounded-lg shadow ${(result) > -1.3 ? " shadow-green-700" : " shadow-red-700"}  `}>
                                                <span className=' text-xl'>
                                                    {
                                                        val === "audioAnalysis" &&
                                                        (`Audio Check Result`)
                                                    }
                                                </span>
                                                <span className={` text-2xl px-6 py-2 rounded-full font-semibold ${(result) > -1.3 ? " bg-green-200  text-green-700" : " bg-red-200 text-red-700"}`}>
                                                    {result}
                                                </span>
                                                <span className=' text-xs'>
                                                    {
                                                        val === "audioAnalysis" &&
                                                        (` < -1.3 deems it suspicious of forgery `)
                                                    }
                                                </span>
                                            </div>
                                        )
                                    })
                                }
                            </div>

                            {/* AUDIO META DATA */}
                            <div className=' mt-10 mb-6 bg-slate-100 py-4 px-5 border rounded-lg w-fit min-w-[30vw] flex flex-col gap-4 shadow hover:shadow-sky-500 transition-all duration-300'>
                                <span className=' text-xl'>
                                    Audio Metadata
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
                                        <span className=' font-medium pr-2' >Audio type: </span>
                                        <span>{file_metadata.type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GRAPH AND SLIDER */}
                    <div className=' relative z-10 flex flex-row justify-stretch w-full bg-gradient-to-bl from-indigo-200 to-sky-200 border-gray-300 border px-3 pb-4 pt-3 rounded-b '>

                        {/* data chart and slider */}
                        <div className="w-full ">

                            {
                                waveformRef !== null &&
                                <div ref={waveformRef} className=' w-full pl-10 pr-4 h-56 bg-white rounded-md' />
                            }

                            {
                                chartData !== null &&
                                <div className=' bg-white max-h-64 w-full px-3 mt-2 rounded-md'>
                                    <LineChart chartData={chartData["audioAnalysis"]} />
                                </div>
                            }
                        </div>

                    </div>
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

export default ResultsAudioUI