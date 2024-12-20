import { useStateProvider } from "@/context/StateContext";
import React, { useRef, useState, useEffect } from "react";
import { FaMicrophone, FaPauseCircle, FaStop, FaPlay, FaTrash } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";
import axios from "axios";
import { ADD_AUDIO_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";

function CaptureAudio({ hide }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [waveform, setWaveform] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [renderedAudio, setRenderedAudio] = useState(null);

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const waveFormRef = useRef(null);
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();

  // Recording duration tracker
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prevDuration) =>{
          setTotalDuration(prevDuration + 1);
          return prevDuration+1;
        } );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // WaveSurfer instance initialization
  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: waveFormRef.current,
      waveColor: "#ccc",
      progressColor: "#4a9eff",
      cursorColor: "#7ae3c3",
      barWidth: 2,
      height: 30,
      responsive: true,
    });
    setWaveform(wavesurfer);

    wavesurfer.on("finish", () => setIsPlaying(false));

    return () => wavesurfer.destroy();
  }, []);

  useEffect(()=>{
    if(waveform)handleStartRecording();

  },[waveform]);
  // Start recording
  const handleStartRecording = () => {
    setRecordingDuration(0);
    setCurrentPlaybackTime(0);
    setTotalDuration(0);
    setIsRecording(true);
    setRecordedAudio(null);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioRef.current.srcObject = stream;

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
          const audioURL = URL.createObjectURL(blob);
          const audio = new Audio(audioURL);

          setRecordedAudio(audio);
          waveform.load(audioURL);
        };

        mediaRecorder.start();
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  // Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      waveform.stop();

      const audioChunks = [];
      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });


      mediaRecorderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        const audioFile = new File([audioBlob], "recording.mp3");
        setRenderedAudio(audioFile);
      });
    }
  };

  // Update playback time
  useEffect(() => {
    if (recordedAudio) {
      const updatePlaybackTime = () => {
        setCurrentPlaybackTime(recordedAudio.currentTime);
      };

      recordedAudio.addEventListener("timeupdate", updatePlaybackTime);

      return () => {
        recordedAudio.removeEventListener("timeupdate", updatePlaybackTime);
      };
    }
  }, [recordedAudio]);

  // Play recording
  const handlePlayRecording = () => {
    if (recordedAudio) {
      waveform.stop();
      waveform.play();
      recordedAudio.play();
      setIsPlaying(true);
    }
  };

  // Pause recording
  const handlePauseRecording = () => {
    waveform.stop();
    recordedAudio.pause();
    setIsPlaying(false);
  };

  // Format time (mm:ss)
  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Send recording
  const sendRecording = async () => {
    try {
      const formData = new FormData();
      formData.append("audio", renderedAudio);

      const response = await axios.post(ADD_AUDIO_MESSAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          from: userInfo.id,
          to: currentChatUser.id,
        },
      });

      if (response.status === 201) {
        socket.current.emit("send-msg", {
          to: currentChatUser?.id,
          from: userInfo?.id,
          message: response.data.message,
        });

        dispatch({
          type: reducerCases.ADD_MESSSAGE,
          newMessage: response.data.message,
          fromSelf: true,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex text-2xl w-full justify-end items-center">
      {/* Trash Icon */}
      <div className="pt-1">
        <FaTrash className="text-panel-header-icon cursor-pointer" onClick={() => hide()} />
      </div>

      {/* Recording/Playback Section */}
      <div className="mx-4 py-2 px-4 text-white text-lg flex gap-3 justify-center items-center bg-search-input-container-background rounded-full drop-shadow-lg">
        {isRecording ? (
          <div className="text-red-500 animate-pulse text-center">
            Recording <span>{formatTime(recordingDuration)}</span>
          </div>
        ) : recordedAudio ? (
          <>
            {!isPlaying ? (
              <FaPlay onClick={handlePlayRecording} className="cursor-pointer" />
            ) : (
              <FaStop onClick={handlePauseRecording} className="cursor-pointer" />
            )}
          </>
        ) : null}
        <div className="w-60" ref={waveFormRef} hidden={isRecording} />

        {recordedAudio && isPlaying && (
          <span>
            {formatTime(currentPlaybackTime)} 
          </span>
        )}
        {recordedAudio && !isPlaying && (
          <span>
            {formatTime(totalDuration)}
          </span>
        )}
        
        

        <audio ref={audioRef} hidden />
      </div>

      {/* Record/Pause Button */}
      <div className="mr-4">
        {!isRecording ? (
          <FaMicrophone
            className="text-red-500 cursor-pointer"
            onClick={handleStartRecording}
          />
        ) : (
          <FaPauseCircle
            className="text-red-500 cursor-pointer"
            onClick={handleStopRecording}
          />
        )}
      </div>

      {/* Send Button */}
      <div>
        <MdSend
          className="text-panel-header-icon cursor-pointer mr-4"
          title="Send"
          onClick={sendRecording}
        />
      </div>
    </div>
  );
}

export default CaptureAudio;
