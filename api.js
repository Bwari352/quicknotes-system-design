
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.getElementById("load-btn");
const statusText = document.getElementById("status");
const notesList = document.getElementById("notes-list");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");

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


// Load 10 notes from the practice API.
async function loadNotes() {
    loadBtn.disabled = true;
    statusText.className = "";
    statusText.textContent = "Loading notes...";

    try {
        const result = await request(`${API_URL}?_limit=10`);
        const notes = result.data;

        notesList.replaceChildren();

        if (notes.length === 0) {
            const emptyMessage = document.createElement("li");
            emptyMessage.textContent = "No notes found. Try again later.";
            notesList.appendChild(emptyMessage);
        } else {
            notes.forEach(note => {
                const item = document.createElement("li");
                item.className = "note-item";

                const title = document.createElement("h3");
                title.textContent = note.title;

                const body = document.createElement("p");
                body.textContent = note.body;

                item.append(title, body);
                notesList.appendChild(item);
            });
        }

        statusText.textContent =
            `Loaded ${notes.length} notes from the server.`;
        statusText.className = "success";

    } catch (error) {
        statusText.textContent =
            "Unable to load notes. Please check your connection and try again.";
        statusText.className = "error";

        console.error(error);

    } finally {
        loadBtn.disabled = false;
    }
}

loadBtn.addEventListener("click", loadNotes);

async function createNote(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // Validate the title before sending a request.
    if (!title) {
        showStatus("Please enter a note title.", "error");
        titleInput.focus();
        return;
    }

    if (title.length > 100) {
        showStatus("Title must not exceed 100 characters.", "error");
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

        // Show the newly created note at the top of the list.
        const item = document.createElement("li");
        item.className = "note-item";

        const heading = document.createElement("h3");
        heading.textContent = note.title;

        const paragraph = document.createElement("p");
        paragraph.textContent = note.body || "No body provided.";

        item.append(heading, paragraph);
        notesList.prepend(item);

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