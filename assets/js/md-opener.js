// Asynchronous File Stream Hydration for Notepad Client Workspace
async function openFileInNotepad(event, filePath, fileName) {
    event.preventDefault(); // Halt document anchor window routing loops

    const notepadWin = document.getElementById('win-notepad');
    const notepadTitle = document.getElementById('notepad-title');
    const notepadTextarea = document.getElementById('notepad-content');

    // Force visibility setup layout actions
    notepadWin.classList.remove('hidden');
    if (typeof createTaskbarItem === 'function') createTaskbarItem('win-notepad');
    if (typeof focusWindow === 'function') focusWindow('win-notepad');

    // Update title buffer metrics
    notepadTitle.textContent = `${fileName} - Notepad`;
    notepadTextarea.value = "Loading asset cluster records from disk stream...";

    // Minimize/Close File Explorer as Notepad initializes loading
    if (typeof closeWindow === 'function') {
        closeWindow('win-explorer');
    }

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP Error status footprint code: ${response.status}`);
        }
        const markdownText = await response.text();
        notepadTextarea.value = markdownText;
    } catch (error) {
        console.error("Notepad resource mapping failure:", error);
        notepadTextarea.value = `Fatal Error: File Access Violation.\nCould not map file link context structure.\n\n[Log Code]: ${error.message}`;
    }
}

// Extend existing taskbar name configurations dynamically if present
const originalCreateTaskbarItem = createTaskbarItem;
createTaskbarItem = function(id) {
    if (id === 'win-notepad') {
        if (document.getElementById(`task-${id}`)) return;
        const taskbar = document.getElementById('taskbar-apps');
        const taskEl = document.createElement('div');
        taskEl.id = `task-${id}`;
        taskEl.className = "win-outset bg-gray-100 flex items-center px-3 text-xs max-w-[150px] font-bold border-2 border-white cursor-pointer select-none";
        taskEl.innerHTML = `<span class="truncate">📝 Notepad</span>`;
        taskEl.onclick = () => focusWindow(id);
        taskbar.appendChild(taskEl);
        return;
    }
    if (typeof originalCreateTaskbarItem === 'function') originalCreateTaskbarItem(id);
};