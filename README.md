<div align="center">

# Enhanced for Todoist

**A different front end for Todoist, built around planning a week instead of a
day.** Todoist stays the backend — it keeps your account and your data, and this
replaces the interface in front of it. Everything the app adds is stored in
properties Todoist already has: an estimate is a label, "anytime this week" is a
label, and the rest is projects, sections, priorities and dates. Open the
official app afterwards and nothing looks unusual. If this project stopped
working tomorrow your data would be untouched, because it never lived anywhere
else.

[Open it](https://todoistenhanced.julesbertolino.fr) ·
[What it adds](#what-it-adds) ·
[How to use it](#how-to-use-it) ·
[Changelog](CHANGELOG.md) ·
[Report a bug or an idea](https://tally.so/r/WOLkVN) ·
[Support me](https://buymeacoffee.com/julesbertolino)

[![Enhanced for Todoist, My week view](docs/screenshot-my-week.png)](https://github.com/julesvbertolino/todoist-enhancements/raw/main/docs/tour.mp4)

**[Watch the tour](https://github.com/julesvbertolino/todoist-enhancements/raw/main/docs/tour.mp4)** · two and a half minutes, no sign-in

**Enhanced for Todoist is an independent project. It is not created by,
affiliated with, or supported by Todoist.**

</div>

---

## What it adds

- **My week.** The week in five buckets: behind schedule, quick, today,
  scheduled today, and **anytime this week** — the work you have committed to
  without pinning it to an afternoon, which is most of it.
- **Durations.** Write down how long a task will take. Every page then shows how
  many tasks are on it, how much time that adds up to, and what share of the
  capacity you set for that day or week. A parent with no estimate of its own
  adds up its subtasks, and anything still unestimated is listed in one place so
  you can fill them in together.
- **Quick.** Anything short enough to do rather than plan, gathered into its own
  bucket.
- **Someday.** What you are not committing to yet, kept out of the week but not
  out of the app, and read back to you during the weekly review.
- **A daily review.** A few minutes, one question at a time, with an end: what is
  late, your mail, the Inbox, what you committed to this week without naming a
  day, what has no estimate, and what today weighs against the hours you have.
- **A weekly review.** Closes the week — what you finished, the week in numbers,
  what is late, which projects have gone quiet — then opens the next one. You
  choose which week you are closing, and it opens on the one that has just
  ended.
- **Looking back.** A dashboard that changes with the period you pick: a day
  shows the hours you finished things in, a week adds its shape and a comparison
  with the last one, a year reads month by month. A focus score weights what you
  finished by its priority, which answers whether the effort went where it
  mattered.
- **A logbook.** What you actually finished, grouped by day, filtered by several
  projects and priorities at once.
- **Things to settle.** The contradictions no app should resolve on its own — a
  task both dated and labelled for the week, two estimates on one task, a
  "quick" task estimated at forty minutes. Listed with the options that match
  each intent, and nothing changes until you choose one.
- **Capacity.** The hours you actually have in a day and a week, which is what
  the workload figures are measured against.

## ...and the things you already know from Todoist

- **Drag and drop**, where each destination has one fixed meaning and every drop
  can be undone. Dropped on a row, a task takes its place; dragged a little to
  the right, it goes inside it as a subtask; a subtask dragged left becomes a
  task again.
- **List and board**, with grouping, sorting and filtering behind one Display
  control.
- **A composer that reads what you type.** `Call Marc tomorrow at 9h p1 #Work
  @quick (25)` — the date, project, priority, tag and estimate are marked inside
  the field as you type and fill the fields underneath. Click a mark, or press
  Backspace against it, and that reading turns back into ordinary text.
- **Recurring dates** in Todoist's own grammar: `every monday`, `every 3 days`,
  `every 1st wed`, `every!`, `tous les jours de semaine`. The rule is handed to
  Todoist to resolve rather than guessed at here.
- **Subtasks**, typed in the same dialog and created with their parent.
- **Projects, sections, tags and favourites**, nested by dragging, ordered by
  dragging.
- **Inbox, Upcoming, Someday**, plus a page for every project and every tag.
- **Search** (`⌘K`) across tasks, projects, tags and every view in the app.
- **Undo** (`⌘Z`) for a move, a completion, a deletion, a drop. A deleted task
  comes back with its subtasks.
- **Multi-select** (`⌘`-click) with one bar at the foot of the window to give
  the lot a date, a project, a tag or a priority.
- **Markdown in descriptions**, rendered in the list and in the task panel.
- **Light and dark**, or whichever the device is set to, with ten accent colours
  drawn in both and checked for contrast rather than chosen by eye.
- **Offline.** Changes are queued and sent when you reconnect. It installs as an
  app.
- **English and French**, and settings for the things people disagree about.

## A look

![The My week buckets](docs/feature-my-week.gif)

*My week: behind schedule, quick, today, anytime this week.*

![Estimates and the workload figure](docs/feature-estimates.gif)

*An estimate being typed, and the workload line following it.*

![The insights dashboard](docs/feature-insights.gif)

*Looking back over a week.*

![The logbook](docs/feature-logbook.gif)

*The logbook.*

---

## How to use it

1. Open **[todoistenhanced.julesbertolino.fr](https://todoistenhanced.julesbertolino.fr)**.
2. Press **Explore with demo data** to look around a made-up workspace without a
   token. Nothing is sent anywhere.
3. To use your own account, copy your API token from [Todoist → Settings →
   Integrations → Developer](https://app.todoist.com/app/settings/integrations/developer)
   and paste it into the connect screen.

There is no server, no database and no account beyond your Todoist one. The
browser talks to the Todoist API directly, your token is stored in your own
browser and is only ever sent to Todoist, and a copy of your workspace,
your preferences and anything you changed offline sit in IndexedDB on that
device.

## Links

- **[Open the app](https://todoistenhanced.julesbertolino.fr)**
- **[Report a bug or an idea](https://tally.so/r/WOLkVN)** — a short form, no
  GitHub account needed. It is the one the app links to from the user menu.
- **[Changelog](CHANGELOG.md)** — each version is also a
  [release](https://github.com/julesvbertolino/todoist-enhancements/releases)
  with a ready-to-host build attached.
- **[Buy me a coffee](https://buymeacoffee.com/julesbertolino)** if it saves you
  time.

## Building it

React 18, TypeScript and Vite. Zustand for state, `idb` for IndexedDB,
`@dnd-kit` for drag and drop, `date-fns` for dates, `vite-plugin-pwa` so it can
be installed. No UI or CSS framework.

```bash
npm install
npm run dev      # Node 20+, pinned in .nvmrc
npm run build    # a static site in dist/, see docs/deploying.md
```

I built this for myself, so it is shaped around one person's habits — that is
the main thing it needs help with. If you have an idea, open an issue and say
how you plan your week; the most useful thing you can tell me is what you do
that this app makes difficult. Pull requests are open, and the rules live in
`src/domain` and depend on nothing else, so most behaviour can be changed
without touching the interface.

## Disclaimer and trademarks

Enhanced for Todoist is an independent project. **It is not created by,
affiliated with, or supported by Todoist.** It is not an official Todoist
product and it carries no endorsement.

"Todoist" is a trademark of Todoist Inc. Any reference to it here is
descriptive, to say what this connects to, and implies no association. The
project is named in the `x for Todoist` form that Todoist's [brand usage
guidelines](https://developer.todoist.com/api/v1/#section/Developing-with-Todoist/Brand-usage)
ask of third-party apps, and the same statement appears on the sign-in screen
and under Settings, About. The app's icon, name and interface are its own work:
no Todoist logo, icon or other brand asset is used anywhere in this project.

It uses the public Todoist API as any account holder may. It is provided as is,
with no warranty, and it is not a support channel for Todoist: if something is
wrong with your account or with Todoist itself, ask Todoist, not me. If anyone
at Todoist would like something here changed, open an issue and I will change
it.

## License

[MIT](LICENSE).
