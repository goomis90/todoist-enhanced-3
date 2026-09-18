/** Case- and accent-insensitive text used by picker filters. */
export const searchText = (value: string): string =>
  value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const matchesSearch = (value: string, query: string): boolean =>
  searchText(value).includes(searchText(query.trim()));
