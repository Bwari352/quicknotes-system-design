

const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.getElementById("load-btn");
const statusText = document.getElementById("status");
const notesList = document.getElementById("notes-list");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");

// Display status messages.
function showStatus(message, type = "") {
    statusText.textContent = message;
    statusText.className = type;
}

// Reusable function for making API requests.
async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    const data = response.status === 204
        ? null
        : await response.json();

    return {
        data: data,
        status: response.status
    };
}

// Display one note, including its Delete button.
function renderNote(note, prepend = false) {
    const item = document.createElement("li");
    item.className = "note-item";
    item.dataset.id = String(note.id);

    const heading = document.createElement("h3");
    heading.textContent = note.title || "Untitled note";

    const paragraph = document.createElement("p");
    paragraph.textContent = note.body || "No body provided.";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", () => {
        deleteNote(note.id, deleteBtn);
    });

    item.append(heading, paragraph, deleteBtn);

    if (prepend) {
        notesList.prepend(item);
    } else {
        notesList.appendChild(item);
    }
}

// Display an empty-state message.
function showEmptyMessage() {
    notesList.replaceChildren();

    const emptyMessage = document.createElement("li");
    emptyMessage.textContent =
        "No notes to display. Load notes or create one.";

    notesList.appendChild(emptyMessage);
}

// Load 10 notes from the API.
async function loadNotes() {
    loadBtn.disabled = true;
    showStatus("Loading notes...");

    try {
        const result = await request(`${API_URL}?_limit=10`);
        const notes = result.data;

        notesList.replaceChildren();

        if (notes.length === 0) {
            showEmptyMessage();
            showStatus("No notes found.", "success");
            return;
        }

        notes.forEach(note => {
            renderNote(note);
        });

        showStatus(
            `Loaded ${notes.length} notes from the server.`,
            "success"
        );

    } catch (error) {
        showStatus(
            "Unable to load notes. Please check your connection and try again.",
            "error"
        );

        console.error(error);

    } finally {
        loadBtn.disabled = false;
    }
}

loadBtn.addEventListener("click", loadNotes);

// Create a new note.
async function createNote(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // Validate the title.
    if (!title) {
        showStatus("Please enter a note title.", "error");
        titleInput.focus();
        return;
    }

    if (title.length > 100) {
        showStatus(
            "Title must not exceed 100 characters.",
            "error"
        );
        titleInput.focus();
        return;
    }

    submitBtn.disabled = true;
    showStatus("Creating note...");

    try {
        const result = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                body: body,
                userId: 1
            })
        });

        const note = result.data;

        // Remove the empty-state message before displaying the note.
        if (
            notesList.children.length === 1 &&
            !notesList.firstElementChild.dataset.id
        ) {
            notesList.replaceChildren();
        }

        renderNote(note, true);

        showStatus(
            `Note created (status ${result.status}, id ${note.id}).`,
            "success"
        );

        noteForm.reset();

    } catch (error) {
        showStatus(
            "Unable to create the note. Please try again.",
            "error"
        );

        console.error(error);

    } finally {
        submitBtn.disabled = false;
    }
}

noteForm.addEventListener("submit", createNote);

// Delete a note.
async function deleteNote(id, deleteBtn) {
    deleteBtn.disabled = true;
    showStatus("Deleting note...");

    try {
        const result = await request(
            `${API_URL}/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );

        const item = deleteBtn.closest("li");

        if (item) {
            item.remove();
        }

        // Check whether any notes remain.
        const remainingNotes = notesList.querySelectorAll(
            "li[data-id]"
        );

        if (remainingNotes.length === 0) {
            showEmptyMessage();
        }

        showStatus(
            `Note deleted successfully).`,
            "success"
        );

    } catch (error) {
        showStatus(
            "Unable to delete the note. Please try again.",
            "error"
        );

        console.error(error);

    } finally {
        deleteBtn.disabled = false;
    }
}
