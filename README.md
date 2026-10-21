# QuickNotes System Design

## Overview

QuickNotes is a note-taking application that allows users to create, view, and delete notes. This project focuses on designing the system architecture, REST API, and database structure needed to support a reliable and scalable application.

The project documents how the frontend communicates with the backend, how requests are processed, and how note data can be stored securely in a MySQL database.

## Objectives

- Design a REST API for managing notes.
- Define a relational database model for users, notes, categories, and tags.
- Create a system architecture that supports scalability and reliability.
- Identify potential single points of failure and propose solutions.
- Document security, performance, and error-handling considerations.

## Technologies

- **HTML, CSS and JavaScript:** Frontend development.
- **REST API and JSON:** Communication between frontend and backend.
- **MySQL:** Proposed relational database.
- **Git and GitHub:** Version control and project hosting.
- **Mermaid:** System architecture diagrams.

## Project Structure

```text
quicknotes-system-design/
├── index.html
├── style.css
├── api.js
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## Documentation

| File | Description |
|---|---|
| `docs/api-design.md` | REST API endpoints, request and response examples, validation, and HTTP error codes. |
| `docs/data-model.md` | Database entities, relationships, SQL table definitions, indexes, and queries. |
| `docs/architecture.md` | System architecture, requirements, capacity estimates, scaling strategies, and single points of failure. |

## Main Features

- Load and display notes.
- Create notes with a title and body.
- Delete notes.
- Validate user input.
- Display loading, success, and error messages.
- Define a proposed backend architecture for future development.

## System Architecture

The proposed system consists of a web browser, frontend, load balancer, application servers, authentication and authorization, REST API, and MySQL database. Optional components include a cache, read replica, message queue, and background worker to support future growth.

The architecture is designed to improve maintainability, security, availability, and scalability.

## API Design

The proposed REST API supports the following operations:

- `GET /notes` — Retrieve notes.
- `GET /notes/{id}` — Retrieve a specific note.
- `POST /notes` — Create a note.
- `PUT /notes/{id}` — Update a note.
- `DELETE /notes/{id}` — Delete a note.

The API uses JSON for request and response bodies and standard HTTP status codes to communicate success or failure.

## Database Design

The proposed MySQL database includes users, notes, categories, and tags, with a junction table to support the many-to-many relationship between notes and tags.

Primary keys, foreign keys, constraints, and indexes help maintain data integrity and support efficient queries.

## Scalability and Reliability

Potential improvements include:

- Using multiple application servers behind a load balancer.
- Adding database indexes and optimizing queries.
- Introducing caching for frequently requested data.
- Using database replication to support read traffic.
- Moving suitable background tasks to a message queue and worker.
- Maintaining backups, monitoring, and recovery procedures.

Optional components represent future design improvements and are not necessarily implemented in the current project.

## Security Considerations

The proposed system should use HTTPS, authentication, authorization, server-side input validation, secure password storage, parameterized SQL queries, rate limiting, and appropriate error handling.

## Current Limitations

The current frontend uses JSONPlaceholder as a demonstration API. JSONPlaceholder simulates note creation and deletion but does not permanently save those changes. The custom REST API and MySQL backend described in the documentation are proposed system designs, not a claim that a production backend has been deployed.

## Author

**Esther Bwari**

## Project Purpose

This repository demonstrates system-design documentation, REST API planning, relational database design, architecture diagrams, scalability considerations, and version control using Git and GitHub.
