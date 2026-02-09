import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/lib/roles'

export async function POST(req: Request) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata, phone_numbers } = evt.data

    try {
      // Extract user details
      const email = email_addresses?.[0]?.email_address || ''
      const phone = phone_numbers?.[0]?.phone_number || null
      const role = (public_metadata?.role as UserRole) || 'BUYER'

      const firstName = first_name || ''
      const lastName = last_name || ''
      const fullName = `${firstName} ${lastName}`.trim() || email.split('@')[0]

      // Create user in database with comprehensive data
      const user = await prisma.user.create({
        data: {
          clerkId: id,
          email,
          firstName,
          lastName,
          fullName,
          phone,
          imageUrl: image_url || null,
          role,
          country: 'India', // Default country
        },
      })

      console.log(`✅ Created ${role} user from webhook:`, user.email)
    } catch (error) {
      console.error('❌ Error creating user in database:', error)
      return NextResponse.json(
        { error: 'Error creating user in database' },
        { status: 500 }
      )
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, public_metadata, phone_numbers } = evt.data

    try {
      // Extract updated user details
      const email = email_addresses?.[0]?.email_address || ''
      const phone = phone_numbers?.[0]?.phone_number || null
      const role = (public_metadata?.role as UserRole) || 'BUYER'

      const firstName = first_name || ''
      const lastName = last_name || ''
      const fullName = `${firstName} ${lastName}`.trim() || email.split('@')[0]

      // Update user in database with all available data
      const user = await prisma.user.update({
        where: { clerkId: id },
        data: {
          email,
          firstName,
          lastName,
          fullName,
          phone,
          imageUrl: image_url || null,
          role,
          updatedAt: new Date(),
        },
      })

      console.log(`✅ Updated user from webhook:`, user.email)
    } catch (error) {
      console.error('❌ Error updating user in database:', error)
      return NextResponse.json(
        { error: 'Error updating user in database' },
        { status: 500 }
      )
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      // Delete user from database (cascading deletes should handle related data)
      await prisma.user.delete({
        where: { clerkId: id as string },
      })

      console.log('✅ User deleted from database via webhook:', id)
    } catch (error) {
      console.error('❌ Error deleting user from database:', error)
      return NextResponse.json(
        { error: 'Error deleting user from database' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ message: 'Webhook received' }, { status: 200 })
}
