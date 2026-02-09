import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a seller
    const user = await currentUser()
    const role = user?.publicMetadata?.role as string
    
    if (role !== 'SELLER') {
      return NextResponse.json({ error: 'Only sellers can upload certificates' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('certificate') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // In production, upload to Google Cloud Storage
    // const uploadResult = await uploadToGCS(file)
    
    // Mock response for demo
    return NextResponse.json({
      success: true,
      fileUrl: 'https://storage.googleapis.com/landverify-certificates/demo.pdf',
      jobId: 'job_' + Date.now()
    })

  } catch (error) {
    console.error('Certificate upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload certificate' },
      { status: 500 }
    )
  }
}