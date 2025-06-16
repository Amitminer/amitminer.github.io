- In app/api/github/example.route.ts around lines 108 to 116, the cache key uses
only the endpoint, ignoring the cacheParam value, which can be "true" or
"skills". This causes different cache entries to overwrite each other, risking
cache poisoning. To fix this, modify the cache key to include both the endpoint
and the cacheParam value, ensuring distinct cache entries for each cacheParam
variant.
- In app/components/sections/Projects.tsx around lines 237 to 247, the formatDate
function incorrectly shows "1 day ago" for updates that happened minutes ago
because diffDays is always at least 1 due to Math.ceil. Fix this by adding a
condition to check if the difference is less than one day and return "Today" or
"Just now" accordingly before the existing day-based checks.
- In app/components/sections/GitHubStats.tsx around lines 135 to 164, the
AbortController's timeout cleanup with clearTimeout(timeoutId) is currently only
called in try and catch blocks, which can cause leaks if fetch resolves after
abort. Refactor the fetchFromAPI function to move clearTimeout(timeoutId) into a
finally block after the try-catch to ensure it always runs regardless of fetch
outcome, preventing AbortController leaks and unhandled promise rejections.
- In app/lib/types.ts around lines 61 to 65, the GitHubEvent interface uses `any`
for the payload property, which removes type safety. Replace `any` with a union
type of known event payload interfaces, such as `PushEventPayload |
IssueEventPayload | ...`, to improve type safety and enable compile-time checks
for payload structure.
- In app/components/ui/progress.tsx around lines 11 to 23, the clamped value is
assigned to safeValue but not passed to ProgressPrimitive.Root, causing loss of
aria-valuenow and breaking accessibility. Fix this by adding value={safeValue}
to the props of ProgressPrimitive.Root so the component receives the clamped
value and ARIA attributes work correctly.