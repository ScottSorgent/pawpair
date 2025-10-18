# PawPair API Documentation

This document defines the REST API endpoints that the PawPair mobile app will call. Currently, these endpoints are mocked in the services layer. When implementing the backend (Express + Postgres on AWS), follow these specifications to ensure type compatibility with the frontend.

---

## Authentication

### Sign Up

**Endpoint:** `POST /auth/sign-up`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-10-18T00:00:00.000Z"
  },
  "token": "jwt-token-string"
}
```

**Error Response (400/409):**
```json
{
  "error": "Email already exists"
}
```

---

### Sign In

**Endpoint:** `POST /auth/sign-in`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-10-18T00:00:00.000Z"
  },
  "token": "jwt-token-string"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

## Profile Management

### Get User Profile

**Endpoint:** `GET /profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": "uuid-string",
  "userId": "uuid-string",
  "bio": "Animal lover seeking furry companion",
  "photoUrl": "https://example.com/photo.jpg",
  "phone": "+1234567890",
  "verifiedId": true,
  "backgroundCheckStatus": "approved",
  "backgroundCheckDate": "2025-10-15T00:00:00.000Z",
  "lifestyle": {
    "housingType": "House",
    "hasYard": true,
    "hasChildren": false,
    "hasPets": false,
    "activityLevel": "Moderate",
    "workSchedule": "Full-time",
    "preferredPetEnergy": "Medium"
  },
  "preferences": {
    "species": ["dog", "cat"],
    "size": ["medium", "large"],
    "age": ["young", "adult"],
    "temperament": ["friendly", "playful"]
  },
  "address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+1987654321",
    "relationship": "Spouse"
  },
  "createdAt": "2025-10-18T00:00:00.000Z",
  "updatedAt": "2025-10-18T00:00:00.000Z"
}
```

---

### Update User Profile

**Endpoint:** `PUT /profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body (all fields optional):**
```json
{
  "bio": "Updated bio text",
  "phone": "+1234567890",
  "lifestyle": {
    "housingType": "Apartment",
    "hasYard": false,
    "activityLevel": "High"
  },
  "preferences": {
    "species": ["dog"],
    "size": ["small", "medium"]
  },
  "address": {
    "street": "456 Oak Ave",
    "city": "Oakland",
    "state": "CA",
    "zipCode": "94601"
  }
}
```

**Response (200 OK):**
```json
{
  "id": "uuid-string",
  "userId": "uuid-string",
  "bio": "Updated bio text",
  "phone": "+1234567890",
  "lifestyle": {
    "housingType": "Apartment",
    "hasYard": false,
    "activityLevel": "High"
  },
  "updatedAt": "2025-10-18T01:00:00.000Z"
}
```

---

## Pets

### Get Recommended Pets

**Endpoint:** `GET /pets/recommended`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
```
?species=dog,cat
&size=medium,large
&age=young,adult
&temperament=friendly,playful
&maxDistance=25
&limit=20
&offset=0
```

**Response (200 OK):**
```json
{
  "pets": [
    {
      "id": "uuid-string",
      "name": "Buddy",
      "species": "dog",
      "breed": "Golden Retriever",
      "age": 3,
      "sex": "male",
      "size": "large",
      "weight": 70,
      "color": "Golden",
      "description": "Friendly and energetic dog looking for an active family.",
      "temperament": ["friendly", "energetic", "loyal"],
      "medicalHistory": "Up to date on vaccinations, neutered",
      "specialNeeds": null,
      "houseTrained": true,
      "goodWithKids": true,
      "goodWithDogs": true,
      "goodWithCats": false,
      "adoptionFee": 250,
      "availableForAdoption": true,
      "images": [
        "https://example.com/buddy1.jpg",
        "https://example.com/buddy2.jpg"
      ],
      "videoUrl": "https://example.com/buddy-video.mp4",
      "shelterId": "shelter-uuid",
      "shelter": {
        "id": "shelter-uuid",
        "name": "Happy Paws Shelter",
        "address": "789 Shelter Rd, San Francisco, CA 94103",
        "phone": "+1555123456",
        "distance": 5.2
      },
      "createdAt": "2025-10-01T00:00:00.000Z",
      "updatedAt": "2025-10-15T00:00:00.000Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

---

### Get Pet Details

**Endpoint:** `GET /pets/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": "uuid-string",
  "name": "Buddy",
  "species": "dog",
  "breed": "Golden Retriever",
  "age": 3,
  "sex": "male",
  "size": "large",
  "weight": 70,
  "color": "Golden",
  "description": "Friendly and energetic dog looking for an active family.",
  "temperament": ["friendly", "energetic", "loyal"],
  "medicalHistory": "Up to date on vaccinations, neutered",
  "specialNeeds": null,
  "houseTrained": true,
  "goodWithKids": true,
  "goodWithDogs": true,
  "goodWithCats": false,
  "adoptionFee": 250,
  "availableForAdoption": true,
  "images": [
    "https://example.com/buddy1.jpg",
    "https://example.com/buddy2.jpg"
  ],
  "videoUrl": "https://example.com/buddy-video.mp4",
  "shelterId": "shelter-uuid",
  "shelter": {
    "id": "shelter-uuid",
    "name": "Happy Paws Shelter",
    "address": "789 Shelter Rd, San Francisco, CA 94103",
    "phone": "+1555123456",
    "email": "contact@happypaws.org",
    "hours": "Mon-Sat: 10am-6pm, Sun: 12pm-5pm",
    "website": "https://happypaws.org"
  },
  "stats": {
    "viewCount": 245,
    "favoriteCount": 67,
    "averageRating": 4.8,
    "reviewCount": 12
  },
  "createdAt": "2025-10-01T00:00:00.000Z",
  "updatedAt": "2025-10-15T00:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "Pet not found"
}
```

---

## Shelters

### Get Nearby Shelters

**Endpoint:** `GET /shelters/nearby`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (required):**
```
?lat=37.7749
&lng=-122.4194
&radius=25
&limit=10
```

**Response (200 OK):**
```json
{
  "shelters": [
    {
      "id": "uuid-string",
      "name": "Happy Paws Shelter",
      "address": "789 Shelter Rd, San Francisco, CA 94103",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94103",
      "country": "USA",
      "phone": "+1555123456",
      "email": "contact@happypaws.org",
      "website": "https://happypaws.org",
      "description": "A no-kill shelter dedicated to finding homes for every pet.",
      "hours": "Mon-Sat: 10am-6pm, Sun: 12pm-5pm",
      "location": {
        "lat": 37.7749,
        "lng": -122.4194
      },
      "distance": 5.2,
      "availablePets": 23,
      "rating": 4.7,
      "images": [
        "https://example.com/shelter1.jpg"
      ],
      "amenities": ["parking", "indoor_play_area", "grooming"],
      "verifiedShelter": true
    }
  ],
  "total": 8
}
```

---

### Get Available Time Slots

**Endpoint:** `GET /shelters/:id/slots`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
```
?date=2025-10-20
&petId=pet-uuid (optional)
```

**Response (200 OK):**
```json
{
  "shelterId": "uuid-string",
  "date": "2025-10-20",
  "slots": [
    {
      "time": "09:00",
      "available": true,
      "capacity": 4,
      "booked": 1
    },
    {
      "time": "10:00",
      "available": true,
      "capacity": 4,
      "booked": 2
    },
    {
      "time": "11:00",
      "available": false,
      "capacity": 4,
      "booked": 4
    },
    {
      "time": "14:00",
      "available": true,
      "capacity": 4,
      "booked": 0
    },
    {
      "time": "15:00",
      "available": true,
      "capacity": 4,
      "booked": 1
    },
    {
      "time": "16:00",
      "available": true,
      "capacity": 4,
      "booked": 3
    }
  ]
}
```

---

## Bookings

### Create Booking

**Endpoint:** `POST /bookings`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "petId": "uuid-string",
  "shelterId": "uuid-string",
  "date": "2025-10-20",
  "timeSlot": "14:00",
  "notes": "I'm especially interested in learning about the pet's training history."
}
```

**Response (201 Created):**
```json
{
  "id": "uuid-string",
  "userId": "uuid-string",
  "petId": "uuid-string",
  "shelterId": "uuid-string",
  "date": "2025-10-20",
  "timeSlot": "14:00",
  "status": "pending",
  "notes": "I'm especially interested in learning about the pet's training history.",
  "confirmationCode": "PW-AB12CD",
  "pet": {
    "id": "uuid-string",
    "name": "Buddy",
    "species": "dog",
    "breed": "Golden Retriever",
    "images": ["https://example.com/buddy1.jpg"]
  },
  "shelter": {
    "id": "uuid-string",
    "name": "Happy Paws Shelter",
    "address": "789 Shelter Rd, San Francisco, CA 94103",
    "phone": "+1555123456"
  },
  "createdAt": "2025-10-18T00:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "Time slot no longer available"
}
```

**Error Response (409):**
```json
{
  "error": "You already have a booking at this time"
}
```

---

### Get User Bookings

**Endpoint:** `GET /bookings`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (optional):**
```
?status=confirmed,pending
&from=2025-10-01
&to=2025-10-31
&limit=20
&offset=0
```

**Response (200 OK):**
```json
{
  "bookings": [
    {
      "id": "uuid-string",
      "userId": "uuid-string",
      "petId": "uuid-string",
      "shelterId": "uuid-string",
      "date": "2025-10-20",
      "timeSlot": "14:00",
      "status": "confirmed",
      "notes": "Looking forward to meeting Buddy!",
      "confirmationCode": "PW-AB12CD",
      "pet": {
        "id": "uuid-string",
        "name": "Buddy",
        "species": "dog",
        "breed": "Golden Retriever",
        "images": ["https://example.com/buddy1.jpg"]
      },
      "shelter": {
        "id": "uuid-string",
        "name": "Happy Paws Shelter",
        "address": "789 Shelter Rd, San Francisco, CA 94103",
        "phone": "+1555123456"
      },
      "createdAt": "2025-10-18T00:00:00.000Z",
      "updatedAt": "2025-10-18T02:00:00.000Z"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

---

### Update Booking

**Endpoint:** `PATCH /bookings/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "date": "2025-10-21",
  "timeSlot": "15:00",
  "status": "cancelled",
  "notes": "Updated notes"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid-string",
  "date": "2025-10-21",
  "timeSlot": "15:00",
  "status": "cancelled",
  "updatedAt": "2025-10-18T05:00:00.000Z"
}
```

---

### Cancel Booking

**Endpoint:** `DELETE /bookings/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Booking cancelled successfully",
  "bookingId": "uuid-string"
}
```

---

## Feedback

### Submit Feedback

**Endpoint:** `POST /feedback`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "bookingId": "uuid-string",
  "petId": "uuid-string",
  "shelterId": "uuid-string",
  "ratings": {
    "overallExperience": 5,
    "petTemperament": 5,
    "shelterStaff": 5,
    "cleanliness": 4,
    "communication": 5
  },
  "petBehavior": ["friendly", "playful", "calm"],
  "wouldRecommend": true,
  "interestedInAdoption": true,
  "comments": "Buddy was amazing! Very friendly and well-behaved. The shelter staff was knowledgeable and helpful.",
  "photos": [
    "https://example.com/my-visit-photo1.jpg"
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "uuid-string",
  "userId": "uuid-string",
  "bookingId": "uuid-string",
  "petId": "uuid-string",
  "shelterId": "uuid-string",
  "ratings": {
    "overallExperience": 5,
    "petTemperament": 5,
    "shelterStaff": 5,
    "cleanliness": 4,
    "communication": 5
  },
  "petBehavior": ["friendly", "playful", "calm"],
  "wouldRecommend": true,
  "interestedInAdoption": true,
  "comments": "Buddy was amazing! Very friendly and well-behaved. The shelter staff was knowledgeable and helpful.",
  "photos": [
    "https://example.com/my-visit-photo1.jpg"
  ],
  "helpful": 0,
  "createdAt": "2025-10-20T18:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "Feedback already submitted for this booking"
}
```

---

### Get Pet Feedback

**Endpoint:** `GET /pets/:id/feedback`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (optional):**
```
?limit=20
&offset=0
&sort=recent|helpful
```

**Response (200 OK):**
```json
{
  "feedback": [
    {
      "id": "uuid-string",
      "userId": "uuid-string",
      "userName": "John D.",
      "userPhotoUrl": "https://example.com/user-photo.jpg",
      "petId": "uuid-string",
      "ratings": {
        "overallExperience": 5,
        "petTemperament": 5
      },
      "petBehavior": ["friendly", "playful", "calm"],
      "wouldRecommend": true,
      "comments": "Buddy was amazing! Very friendly and well-behaved.",
      "photos": [
        "https://example.com/my-visit-photo1.jpg"
      ],
      "helpful": 12,
      "visitDate": "2025-10-20",
      "createdAt": "2025-10-20T18:00:00.000Z"
    }
  ],
  "total": 34,
  "averageRating": 4.8,
  "limit": 20,
  "offset": 0
}
```

---

## Rewards

### Get User Rewards

**Endpoint:** `GET /rewards`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "userId": "uuid-string",
  "totalPoints": 450,
  "level": "Bronze",
  "nextLevel": "Silver",
  "pointsToNextLevel": 50,
  "badges": [
    {
      "id": "uuid-string",
      "name": "First Visit",
      "description": "Completed your first shelter visit",
      "icon": "https://example.com/badge-first-visit.png",
      "earnedAt": "2025-10-01T00:00:00.000Z"
    },
    {
      "id": "uuid-string",
      "name": "Feedback Hero",
      "description": "Submitted 5 helpful feedback reports",
      "icon": "https://example.com/badge-feedback.png",
      "earnedAt": "2025-10-10T00:00:00.000Z"
    }
  ],
  "recentActivity": [
    {
      "type": "visit_completed",
      "points": 50,
      "description": "Completed visit with Buddy",
      "date": "2025-10-20T00:00:00.000Z"
    },
    {
      "type": "feedback_submitted",
      "points": 25,
      "description": "Submitted feedback for Buddy",
      "date": "2025-10-20T18:00:00.000Z"
    },
    {
      "type": "profile_completed",
      "points": 100,
      "description": "Completed your profile",
      "date": "2025-10-01T00:00:00.000Z"
    }
  ],
  "availableRewards": [
    {
      "id": "uuid-string",
      "name": "Free Adoption Fee",
      "description": "Waive adoption fee for one pet (up to $500)",
      "pointsCost": 1000,
      "available": false
    },
    {
      "id": "uuid-string",
      "name": "Pet Starter Kit",
      "description": "Food, toys, and essentials for new pet parents",
      "pointsCost": 500,
      "available": true
    }
  ],
  "stats": {
    "totalVisits": 8,
    "totalFeedback": 6,
    "helpfulVotes": 23,
    "adoptionsCompleted": 0
  }
}
```

---

### Redeem Reward

**Endpoint:** `POST /rewards/redeem`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "rewardId": "uuid-string"
}
```

**Response (200 OK):**
```json
{
  "redemptionId": "uuid-string",
  "rewardId": "uuid-string",
  "rewardName": "Pet Starter Kit",
  "pointsSpent": 500,
  "remainingPoints": 450,
  "code": "PSK-XY789Z",
  "expiresAt": "2025-11-20T00:00:00.000Z",
  "instructions": "Show this code to any partner shelter when adopting a pet.",
  "redeemedAt": "2025-10-20T00:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "Insufficient points"
}
```

---

## Messages

### Get Message Threads

**Endpoint:** `GET /messages/threads`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (optional):**
```
?limit=20
&offset=0
```

**Response (200 OK):**
```json
{
  "threads": [
    {
      "id": "uuid-string",
      "userId": "uuid-string",
      "shelterId": "uuid-string",
      "shelterName": "Happy Paws Shelter",
      "petId": "uuid-string",
      "petName": "Buddy",
      "lastMessage": "We'd love to schedule your visit!",
      "lastMessageTime": "2025-10-18T14:30:00.000Z",
      "unreadCount": 2,
      "createdAt": "2025-10-18T10:00:00.000Z"
    }
  ],
  "total": 3
}
```

---

### Get Thread Messages

**Endpoint:** `GET /messages/threads/:threadId`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (optional):**
```
?limit=50
&before=message-uuid (for pagination)
```

**Response (200 OK):**
```json
{
  "thread": {
    "id": "uuid-string",
    "userId": "uuid-string",
    "shelterId": "uuid-string",
    "shelterName": "Happy Paws Shelter",
    "petId": "uuid-string",
    "petName": "Buddy"
  },
  "messages": [
    {
      "id": "uuid-string",
      "threadId": "uuid-string",
      "senderId": "uuid-string",
      "senderType": "user",
      "text": "Hi, I'm interested in meeting Buddy!",
      "read": true,
      "createdAt": "2025-10-18T10:00:00.000Z"
    },
    {
      "id": "uuid-string",
      "threadId": "uuid-string",
      "senderId": "shelter-user-uuid",
      "senderType": "shelter",
      "text": "We'd love to schedule your visit! What days work for you?",
      "read": true,
      "createdAt": "2025-10-18T10:15:00.000Z"
    }
  ],
  "hasMore": false
}
```

---

### Send Message

**Endpoint:** `POST /messages/threads/:threadId`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "text": "How about this Saturday at 2pm?"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid-string",
  "threadId": "uuid-string",
  "senderId": "uuid-string",
  "senderType": "user",
  "text": "How about this Saturday at 2pm?",
  "read": false,
  "createdAt": "2025-10-18T14:30:00.000Z"
}
```

---

## Favorites

### Add Pet to Favorites

**Endpoint:** `POST /favorites`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "petId": "uuid-string"
}
```

**Response (201 Created):**
```json
{
  "userId": "uuid-string",
  "petId": "uuid-string",
  "createdAt": "2025-10-18T00:00:00.000Z"
}
```

---

### Remove Pet from Favorites

**Endpoint:** `DELETE /favorites/:petId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Pet removed from favorites"
}
```

---

### Get User Favorites

**Endpoint:** `GET /favorites`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "favorites": [
    {
      "petId": "uuid-string",
      "pet": {
        "id": "uuid-string",
        "name": "Buddy",
        "species": "dog",
        "breed": "Golden Retriever",
        "age": 3,
        "images": ["https://example.com/buddy1.jpg"],
        "shelter": {
          "name": "Happy Paws Shelter"
        }
      },
      "addedAt": "2025-10-18T00:00:00.000Z"
    }
  ],
  "total": 12
}
```

---

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "error": "Access denied"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Headers

All authenticated requests should include:
```
Authorization: Bearer {jwt-token}
Content-Type: application/json
```

---

## Notes for Backend Implementation

1. **Base URL**: Deploy to AWS and configure base URL (e.g., `https://api.pawpair.com/v1`)

2. **Authentication**: Use JWT tokens with expiration. Include refresh token mechanism.

3. **Pagination**: Use `limit` and `offset` for consistent pagination across all list endpoints.

4. **Date Format**: All dates should be in ISO 8601 format (UTC).

5. **File Uploads**: For image uploads (profile photos, feedback photos), implement separate multipart/form-data endpoints:
   - `POST /upload/profile-photo`
   - `POST /upload/feedback-photos`

6. **Rate Limiting**: Implement rate limiting to prevent abuse:
   - Auth endpoints: 5 requests per minute
   - Other endpoints: 100 requests per minute

7. **CORS**: Configure CORS to allow mobile app origins.

8. **Validation**: Validate all input data and return clear error messages.

9. **Database**: Use Postgres with proper indexing on frequently queried fields (userId, petId, shelterId, date).

10. **Caching**: Consider Redis for caching frequently accessed data (pet listings, shelter info).

11. **Real-time**: For messages, consider implementing WebSocket support for real-time updates.

12. **Search**: Implement full-text search for pet names, breeds, and descriptions.

---

## TypeScript Types

The frontend expects these types to match the API responses. Reference `/types/index.ts` for the complete type definitions.

Key types:
- `User`
- `Profile`
- `Pet`
- `Shelter`
- `Booking`
- `Feedback`
- `Thread`
- `Message`
- `Badge`
- `Reward`
