import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SucursalesService } from '../services/sucursales.service';
import { OnInit } from '@angular/core';
import { Observable } from 'rxjs';

export abstract class ListadoBaseComponent implements OnInit {
  items = [];
  isFiltersCollapsed = true;

  page = 0;
  totalElements = 0;
  totalPages = 0;
  size = 0;

  filterForm: FormGroup;
  appliedFilters: { label: string; value: string; asyncFn?: Observable<string> }[] = [];

  protected constructor(protected route: ActivatedRoute,
                        protected router: Router,
                        protected sucursalesService: SucursalesService) {}

  abstract getTerminosFromQueryParams(params);
  abstract createFilterForm();
  abstract getItems(terminos);
  abstract getAppliedFilters();
  abstract getFormValues();

  ngOnInit(): void {
    this.createFilterForm();
    this.sucursalesService.sucursal$.subscribe(() => this.getItemsFromQueryParams());
    this.route.queryParamMap.subscribe(params => this.getItemsFromQueryParams(params));
  }

  getItemsFromQueryParams(params = null) {
    const terminos = this.getTerminosFromQueryParams(params);
    this.fetchItems(terminos);
  }

  fetchItems(terminos = null) {
    terminos = terminos || this.getFormValues();
    terminos.idSucursal = Number(this.sucursalesService.getIdSucursal());

    this.getAppliedFilters();

    terminos.pagina = this.page;
    this.getItems(terminos);
  }

  filter() {
    const qParams = this.getFormValues();
    qParams.p = this.page + 1;
    this.router.navigate([], { relativeTo: this.route, queryParams: qParams });
    this.isFiltersCollapsed = true;
  }

  reset() {
    this.router.navigate([], { relativeTo: this.route, queryParams: [] });
  }

  loadPage(page) {
    this.page = page;
    this.filter();
  }
}
