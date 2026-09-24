/**
 * Links into Todoist, and putting them on the clipboard.
 *
 * "Open in Todoist" and "Copy link" build the same address; one function keeps
 * the two from drifting apart.
 */

/** A task's page in Todoist's web app. */
export const todoistTaskUrl = (id: string): string => `https://app.todoist.com/app/task/${id}`;

/**
 * An id the app made up while Todoist had not answered yet (see `newUuid`).
 * Todoist's own ids have no dashes, and a made-up one has no page to link to.
 */
export const isTemporaryId = (id: string): boolean => id.includes('-');

/** Copies text, and says whether it worked: the clipboard can be refused. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
