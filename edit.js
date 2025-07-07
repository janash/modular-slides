// =================================================================== 
// LOCAL DEVELOPMENT ONLY EDITING SYSTEM
// edit.js
// ===================================================================

let editMode = false;
let isLocalDevelopment = false;

// Detect if running locally (only show edit mode for local development)
function detectEnvironment() {
    const hostname = window.location.hostname;
    isLocalDevelopment = (
        hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname === '' || 
        window.location.protocol === 'file:'
    );
    
    console.log(`Environment: ${isLocalDevelopment ? 'Local Development' : 'Production'}`);
    return isLocalDevelopment;
}

// Only enable editing in local development
function initializeEditMode() {
    if (!detectEnvironment()) {
        // Production mode - hide edit button and disable editing
        console.log('Edit mode disabled in production');
        return;
    }
    
    // Local development - show edit button
    const editButton = document.getElementById('edit-mode-btn');
    if (editButton) {
        editButton.style.display = 'flex';
        editButton.onclick = toggleEditMode;
    }
    
    // Add keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'e' && !isInputMode) {
            e.preventDefault();
            toggleEditMode();
        }
    });
}

function toggleEditMode() {
    editMode = !editMode;
    const button = document.getElementById('edit-mode-btn');
    const body = document.body;
    
    if (editMode) {
        body.classList.add('edit-mode');
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Exit Edit
        `;
        button.style.background = '#dc3545';
        makeContentEditable();
        showEditInstructions();
        showSaveButton(); // NEW
    } else {
        body.classList.remove('edit-mode');
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Mode
        `;
        button.style.background = '#4a4a4a';
        makeContentNonEditable();
        hideEditInstructions();
        hideSaveButton(); // NEW
        // Don't auto-save on exit anymore
    }
}

// NEW: Show save button
function showSaveButton() {
    if (document.getElementById('save-button')) return; // Already exists
    
    const saveButton = document.createElement('button');
    saveButton.id = 'save-button';
    saveButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17,21 17,13 7,13 7,21"></polyline>
            <polyline points="7,3 7,8 15,8"></polyline>
        </svg>
        Save Changes
    `;
    saveButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        background: #28a745;
        color: white;
        border: none;
        padding: 12px 18px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: background 0.2s ease;
    `;
    
    saveButton.onmouseover = () => saveButton.style.background = '#218838';
    saveButton.onmouseout = () => saveButton.style.background = '#28a745';
    saveButton.onclick = saveToLocalServer;
    
    document.body.appendChild(saveButton);
}

// NEW: Hide save button
function hideSaveButton() {
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
        saveButton.remove();
    }
}

// Make content editable (only works locally)
function makeContentEditable() {
    const editableSelectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p:not(.nav *)', 'li:not(.nav *)',
        '.box-header',
        '.section-title', '.section-subtitle'
    ];
    
    editableSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            // Skip navigation and system elements
            if (element.closest('.nav, .sidebar, .control-guide')) return;
            
            // Store original content
            element.dataset.originalContent = element.innerHTML;
            
            // Make editable
            element.contentEditable = true;
            element.classList.add('editable-content');
            
            // Add event listeners
            element.addEventListener('focus', onEditFocus);
            element.addEventListener('blur', onEditBlur);
            element.addEventListener('keydown', onEditKeydown);
        });
    });
}

function makeContentNonEditable() {
    document.querySelectorAll('.editable-content').forEach(element => {
        element.contentEditable = false;
        element.classList.remove('editable-content', 'editing');
        
        // Remove event listeners
        element.removeEventListener('focus', onEditFocus);
        element.removeEventListener('blur', onEditBlur);
        element.removeEventListener('keydown', onEditKeydown);
    });
}

// Edit event handlers
function onEditFocus(e) {
    e.target.classList.add('editing');
}

function onEditBlur(e) {
    e.target.classList.remove('editing');
}

function onEditKeydown(e) {
    // Save on Ctrl+Enter
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
        toggleEditMode(); // Exit edit mode and save
    }
    
    // Cancel on Escape
    if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit(e.target);
        e.target.blur();
    }
}

function cancelEdit(element) {
    const originalContent = element.dataset.originalContent;
    if (originalContent) {
        element.innerHTML = originalContent;
    }
}

// Replace the saveToLocalServer function in edit.js:
async function saveToLocalServer() {
    const currentSection = getCurrentSectionName();
    console.log('Saving entire section:', currentSection);
    
    // Get the entire section wrapper HTML
    const currentSlide = document.querySelector('.slide[style*="block"]');
    if (!currentSlide) {
        showNotification('Could not find current slide', 'error');
        return;
    }
    
    const sectionWrapper = currentSlide.closest('.section-wrapper');
    if (!sectionWrapper) {
        showNotification('Could not find section wrapper', 'error');
        return;
    }
    
    // Get just the inner HTML (without the wrapper div)
    const sectionHTML = sectionWrapper.innerHTML;
    
    try {
        const response = await fetch('http://localhost:3005/api/save-slides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sectionHTML: sectionHTML,
                currentSection: currentSection,
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification(`✅ Saved ${Math.round(result.size/1000)}KB to ${result.filename}`, 'success');
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Save failed');
        }
    } catch (error) {
        console.error('Save failed:', error);
        showNotification('❌ Save failed: ' + error.message, 'error');
    }
}

// Collect changes made to content
function collectChanges() {
    const changes = {};
    
    document.querySelectorAll('.editable-content').forEach(element => {
        const original = element.dataset.originalContent;
        const current = element.innerHTML;
        
        if (original && original !== current) {
            changes[element.id || generateElementId(element)] = {
                original: original,
                modified: current,
                elementType: element.tagName.toLowerCase(),
                className: element.className,
                selector: generateElementSelector(element)
            };
        }
    });
    
    return changes;
}

// Generate unique ID for elements that don't have one
function generateElementId(element) {
    if (element.id) return element.id;
    
    const id = 'edit_' + Math.random().toString(36).substr(2, 9);
    element.id = id;
    return id;
}

// Generate CSS selector for element
function generateElementSelector(element) {
    if (element.id) return '#' + element.id;
    
    const tagName = element.tagName.toLowerCase();
    const parent = element.parentElement;
    
    if (parent) {
        const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
        const index = siblings.indexOf(element);
        return generateElementSelector(parent) + ' > ' + tagName + ':nth-of-type(' + (index + 1) + ')';
    }
    
    return tagName;
}

// Get current section filename
function getCurrentSectionName() {
    // Find which section wrapper contains the current slide
    const currentSlide = document.querySelector('.slide[style*="block"]'); // Visible slide
    if (currentSlide) {
        const sectionWrapper = currentSlide.closest('.section-wrapper');
        if (sectionWrapper) {
            const sectionName = sectionWrapper.dataset.sectionName;
            console.log('Detected section from wrapper:', sectionName);
            return sectionName;
        }
    }
    
    // Fallback: ask user
    const userInput = prompt('Could not detect section name. What is the filename? (without .html)');
    return userInput || 'unknown-section';
}

// Show edit instructions
function showEditInstructions() {
    hideEditInstructions();
    
    const instructions = document.createElement('div');
    instructions.id = 'edit-instructions';
    instructions.innerHTML = `
        <div style="
            position: fixed; 
            top: 80px; 
            right: 20px; 
            background: rgba(0,0,0,0.9); 
            color: white; 
            padding: 15px; 
            border-radius: 8px; 
            z-index: 1000;
            max-width: 280px;
            font-size: 0.9em;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ">
            <h4 style="margin: 0 0 10px 0; color: #ed1c24;">Local Edit Mode</h4>
            <p style="margin: 5px 0;">• Click any text to edit</p>
            <p style="margin: 5px 0;">• Click <strong>Save Changes</strong> to save</p>
            <p style="margin: 5px 0;">• <kbd>Esc</kbd> cancel changes</p>
            <p style="margin: 5px 0;">• <kbd>F</kbd> and <kbd>Space</kbd> work normally</p>
            <p style="margin: 5px 0; font-size: 0.8em; opacity: 0.8;">Changes save to HTML files</p>
        </div>
    `;
    document.body.appendChild(instructions);
}

function hideEditInstructions() {
    const instructions = document.getElementById('edit-instructions');
    if (instructions) instructions.remove();
}

// File export tools for when server isn't available
function showFileExportTools() {
    if (document.getElementById('file-export-tools')) return;
    
    const tools = document.createElement('div');
    tools.id = 'file-export-tools';
    tools.innerHTML = `
        <div style="
            position: fixed; 
            top: 80px; 
            left: 20px; 
            background: rgba(0,0,0,0.9); 
            color: white; 
            padding: 15px; 
            border-radius: 8px; 
            z-index: 1000;
            max-width: 250px;
            font-size: 0.9em;
        ">
            <h4 style="margin: 0 0 10px 0; color: #ed1c24;">Export Options</h4>
            <button onclick="downloadModifiedSection()" style="
                width: 100%; 
                padding: 8px; 
                margin: 5px 0; 
                background: #28a745; 
                color: white; 
                border: none; 
                border-radius: 4px;
                cursor: pointer;
            ">📥 Download HTML</button>
            <button onclick="exportChangesAsJSON()" style="
                width: 100%; 
                padding: 8px; 
                margin: 5px 0; 
                background: #007bff; 
                color: white; 
                border: none; 
                border-radius: 4px;
                cursor: pointer;
            ">📄 Export Changes</button>
        </div>
    `;
    document.body.appendChild(tools);
}

function hideFileExportTools() {
    const tools = document.getElementById('file-export-tools');
    if (tools) tools.remove();
}

// Download modified section as HTML file
function downloadModifiedSection() {
    const slides = document.querySelectorAll('.slide');
    let sectionHTML = '';
    
    slides.forEach(slide => {
        sectionHTML += slide.outerHTML + '\n\n';
    });
    
    // Include the script tag if it exists
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
        if (script.textContent.includes('SlideAnimation')) {
            sectionHTML += '<script>\n' + script.textContent + '\n</script>';
        }
    });
    
    const blob = new Blob([sectionHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${getCurrentSectionName()}-modified.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('📥 Section downloaded!', 'success');
}

// Export changes as JSON
function exportChangesAsJSON() {
    const changes = collectChanges();
    const blob = new Blob([JSON.stringify(changes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${getCurrentSectionName()}-changes.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('📄 Changes exported!', 'success');
}

// Notification system
function showNotification(message, type = 'info') {
    const colors = {
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
        info: '#007bff'
    };
    
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: ${colors[type]}; 
            color: white; 
            padding: 12px 18px; 
            border-radius: 6px; 
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        ">
            ${message}
        </div>
        <style>
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        </style>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// CSS for edit mode
const editModeCSS = `
    /* Edit mode only appears in local development */
    #edit-mode-btn {
        display: none; /* Hidden by default */
    }
    
    .edit-mode .editable-content {
        outline: 2px dashed transparent;
        transition: outline 0.2s ease, background 0.2s ease;
        cursor: text;
        border-radius: 2px;
    }
    
    .edit-mode .editable-content:hover {
        outline-color: rgba(237, 28, 36, 0.5);
        background: rgba(237, 28, 36, 0.05);
    }
    
    .edit-mode .editable-content.editing {
        outline-color: #ed1c24;
        background: rgba(237, 28, 36, 0.1);
        box-shadow: 0 0 5px rgba(237, 28, 36, 0.3);
    }
    
    .edit-mode .editable-content:focus {
        outline: 2px solid #ed1c24;
    }
    
    kbd {
        background: #f1f1f1;
        border: 1px solid #ccc;
        border-radius: 3px;
        padding: 2px 4px;
        font-family: monospace;
        font-size: 0.85em;
    }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = editModeCSS;
document.head.appendChild(style);

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    initializeEditMode();
});