// Global memory layer cache trackers
let activeNotepadFile = "";

// Asynchronous File Stream Hydration for Notepad Client Workspace
async function openFileInNotepad(event, filePath, fileName) {
    event.preventDefault(); 

    const notepadWin = document.getElementById('win-notepad');
    const notepadTitle = document.getElementById('notepad-title');
    const notepadTextarea = document.getElementById('notepad-content');

    if (!notepadWin || !notepadTextarea || !notepadTitle) return;

    notepadWin.classList.remove('hidden');
    createTaskbarItem('win-notepad');
    focusWindow('win-notepad');

    // Track original filename parameters directly across global tracking registers
    activeNotepadFile = fileName;
    notepadTitle.textContent = `${fileName} - Notepad`;
    notepadTextarea.value = "Loading asset cluster records from disk stream...";

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

// Asynchronous Commit Endpoint Bridge Router Task Routine
async function saveFileFromNotepad() {
    const notepadTextarea = document.getElementById('notepad-content');
    if (!notepadTextarea || !activeNotepadFile) {
        alert("System Error: No structural file references actively mapped to write space.");
        return;
    }

    const modifiedContent = notepadTextarea.value;

    try {
        const response = await fetch('save-file.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: activeNotepadFile,
                content: modifiedContent
            })
        });

        // Capture whatever the server outputs completely raw
        const rawTextOutput = await response.text();
        
        // Check if it's even a JSON string
        if (rawTextOutput.trim().startsWith('{')) {
            const result = JSON.parse(rawTextOutput);
            if (result.success) {
                alert(`File Saved Successfully:\n[Target]: ${activeNotepadFile}`);
            } else {
                alert(`PHP Application Logic Error:\n${result.message}`);
            }
        } else {
            // This will pop up the EXACT raw PHP error/warning message causing your crash!
            alert(`CRITICAL SERVER ERROR RAW OUTPUT:\n\n${rawTextOutput}`);
        }

    } catch (error) {
        console.error("Critical interface synchronization breakdown:", error);
        alert(`Network Error: ${error.message}`);
    }
}