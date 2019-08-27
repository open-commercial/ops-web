interface Sort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

export interface Pagination {
  content: any[];
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  sort: Sort;
  totalElements: number;
  totalPages: number;
}

