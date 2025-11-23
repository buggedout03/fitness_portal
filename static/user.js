// user.js – shared user selector + current user logic

async function fetchUsers() {
    const res = await fetch("/users/list");
    if (!res.ok) {
        console.error("Failed to fetch users");
        return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

async function createUserInteractive() {
    const name = prompt("Enter new user name:");
    if (!name) return null;

    const age = parseInt(prompt("Age?") || "30", 10);
    const height_cm = parseInt(prompt("Height (cm)?") || "170", 10);
    let gender = prompt("Gender (male/female)?") || "male";
    gender = gender.toLowerCase();

    const res = await fetch("/users/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name, age, height_cm, gender })
    });

    if (!res.ok) {
        alert("Failed to create user");
        return null;
    }

    return await res.json();
}

function getStoredUserId() {
    const raw = localStorage.getItem("currentUserId");
    return raw ? parseInt(raw, 10) : null;
}

function storeUserId(id) {
    localStorage.setItem("currentUserId", String(id));
}

function setupUserSelect(users, currentId) {
    const sel = document.getElementById("userSelect");
    if (!sel) return; // navbar not yet inserted or different page

    sel.innerHTML = "";
    users.forEach(u => {
        const opt = document.createElement("option");
        opt.value = String(u.id);
        opt.textContent = u.name;
        sel.appendChild(opt);
    });

    if (currentId == null && users.length > 0) {
        currentId = users[0].id;
        storeUserId(currentId);
    }

    if (currentId != null) {
        sel.value = String(currentId);
    }

    sel.onchange = () => {
        const newId = parseInt(sel.value, 10);
        storeUserId(newId);
        // Notify all pages that the user changed
        document.dispatchEvent(new CustomEvent("user-changed", {
            detail: { userId: newId }
        }));
    };

    const addBtn = document.getElementById("addUserBtn");
    if (addBtn) {
        addBtn.onclick = async () => {
            const newUser = await createUserInteractive();
            if (!newUser) return;
            users.push(newUser);
            storeUserId(newUser.id);
            setupUserSelect(users, newUser.id);
            document.dispatchEvent(new CustomEvent("user-changed", {
                detail: { userId: newUser.id }
            }));
        };
    }
}

async function ensureUserSelected() {
    let id = getStoredUserId();
    let users = await fetchUsers();

    if (users.length === 0) {
        const newUser = await createUserInteractive();
        if (!newUser) {
            alert("You must create at least one user.");
            return null;
        }
        users = [newUser];
        id = newUser.id;
    }

    if (id == null) {
        id = users[0].id;
    }

    storeUserId(id);
    setupUserSelect(users, id);
    return id;
}

// Public helper: get current user id, creating / defaulting if needed
async function getCurrentUserId() {
    const existing = getStoredUserId();
    if (existing != null) return existing;
    return await ensureUserSelected();
}

// Called after navbar HTML is inserted
async function initUserControls() {
    await ensureUserSelected();
}
