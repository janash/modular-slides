// --- Generic Animation State & Helpers ---

let animationStep = 0;
let completedSlides = new Set();


// Global state for annotations (meaning tooltips and info/problem/solution boxes)
let annotationsVisible = true;

// Helper to get the currently active slide
function getActiveSlide() {
    const slides = document.querySelectorAll('.slide');
    for (let i = 0; i < slides.length; i++) {
        if (slides[i].style.display !== 'none') {
            return slides[i];
        }
    }
    return null;
}

// Toggle function
function toggleAllAnnotations() {
    const toggleButton = document.getElementById('annotationToggle');
    const toggleText = toggleButton.querySelector('.toggle-text');
    
    console.log("toggleAllAnnotations called. annotationsVisible before: ", annotationsVisible);
    annotationsVisible = !annotationsVisible;
    console.log("annotationsVisible after: ", annotationsVisible);
    
    if (annotationsVisible) {
        // User wants annotations visible, so show them
        showAllAnnotations();
        toggleButton.classList.remove('annotations-hidden');
        toggleText.textContent = 'Hide Annotations';
    } else {
        // User wants annotations hidden, so hide them
        hideAllAnnotations();
        toggleButton.classList.add('annotations-hidden');
        toggleText.textContent = 'Show Annotations';
    }
}

// Selectors for elements that should be hidden/shown by the annotation toggle
// These are the "tooltips" and "info boxes"
const annotationToggleElementsSelectors = [
    '.code-annotation',      // The actual tooltip bubbles
];

function showAllAnnotations() {
    const activeSlide = getActiveSlide();
    if (!activeSlide) return;

    annotationToggleElementsSelectors.forEach(selector => {
        activeSlide.querySelectorAll(selector).forEach(el => {
            if (el.classList.contains('code-annotation')) {
                el.classList.add('show'); // Tooltip bubbles use the .show class
            }
            el.style.display = 'block'; // Ensure visibility
            el.style.opacity = '1';    // Make visible
            el.style.pointerEvents = 'auto'; // Make interactive
            el.style.visibility = 'visible'; // Ensure visible when shown
        });
    });
}

function hideAllAnnotations() {
    const activeSlide = getActiveSlide();
    if (!activeSlide) return;

    annotationToggleElementsSelectors.forEach(selector => {
        activeSlide.querySelectorAll(selector).forEach(el => {
            if (el.classList.contains('code-annotation')) {
                el.classList.remove('show'); // Tooltip bubbles remove the .show class
            }
            el.style.opacity = '0';    // Make hidden (start fade out)
            el.style.pointerEvents = 'none'; // Prevent interaction
            el.style.visibility = 'hidden'; // Make instantly hidden (but still in layout during fade)
            
            // After transition, set display to none to fully remove from layout
            const transitionDuration = parseFloat(getComputedStyle(el).transitionDuration) * 1000 || 500;
            setTimeout(() => {
                if (el.style.opacity === '0' && el.style.visibility === 'hidden') { // Only hide if it's still faded/invisible
                    el.style.display = 'none'; 
                }
            }, transitionDuration);
        });
    });
}

function resetAnimations() {
    // If this slide is already completed, set animations to final state
    if (completedSlides.has(current)) {
        // Skip all animation steps silently to reach final state
        const slides = getSlides();
        const currentSlide = slides[current];
        const slideId = currentSlide ? currentSlide.id : null;
        
        if (slideId && slideAnimations[slideId]) {
            // Run through all animation steps without visual delay
            while (slideAnimations[slideId]()) {
                // Keep going until no more steps
            }
        } else if (slideAnimations[current]) {
            while (slideAnimations[current]()) {
                // Keep going until no more steps
            }
        }
        return; // Don't reset to step 0
    }
    
    // Normal reset for uncompleted slides
    animationStep = 0;
    
    // ALWAYS remove highlight overlays (these are transient code line highlights)
    document.querySelectorAll('.highlight-overlay').forEach(el => el.remove());
    
    // ALWAYS remove the 'highlight' class from elements
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));

    // Reset the state of the *annotation* elements for the CURRENT slide
    const activeSlide = getActiveSlide();
    if (activeSlide) {
        if (annotationsVisible) {
            // Reset annotations to hidden state (ready to be animated in)
            annotationToggleElementsSelectors.forEach(selector => {
                activeSlide.querySelectorAll(selector).forEach(el => {
                    if (el.classList.contains('code-annotation')) {
                        el.classList.remove('show');
                    }
                    el.style.opacity = '0';
                    el.style.pointerEvents = 'none';
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                });
            });
        } else {
            hideAllAnnotations(); 
        }
    }

    // Reset background highlights
    const bgToReset = ['#bracket-method', '#at-method'];
    bgToReset.forEach(selector => {
        const el = document.querySelector(selector);
        if(el) el.style.background = '';
    });
}

// Optional keyboard shortcut
document.addEventListener('keydown', function(e) {
    if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleAllAnnotations();
    }
});

// Modified highlightCode function - now ALWAYS creates highlights, regardless of annotation toggle
function highlightCode(codeBlockId, textToFind, color = 'rgba(255, 215, 0, 0.4)', className = 'highlight-overlay') {
    const codeBlock = document.getElementById(codeBlockId);
    if (!codeBlock || !textToFind) return;

    // Helper to find node and offset of a character index
    const findChildNodeAndOffset = (container, overallCharCharIndex) => {
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        let currentNode = walker.nextNode();
        let accumulatedLength = 0;
        while (currentNode) {
            const nodeLength = currentNode.textContent.length;
            if (accumulatedLength + nodeLength >= overallCharCharIndex) {
                return { node: currentNode, offset: overallCharCharIndex - accumulatedLength };
            }
            accumulatedLength += nodeLength;
            currentNode = walker.nextNode();
        }
        return null;
    };

    const fullText = codeBlock.textContent;
    const startIndex = fullText.indexOf(textToFind);
    if (startIndex === -1) return;
    const endIndex = startIndex + textToFind.length;

    const startPosition = findChildNodeAndOffset(codeBlock, startIndex);
    const endPosition = findChildNodeAndOffset(codeBlock, endIndex);

    if (!startPosition || !endPosition) return;

    const range = document.createRange();
    range.setStart(startPosition.node, startPosition.offset);
    range.setEnd(endPosition.node, endPosition.offset);

    const targetRect = range.getBoundingClientRect();
    if (targetRect.width === 0 && targetRect.height === 0) return;

    const container = codeBlock.closest('.code-container');
    const containerRect = container.getBoundingClientRect();

    // Create and position the highlight overlay element
    const overlay = document.createElement('div');
    overlay.className = className;
    overlay.style.position = 'absolute';
    overlay.style.top = `${targetRect.top - containerRect.top}px`;
    overlay.style.left = `${targetRect.left - containerRect.left}px`;
    overlay.style.width = `${targetRect.width}px`;
    overlay.style.height = `${targetRect.height}px`;
    overlay.style.backgroundColor = color; // Use the provided color (defaults to yellow)
    overlay.style.borderRadius = '3px';
    overlay.style.zIndex = '0';
    overlay.style.pointerEvents = 'none'; // Highlights should not interfere with clicks

    container.appendChild(overlay);
}

// positionAnnotation handles positioning and final visibility of tooltips
function positionAnnotation(codeBlockId, textToFind, annotationId) {
    const codeBlock = document.getElementById(codeBlockId);
    const annotation = document.getElementById(annotationId);
    if (!codeBlock || !annotation || !textToFind) return;

    // 1. Temporarily ensure element is visible in layout but not seen, to get correct dimensions
    // Store original styles to revert if necessary
    const initialDisplay = annotation.style.display; 
    const initialOpacity = annotation.style.opacity;
    const initialVisibility = annotation.style.visibility; // Store visibility
    const initialPointerEvents = annotation.style.pointerEvents;

    // Force display: block and hide visually for measurement
    annotation.style.display = 'block'; 
    annotation.style.opacity = '0';     
    annotation.style.pointerEvents = 'none'; 
    annotation.style.visibility = 'hidden'; // Crucial for accurate measurement when hidden

    // Use requestAnimationFrame to ensure browser reflows before measurement
    requestAnimationFrame(() => {
        // --- (existing measurement code remains here) ---
        const walker = document.createTreeWalker(codeBlock, NodeFilter.SHOW_TEXT);
        let fullText = '';
        const nodeMap = [];
        let node;
        while(node = walker.nextNode()) {
            nodeMap.push({ node: node, start: fullText.length, end: fullText.length + node.textContent.length });
            fullText += node.textContent;
        }
        const startIndex = fullText.indexOf(textToFind);
        if (startIndex === -1) {
            // Revert temporary styles if target text not found
            annotation.style.display = initialDisplay;
            annotation.style.opacity = initialOpacity;
            annotation.style.visibility = initialVisibility;
            annotation.style.pointerEvents = initialPointerEvents;
            return;
        }
        const range = document.createRange();
        let foundStart = false;
        for (const item of nodeMap) {
            if (!foundStart && startIndex >= item.start && startIndex < item.end) {
                range.setStart(item.node, startIndex - item.start);
                foundStart = true;
            }
            if (foundStart && (startIndex + textToFind.length) <= item.end) {
                range.setEnd(item.node, (startIndex + textToFind.length) - item.start);
                break;
            }
        }
        const targetRect = range.getBoundingClientRect(); // Dimensions of the text to annotate
        if (targetRect.width === 0 && targetRect.height === 0) {
            // Revert temporary styles if target text has no dimensions
            annotation.style.display = initialDisplay;
            annotation.style.opacity = initialOpacity;
            annotation.style.visibility = initialVisibility;
            annotation.style.pointerEvents = initialPointerEvents;
            return;
        }

        const container = codeBlock.closest('.code-container');
        const containerRect = container.getBoundingClientRect();

        // 2. Calculate position using now-correct dimensions
        const left = targetRect.left - containerRect.left + (targetRect.width / 2) - (annotation.offsetWidth / 2);
        const top = targetRect.top - containerRect.top - annotation.offsetHeight - 10; // 10px above

        // 3. Apply position
        annotation.style.left = left + 'px';
        annotation.style.top = top + 'px';

        // 4. Apply final visibility state based on global annotationsVisible flag
        // This logic ensures it's shown if globally allowed, or kept hidden otherwise.
        if (annotationsVisible) {
            annotation.classList.add('show'); // Apply CSS for opacity transition (opacity:1)
            annotation.style.opacity = '1';    // Ensure immediate visibility over CSS default
            annotation.style.pointerEvents = 'auto'; // Make interactive
            annotation.style.display = 'block'; // Ensure it stays visible/block
            annotation.style.visibility = 'visible'; // Ensure visually visible
        } else {
            annotation.classList.remove('show'); // Remove CSS for opacity transition (opacity:0)
            annotation.style.opacity = '0';    // Ensure immediate hidden state
            annotation.style.pointerEvents = 'none'; // Prevent interaction
            annotation.style.display = 'none'; // Ensure it's fully removed from layout
            annotation.style.visibility = 'hidden'; // Ensure visually hidden
        }
    }); // End of requestAnimationFrame
}

// highlightListItem - now ALWAYS creates highlights, regardless of annotation toggle
function highlightListItem(listId, index) {
    const list = document.getElementById(listId);
    if (list) {
        const items = list.querySelectorAll('.highlight-item'); // .highlight-item is the span inside the li
        if (items[index]) {
            items[index].classList.add('highlight'); // Apply the 'highlight' class for styling
        }
    }
}

// showElement - still respects annotationVisible, as it's for showing annotation boxes
function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element && annotationsVisible) { // Keep the annotationsVisible check
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';

        // --- THE CRITICAL CHANGE IS HERE ---
        if (element.tagName === 'LI') {
            // If it's a list item, set its display to 'list-item'
            element.style.display = 'list-item';
        } else {
            // For all other elements, 'block' might be appropriate
            element.style.display = 'block';
        }
        // --- END CRITICAL CHANGE ---

        element.style.visibility = 'visible'; // Ensure visible when shown
    }
    // If annotations are hidden, don't show the element
}

function runAnimationSteps(steps) {
    if (animationStep < steps.length) {
        if (typeof steps[animationStep] === 'function') {
            steps[animationStep]();
        }
        animationStep++;
        return true; 
    }
    return false;
}

function highlightBackground(elementId, color) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.background = color;
    element.style.transition = 'background 0.3s ease';
  }
}