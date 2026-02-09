"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Video, Camera, Upload, CheckCircle, Loader2, Play, Pause } from 'lucide-react'

interface VideoUploadProps {
  documentData: any
  onSuccess: (data: any) => void
}

export default function VideoUpload({ documentData, onSuccess }: VideoUploadProps) {
  const [recording, setRecording] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        setRecordedVideo(blob)
        setVideoUrl(URL.createObjectURL(blob))
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const uploadVideo = async (file: File) => {
    setAnalyzing(true)
    
    try {
      // Simulate video upload and analysis
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockResult = {
        videoUrl: videoUrl,
        duration: 85,
        visualInsights: {
          terrainType: 'flat' as const,
          soilQuality: 'good' as const,
          vegetationDensity: 'moderate' as const,
          builtStructures: ['fence', 'well'],
          accessibility: 'rural' as const,
          boundaryMatch: 92,
        },
        audioInsights: {
          noiseLevel: 'moderate' as const,
          trafficPattern: 'light' as const,
          dominantSounds: ['birds', 'wind', 'distant traffic'],
          decibelEstimate: 45,
        },
        crossValidation: {
          certificateMatchScore: 94,
          redFlags: [],
          confidence: 96,
        }
      }

      setAnalysisResult(mockResult)
      setAnalyzing(false)
      onSuccess(mockResult)
    } catch (error) {
      setAnalyzing(false)
      console.error('Analysis failed:', error)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoUrl(URL.createObjectURL(file))
      uploadVideo(file)
    }
  }

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Video className="h-5 w-5" />
          Land Video Recording & Analysis
        </h2>

        {!videoUrl && (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full rounded-lg"
                style={{ display: recording ? 'block' : 'none' }}
              />
              {!recording && (
                <div className="text-center">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Camera preview will appear here</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!recording ? (
                <Button onClick={startRecording} className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive" className="flex-1">
                  Stop Recording
                </Button>
              )}

              <div className="relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Video
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center">
              Record or upload a 60-120 second walkthrough video of your land
            </p>
          </div>
        )}

        {videoUrl && !analyzing && !analysisResult && (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full"
                onClick={togglePlayback}
              />
              <button
                onClick={togglePlayback}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition"
              >
                {isPlaying ? (
                  <Pause className="h-16 w-16 text-white" />
                ) : (
                  <Play className="h-16 w-16 text-white" />
                )}
              </button>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => recordedVideo && uploadVideo(recordedVideo as any)} className="flex-1">
                <Upload className="mr-2 h-4 w-4" />
                Analyze Video
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setVideoUrl('')
                  setRecordedVideo(null)
                }}
              >
                Retake
              </Button>
            </div>
          </div>
        )}

        {analyzing && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analyzing Video...</h3>
            <p className="text-gray-600">
              Gemini AI is analyzing terrain, soil, vegetation, structures, audio, and more
            </p>
          </div>
        )}

        {analysisResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Analysis Complete!</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Terrain Type</p>
                <p className="font-semibold capitalize">{analysisResult.visualInsights.terrainType}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Soil Quality</p>
                <p className="font-semibold capitalize">{analysisResult.visualInsights.soilQuality}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Vegetation</p>
                <p className="font-semibold capitalize">{analysisResult.visualInsights.vegetationDensity}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Noise Level</p>
                <p className="font-semibold capitalize">{analysisResult.audioInsights.noiseLevel}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Overall Confidence Score</p>
              <p className="text-2xl font-bold text-blue-600">
                {analysisResult.crossValidation.confidence}%
              </p>
            </div>

            <Button onClick={() => onSuccess(analysisResult)} className="w-full">
              Continue to Review
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
