# LLM Guide to the Modular Slide System - Conceptual Content

## 1. Your Task: Content Creation

Your primary role is to create and modify educational slide presentations for conceptual learning. All slides and animations are defined in **modular topic files**.

**Your output must be a single, complete HTML file containing:**
* **HTML Structure:** All `<section>` slides with descriptive IDs.
* **Content:** Text, diagrams, lists, and visual elements.
* **JavaScript Animations:** Class-based animations within a final `<script>` tag to control the progressive disclosure of information.

**Key Success Criteria:**
* **Educational Effectiveness:** The slide logically explains a concept with clear progression.
* **Technical Correctness:** The HTML is well-formed and the JavaScript is correct.
* **Consistency:** The output matches the patterns and templates in this guide.
* **Progressivity:** Information builds from simple to complex concepts.
* **Visual Clarity:** Diagrams, examples, and explanations are clear and accessible.

## 2. System Philosophy

This is a custom web-based system designed for teaching concepts through progressive disclosure and interactivity. It manages cognitive load by revealing information step-by-step and allows for precise control over visual elements, diagrams, and conceptual explanations. You will be creating **modular topic files** that operate within this larger system.

## 3. File and Topic Structure

The project has a defined structure with shared core files and a directory for topic modules.

```
project/
├── index.html          # Main template that loads topics (includes global footer)
├── style.css           # All shared styling
├── core.js             # Core navigation and SlideAnimation base class
└── sections/
    ├── topic-a.html    # A modular topic file
    └── topic-b.html    # Another modular topic file
```

Each topic is a single `.html` file containing all its slides and animation logic.

**Note: Each topic file is a module and requires the shared `core.js` and `style.css` files from the project root to render and function correctly.**

### Topic File Template
A new topic file must contain one or more `<section>` elements (slides) and a `<script>` tag at the end for the animation logic.

### Two-Column Layout
Use for conceptual slides with explanation + examples/diagrams. Choose the layout that best fits your content structure.

### Single Slide Example

For reference, here's a complete single-slide example:

```html
<section class="slide two-column" id="section-concept-detail">
  <!-- Slide content -->
</section>

<section class="slide two-column" id="section-concept-example">
  <!-- Slide content -->
</section>

<script>
  // Animation classes (JavaScript)
</script>
```

### Slide ID Naming Convention
Slide IDs are critical for linking animations to slides. They **must** be unique and follow the `section-concept-detail` pattern.
* **Correct:** `psychology-memory-stages`, `business-marketing-segmentation`, `communication-nonverbal-types`
* **Incorrect:** `slide1`, `intro`, `example-slide`

## 4. Slide Layouts & Content

### One-Column Layout
Use for comparison tables, summaries, or content that needs full width.

```html
<section class="slide one-column" id="descriptive-slide-id">
  <div class="slide-header">
    <h2 class="slide-title">Slide Title</h2>
  </div>
  <div class="slide-body one-column">
    <!-- Full-width content -->
  </div>
</section>
```

### Tables for Comparisons
Use clean, styled tables for comparing concepts, theories, or approaches.

```html
<table style="width: 100%; border-collapse: collapse; margin-bottom: 2em; font-size: 1.1em;">
  <thead>
    <tr style="background: #003262; color: white;">
      <th style="padding: 12px; border: 1px solid #ccc; text-align: left;">Aspect</th>
      <th style="padding: 12px; border: 1px solid #ccc; text-align: left;">Approach A</th>
      <th style="padding: 12px; border: 1px solid #ccc; text-align: left;">Approach B</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #ccc; font-weight: bold;">Focus</td>
      <td style="padding: 10px; border: 1px solid #ccc;">Individual behavior</td>
      <td style="padding: 10px; border: 1px solid #ccc;">Group dynamics</td>
    </tr>
    <tr style="background: #f5f5f5;">
      <td style="padding: 10px; border: 1px solid #ccc; font-weight: bold;">Method</td>
      <td style="padding: 10px; border: 1px solid #ccc;">Observation</td>
      <td style="padding: 10px; border: 1px solid #ccc;">Interaction</td>
    </tr>
  </tbody>
</table>
```

### Two-Column Layout
Use for conceptual slides that benefit from side-by-side presentation of content.

```html
<section class="slide two-column" id="descriptive-slide-id">
  <div class="slide-header">
    <h2 class="slide-title">Slide Title</h2>
  </div>
  <div class="slide-body two-column">
    <div class="left-panel">
      <!-- Concept explanation -->
    </div>
    <div class="right-panel">
      <!-- Examples, diagrams, or illustrations -->
    </div>
  </div>
</section>
```

### Section Header Layout
Use this as the first slide of a new topic section.

```html
<section class="slide section-header">
  <div class="slide-header"></div>
  <div class="slide-body section-header">
    <div class="section-content">
      <h1 class="section-title">Main Topic Title</h1>
      <p class="section-subtitle">Optional brief description</p>
    </div>
  </div>
</section>
```

### Visual Elements and Diagrams
Use containers to create diagrams, flowcharts, or visual representations. To make elements highlightable by animations, wrap them in containers with unique `id` attributes.

```html
<div class="diagram-container">
  <div class="concept-diagram">
    <div class="concept-box" id="concept-stage-1">
      <h5>Stage 1: Input</h5>
      <p>Initial information processing</p>
    </div>
    <div class="arrow-connector" id="arrow-1">→</div>
    <div class="concept-box" id="concept-stage-2">
      <h5>Stage 2: Processing</h5>
      <p>Information transformation</p>
    </div>
  </div>
  
  <div class="concept-annotation" id="anno-stage-1" style="opacity:0;">
    This is where information first enters the system.
  </div>
</div>
```

### List Content with Highlighting
For lists that will be highlighted progressively, wrap each list item content in a `<span class="highlight-item">`:

```html
<ul id="topics-list">
  <li><span class="highlight-item">First concept or topic</span></li>
  <li><span class="highlight-item">Second concept or topic</span></li>
  <li><span class="highlight-item">Third concept or topic</span></li>
</ul>
```

## 5. Animation System

The system uses a class-based, auto-registering architecture. For each slide that needs animation, you define a JavaScript class.

### The `SlideAnimation` Base Class
All animation classes must extend the `SlideAnimation` base class. It requires you to implement a `slideId` getter and an `animate` method. Registration is handled automatically when you instantiate the class.

### Animation Class Pattern
This is the required pattern for all animations.

1. **Define a class** that extends `SlideAnimation`.
2. **Implement `slideId`** to return the target slide's ID.
3. **Implement `animate`** to define the sequence of animation steps.
4. **Instantiate the class** at the end of the script with `new`.

```javascript
// Class definition
class ConceptIntroAnimation extends SlideAnimation {
    get slideId() {
        return 'psychology-memory-stages';
    }

    animate() {
        const steps = [
            () => highlightBackground('concept-stage-1', '#e3f2fd'), // Highlight concept
            () => {
                showElement('anno-stage-1');
            }
        ];
        return runAnimationSteps(steps);
    }
}

// Instantiation (this makes the animation live)
new ConceptIntroAnimation();
```

### Available Animation Functions
Use these helper functions inside your `animate` method's `steps` array.

* `runAnimationSteps(steps)`: The function that executes the animation sequence. Your `animate` method must return its result.
* `highlightBackground('elementId', 'color')`: Changes the background color of an element for emphasis.
* `showElement('elementId')`: Fades in a hidden element (like explanations or annotations). Respects the global annotation visibility setting.
* `highlightText('containerId', 'textToFind')`: Highlights specific text within a container.
* `positionAnnotation('containerId', 'textToFind', 'annotationId')`: Positions an annotation element next to specific text.
* `highlightListItem('listId', index)`: Highlights a specific list item by index. Looks for `.highlight-item` spans within list items and adds the `.highlight` class.
* `highlightCode('codeBlockId', 'textToFind', 'color', 'className')`: Creates highlight overlays on specific text within code blocks. Always creates highlights regardless of annotation toggle state.

## 6. Best Practices & Troubleshooting

### Best Practices
* **One concept per slide.** Don't overload a single slide with multiple ideas.
* **Focus on visual hierarchy.** Use highlighting and annotations to guide attention to key concepts.
* **Progressive Reveal:** Introduce concepts one by one. Each step in an animation should reveal only one new piece of information.
* **Clear examples:** Use concrete examples to illustrate abstract concepts.
* **Naming Conventions:**
  * Slide IDs: `section-concept-detail` (e.g., `psychology-memory-encoding`).
  * Animation Classes: `[Concept]Animation` (e.g., `MemoryEncodingAnimation`).

### Troubleshooting
If an animation is not working, check the following:
1. **Was the class instantiated?** Ensure `new YourAnimationClass();` is at the end of your script.
2. **Is the Slide ID correct?** The string from the `slideId` getter must *exactly* match the `<section>` ID in the HTML.
3. **Are the element IDs correct?** Check that IDs used in functions like `highlightBackground` match the HTML element IDs.
4. **For list highlighting:** Ensure list items contain `<span class="highlight-item">` elements.
5. **Check the browser console.** Look for errors like `slideId getter must be defined` or other JavaScript exceptions.

## 7. Minimal Example: Complete Topic Flow

This shows a typical 3-slide progression for conceptual content. Use this as your template for topic structure.

```html
<!-- Slide 1: Section Header -->
<section class="slide section-header">
  <div class="slide-header"></div>
  <div class="slide-body section-header">
    <div class="section-content">
      <h1 class="section-title">Communication Theory</h1>
      <p class="section-subtitle">Understanding effective communication principles</p>
    </div>
  </div>
</section>

<!-- Slide 2: Concept Introduction -->
<section class="slide two-column" id="communication-process-model">
  <div class="slide-header">
    <h2 class="slide-title">The Communication Process</h2>
  </div>
  <div class="slide-body two-column">
    <div class="left-panel">
      <h4>Basic Communication Model</h4>
      <p>Communication involves several key components:</p>
      <ul>
        <li>Sender encodes the message</li>
        <li>Message travels through a channel</li>
        <li>Receiver decodes the message</li>
        <li>Feedback completes the loop</li>
      </ul>
    </div>
    <div class="right-panel">
      <div class="diagram-container">
        <div class="communication-flow">
          <div class="comm-box" id="sender-box">
            <h5>Sender</h5>
            <p>Encodes message</p>
          </div>
          <div class="arrow-connector" id="arrow-to-channel">→</div>
          <div class="comm-box" id="channel-box">
            <h5>Channel</h5>
            <p>Medium of transmission</p>
          </div>
          <div class="arrow-connector" id="arrow-to-receiver">→</div>
          <div class="comm-box" id="receiver-box">
            <h5>Receiver</h5>
            <p>Decodes message</p>
          </div>
        </div>
        <div class="concept-annotation" id="anno-sender" style="opacity:0;">
          The person initiating communication
        </div>
        <div class="concept-annotation" id="anno-channel" style="opacity:0;">
          Could be verbal, written, or digital
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Slide 3: Comparison Table -->
<section class="slide one-column" id="communication-channels-comparison">
  <div class="slide-header">
    <h2 class="slide-title">Communication Channels Comparison</h2>
  </div>
  <div class="slide-body one-column">
    <div style="max-width: 800px; margin: 0 auto;">
      <table style="width: 100%; border-collapse: collapse; font-size: 1.1em;">
        <thead>
          <tr style="background: #003262; color: white;">
            <th style="padding: 12px; border: 1px solid #ccc; text-align: left;">Channel</th>
            <th style="padding: 12px; border: 1px solid #ccc; text-align: left;">Advantages</th>
            <th style="padding: 12px; border: 1px solid #ccc; text-align: left;">Disadvantages</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px; border: 1px solid #ccc; font-weight: bold;">Face-to-Face</td>
            <td style="padding: 10px; border: 1px solid #ccc;">Immediate feedback, nonverbal cues</td>
            <td style="padding: 10px; border: 1px solid #ccc;">Requires physical presence</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ccc; font-weight: bold;">Written</td>
            <td style="padding: 10px; border: 1px solid #ccc;">Permanent record, careful composition</td>
            <td style="padding: 10px; border: 1px solid #ccc;">No immediate feedback</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ccc; font-weight: bold;">Digital</td>
            <td style="padding: 10px; border: 1px solid #ccc;">Fast, wide reach, multimedia</td>
            <td style="padding: 10px; border: 1px solid #ccc;">Can be impersonal, technical issues</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<script>
class CommunicationProcessAnimation extends SlideAnimation {
    get slideId() {
        return 'communication-process-model';
    }

    animate() {
        const steps = [
            () => {
                highlightBackground('sender-box', '#e3f2fd');
                showElement('anno-sender');
            },
            () => {
                highlightBackground('channel-box', '#fff3e0');
                showElement('anno-channel');
            },
            () => {
                highlightBackground('receiver-box', '#e8f5e8');
            },
            () => {
                highlightBackground('arrow-to-channel', '#ffeb3b');
                highlightBackground('arrow-to-receiver', '#ffeb3b');
            }
        ];
        return runAnimationSteps(steps);
    }
}

// Register animation
new CommunicationProcessAnimation();
</script>
```

**Flow Pattern:**
1. **Section header** - Introduces the topic
2. **Two-column concept** - Explains with visual diagram and animations
3. **One-column comparison** - Summarizes with a comparative table

This 3-slide pattern works for most conceptual topics and shows all the key elements working together.

### Example Single Slide: Complete

```html
<section class="slide two-column" id="psychology-memory-intro">
  <div class="slide-header">
    <h2 class="slide-title">Introduction to Memory</h2>
  </div>
  <div class="slide-body two-column">
    <div class="left-panel">
      <h4>Memory Process</h4>
      <p>Memory involves three key stages:</p>
      <ul>
        <li>Encoding: Information enters the system</li>
        <li>Storage: Information is retained</li>
        <li>Retrieval: Information is accessed</li>
      </ul>
    </div>
    <div class="right-panel">
      <div class="diagram-container">
        <div class="memory-stages">
          <div class="stage-box" id="encoding-stage">
            <h5>Encoding</h5>
            <p>Sensory input → Memory</p>
          </div>
          <div class="arrow-connector" id="arrow-encode">→</div>
          <div class="stage-box" id="storage-stage">
            <h5>Storage</h5>
            <p>Maintained over time</p>
          </div>
          <div class="arrow-connector" id="arrow-store">→</div>
          <div class="stage-box" id="retrieval-stage">
            <h5>Retrieval</h5>
            <p>Accessing stored info</p>
          </div>
        </div>
        <div class="concept-annotation" id="anno-encoding" style="opacity:0;">
          How we initially process information
        </div>
        <div class="concept-annotation" id="anno-storage" style="opacity:0;">
          Information is held in memory systems
        </div>
      </div>
    </div>
  </div>
</section>

<script>
class MemoryIntroAnimation extends SlideAnimation {
    get slideId() {
        return 'psychology-memory-intro';
    }

    animate() {
        const steps = [
            () => {
                highlightBackground('encoding-stage', '#e3f2fd');
                showElement('anno-encoding');
            },
            () => {
                highlightBackground('storage-stage', '#fff3e0');
                showElement('anno-storage');
            },
            () => {
                highlightBackground('retrieval-stage', '#e8f5e8');
            },
            () => {
                highlightBackground('arrow-encode', '#ffeb3b');
                highlightBackground('arrow-store', '#ffeb3b');
            }
        ];
        return runAnimationSteps(steps);
    }
}

// IMPORTANT: Instantiate the class to register the animation
new MemoryIntroAnimation();
</script>
```

### Example List Highlighting Slide

```html
<section class="slide one-column" id="course-outline">
  <div class="slide-header">
    <h2 class="slide-title">Course Outline</h2>
  </div>
  <div class="slide-body one-column">
    <div class="content-wrapper">
      <ul id="topics-list">
        <li><span class="highlight-item">The size of "Chemical Space"</span></li>
        <li><span class="highlight-item">Molecular representations and descriptors</span></li>
        <li><span class="highlight-item">Machine learning fundamentals</span></li>
        <li><span class="highlight-item">Deep learning applications</span></li>
      </ul>
    </div>
  </div>
</section>

<script>
class OutlineAnimation extends SlideAnimation {
    get slideId() {
        return 'course-outline';
    }
    
    animate() {
        const steps = [
            () => highlightListItem('topics-list', 0),
            () => highlightListItem('topics-list', 1),
            () => highlightListItem('topics-list', 2),
            () => highlightListItem('topics-list', 3),
        ];
        return runAnimationSteps(steps);
    }
}

new OutlineAnimation();
</script>
```

## 8. Animation Patterns

### Concept Highlighting with Annotations
Target specific concept elements and show explanatory annotations:

```javascript
() => {
    highlightBackground('concept-element-id', '#e3f2fd');
    showElement('annotation-id');
}
```

### Background Highlighting
Change element background colors for emphasis:

```javascript
() => highlightBackground('element-id', '#ffebee') // Light red background
() => highlightBackground('positive-concept', '#e8f5e8') // Light green background
```

### List Item Highlighting
Progressively highlight list items:

```javascript
() => highlightListItem('list-id', 0) // Highlights first item
() => highlightListItem('list-id', 1) // Highlights second item
```

### Code Highlighting
Highlight specific text within code blocks:

```javascript
() => highlightCode('code-block-id', 'functionName', '#ffeb3b') // Highlight function name in yellow
```

### Hidden Elements Pattern
Elements that will be shown during animation should start hidden:

```html
<div id="info-box" style="opacity: 0; transition: opacity 0.5s;">
  <h4>Additional Info:</h4>
  <p>This appears during animation</p>
</div>
```

### Concept + Example Pattern
```javascript
animate() {
    const steps = [
        () => {
            highlightBackground('main-concept', '#e3f2fd');
            showElement('concept-explanation');
        },
        () => {
            highlightBackground('example-box', '#fff3e0');
            showElement('example-explanation');
        }
    ];
    return runAnimationSteps(steps);
}
```

## 9. Interactive Demo Setup

For slides with interactive elements (buttons, clickable concepts), add setup functions:

```javascript
class MyConceptAnimation extends SlideAnimation {
    get slideId() {
        return 'my-concept-slide';
    }
    
    animate() {
        const steps = [
            () => highlightBackground('main-concept', '#e3f2fd'),
            // ... other steps
        ];
        return runAnimationSteps(steps);
    }
}

// Interactive demo variables (if needed)
let currentExample = 0;
const examples = [
    'Example 1: Basic scenario',
    'Example 2: Complex scenario', 
    'Example 3: Advanced application'
];

function setupInteractiveDemo() {
    const nextButton = document.getElementById('next-example');
    const resetButton = document.getElementById('reset-demo');
    
    if (nextButton && resetButton) {
        nextButton.onclick = function() {
            currentExample = (currentExample + 1) % examples.length;
            updateExampleDisplay();
        };
        
        resetButton.onclick = function() {
            currentExample = 0;
            updateExampleDisplay();
        };
    }
}

function updateExampleDisplay() {
    const display = document.getElementById('example-display');
    if (display) {
        display.textContent = examples[currentExample];
    }
}

// Register animation
new MyConceptAnimation();

// Setup demo after DOM loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(setupInteractiveDemo, 500);
});
```

### Interactive Demo HTML Structure
```html
<div id="concept-demo" style="margin-top: 2em;">
  <h4>Interactive Demo:</h4>
  <div id="concept-state">
    <p>Current Example: <span id="example-display">Example 1: Basic scenario</span></p>
  </div>
  <div id="concept-visualization" style="display: flex; gap: 10px; margin: 10px 0; min-height: 60px; align-items: center;">
    <div id="concept-boxes" style="display: flex; gap: 10px;"></div>
  </div>
  <button id="next-example" style="padding: 8px 15px; background: #2e7d32; color: white; border: none; border-radius: 4px; margin: 5px;">
    Next Example
  </button>
  <button id="reset-demo" style="padding: 8px 15px; background: #d32f2f; color: white; border: none; border-radius: 4px; margin: 5px;">
    Reset
  </button>
</div>
```

## 10. Concept Element Targeting Requirements

### When to Use Each Layout:
- **Two-column:** Concept explanation + examples/diagrams, theory + application
- **One-column:** Comparison tables, summaries, section headers, content requiring full width
- **Section header:** First slide of a new major topic

### Font Size and Display Requirements
**CRITICAL:** All text must be large enough to be clearly visible when displayed:
- **Minimum readable sizes** - use the predefined classes which ensure appropriate sizing
- **Vertical spacing limitation** - when using concept boxes or stages, **use no more than 2 elements vertically** to maintain readability
- **Horizontal flow preferred** - arrange concept sequences horizontally when possible

### Table vs. Two-Column:
- **Tables:** When comparing 3+ approaches or multiple aspects
- **Two-column:** When showing one concept with examples/diagrams

For animations to work with concept elements, wrap targetable content in containers with unique IDs:

```html
<div class="concept-container">
  <div class="concept-stage" id="stage-1">
    <h5>Stage 1</h5>
    <p>Description of first stage</p>
  </div>
  <div class="concept-stage" id="stage-2">
    <h5>Stage 2</h5>
    <p>Description of second stage</p>
  </div>
</div>
```

Then target these elements in animations:
```javascript
() => highlightBackground('stage-1', '#e3f2fd')
() => highlightBackground('stage-2', '#fff3e0')
```

## 11. Multiple Animation Classes Per File

A single topic file can have multiple animated slides. Create one class per slide:

```javascript
class FirstConceptAnimation extends SlideAnimation {
    get slideId() { return 'topic-first-concept'; }
    animate() { /* ... */ }
}

class SecondConceptAnimation extends SlideAnimation {
    get slideId() { return 'topic-second-concept'; }
    animate() { /* ... */ }
}

// Register all animations
new FirstConceptAnimation();
new SecondConceptAnimation();
```

## 12. Additional Content Styling Classes

The system includes predefined CSS classes for common conceptual content patterns. Use these instead of inline styles to maintain consistent font sizing and follow the framework's design principles.

### Theory and Application Patterns
For showing theoretical concepts and practical applications:

```html
<!-- Theory with header -->
<h5 class="theory-header">Theoretical Framework</h5>
<div class="theory-content">
  <div class="concept-container">
    <p>Theoretical explanation here</p>
  </div>
</div>

<!-- Different concept types -->
<h5 class="theory-header blue">Core Theory</h5>      <!-- Blue for main theories -->
<h5 class="theory-header orange">Application</h5>    <!-- Orange for applications -->
<h5 class="theory-header green">Example</h5>         <!-- Green for examples -->
```

### Information Boxes
For explanations, warnings, and highlights:

```html
<!-- Info boxes -->
<div class="info-box">
  <h4 class="box-header blue">Key Concept</h4>
  <p>Central idea explanation</p>
</div>

<div class="info-box green">
  <h4 class="box-header green">Benefits</h4>
  <ul><li>Advantage 1</li><li>Advantage 2</li></ul>
</div>

<div class="info-box orange">
  <h4 class="box-header orange">Important Note</h4>
  <p>Critical information</p>
</div>

<div class="info-box red">
  <h4 class="box-header red">Common Misconception</h4>
  <p>What people often misunderstand</p>
</div>
```

### Problem/Solution Containers
For showing conceptual problems and their solutions:

```html
<!-- Problem demonstration -->
<div class="problem-box">
  <h5 class="box-header red">Challenge</h5>
  <div class="challenge-description">
    Description of the conceptual challenge or problem
  </div>
</div>

<!-- Solution demonstration -->
<div class="solution-box">
  <h5 class="box-header green">Solution</h5>
  <p>Explanation of how to address the challenge</p>
</div>

<!-- Examples -->
<div class="example-box">
  <h5 class="box-header blue">Case Study</h5>
  <div class="case-study-content">
    Real-world example demonstrating the concept
  </div>
</div>
```

## 13. Annotation Toggle System

The system includes a global annotation toggle that affects certain types of content:

### Annotation-Aware Functions
- `showElement()` - Respects the global annotation visibility setting
- `positionAnnotation()` - Positions annotations and respects visibility toggle
- `highlightCode()` - Always creates highlights (not affected by toggle)
- `highlightListItem()` - Always creates highlights (not affected by toggle)
- `highlightBackground()` - Always creates highlights (not affected by toggle)

### Elements Affected by Annotation Toggle
- `.code-annotation` - Tooltip-style annotations
- Elements shown via `showElement()` function

### Elements NOT Affected by Annotation Toggle
- Background highlights created by `highlightBackground()`
- List item highlights created by `highlightListItem()`
- Code highlights created by `highlightCode()`

## 14. Footer Information

**Important:** Do NOT include footer information in individual slide files. The footer with the Berkeley logo and course information is handled globally by the `index.html` file and will appear automatically on all slides.

Individual slides should focus only on their content without any footer elements.

### Critical Rules
- **Never use inline styles** for colors, backgrounds, or containers
- **Always use predefined classes** for consistency
- **Concept elements automatically maintain proper font sizing** within any container
- **Color scheme**: Blue (theories/key concepts), Orange (applications/notes), Green (examples/solutions), Red (problems/misconceptions)
- **Font size requirements**: All text must be large enough for clear display - use predefined classes
- **Vertical layout limit**: **Maximum 2 concept boxes/stages vertically** to ensure readability
- **No footers in slides**: Footer content is handled globally by `index.html`
- **List highlighting**: Always wrap list item content in `<span class="highlight-item">` for progressive highlighting to work