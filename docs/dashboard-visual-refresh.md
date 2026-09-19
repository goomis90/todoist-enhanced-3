# Dashboard visual refresh — validation notes

This work is intentionally isolated on `codex/issues-30-34-validation` and must not be merged before visual approval with real Todoist data.

## Metric-to-question map

| Metric | User question | Data type | Encoding | Period / comparison | Empty, sparse and dense states |
| --- | --- | --- | --- | --- | --- |
| Completed tasks | What actually moved during this period? | Count | Primary number and supporting sentence | Selected period, with the previous equal-length period stated beside it | Zero remains an explicit `0`; the comparison stays textual; large values do not change the card layout |
| Tasks per day | What is the average completion pace? | Rate | Primary number | Entire selected period, including inactive days | Zero remains explicit and never hides quiet days |
| Estimated time completed | How much estimated effort was finished? | Duration | Primary number | Selected period | Zero is explicit; unestimated completed tasks are stated beside it |
| Completed volume over time | When did output rise or fall? | Trend | Bars, with the previous equal-length period as a tick on the same scale | Selected period against the preceding equal-length period | Weekly views use weekday labels; medium ranges offer Day/Month; years use months |
| Activity heatmap | On how many days was something completed? | Daily count / distribution | Contribution grid in one hue, four intensities and a Less–More legend | Entire selected period, including a full year | Empty days remain visible; every cell has an exact accessible label; long ranges scroll inside the card |
| Project distribution | Where did completed work go? | Share / distribution | Donut with direct legend values and percentages | Selected period | Empty state is named; long tails fold into Other |
| Priority and focus | Did completed work favour higher-priority tasks, and what was the mix? | Bounded rate plus distribution | Focus ring and P1–P4 split bar in one card | Selected period; no invented target | Empty history is 0%; every priority is named and valued |
| Completion time | At what hours was work completed? | Distribution | Bars by hour | Selected period | Empty state is named; 24 fixed buckets avoid changing the scale with density |
| Tag distribution | Which contexts dominated completed work? | Ranked distribution | Stage-style ranked bars with exact values | Selected period | Untagged work is explicit; long tails fold into Other; long names truncate visually but remain available as titles |

## Visual hierarchy

1. The first row answers three questions only: completed tasks, daily pace and estimated time completed.
2. Trend and the full-period heatmap follow.
3. Project, priority/focus, time-of-day and tag breakdowns complete the page.
4. Exact values are available in text, keyboard focus labels, legends or readouts; colour is never the only carrier.

## Validation matrix

- Desktop: light and dark mode at 1440 × 1000.
- Mobile: 390 × 844; the bento and Eisenhower matrix collapse to one column without page-level horizontal overflow.
- Data: demo mode plus empty, sparse and dense inspection by changing the selected period.
- Accessibility: keyboard focus on chart marks and contribution cells, screen-reader labels, monochrome-readable shapes and legends, reduced-motion respected.
- Performance: no chart dependency was added; the contribution grid is plain React/CSS and supports the full 365-day view.
