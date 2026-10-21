
# QuickNotes Data Model

## 1. Overview

QuickNotes is an application that allows users to create, organize, search and delete notes. The database must store user accounts, notes, categories and tags.

The proposed database is MySQL, a relational database that supports structured data, relationships, constraints and transactions.

## 2. Entities

The data model contains four main entities.

### 2.1 Users

Stores information about registered users.

- `id`: Unique identifier for each user.
- `name`: User's display name.
- `email`: User's unique email address.
- `password_hash`: Secure hash of the user's password.
- `created_at`: Date and time the account was created.

### 2.2 Notes

Stores the notes created by users.

- `id`: Unique identifier for each note.
- `user_id`: Identifies the user who owns the note.
- `category_id`: Identifies the note's category.
- `title`: Note title, required and limited to 100 characters.
- `body`: Note content, which is optional.
- `created_at`: Date and time the note was created.
- `updated_at`: Date and time the note was last updated.

### 2.3 Categories

Stores categories used to organize notes.

- `id`: Unique identifier for each category.
- `user_id`: Identifies the user who owns the category.
- `name`: Category name, such as Personal, Work, or Study.

### 2.4 Tags

Stores labels that can be attached to notes to improve organization and searching.

- `id`: Unique identifier for each tag.
- `user_id`: Identifies the user who owns the tag.
- `name`: Tag name, such as revision, project, or urgent.

### Note–Tag Relationship

A note can have several tags and a tag can be attached to several notes. This is a many-to-many relationship implemented using a junction table called `note_tags`. The junction table connects the four main entities without storing repeated tag lists inside a note.

## 3. Entity Relationships

The relationships are:

1. One user can own many notes (one-to-many).
2. One user can create many categories (one-to-many).
3. One user can create many tags (one-to-many).
4. One category can contain many notes (one-to-many).
5. Notes and tags have a many-to-many relationship through `note_tags`.

Every note, category, and tag belongs to a user. The backend must prevent users from accessing another user's records.

## 4. SQL CREATE TABLE Statements

The following SQL defines the proposed MySQL schema.

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(50) NOT NULL,

    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_category_per_user
        UNIQUE (user_id, name),

    CONSTRAINT uq_category_id_user
        UNIQUE (id, user_id)
);

CREATE TABLE notes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_notes_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notes_category_owner
        FOREIGN KEY (category_id, user_id)
        REFERENCES categories(id, user_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_note_title
        CHECK (CHAR_LENGTH(TRIM(title)) BETWEEN 1 AND 100
            AND title NOT REGEXP '^[[:space:]]*$')
);

CREATE TABLE tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(50) NOT NULL,

    CONSTRAINT fk_tags_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_tag_per_user
        UNIQUE (user_id, name),

    CONSTRAINT uq_tag_id_user
        UNIQUE (id, user_id)
);

CREATE TABLE note_tags (
    note_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (note_id, tag_id),

    CONSTRAINT fk_note_tags_note_owner
        FOREIGN KEY (note_id, user_id)
        REFERENCES notes(id, user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_note_tags_tag_owner
        FOREIGN KEY (tag_id, user_id)
        REFERENCES tags(id, user_id)
        ON DELETE CASCADE
);
```

The `note_tags` table is a supporting junction table, not a fifth main entity. Its composite foreign keys ensure that a note and its tag belong to the same user.

The backend must also validate titles before inserting them. Database constraint behaviour can vary by MySQL version, so application-level validation remains necessary.

## 5. Example SQL Queries

### 5.1 Create a Note

```sql
INSERT INTO notes (user_id, category_id, title, body)
VALUES (1, 1, 'Network Security', 'Review firewalls and access controls');
```

The example assumes user 1 and category 1 exist and that the category belongs to user 1.

### 5.2 Retrieve a User's Notes

```sql
SELECT id, title, body, category_id, created_at, updated_at
FROM notes
WHERE user_id = 1
ORDER BY updated_at DESC;
```

### 5.3 Search Notes by Title

```sql
SELECT id, title, body
FROM notes
WHERE user_id = 1
  AND title LIKE '%security%'
ORDER BY updated_at DESC;
```

### 5.4 Update a Note

```sql
UPDATE notes
SET title = 'Updated Network Security',
    body = 'Review firewalls, access controls and monitoring'
WHERE id = 1
  AND user_id = 1;
```

### 5.5 Delete a Note

```sql
DELETE FROM notes
WHERE id = 1
  AND user_id = 1;
```

The `user_id` condition helps ensure that the operation only affects a note belonging to the specified user.

### 5.6 Find Notes with Their Categories

```sql
SELECT n.id, n.title, c.name AS category
FROM notes AS n
LEFT JOIN categories AS c
    ON n.category_id = c.id
   AND n.user_id = c.user_id
WHERE n.user_id = 1
ORDER BY n.updated_at DESC;
```

### 5.7 Find Notes with a Specific Tag

```sql
SELECT n.id, n.title, n.body
FROM notes AS n
JOIN note_tags AS nt
    ON n.id = nt.note_id
   AND n.user_id = nt.user_id
JOIN tags AS t
    ON nt.tag_id = t.id
   AND nt.user_id = t.user_id
WHERE n.user_id = 1
  AND t.name = 'revision';
```

## 6. Indexes

Indexes improve the speed of common searches and queries.

| Index | Purpose |
|---|---|
| Primary key on `users.id` | Finds a user by ID |
| Unique index on `users.email` | Prevents duplicate email addresses and speeds up login lookups |
| Unique index on `(user_id, name)` in `categories` | Prevents duplicate category names per user |
| Unique index on `(user_id, name)` in `tags` | Prevents duplicate tag names per user |
| Index on `(user_id, updated_at)` in `notes` | Helps retrieve a user's notes in recent-update order |
| Index on `(user_id, category_id)` in `notes` | Helps filter notes by category |
| Primary key on `(note_id, tag_id)` in `note_tags` | Prevents duplicate tag assignments and supports note-to-tag lookup |
| Index on `(tag_id, user_id)` in `note_tags` | Helps find notes associated with a tag |

The primary keys and unique constraints create indexes automatically. The additional indexes should be added based on query patterns and verified using `EXPLAIN`.

Example additional indexes:

```sql
CREATE INDEX idx_notes_user_updated
ON notes (user_id, updated_at);

CREATE INDEX idx_notes_user_category
ON notes (user_id, category_id);

CREATE INDEX idx_note_tags_tag_user
ON note_tags (tag_id, user_id);
```

Do not create duplicate indexes when an equivalent index already exists.

## 7. SQL vs NoSQL Decision

### Selected: SQL (MySQL)

MySQL is the preferred database for QuickNotes because:

1. **Relationships:** Users, notes, categories, and tags have clear relationships that foreign keys can enforce.
2. **Data integrity:** Primary keys, unique constraints and foreign keys help prevent invalid or inconsistent data.
3. **Transactions:** SQL transactions can group related database operations and roll them back if a failure occurs.
4. **Structured queries:** SQL supports joins, filtering, sorting and aggregation.
5. **Security:** User ownership can be enforced through backend authorization and database constraints.
6. **Suitable scale:** A relational database is sufficient for a typical notes application and can be optimized with indexes.

### Why not NoSQL?

A document database can store flexible note documents and may be useful when data structures vary significantly. However, QuickNotes has clear relationships and integrity requirements. A relational model is simpler to maintain for this application's current needs.

NoSQL is not inherently less secure or less scalable; it is simply not the best fit for the proposed initial data model.

## 8. Data Integrity and Security

- Store password hashes, never plaintext passwords.
- Validate input on the server before saving it.
- Use parameterized queries or a trusted ORM to reduce SQL injection risks.
- Check ownership and authorization on every read, update, and delete request.
- Use transactions when multiple related changes must succeed together.
- Back up the database regularly and restrict database credentials.
- Avoid exposing sensitive user information through API responses.
