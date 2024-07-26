import LineChart from './LineChart';
import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';

const ResultsAudioUI = ({ response_data, fileUrl, file_metadata, analysisTypes, pdfRef }) => {

    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);

    //output results
    const [chartData, setChartData] = useState(null);

    const [playing, setPlaying] = useState(false);

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
                progressColor: '#0253E4',
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

    if (response_data["message"] === undefined) {

        return (
            <>
                {/* ANALYSIS */}
                <div ref={pdfRef} className="w-full flex flex-col lg:gap-3 items-center rounded-lg bg-slate-50 pt-5 ">

                    {/* VERDICT + BUTTON | RESULT + METADATA */}
                    <div className=' w-full flex justify-between items-stretch px-8 gap-10 '>

                        <div className=' flex flex-col justify-between'>
                            {/* Verdict */}
                            <div className='w-72 flex justify-evenly '>
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

                            {/* play button */}
                            <button
                                onClick={handlePlayPause}
                                className=" w-fit bg-primary text-white text-4xl font-bold py-3 px-3 rounded-full transition-all duration-300 "
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
                        </div>

                        <div className='flex gap-10 justify-evenly w-full items-start'>
                            {/* RESULT */}
                            {
                                Object.keys(response_data).map((val, idx) => {
                                    const result = (response_data[val].result).toFixed(3);
                                    return (
                                        <div key={idx} className={` bg-white flex flex-col justify-evenly h-full w-fit items-center gap-3 min-w-96 px-5 py-2 rounded-lg shadow ${(result) > -1.3 ? " shadow-green-700" : " shadow-red-700"}  `}>
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
                                                    (` < -1.3 deems it suspicious of manipulation `)
                                                }
                                            </span>
                                        </div>
                                    )
                                })
                            }

                            {/* AUDIO META DATA */}
                            <div className=' bg-white py-4 px-5 border rounded-lg w-fit min-w-96 flex flex-col gap-4 shadow hover:shadow-primary transition-all duration-300'>
                                <span className=' text-xl'>
                                    Audio Metadata
                                </span>
                                <div className='flex flex-col break-words'>
                                    <div>
                                        <span className=' font-medium pr-2' >FileName: </span>
                                        <span>{file_metadata.name}</span>
                                    </div>
                                    <div>
                                        <span className=' font-medium pr-2' > Size: </span>
                                        <span>{file_metadata.size}</span>
                                    </div>
                                    <div>
                                        <span className=' font-medium pr-2' >Audio type: </span>
                                        <span>{file_metadata.type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GRAPH AND waveform slider */}
                    <div className=' relative z-10 flex flex-row justify-stretch w-full bg-primary border px-3 pb-4 pt-3 rounded-b-lg '>
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
        console.log(response_data);
        return (<>
            <div className='flex flex-col px-24 py-16'>
                <div className='text-xl bg-red-500 px-2' >ERROR OCCURED</div>
                <div className='text-lg bg-red-800 text-white px-2' >{response_data["message"]}</div>
            </div>
        </>)
    }
}

export default ResultsAudioUI