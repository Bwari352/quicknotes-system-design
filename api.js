
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.getElementById("load-btn");
const statusText = document.getElementById("status");
const notesList = document.getElementById("notes-list");

// Reusable function for making API requests.
async function request(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
}

// Load 10 notes from the practice API.
async function loadNotes() {
    loadBtn.disabled = true;
    statusText.className = "";
    statusText.textContent = "Loading notes...";

    try {
        const notes = await request(`${API_URL}?_limit=10`);

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
