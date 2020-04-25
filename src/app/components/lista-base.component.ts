import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SucursalesService } from '../services/sucursales.service';
import { OnInit } from '@angular/core';
import { Observable } from 'rxjs';

export abstract class ListaBaseComponent implements OnInit {
  protected items = [];
  protected isFiltersCollapsed = true;

  protected page = 0;
  protected totalElements = 0;
  protected totalPages = 0;
  protected size = 0;

  protected filterForm: FormGroup;
  protected appliedFilters: { label: string; value: string; asyncFn?: Observable<string> }[] = [];

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

  getItemsFromQueryParams(params = null, clearResults = true) {
    const terminos = this.getTerminosFromQueryParams(params);
    this.fetchItems(clearResults, terminos);
  }

  fetchItems(clearResults: boolean = false, terminos = null) {
    terminos = terminos || this.getFormValues();
    terminos.idSucursal = Number(this.sucursalesService.getIdSucursal());
    this.page += 1;
    if (clearResults) {
      this.page = 0;
      this.items = [];
    }
    this.getAppliedFilters();

    terminos.pagina = this.page;
    this.getItems(terminos);
  }

  filter() {
    const qParams = this.getFormValues();
    this.router.navigate([], { relativeTo: this.route, queryParams: qParams });
    this.isFiltersCollapsed = true;
  }

  reset() {
    this.router.navigate([], { relativeTo: this.route, queryParams: [] });
  }

  loadMore() {
    this.getItemsFromQueryParams(null, false);
  }
}
