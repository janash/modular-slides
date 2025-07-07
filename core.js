// --- core.js ---
// Manages the fundamental slide deck system.

// --- State and Variables ---
let current = 0;
let currentTextSize = parseFloat(localStorage.getItem('slideTextSize') || '1.5');
let isInputMode = false;
let skipAnimations = false;

// --- Helper function to always get current slides ---
function getSlides() {
  return document.querySelectorAll('.slide');
}

// --- Core Functions ---

async function loadSections(sectionNames) {
  const slidesContainer = document.getElementById('slides');
  
  // Clear any existing content
  slidesContainer.innerHTML = '';
  
  for (const section of sectionNames) {
    try {
      console.log(`Loading section: ${section}`);
      const response = await fetch(`sections/${section}.html`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      slidesContainer.insertAdjacentHTML('beforeend', html);
      
      // Execute any scripts in the loaded content
      const scripts = slidesContainer.querySelectorAll('script');
      scripts.forEach(script => {
        if (script.src) {
          // External script
          const newScript = document.createElement('script');
          newScript.src = script.src;
          document.head.appendChild(newScript);
        } else {
          // Inline script - execute the code
          try {
            eval(script.textContent);
          } catch (error) {
            console.error(`Error executing script in ${section}:`, error);
          }
        }
      });
      
    } catch (error) {
      console.error(`Failed to load section: ${section}`, error);
      slidesContainer.insertAdjacentHTML('beforeend', 
        `<section class="slide">
          <div class="slide-body">
            <h2>Error loading section: ${section}</h2>
            <p>Check that sections/${section}.html exists</p>
          </div>
        </section>`
      );
    }
  }
  
  // Wait a bit longer for everything to settle, then initialize
  setTimeout(() => {
    initializeSlides();
  }, 200);
}

function initializeSlides() {
  const slides = getSlides();
  
  // Hide all slides except the first
  slides.forEach((slide, index) => {
    slide.style.display = index === 0 ? 'block' : 'none';
  });
  
  // Reset current slide to 0
  current = 0;
  
  // Update counter
  updateSlideCounter();
  
  // Run Prism syntax highlighting AFTER everything is loaded
  setTimeout(() => {
    if (typeof Prism !== 'undefined') {
      console.log('Running Prism.highlightAll()');
      Prism.highlightAll();
    } else {
      console.log('Prism not found');
    }
  }, 100);
  
  console.log(`Loaded ${slides.length} slides total`);
}

function updateSlideCounter() {
  const counter = document.getElementById('counter');
  const totalSlides = getSlides().length;
  if (counter && !isInputMode) {
    const currentSlide = getCurrentSlideIndex() + 1;
    counter.textContent = `${currentSlide} / ${totalSlides}`;
  }
}

function getCurrentSlideIndex() {
  const slides = getSlides();
  for (let i = 0; i < slides.length; i++) {
    if (slides[i].style.display !== 'none') {
      return i;
    }
  }
  return 0;
}

function updateTextSize() {
  document.documentElement.style.setProperty('--slide-font-size', `${currentTextSize}em`);
  localStorage.setItem('slideTextSize', currentTextSize);
}

function showSlide(index) {
  const slides = getSlides();
  slides.forEach((s, i) => s.style.display = i === index ? 'block' : 'none');
  updateSlideCounter();
  
  if (typeof resetAnimations === 'function') {
    resetAnimations();
  }
  
  setTimeout(() => {
    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }
  }, 50);
}

// Enhanced nextSlide function
function nextSlide() { 
  const slides = getSlides();
  
  // Check if we should skip animations
  const shouldSkipAnimations = !annotationsVisible || skipAnimations || completedSlides.has(current);
  
  if (!shouldSkipAnimations && typeof slideAnimations !== 'undefined') {
    const currentSlide = slides[current];
    const slideId = currentSlide ? currentSlide.id : null;
    
    // Try to run animation for this slide
    if (slideId && slideAnimations[slideId]) {
      if (slideAnimations[slideId]()) {
        return; // Animation step executed, stay on current slide
      } else {
        // Animation sequence completed, mark slide as done
        completedSlides.add(current);
      }
    }
    else if (slideAnimations[current]) {
      if (slideAnimations[current]()) {
        return; // Animation step executed, stay on current slide
      } else {
        // Animation sequence completed, mark slide as done
        completedSlides.add(current);
      }
    }
  }
  
  // No more animations or skipping animations, go to next slide
  if (current < slides.length - 1) { 
    current++; 
    showSlide(current); 
  }
}

function prevSlide() { 
  const slides = getSlides();
  
  if (current > 0) { 
    current--; 
    showSlide(current); 
  }
}

// Enhanced print function
function printAllSlides() {
  console.log('Print function called');
  
  // Get all slides
  const slides = getSlides();
  console.log(`Found ${slides.length} slides to print`);
  
  // Store the current slide index to restore later
  const originalCurrentSlide = current;
  
  // Force ALL slides to be visible before printing
  slides.forEach((slide, index) => {
    slide.style.display = 'block';
    slide.style.pageBreakAfter = 'always';
    // Remove any inline styles that might hide content
    slide.style.visibility = 'visible';
    slide.style.opacity = '1';
  });
  
  // Remove the last slide's page break to avoid blank page
  if (slides.length > 0) {
    slides[slides.length - 1].style.pageBreakAfter = 'avoid';
  }
  
  // Hide navigation and other UI elements
  const elementsToHide = [
    '.nav',
    '.sidebar',
    '.sidebar-overlay',
    '.hamburger-menu'
  ];
  
  const hiddenElements = [];
  elementsToHide.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      hiddenElements.push({element: el, originalDisplay: el.style.display});
      el.style.display = 'none';
    });
  });
  
  // Add a class to body for print-specific styling
  document.body.classList.add('printing-all-slides');
  
  console.log('All slides made visible, calling print...');
  
  // Print after a short delay to ensure layout is complete
  setTimeout(() => {
    window.print();
    
    // Restore original state after print
    setTimeout(() => {
      console.log('Restoring original slide visibility...');
      
      // Hide all slides except the current one
      slides.forEach((slide, index) => {
        slide.style.display = index === originalCurrentSlide ? 'block' : 'none';
        slide.style.pageBreakAfter = '';
        slide.style.visibility = '';
        slide.style.opacity = '';
      });
      
      // Restore hidden elements
      hiddenElements.forEach(({element, originalDisplay}) => {
        element.style.display = originalDisplay;
      });
      
      // Remove print class
      document.body.classList.remove('printing-all-slides');
      
      console.log('Print state restored');
    }, 2000);
  }, 300);
}

// --- Interactive slide counter functionality ---

function toggleSlideInput() {
    const counter = document.getElementById('counter');
    
    if (isInputMode) return;
    
    isInputMode = true;
    
    // Get current slide info
    const totalSlides = getSlides().length;
    const currentSlide = current + 1;
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'slide-input';
    input.value = currentSlide.toString();
    input.maxLength = totalSlides.toString().length;
    
    // Replace counter content with input
    counter.innerHTML = '';
    counter.appendChild(input);
    
    // Focus and select the input
    input.focus();
    input.select();
    
    // Only allow numeric input
    input.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        if (e.target.value.length > totalSlides.toString().length) {
            e.target.value = e.target.value.slice(0, totalSlides.toString().length);
        }
    });
    
    // Handle completion
    function handleInputComplete() {
        const newSlide = parseInt(input.value);
        
        if (newSlide >= 1 && newSlide <= totalSlides) {
            jumpToSlide(newSlide - 1);
            restoreCounter();
        } else {
            showInvalidMessage();
        }
    }
    
function showInvalidMessage() {
    input.style.borderColor = '#d32f2f';
    input.style.backgroundColor = '#ffebee';
    
    const errorMsg = document.createElement('div');
    errorMsg.textContent = `Invalid slide number. Must be 1-${totalSlides}`;
    errorMsg.style.cssText = `
        color: white;
        background: #d32f2f;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 0.9em;
        text-align: center;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        top: -40px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        z-index: 1000;
    `;
    
    // Add tooltip arrow
    const arrow = document.createElement('div');
    arrow.style.cssText = `
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #d32f2f;
    `;
    errorMsg.appendChild(arrow);
    
    counter.style.position = 'relative';
    counter.appendChild(errorMsg);
    
    setTimeout(() => {
        restoreCounter();
    }, 2000);
}
    
    function restoreCounter() {
        counter.style.position = '';
        isInputMode = false;
        updateSlideCounter();
    }
    
    // Event listeners
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            handleInputComplete();
        } else if (e.key === 'Escape') {
            restoreCounter();
        }
    });
    
    input.addEventListener('blur', function() {
        handleInputComplete();
    });
}

function jumpToSlide(slideIndex) {
    const slides = getSlides();
    
    if (slideIndex < 0 || slideIndex >= slides.length) {
        return;
    }
    
    current = slideIndex;
    showSlide(current);
}

// Enhanced keyboard navigation
function handleKeyPress(e) {
    if (isInputMode) return; // Don't interfere with input mode
    
    // NEW: Don't handle navigation keys when editing content
    if (e.target.contentEditable === 'true') {
        return; // Let all keys work normally when editing
    }
    
    if (e.key === 'ArrowLeft') {
        prevSlide();
    } else if (e.key === 'ArrowRight') {
        if (e.shiftKey) {
            // Shift + Right Arrow: Skip animations and go to next slide
            const originalSkip = skipAnimations;
            skipAnimations = true;
            nextSlide();
            skipAnimations = originalSkip;
        } else {
            // Regular Right Arrow: Normal navigation (with animations)
            nextSlide();
        }
    } else if (e.key === ' ') {
        // NEW: Only handle spacebar if not editing
        e.preventDefault();
        const originalSkip = skipAnimations;
        skipAnimations = true;
        nextSlide();
        skipAnimations = originalSkip;
    }
}

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('bigger-text').onclick = () => {
    currentTextSize += 0.05;
    updateTextSize();
  };
  
  document.getElementById('smaller-text').onclick = () => {
    currentTextSize -= 0.05;
    updateTextSize();
  };
  
  document.getElementById('next').onclick = nextSlide;
  document.getElementById('prev').onclick = prevSlide;
  document.getElementById('print').onclick = printAllSlides;
  
  document.getElementById('annotationToggle').onclick = toggleAllAnnotations;

  // Enhanced keyboard navigation
  document.addEventListener('keydown', handleKeyPress);

  updateTextSize();
});

// =================================================================== 
// COPY BUTTON FUNCTIONALITY
// ===================================================================

/**
 * Initialize copy buttons for all code containers
 * Call this function after the DOM is loaded
 */
function initializeCopyButtons() {
    // Find all code containers
    const codeContainers = document.querySelectorAll('.code-container');
    
    codeContainers.forEach(container => {
        // Skip if button already exists
        if (container.querySelector('.copy-code-button')) return;
        
        // Create the copy button
        const copyButton = createCopyButton();
        container.appendChild(copyButton);
        
        // Add click handler
        copyButton.addEventListener('click', () => {
            copyCodeFromContainer(container, copyButton);
        });
    });
}

/**
 * Create a copy button element with icons
 */
function createCopyButton() {
    const button = document.createElement('button');
    button.className = 'copy-code-button';
    button.setAttribute('aria-label', 'Copy code to clipboard');
    button.innerHTML = `
        <svg class="copy-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.24264C20 6.97721 19.8946 6.7228 19.7071 6.53553L16.4645 3.29289C16.2772 3.10536 16.0228 3 15.7574 3H10C8.89543 3 8 3.89543 8 5Z" stroke="currentColor" stroke-width="2"/>
            <path d="M16 18V20C16 21.1046 15.1046 22 14 22H6C4.89543 22 4 21.1046 4 20V9C4 7.89543 4.89543 7 6 7H8" stroke="currentColor" stroke-width="2"/>
        </svg>
        <svg class="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="copy-text">Copy</span>
    `;
    return button;
}

/**
 * Copy code content from a container to clipboard
 */
async function copyCodeFromContainer(container, button) {
    try {
        // Find the code element
        const codeElement = container.querySelector('pre code') || container.querySelector('code');
        if (!codeElement) {
            console.warn('No code element found in container');
            return;
        }
        
        // Get the text content, cleaning up any HTML
        let codeText = codeElement.textContent || codeElement.innerText;
        
        // Clean up the text (remove extra whitespace, normalize line endings)
        codeText = codeText.trim().replace(/\r\n/g, '\n');
        
        // Copy to clipboard
        await navigator.clipboard.writeText(codeText);
        
        // Show success feedback
        showCopySuccess(button);
        
    } catch (error) {
        console.error('Failed to copy code:', error);
        // Fallback for browsers that don't support clipboard API
        fallbackCopyCode(container, button);
    }
}

/**
 * Fallback copy method for older browsers
 */
function fallbackCopyCode(container, button) {
    try {
        const codeElement = container.querySelector('pre code') || container.querySelector('code');
        if (!codeElement) return;
        
        // Create a temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = codeElement.textContent || codeElement.innerText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        
        // Select and copy
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        showCopySuccess(button);
    } catch (error) {
        console.error('Fallback copy failed:', error);
        showCopyError(button);
    }
}

/**
 * Show success feedback on the copy button
 */
function showCopySuccess(button) {
    const textSpan = button.querySelector('.copy-text');
    
    // Add copied class for styling
    button.classList.add('copied');
    if (textSpan) textSpan.textContent = 'Copied!';
    
    // Reset after 2 seconds
    setTimeout(() => {
        button.classList.remove('copied');
        if (textSpan) textSpan.textContent = 'Copy';
    }, 2000);
}

/**
 * Show error feedback on the copy button
 */
function showCopyError(button) {
    const textSpan = button.querySelector('.copy-text');
    
    button.style.backgroundColor = 'rgba(211, 47, 47, 0.9)';
    if (textSpan) textSpan.textContent = 'Error';
    
    setTimeout(() => {
        button.style.backgroundColor = '';
        if (textSpan) textSpan.textContent = 'Copy';
    }, 2000);
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all slides are loaded
    setTimeout(initializeCopyButtons, 100);
});

// Also initialize when new content is dynamically added
// (useful if slides are loaded dynamically)
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.querySelector && node.querySelector('.code-container')) {
                    setTimeout(initializeCopyButtons, 50);
                }
            });
        }
    });
});

function autoSizeCode() {
    document.querySelectorAll('.code-container pre code').forEach(codeBlock => {
        const lines = codeBlock.textContent.split('\n').length;
        let fontSize;
        
        if (lines <= 10) fontSize = '1em';
        else if (lines <= 15) fontSize = '0.9em';
        else if (lines <= 20) fontSize = '0.8em';
        else fontSize = '0.75em';
        
        codeBlock.style.fontSize = fontSize;
    });
}

// Call after slides load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(autoSizeCode, 500);
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Add this to your core.js or in a script tag
function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { // Safari
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE11
        elem.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// In your core.js fullscreen handler, modify it like this:
document.addEventListener('keydown', function(e) {
    // Don't trigger fullscreen if we're editing content
    if (e.key === 'F' || e.key === 'f') {
        // Check if we're actively editing
        if (e.target.contentEditable === 'true' || 
            e.target.tagName === 'INPUT' || 
            e.target.tagName === 'TEXTAREA') {
            return; // Let the F key work normally for typing
        }
        
        e.preventDefault();
        if (!document.fullscreenElement) {
            enterFullscreen();
        } else {
            exitFullscreen();
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const nav = document.querySelector('.nav'); // Assuming your navigation div has the class 'nav'

    if (!nav) {
        console.warn("Navigation element with class 'nav' not found. Fullscreen hover effect may not work.");
        return;
    }

    // Function to check and apply/remove fullscreen class
    function handleFullscreenChange() {
        if (document.fullscreenElement) {
            body.classList.add('fullscreen-active');
            // Hide the nav immediately when entering fullscreen, then rely on hover
            nav.style.opacity = '0';
        } else {
            body.classList.remove('fullscreen-active');
            // Make the nav visible immediately when exiting fullscreen
            nav.style.opacity = '1';
        }
    }

    // Listen for fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // For Safari
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);   // For Firefox
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);    // For IE/Edge (older)

    // Initial check in case the page loads already in fullscreen (unlikely, but good practice)
    handleFullscreenChange();
});

// =================================================================== 
// SLIDE ANIMATION BASE CLASS
// ===================================================================

class SlideAnimation {
    constructor() {
        if (this.slideId === undefined) {
            throw new Error('slideId getter must be defined in subclass');
        }
        this.register();
    }
    
    get slideId() {
        throw new Error('slideId getter must be implemented in subclass');
    }
    
    register() {
        if (typeof window.slideAnimations === 'undefined') {
            window.slideAnimations = {};
        }
        window.slideAnimations[this.slideId] = () => this.animate();
    }
    
    animate() {
        throw new Error('animate() method must be implemented in subclass');
    }
}