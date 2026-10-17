# Read Before Writing

Before writing any function, CSS class, component or utility: grep for an existing implementation,
check the file's imports, look at how the app solves it elsewhere, and reuse what exists. Before adding
a CSS class to markup, grep the stylesheets for that name (`.legend-item` collided once). When a
project has a design language or brand guide, read it before proposing a layout.

Before modifying code: read every function in the feature, trace every call site and state transition,
then make one clean pass. If intended behavior is unclear, ask before coding.

Why: new search-bar CSS when `.attendance-search` existed, a custom toggle beside `btn-group-toggle`,
a birthday card duplicating `.schedule-class-item`.
