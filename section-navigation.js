// Section Navigation System
class SectionNavigator {
  constructor() {
    this.sections = [];
    this.currentSection = 0;
    this.isOpen = false;
    this.initializeUI();
  }

  // Enhanced loadSections to track section boundaries
  async enhancedLoadSections(sections) {
    const slidesContainer = document.getElementById('slides');
    slidesContainer.innerHTML = '';
    
    this.sections = [];
    let slideCount = 0;

    const normalizedSections = this.normalizeSections(sections);

    for (let i = 0; i < normalizedSections.length; i++) {
        const section = normalizedSections[i];
        const startSlide = slideCount;
        
        try {
            console.log(`Loading section: ${section.file}`);
            const response = await fetch(`sections/${section.file}.html`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            
            // Fix image paths for GitHub Pages if needed
            let fixedHtml = html;
            if (window.location.hostname !== 'localhost' && window.location.protocol !== 'file:') {
                fixedHtml = html.replace(/\.\.\/images\//g, 'images/');
            }
            
            // NEW: Wrap the section content in a section div
            const sectionWrapper = `
                <div class="section-wrapper" data-section-name="${section.file}">
                    ${fixedHtml}
                </div>
            `;
            
            slidesContainer.insertAdjacentHTML('beforeend', sectionWrapper);
            
            // Count slides in this section
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = fixedHtml;
            const slidesInSection = tempDiv.querySelectorAll('.slide').length;
            
            // Store section information
            this.sections.push({
                file: section.file,
                name: section.name,
                displayName: section.name,
                startSlide: startSlide,
                slideCount: slidesInSection
            });
            
            slideCount += slidesInSection;
            
            // Execute scripts in the loaded content
            const scripts = slidesContainer.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.src) {
                    const newScript = document.createElement('script');
                    newScript.src = script.src;
                    document.head.appendChild(newScript);
                } else {
                    try {
                        eval(script.textContent);
                    } catch (error) {
                        console.error(`Error executing script in ${section.file}:`, error);
                    }
                }
            });
            
        } catch (error) {
            console.error(`Failed to load section: ${section.file}`, error);
            // Error handling with wrapper too
            const errorWrapper = `
                <div class="section-wrapper" data-section-name="${section.file}">
                    <section class="slide">
                        <div class="slide-body">
                            <h2>Error loading section: ${section.file}</h2>
                            <p>Check that sections/${section.file}.html exists</p>
                        </div>
                    </section>
                </div>
            `;
            slidesContainer.insertAdjacentHTML('beforeend', errorWrapper);
            
            this.sections.push({
                file: section.file,
                name: section.name,
                displayName: section.name,
                startSlide: startSlide,
                slideCount: 1
            });
            slideCount += 1;
        }
    }
    
    this.updateSidebar();
    setTimeout(() => {
        initializeSlides();
    }, 200);
}

  // Convert old format to new format for backward compatibility
  normalizeSections(sections) {
    if (!Array.isArray(sections)) {
      throw new Error('Sections must be an array');
    }

    return sections.map(section => {
      if (typeof section === 'string') {
        // Old format: just filename, auto-generate display name
        return {
          file: section,
          name: this.formatSectionName(section)
        };
      } else if (typeof section === 'object' && section.file && section.name) {
        // New format: object with file and name
        return section;
      } else {
        throw new Error(`Invalid section format: ${JSON.stringify(section)}`);
      }
    });
  }

  formatSectionName(filename) {
    // Fallback function for auto-generating names from filenames
    const nameMap = {
      'title': 'Title',
      'outline': 'Course Outline', 
      'containers': 'Containers',
      'functions': 'Functions',
      'file-io': 'File I/O'
    };
    return nameMap[filename] || filename.charAt(0).toUpperCase() + filename.slice(1).replace('-', ' ');
  }

  initializeUI() {
    // Create the enhanced navigation
    this.createEnhancedNavigation();
    
    // Create sidebar
    this.createSidebar();
    
    // Track current section when navigating
    this.trackCurrentSection();
    
    // Add help guide
    this.createHelpGuide();
  }

  createEnhancedNavigation() {
    const nav = document.querySelector('.nav');
    
    // Replace the entire nav content with enhanced navigation
    nav.innerHTML = `
      <div class="nav-left">
        <button class="hamburger-menu" id="hamburgerBtn" title="Section Navigation">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="nav-center">
        <div class="slide-nav-group">
          <button id="first-slide" title="First Slide">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="19,20 9,12 19,4"></polygon>
              <line x1="5" y1="19" x2="5" y2="5"></line>
            </svg>
          </button>
          <button id="prev-slide" title="Previous Slide">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="15,18 9,12 15,6"></polygon>
            </svg>
          </button>
          <span id="counter" onclick="toggleSlideInput()" title="Click to jump to slide">1 / ?</span>
          <button id="next-slide" title="Next Slide">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="9,18 15,12 9,6"></polygon>
            </svg>
          </button>
          <button id="last-slide" title="Last Slide">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5,4 15,12 5,20"></polygon>
              <line x1="19" y1="5" x2="19" y2="19"></line>
            </svg>
          </button>
        </div>
        
        <div class="animation-nav-group">
          <span class="nav-label">Animations:</span>
          <button id="prev-animation" class="animation-btn" title="Previous Animation Step">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          <button id="next-animation" class="animation-btn" title="Next Animation Step">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
          <button id="skip-animations" class="animation-btn" title="Skip All Animations">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5,4 15,12 5,20"></polygon>
              <polygon points="19,4 29,12 19,20" transform="translate(-10,0)"></polygon>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="nav-right">
        <button id="help-guide" title="Keyboard Shortcuts">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>
        <button id="bigger-text">Bigger Text</button>
        <button id="smaller-text">Smaller Text</button>
        <button id="print">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 6,2 18,2 18,9"></polyline>
            <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print PDF
        </button>
        <button class="annotation-toggle" id="annotationToggle">
          <span class="toggle-icon">
            <svg class="eye-open-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg class="eye-closed-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.54 18.54 0 0 1 2.94-3.12M2.36 2.36L21.64 21.64"></path>
              <path d="M11.29 11.29A3.5 3.5 0 0 0 12 14c1.65 0 3-1.35 3-3V9"></path>
              <path d="M18 10V6a2 2 0 0 0-2-2"></path>
              <path d="M6 6v.01"></path>
            </svg>
          </span>
          <span class="toggle-text">Hide Annotations</span>
        </button>
      <div class="nav-right">
        
        <!-- EDIT MODE BUTTON (only shows in local development) -->
        <button id="edit-mode-btn" title="Edit slide content (Ctrl+E)" style="display: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit Mode
        </button>
      </div>
    `;
    
    // Add navigation event listeners
    this.addNavigationEventListeners();
  }

  addNavigationEventListeners() {
    // Hamburger menu
    document.getElementById('hamburgerBtn').addEventListener('click', () => {
      this.toggleSidebar();
    });
    
    // Enhanced navigation buttons - bind 'this' context
    document.getElementById('prev-slide').onclick = () => this.prevSlideOnly();
    document.getElementById('next-slide').onclick = () => this.nextSlideOnly();
    document.getElementById('first-slide').onclick = () => this.goToFirstSlide();
    document.getElementById('last-slide').onclick = () => this.goToLastSlide();
    
    // Animation controls
    document.getElementById('prev-animation').onclick = () => prevSlide();
    document.getElementById('next-animation').onclick = () => nextSlide();
    document.getElementById('skip-animations').onclick = () => this.skipAllAnimationsOnSlide();
    
    // Existing buttons
    document.getElementById('bigger-text').onclick = () => {
      currentTextSize += 0.05;
      updateTextSize();
    };
    
    document.getElementById('smaller-text').onclick = () => {
      currentTextSize -= 0.05;
      updateTextSize();
    };
    
    document.getElementById('print').onclick = printAllSlides;
    document.getElementById('annotationToggle').onclick = toggleAllAnnotations;
    document.getElementById('help-guide').onclick = () => this.showControlGuide();
    
    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => this.handleEnhancedKeyPress(e));
  }

  // Navigation functions
  goToFirstSlide() {
    current = 0;
    showSlide(current);
  }

  goToLastSlide() {
    const slides = getSlides();
    current = slides.length - 1;
    showSlide(current);
  }

  nextSlideOnly() {
    const slides = getSlides();
    if (current < slides.length - 1) {
      current++;
      showSlide(current);
    }
  }

  prevSlideOnly() {
    const slides = getSlides();
    if (current > 0) {
      current--;
      showSlide(current);
    }
  }

  skipAllAnimationsOnSlide() {
    // Skip all remaining animation steps on current slide
    if (typeof slideAnimations !== 'undefined') {
      const slides = getSlides();
      const currentSlide = slides[current];
      const slideId = currentSlide ? currentSlide.id : null;
      
      if (slideId && slideAnimations[slideId]) {
        // Keep running animation steps until no more
        while (slideAnimations[slideId]()) {
          // Continue until function returns false
        }
      }
    }
  }

  // Enhanced keyboard navigation
  // Enhanced keyboard navigation
handleEnhancedKeyPress(e) {
    if (isInputMode) return;
    
    // NEW: Don't handle navigation keys when editing content
    if (e.target.contentEditable === 'true') {
        return; // Let all keys work normally when editing
    }
    
    switch(e.key) {
        case 'ArrowLeft':
            if (e.shiftKey) {
                this.prevSlideOnly();
            } else {
                prevSlide(); // With animations
            }
            break;
            
        case 'ArrowRight':
            if (e.shiftKey) {
                this.nextSlideOnly();
            } else {
                nextSlide(); // With animations
            }
            break;
            
        case ' ':
            // Only prevent default and advance slide if NOT editing
            e.preventDefault();
            this.nextSlideOnly();
            break;
            
        case 'Home':
            this.goToFirstSlide();
            break;
            
        case 'End':
            this.goToLastSlide();
            break;
            
        case '?':
            this.showControlGuide();
            break;
            
        case 'Escape':
            this.hideControlGuide();
            break;
    }
}

  createSidebar() {
    // Create sidebar HTML
    const sidebarHTML = `
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
      <div class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <h3 class="sidebar-title">Sections</h3>
          <button class="close-sidebar" id="closeSidebar">✕</button>
        </div>
        <div class="sidebar-content" id="sidebarContent">
          </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);
    
    // Add event listeners
    document.getElementById('closeSidebar').addEventListener('click', () => {
      this.closeSidebar();
    });
    
    document.getElementById('sidebarOverlay').addEventListener('click', () => {
      this.closeSidebar();
    });
  }

  createHelpGuide() {
    // Create help guide HTML
    const helpGuideHTML = `
      <div class="control-guide-overlay" id="controlGuideOverlay">
        <div class="control-guide-modal" id="controlGuideModal">
          <div class="control-guide-header">
            <h3>Navigation Controls</h3>
            <button class="close-guide" id="closeGuide">✕</button>
          </div>
          <div class="control-guide-content">
            
            <div class="control-section">
              <h4>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                  <path d="M3 3h6l6 18h6"></path>
                  <path d="M14 9h6"></path>
                </svg>
                Mouse Controls
              </h4>
              <div class="control-grid">
                <div class="control-item">
                  <span class="control-key">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="19,20 9,12 19,4"></polygon>
                      <line x1="5" y1="19" x2="5" y2="5"></line>
                    </svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="5,4 15,12 5,20"></polygon>
                      <line x1="19" y1="5" x2="19" y2="19"></line>
                    </svg>
                  </span>
                  <span class="control-desc">Jump to first/last slide</span>
                </div>
                <div class="control-item">
                  <span class="control-key">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="15,18 9,12 15,6"></polygon>
                    </svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="9,18 15,12 9,6"></polygon>
                    </svg>
                  </span>
                  <span class="control-desc">Previous/next slide</span>
                </div>
                <div class="control-item">
                  <span class="control-key">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </span>
                  <span class="control-desc">Animation steps</span>
                </div>
                <div class="control-item">
                  <span class="control-key">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="5,4 15,12 5,20"></polygon>
                      <polygon points="19,4 29,12 19,20" transform="translate(-10,0)"></polygon>
                    </svg>
                  </span>
                  <span class="control-desc">Skip animations on current slide</span>
                </div>
                <div class="control-item">
                  <span class="control-key">1 / 45</span>
                  <span class="control-desc">Click to jump to specific slide</span>
                </div>
                <div class="control-item">
                  <span class="control-key">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </span>
                  <span class="control-desc">Section navigation menu</span>
                </div>
              </div>
            </div>

            <div class="control-section">
              <h4>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <polyline points="8,21 16,21"></polyline>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                Keyboard Shortcuts
              </h4>
              <div class="control-grid">
              <div class="control-item">
                <span class="control-key">F</span>
                <span class="control-desc">Toggle fullscreen mode</span>
              </div>
                <div class="control-item">
                  <span class="control-key">← →</span>
                  <span class="control-desc">Navigate with animations</span>
                </div>
                <div class="control-item">
                  <span class="control-key">Shift + →</span>
                  <span class="control-desc">Skip animations, next slide</span>
                </div>
                <div class="control-item">
                  <span class="control-key">Space</span>
                  <span class="control-desc">Skip animations, next slide</span>
                </div>
                <div class="control-item">
                  <span class="control-key">Home</span>
                  <span class="control-desc">Go to first slide</span>
                </div>
                <div class="control-item">
                  <span class="control-key">End</span>
                  <span class="control-desc">Go to last slide</span>
                </div>
                <div class="control-item">
                  <span class="control-key">Ctrl/Cmd + A</span>
                  <span class="control-desc">Toggle annotations</span>
                </div>
                <div class="control-item">
                  <span class="control-key">Escape</span>
                  <span class="control-desc">Close menus/input</span>
                </div>
                <div class="control-item">
                  <span class="control-key">?</span>
                  <span class="control-desc">Show this help guide</span>
                </div>
              </div>
            </div>

            <div class="control-section">
              <h4>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
                Tips
              </h4>
              <ul class="tips-list">
                <li><strong>Teaching mode:</strong> Keep annotations visible, use arrow keys for step-by-step</li>
                <li><strong>Review mode:</strong> Hide annotations or use spacebar for quick navigation</li>
                <li><strong>Presentation tip:</strong> Use section menu (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                  ) to jump between topics</li>
                <li><strong>Print friendly:</strong> Print button shows all slides in one document</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', helpGuideHTML);
    
    // Add event listeners
    document.getElementById('closeGuide').addEventListener('click', () => {
      this.hideControlGuide();
    });
    
    document.getElementById('controlGuideOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.hideControlGuide();
      }
    });
  }

  updateSidebar() {
    const sidebarContent = document.getElementById('sidebarContent');
    if (!sidebarContent) return;
    
    sidebarContent.innerHTML = this.sections.map((section, index) => `
      <div class="section-item" data-section="${index}">
        <div>
          <div class="section-name">${section.displayName}</div>
          <div class="section-info">
            ${section.slideCount} slide${section.slideCount !== 1 ? 's' : ''} • 
            Starts at slide ${section.startSlide + 1}
          </div>
        </div>
      </div>
    `).join('');
    
    // Add click handlers
    sidebarContent.querySelectorAll('.section-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const sectionIndex = parseInt(e.currentTarget.dataset.section);
        this.jumpToSection(sectionIndex);
      });
    });
  }

  trackCurrentSection() {
    // Override the existing showSlide function to track current section
    const originalShowSlide = window.showSlide;
    
    window.showSlide = (index) => {
      // Call original function
      originalShowSlide(index);
      
      // Update current section
      this.updateCurrentSection(index);
    };
  }

  updateCurrentSection(slideIndex) {
    // Find which section contains this slide
    for (let i = this.sections.length - 1; i >= 0; i--) {
      if (slideIndex >= this.sections[i].startSlide) {
        this.currentSection = i;
        break;
      }
    }
    
    // Update sidebar highlighting
    document.querySelectorAll('.section-item').forEach((item, index) => {
      item.classList.toggle('current', index === this.currentSection);
    });
  }

  jumpToSection(sectionIndex) {
    if (sectionIndex >= 0 && sectionIndex < this.sections.length) {
      const section = this.sections[sectionIndex];
      
      // Use existing jumpToSlide function
      if (typeof jumpToSlide === 'function') {
        jumpToSlide(section.startSlide);
      } else {
        // Fallback to showSlide
        current = section.startSlide;
        showSlide(current);
      }
      
      this.closeSidebar();
    }
  }

  toggleSidebar() {
    if (this.isOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.add('open');
    overlay.classList.add('show');
    this.isOpen = true;
    
    // Update current section highlighting
    this.updateCurrentSection(current);
  }

  closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    this.isOpen = false;
  }

  // Control guide functions
    showControlGuide() {
    console.log('showControlGuide called');
    const overlay = document.getElementById('controlGuideOverlay');
    console.log('Found overlay:', !!overlay);
    
    if (overlay) {
        console.log('Adding show class to overlay');
        overlay.classList.add('show');
        
        // Double-check that the class was added
        setTimeout(() => {
        console.log('Overlay classes:', overlay.classList.toString());
        console.log('Overlay display style:', window.getComputedStyle(overlay).display);
        console.log('Overlay opacity:', window.getComputedStyle(overlay).opacity);
        }, 100);
    } else {
        console.error('Control guide overlay not found! Creating it now...');
        // If overlay doesn't exist, create it
        this.createHelpGuide();
        
        // Try again after creating
        setTimeout(() => {
        const newOverlay = document.getElementById('controlGuideOverlay');
        if (newOverlay) {
            console.log('Successfully created overlay, showing now');
            newOverlay.classList.add('show');
        }
        }, 100);
    }
    }
  hideControlGuide() {
    const overlay = document.getElementById('controlGuideOverlay');
    if (overlay) {
      overlay.classList.remove('show');
    }
  }
}


// Replace the end of your section-navigation.js file with this:

// Initialize section navigator
const sectionNavigator = new SectionNavigator();

// Replace the existing loadSections function
window.loadSections = function(sections) {
  return sectionNavigator.enhancedLoadSections(sections);
};

// Make sectionNavigator globally available for debugging
window.sectionNavigator = sectionNavigator;

// Fixed event listener setup
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, setting up help guide...');
  
  // Wait for navigation to be created
  setTimeout(() => {
    const helpButton = document.getElementById('help-guide');
    const overlay = document.getElementById('controlGuideOverlay');
    
    console.log('Help button found:', !!helpButton);
    console.log('Help overlay found:', !!overlay);
    
    if (helpButton) {
      // Remove any existing event listeners
      helpButton.onclick = null;
      
      // Add the event listener
      helpButton.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Help button clicked');
        if (sectionNavigator) {
          sectionNavigator.showControlGuide();
        }
      });
      
      console.log('Help guide button event listener attached');
    }
    
    // Test if we can show the guide directly
    if (overlay) {
      console.log('Help guide overlay exists and ready');
    }
    
  }, 1000); // Increased delay to ensure navigation is fully created
});

// Single keyboard event listener for help (separate from the class method)
document.addEventListener('keydown', (e) => {
  // Only handle ? key for help guide
  if (e.key === '?' && !isInputMode) {
    e.preventDefault();
    console.log('? key pressed, showing help guide');
    if (sectionNavigator && sectionNavigator.showControlGuide) {
      sectionNavigator.showControlGuide();
    }
  }
});