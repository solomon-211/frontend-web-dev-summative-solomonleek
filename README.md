# Campus Life Planner

# The video link for key features
-  https://youtu.be/GoTybZeCBlQ

# Deployment for the campus life planner on Github pages

# GitHub Pages:
Go to Settings → Pages → Branch: main → /root, then visit the provided link.

# Here the link for it: https://solomon-211.github.io/frontend-web-dev-summative-solomonleek/

The **Campus Life Planner** is a responsive web app built with **HTML, CSS, JSON, and JavaScript** to help students organize daily campus activities such as classes, assignments, and events.  
It demonstrates modern **front-end development**, **data storage**, and **UI accessibility** techniques using only vanilla technologies.

## Overview

This project allows users to:
- Allow users to edit, delete, add tasks, exports, and import data in form of JSON file
- Activities are categories under tags depending where each activity falls
- Users can also search activities added into the task section
- Users can also see the whole of the information in the dashboard section.

## Setup Guide

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/campus-life-planner.git
cd campus-life-planner


2. Run the App

Simply open the index.html file in your web browser.


## Features List
Feature	Description
- Responsive Design that works effectively using telephone, tablet, laptop, and so forth.
- Search tasks for the tasks added using key words title, tags, or date
- Accessibility	Keyboard shortcuts and ARIA labels for all key elements.
- Automatic local storage of the file using export for downloading and import for uploading the data
- Highlight search key words with yellow color



### The project uses Regular Expressions (Regex) for form validation and smart search.

Use Case	Regex	Explanation
Task Title Validation /^\S(?:.*\S)?$/,	Allows letters, numbers, and spaces (3–50 chars).
Tag Validation	/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/	Allows text tags only (e.g., “Personal”).
Date Format	/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,	Matches YYYY-MM-DD date format.
Keyword Search	/keyword/i	Case-insensitive search across task names and tags.

### Edge Cases Tested

Empty or whitespaces for trailing and leading whitespaces on the task title, but not on the search task.
Duplicate /\b(\w+)\s+\1\b/i task titles prevented.
Regex ensures invalid characters (@, #, $, %) are blocked except hypens on the tag addings, and task titles.

### Keyboard Map
Shortcut	Action
Enter	To enter inside the section
Ctrl + F	Focus search bar
Tab / Shift + Tab	Navigate through interactive elements
Esc	Close modals or cancel editing

### Accessibility Notes

The app follows ARIA standards:

Semantic HTML tags (<header>, <nav>, <main>, <section>, <footer>)

Color contrast meets accessibility requirements.

All buttons, inputs, and links are keyboard-navigable.

Screen reader support using aria-labels and role attributes.

### Testing Instructions
Test	Expected Outcome
Add a new task	Appears instantly in the task list.
Search by keyword based on tag, title, date, and etc.
Resize window Layout adjusts (cards on mobile, table on desktop).
Print page Clean layout (buttons hidden, text visible).
Refresh browser	All data still available (stored in LocalStorage).

### Technologies Used

HTML5 – Semantic structure

CSS3 – Responsive grid & Flexbox design

JavaScript (ES6) – DOM interaction, logic & data management

LocalStorage JSON File for export and import

Regex – Validation & filtering