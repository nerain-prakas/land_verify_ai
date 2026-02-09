"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react'


interface DocumentUploadProps {
  onSuccess: (data: any) => void
}

export default function DocumentUpload({ onSuccess }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploadedFile(file)
    setUploading(true)

    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1500))

      setUploading(false)
      setAnalyzing(true)

      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2500))

      const mockResult = {
        ownerName: "John Doe",
        plotNumber: "LP-2024-001",
        totalArea: 5.2,
        coordinates: [37.7749, -122.4194] as [number, number],
        registrationDate: new Date('2023-06-15'),
        verificationScore: 94,
        ocrConfidence: 97,
        isAuthentic: true,
        tamperingRisk: 'low' as const,
        missingFields: [],
      }

      setAnalysisResult(mockResult)
      setAnalyzing(false)
      onSuccess(mockResult)
    } catch (error) {
      setUploading(false)
      setAnalyzing(false)
      console.error('Upload failed:', error)
    }
  }, [onSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false,
    disabled: uploading || analyzing
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Step 1: Upload Land Certificate</h2>
        <p className="text-gray-600">
          Upload your official land certificate (PDF or image) for AI verification.
        </p>
      </div>

      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-lg text-blue-600">Drop your certificate here...</p>
          ) : (
            <>
              <p className="text-lg text-gray-600 mb-2">Drag & drop your land certificate</p>
              <p className="text-sm text-gray-500">or click to browse files</p>
            </>
          )}
          <p className="text-xs text-gray-400 mt-4">
            Supports PDF, PNG, JPG (max 10MB)
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium">{uploadedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          {uploading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading document...</span>
            </div>
          )}

          {analyzing && (
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing with Gemini 3 Pro...</span>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Document verified successfully!</span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div><strong>Owner:</strong> {analysisResult.ownerName}</div>
                  <div><strong>Plot Number:</strong> {analysisResult.plotNumber}</div>
                  <div><strong>Total Area:</strong> {analysisResult.totalArea} acres</div>
                </div>
                <div className="space-y-2">
                  <div><strong>Verification Score:</strong> {analysisResult.verificationScore}%</div>
                  <div><strong>OCR Confidence:</strong> {analysisResult.ocrConfidence}%</div>
                  <div><strong>Authenticity:</strong>
                    <span className="text-green-600 ml-1">✓ Verified</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => onSuccess(analysisResult)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Continue to Video Upload
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}