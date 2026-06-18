export async function refreshHomeData(
  loadItems: (showRefreshing?: boolean) => Promise<void>,
  loadReminders: (options?: { force?: boolean }) => Promise<void>,
) {
  await Promise.all([loadItems(true), loadReminders({ force: true })]);
}
