export type ChangelogVisual =
  'calendar' | 'assign' | 'subtasks' | 'sidebarFilters' | 'filterEditor' | 'favourites' | 'tags' | 'tagColours' | 'bulkTags' | 'sharing' | 'access' | 'assigneeFilter' | 'workspaces' | 'forecast' | 'skipRepeat' | 'search' | 'searchSections' | 'parser' | 'rejectParser' | 'duration' | 'estimates' | 'bulkEstimate' | 'estimateStorage' | 'estimateConversion' | 'metadata' | 'datePicker' | 'projectView' | 'board' | 'boardSection' | 'layouts' | 'sidebar' | 'projectNesting' | 'mobileBrowse' | 'today' | 'appearance' | 'dark' | 'accent' | 'setup' | 'notifications' | 'projectPicker' | 'projectMenu' | 'sectionMenu' | 'taskNavigation' | 'time' | 'quick' | 'dust' | 'dashboard' | 'period' | 'dashboardLayout' | 'review' | 'subtaskTotal' | 'nesting' | 'checklist' | 'conflicts' | 'paste' | 'upcomingGroups' | 'logbook' | 'bulk' | 'keyboard' | 'projectEmail' | 'signIn' | 'mac' | 'undo' | 'sync' | 'offline' | 'projectIcons' | 'completed' | 'matrix' | 'swipe' | 'load' | 'week' | 'density';

/** Editorial illustrations for features that benefit from a concrete UI example.
 * Keys refer to the release and its impact-sorted entry, shared by both languages.
 * Add a preview deliberately; design changes and corrections remain text-only.
 */
export const CHANGELOG_VISUALS = {
  '2.10.0:0': 'calendar', // Calendar view.
  '2.9.0:0': 'assign', // Assign a task by typing `+`.
  '2.9.0:1': 'subtasks', // Write subtasks the way you write tasks.
  '2.9.0:2': 'sharing', // A fuller Share window.
  '2.8.0:0': 'forecast', // See future repeats in Upcoming.
  '2.8.0:1': 'search', // See every search result.
  '2.8.0:2': 'tags', // Rename a tag from its page.
  '2.8.0:3': 'parser', // Type a time or a relative date when adding a task.
  '2.8.0:4': 'duration', // Write durations in words.
  '2.7.0:0': 'assigneeFilter', // Tasks assigned to other people are hidden by default.
  '2.7.0:1': 'sharing', // Assign a task to someone.
  '2.5.0:0': 'access', // Choose who can access a project.
  '2.5.0:1': 'mac', // Settings links to the Mac app.
  '2.4.0:0': 'favourites', // Star a filter or a tag from its card.
  '2.3.0:0': 'datePicker', // Set a time, a duration and a repeat from the date picker.
  '2.2.0:0': 'sidebarFilters', // Your Todoist filters are in the app.
  '2.2.0:1': 'filterEditor', // Create, edit and organise filters here.
  '2.2.0:2': 'tagColours', // Change a tag's colour.
  '2.0.0:0': 'appearance', // Choose how the app sits in the window, and what is behind it.
  '2.0.0:1': 'sidebar', // Arrange the sidebar.
  '2.0.0:2': 'metadata', // Choose what a task shows, and in what order.
  '2.0.0:3': 'setup', // A setup for everyone, and a tour to follow it.
  '2.0.0:4': 'notifications', // Notifications from Todoist.
  '2.0.0:5': 'sharing', // Share a project and assign tasks.
  '2.0.0:6': 'projectView', // A default view for each project.
  '2.0.0:7': 'projectPicker', // Create a project without leaving the new task.
} as const satisfies Record<string, ChangelogVisual>;
export function changelogVisual(version: string, entry: number): ChangelogVisual | null {
  return CHANGELOG_VISUALS[`${version}:${entry}` as keyof typeof CHANGELOG_VISUALS] ?? null;
}
