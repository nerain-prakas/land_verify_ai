export interface Database {
  public: {
    Tables: {
      land_listings: {
        Row: {
          id: string
          seller_id: string
          status: 'PENDING' | 'VERIFIED' | 'LIVE' | 'SOLD'
          certificate_url: string | null
          owner_name: string | null
          plot_number: string | null
          total_area: number | null
          coordinates: number[]
          registration_date: string | null
          verification_score: number | null
          ocr_confidence: number | null
          video_url: string | null
          video_duration: number | null
          terrain_type: string | null
          soil_quality: string | null
          vegetation_density: string | null
          built_structures: string[]
          accessibility: string | null
          boundary_match: number | null
          noise_level: string | null
          traffic_pattern: string | null
          dominant_sounds: string[]
          decibel_estimate: number | null
          red_flags: string[]
          asking_price: number | null
          price_per_sqm: number | null
          currency: string
          description: string | null
          geojson_polygon: any | null
          view_count: number
          inquiry_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          status?: 'PENDING' | 'VERIFIED' | 'LIVE' | 'SOLD'
          certificate_url?: string | null
          owner_name?: string | null
          plot_number?: string | null
          total_area?: number | null
          coordinates?: number[]
          registration_date?: string | null
          verification_score?: number | null
          ocr_confidence?: number | null
          video_url?: string | null
          video_duration?: number | null
          terrain_type?: string | null
          soil_quality?: string | null
          vegetation_density?: string | null
          built_structures?: string[]
          accessibility?: string | null
          boundary_match?: number | null
          noise_level?: string | null
          traffic_pattern?: string | null
          dominant_sounds?: string[]
          decibel_estimate?: number | null
          red_flags?: string[]
          asking_price?: number | null
          price_per_sqm?: number | null
          currency?: string
          description?: string | null
          geojson_polygon?: any | null
          view_count?: number
          inquiry_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          status?: 'PENDING' | 'VERIFIED' | 'LIVE' | 'SOLD'
          certificate_url?: string | null
          owner_name?: string | null
          plot_number?: string | null
          total_area?: number | null
          coordinates?: number[]
          registration_date?: string | null
          verification_score?: number | null
          ocr_confidence?: number | null
          video_url?: string | null
          video_duration?: number | null
          terrain_type?: string | null
          soil_quality?: string | null
          vegetation_density?: string | null
          built_structures?: string[]
          accessibility?: string | null
          boundary_match?: number | null
          noise_level?: string | null
          traffic_pattern?: string | null
          dominant_sounds?: string[]
          decibel_estimate?: number | null
          red_flags?: string[]
          asking_price?: number | null
          price_per_sqm?: number | null
          currency?: string
          description?: string | null
          geojson_polygon?: any | null
          view_count?: number
          inquiry_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      meeting_requests: {
        Row: {
          id: string
          buyer_id: string
          seller_id: string
          listing_id: string
          status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED'
          proposed_times: string[]
          selected_time: string | null
          location: string | null
          agenda: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          seller_id: string
          listing_id: string
          status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED'
          proposed_times?: string[]
          selected_time?: string | null
          location?: string | null
          agenda?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          seller_id?: string
          listing_id?: string
          status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED'
          proposed_times?: string[]
          selected_time?: string | null
          location?: string | null
          agenda?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string
          first_name: string | null
          last_name: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_properties_in_bounds: {
        Args: {
          north: number
          south: number
          east: number
          west: number
        }
        Returns: {
          id: string
          coordinates: number[]
          asking_price: number
          total_area: number
          status: string
        }[]
      }
      get_properties_near_point: {
        Args: {
          lat: number
          lng: number
          radius_km: number
        }
        Returns: {
          id: string
          coordinates: number[]
          asking_price: number
          total_area: number
          distance_km: number
        }[]
      }
      calculate_distance: {
        Args: {
          from_lat: number
          from_lng: number
          to_lat: number
          to_lng: number
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}