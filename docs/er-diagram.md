# Entity-Relationship (ER) Diagram: Event Management System (Project 9)

## Conceptual Architecture

The data architecture enforces strict relational referential integrity across 6 core entities:
- **User:** Principal entity representing system actors (`admin`, `organizer`, `attendee`).
- **Venue:** Physical facilities created by organizers/admins hosting events.
- **Event:** Central programme entity, organized by users at venues.
- **TicketType:** Multi-tier inventory allocations defined per event with atomic decrement semantics.
- **Registration:** Formal booking between an attendee, an event, and a ticket tier with unique human-readable code.
- **Payment:** Simulated settlement record directly referencing registrations.

```mermaid
erDiagram
    User ||--o{ Venue : "creates"
    User ||--o{ Event : "organizes"
    User ||--o{ Registration : "registers"
    Venue ||--o{ Event : "hosts"
    Event ||--o{ TicketType : "defines"
    Event ||--o{ Registration : "contains"
    TicketType ||--o{ Registration : "specifies"
    Registration ||--one Payment : "settles"

    User {
        ObjectId _id PK
        string name "required, trim, max 100"
        string email "required, unique, lowercase"
        string passwordHash "required, select: false (bcrypt)"
        string role "enum: [admin, organizer, attendee], default: attendee"
        boolean isActive "default: true"
        date createdAt "timestamps"
        date updatedAt "timestamps"
    }

    Venue {
        ObjectId _id PK
        string name "required, trim, max 150"
        string address "required, trim"
        string city "required, trim, indexed"
        number capacity "required, min: 1"
        ObjectId createdBy FK "ref: User, required, indexed"
        date createdAt
        date updatedAt
    }

    Event {
        ObjectId _id PK
        string title "required, trim, max 200, text-indexed"
        string description "required, trim, text-indexed"
        string category "enum: [Conference, Concert, Workshop, Seminar, Meetup, Festival, Exhibition, Other]"
        date startDate "required, compound-indexed"
        date endDate "required, endDate >= startDate"
        ObjectId venue FK "ref: Venue, required, indexed"
        ObjectId organizer FK "ref: User, required, indexed"
        string status "enum: [draft, published, cancelled, completed], compound-indexed"
        number capacity "required, min: 1, capacity <= venue.capacity"
        date createdAt
        date updatedAt
    }

    TicketType {
        ObjectId _id PK
        ObjectId event FK "ref: Event, required, compound-unique-indexed"
        string name "required, trim, max 80, compound-unique-indexed"
        number price "required, min: 0, default: 0"
        number quantityTotal "required, min: 1"
        number quantitySold "default: 0, min: 0, <= quantityTotal"
        date saleStart "required"
        date saleEnd "required, saleEnd >= saleStart"
        date createdAt
        date updatedAt
    }

    Registration {
        ObjectId _id PK
        ObjectId user FK "ref: User, required, compound-unique-indexed"
        ObjectId event FK "ref: Event, required, compound-unique-indexed"
        ObjectId ticketType FK "ref: TicketType, required, compound-unique-indexed"
        number quantity "required, min: 1, default: 1"
        string status "enum: [confirmed, cancelled], default: confirmed"
        string attendance "enum: [pending, checked_in, no_show], default: pending"
        date checkedInAt "nullable"
        string registrationCode "required, unique-indexed, uppercase (REG-XXXXXX)"
        date createdAt
        date updatedAt
    }

    Payment {
        ObjectId _id PK
        ObjectId registration FK "ref: Registration, required, indexed"
        number amount "required, min: 0"
        string method "enum: [card, upi, cash], required"
        string status "enum: [pending, paid, failed, refunded], default: pending"
        string reference "required, unique-indexed (PAY-XXXX-XXXX)"
        date paidAt "nullable"
        date createdAt
        date updatedAt
    }
```

## Key Relational Constraints & Indexes
1. **User:** Unique index on `email`.
2. **Venue:** Single index on `city`, compound index on `{ city: 1, name: 1 }`.
3. **Event:** Full-text index on `{ title: 'text', description: 'text' }`; compound index on `{ status: 1, startDate: 1 }`.
4. **TicketType:** Compound unique index on `{ event: 1, name: 1 }` preventing duplicate tier naming within the same production.
5. **Registration:** Compound unique index on `{ user: 1, event: 1, ticketType: 1 }` preventing duplicate active bookings; unique index on `registrationCode`.
6. **Payment:** Unique index on transaction `reference`.

