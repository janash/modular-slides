Comprehensive Guide: Submitting Lessons to the ACT-CMS Portal
This document consolidates all essential information for educators preparing and submitting lessons to the ACT-CMS Lesson Portal. Our goal is to make your valuable teaching materials easily discoverable and accessible to the broader computational molecular sciences community.

1. What is a Lesson YAML File? Your Lesson's Blueprint
The heart of every lesson on the portal is a single YAML (.yml) file. Think of this as your lesson's catalog entry – it's human-friendly to write, and the portal automatically processes it to generate a polished webpage.

YAML (YAML Ain't Markup Language) is a human-friendly data serialization standard.

Your entire lesson gets described in one .yml file.

This structured file contains all necessary information: what you're teaching, who you are, and how others can access your materials.

Once submitted, the portal automatically builds a webpage showcasing your lesson.

Example Snippet:

title: "Introduction to Python"
authors:
  - "Dr. Jessica A. Nash"
  - "Prof. Ashley McDonald"
expanded_description: |
  This module introduces students to
  programming concepts essential for
  computational molecular science.

2. Defining Your Lesson: Metadata & Classification
Accurate and complete metadata is crucial for discoverability and helps fellow educators decide if your lesson fits their needs.

Core Lesson Information:
title: The full and descriptive name of your lesson.

description: A concise, 1-2 sentence summary for quick understanding.

expanded_description: A more detailed overview that will form the "Overview" section on the lesson page. Supports multiple paragraphs.

Categorization & Authorship:
programming_skill: Indicate the required programming skill level for students. (See next section for details).

primary_course: The main academic context where this lesson would typically fit (e.g., "Physical Chemistry", "Computational Chemistry").

also_for: (Optional) Other courses or audiences it might serve (e.g., "Theoretical Chemistry").

authors: A list of all contributors to the lesson.

estimated_time: Expected time for completion (e.g., "2-3 hours", "60 min").

format: How the lesson is structured (e.g., "Multi-Part Materials Module", "Single Notebook Lesson").

tags: Keywords for search and filtering (e.g., "python", "DFT", "molecular dynamics").

3. Programming Skill Levels: What They Mean
When defining the programming_skill for your lesson, use one of the following accepted values. This helps educators quickly identify if your material is suitable for their students' current programming proficiency.

"None": Assumes no prior programming experience whatsoever. Lessons should start with fundamental concepts like variables, basic data types, and simple operations. Ideal for introductory courses where students are new to computational thinking.

"Beginner": Assumes basic familiarity with programming concepts (e.g., variables, basic loops, conditionals). Students may have completed a very introductory programming module or have some self-taught exposure. Lessons can build upon these foundational ideas.

"Intermediate": Assumes comfort with fundamental data structures, functions, and control flow. Students are likely familiar with using a programming language in a scientific context and can generally debug common errors. Lessons can introduce more complex algorithms or advanced library usage.

"Advanced": Assumes high proficiency in programming, capable of understanding complex code, designing efficient algorithms, and potentially contributing to software development projects. Lessons at this level can delve into performance optimization, advanced data science techniques, or specialized computational methods.

4. Preparing Your Lesson Materials: The Heart of Your Lesson
Your lesson content defines the true value. We aim to provide maximum flexibility for educators.

Organizing Your materials List:
The materials field is a list of objects, each representing a distinct component or activity within your lesson. For each material, you'll specify its: title, description, type, duration, and relevant URLs.

Critical Requirement: All URLs for student-facing materials must be publicly accessible (no institutional login walls or private repositories).

Three Versions of Your Materials:
The "Local Development" Version (Jupyter Notebook with environment.yaml):

Create your primary lesson content as a polished Jupyter Notebook (.ipynb).

Include an environment.yaml file: This file lists all necessary Python packages and their versions to ensure other educators can reliably recreate your exact computing environment locally.

Purpose: Ideal for educators who want full control, customization, offline access, and integration into their existing course infrastructure.

The "Quick Adoption" Version (Google Colab Notebook with Inline Installation):

Create a separate copy of your Jupyter Notebook specifically optimized for Google Colab.

Include inline installation commands: All necessary Python packages should be installed directly within the initial cells of the Colab notebook (e.g., using !pip install ...).

Public Accessibility: This Colab notebook must be publicly shared so anyone with the link can access and run it without prior setup.

Purpose: Perfect for immediate testing, low-setup teaching environments, guest lectures, or computer lab sessions.

The "Educator Support" Version (Instructor Materials - Private):

If your lesson includes exercises or open-ended components, prepare a separate version of the materials with completed solutions and rubrics.

This can include answered Jupyter Notebooks, detailed teaching notes, or assessment rubrics.

Keep it secure: These materials will live in a private ACT-CMS GitHub repository, accessible only to verified educators, protecting student learning integrity.

Purpose: Helps other educators teach confidently by providing solutions and pedagogical insights.

Platform Support & Repository Paths:
platforms: List all computing environments where your lesson can successfully run (e.g., "Google Colab", "ChemCompute", "Local Installation").

recommended_platform: Your personal recommendation for the best user experience with your lesson.

public_repo_path: The folder name within the ACT-CMS public GitHub repository where your student-facing materials are stored.

instructor_repo_path: The folder name within the ACT-CMS private instructor GitHub repository for your instructor-only materials.

5. Ready to Share? The Submission Workflow
The ACT-CMS portal utilizes an automated publishing pipeline to streamline getting your lesson live.

Three Steps to Publication:
Organize Your Files:

Place all student-facing notebooks, environment.yaml files, and other public materials into a dedicated folder (e.g., your-lesson-title) that corresponds to your public_repo_path.

Organize your instructor materials similarly for the instructor_repo_path.

Create Your Lesson Description (YAML):

Write your comprehensive YAML file (my-new-lesson.yml).

Save it in the lessons/ directory of the public ACT-CMS repository. This filename becomes your lesson's permanent unique identifier and part of its URL.

Collaborate with ACT-CMS:

The ACT-CMS team will help coordinate the upload process. You're not doing this alone! They'll guide you through adding your files to the respective public and private repositories.

Automated Publishing Pipeline:
Once your YAML file is committed to the main branch of the public repository, the portal's automated systems take over:

Validation: The system first validates your YAML structure and checks for all required fields. If there are issues, you'll receive clear feedback for easy fixes.

Page Generation: If validation passes, the system builds a professional, static webpage for your lesson and integrates it into the portal's searchable catalog.

Go Live: Within minutes, your lesson becomes discoverable by educators worldwide through the portal's search and browse features.

6. Best Practices for Success
Follow these tips to ensure a smooth and impactful contribution:

Study Existing Lessons: Browse the current portal and examine the lessons/*.yml files in the repository. What makes them appealing? How do they structure their descriptions?

Test Everything Thoroughly: Verify every single link works from a fresh browser session. Imagine you're a colleague discovering your lesson for the first time.

Write for Your Peers: Use clear, engaging language that conveys enthusiasm for your subject matter. What would make you excited to try a new lesson?

Leverage the Community: The ACT-CMS maintainers are passionate about educational excellence. Reach out early and often for guidance and feedback; they are here to help you succeed!

Your contribution matters! Every lesson you share strengthens the entire computational chemistry education community – we're excited to help you make an impact!
