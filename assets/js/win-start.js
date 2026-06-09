let highestZ = 30;
let isDragging = false;

// ==========================================
// SYSTEM CLOCK ENGINE
// ==========================================
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const clockEl = document.getElementById('os-clock');
    if (clockEl) {
        clockEl.textContent = `${hours}:${minutes} ${ampm}`;
    }
}
setInterval(updateClock, 1000);
updateClock();

// ==========================================
// START MENU SYSTEM
// ==========================================
function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    const btn = document.getElementById('btn-start');
    if (!menu || !btn) return;

    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        btn.classList.add('win-active');
    } else {
        menu.classList.add('hidden');
        btn.classList.remove('win-active');
    }
}

// ==========================================
// CORE WINDOW RUNTIME CONTROLLER
// ==========================================
function focusWindow(id) {
    const win = document.getElementById(id);
    const taskEl = document.getElementById(`task-${id}`);
    if (!win) return;

    if (win.classList.contains('hidden')) {
        openWindow(id);
        return;
    }

    if (win.classList.contains('minimized')) {
        win.classList.remove('minimized');
    }

    highestZ++;
    win.style.zIndex = highestZ;

    document.querySelectorAll('#taskbar-apps > div').forEach(task => {
        task.classList.remove('win-active');
    });

    if (taskEl) {
        taskEl.classList.add('win-active');
    }
}

function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    
    win.classList.remove('hidden');
    win.classList.remove('minimized');
    createTaskbarItem(id);
    focusWindow(id);
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    win.classList.add('hidden');
    win.classList.remove('minimized');
    win.classList.remove('win-maximized');
    removeTaskbarItem(id);
    
    if (id === 'win-cdplayer' && typeof stopCDAudio === 'function') {
        stopCDAudio();
    }
}

function minimizeWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    win.classList.add('minimized');
    
    const taskEl = document.getElementById(`task-${id}`);
    if (taskEl) {
        taskEl.classList.remove('win-active');
    }

    const remainingTasks = Array.from(document.querySelectorAll('#taskbar-apps > div:not(.win-active)'));
    if (remainingTasks.length > 0) {
        const nextId = remainingTasks[remainingTasks.length - 1].id.replace('task-', '');
        const nextWin = document.getElementById(nextId);
        if (nextWin && !nextWin.classList.contains('minimized') && !nextWin.classList.contains('hidden')) {
            highestZ++;
            nextWin.style.zIndex = highestZ;
            const nextTask = document.getElementById(`task-${nextId}`);
            if (nextTask) nextTask.classList.add('win-active');
        }
    }
}

function maximizeWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    focusWindow(id);

    if (win.classList.contains('win-maximized')) {
        win.classList.remove('win-maximized');
    } else {
        win.classList.remove('minimized');
        win.classList.add('win-maximized');
    }
}

// ==========================================
// TASKBAR CORE MANAGEMENT
// ==========================================
function createTaskbarItem(id) {
    if (document.getElementById(`task-${id}`)) return;
    
    const taskbar = document.getElementById('taskbar-apps');
    if (!taskbar) return;

    let taskName = '⚡ Big_Desk_Energy';
    if (id === 'win-explorer') taskName = '📁 Explorer';
    if (id === 'win-cdplayer') taskName = '💿 CD Player';
    if (id === 'win-notepad')  taskName = '📝 Notepad';
    
    const taskEl = document.createElement('div');
    taskEl.id = `task-${id}`;
    taskEl.className = "win-outset bg-gray-100 flex items-center px-3 text-xs max-w-[150px] font-bold border-2 border-white cursor-pointer select-none";
    taskEl.innerHTML = `<span class="truncate">${taskName}</span>`;
    
    taskEl.onclick = (e) => {
        e.stopPropagation();
        
        const win = document.getElementById(id);
        const taskBtn = document.getElementById(`task-${id}`);
        
        // Minimize if clicking active taskbar button of a visible focused window
        if (win && !win.classList.contains('minimized') && !win.classList.contains('hidden') && taskBtn && taskBtn.classList.contains('win-active')) {
            minimizeWindow(id);
        } else {
            focusWindow(id);
        }
    };
    
    taskbar.appendChild(taskEl);
}

function removeTaskbarItem(id) {
    const taskEl = document.getElementById(`task-${id}`);
    if (taskEl) taskEl.remove();
}

// ==========================================
// DRAG AND DROP RUNTIME
// ==========================================
function initializeDragAndDrop() {
    // Select all elements designated with the window handle selector attribute
    const handles = document.querySelectorAll('[data-win-handle]');

    handles.forEach(handle => {
        // Prevent duplicate listener attachments
        if (handle.dataset.dragBound === "true") return;
        handle.dataset.dragBound = "true";

        const win = handle.closest('.win-outset[id^="win-"]');
        if (!win) return;

        handle.addEventListener('mousedown', (e) => {
            // Abort if window is maximized or user is clicking window title header control action buttons
            if (win.classList.contains('win-maximized') || e.target.closest('button')) return;

            e.preventDefault();
            isDragging = true;
            focusWindow(win.id);

            // Fetch absolute bounding coordinates prior to calculation passes
            const rect = win.getBoundingClientRect();
            let offsetX = e.clientX - rect.left;
            let offsetY = e.clientY - rect.top;

            // Set explicit initial static dimensions so the window layout frame doesn't snap-collapse
            win.style.width = `${rect.width}px`;
            win.style.transform = 'none'; 
            win.style.margin = '0';

            function onMouseMove(moveEvent) {
                if (!isDragging) return;
                let leftPosition = moveEvent.clientX - offsetX;
                let topPosition = moveEvent.clientY - offsetY;

                // Restrict windows to viewport bounding areas safely
                if (topPosition < 0) topPosition = 0;

                win.style.left = `${leftPosition}px`;
                win.style.top = `${topPosition}px`;
            }

            function onMouseUp() {
                isDragging = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });
}

// ==========================================
// UNIFIED WORKSPACE ROUTER
// ==========================================
document.querySelector('main').addEventListener('click', (e) => {
    const startBtn = document.getElementById('btn-start');
    const startMenu = document.getElementById('start-menu');

    if (startBtn && !startBtn.contains(e.target) && startMenu && !startMenu.contains(e.target)) {
        startMenu.classList.add('hidden');
        startBtn.classList.remove('win-active');
    }

    const clickedWindow = e.target.closest('.win-outset[id^="win-"]');
    if (clickedWindow && !isDragging) {
        const windowId = clickedWindow.id;
        const win = document.getElementById(windowId);
        
        if (win && !win.classList.contains('minimized') && !win.classList.contains('hidden')) {
            highestZ++;
            win.style.zIndex = highestZ;

            document.querySelectorAll('#taskbar-apps > div').forEach(task => {
                task.classList.remove('win-active');
            });
            const activeTask = document.getElementById(`task-${windowId}`);
            if (activeTask) {
                activeTask.classList.add('win-active');
            }
        }
    }
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initializeDragAndDrop();
});

// Wrapper extension mutation pattern rule
const originalOpenWindow = openWindow;
openWindow = function(id) {
    if (typeof originalOpenWindow === 'function') originalOpenWindow(id);
    initializeDragAndDrop();
};