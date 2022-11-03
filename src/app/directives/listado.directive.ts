import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SucursalesService } from '../services/sucursales.service';
import { OnDestroy, OnInit, Directive } from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Pagination } from '../models/pagination';
import { MensajeModalType } from '../components/mensaje-modal/mensaje-modal.component';
import { LoadingOverlayService } from '../services/loading-overlay.service';
import { MensajeService } from '../services/mensaje.service';

@Directive()
export abstract class ListadoDirective implements OnInit, OnDestroy {
  items = [];
  isFiltersCollapsed = true;

  page = 0;
  totalElements = 0;
  totalPages = 0;
  size = 0;

  filterForm: UntypedFormGroup;
  appliedFilters: { label: string; value: string; asyncFn?: Observable<string> }[] = [];

  subscription: Subscription;

  searching = false;

  ordenArray: { val: string, text: string }[] = [];
  sentidoArray: { val: string, text: string }[] = [];

  protected constructor(protected route: ActivatedRoute,
                        protected router: Router,
                        protected sucursalesService: SucursalesService,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected mensajeService: MensajeService) {
    this.subscription = new Subscription();
  }

  abstract getTerminosFromQueryParams(params);
  abstract createFilterForm();
  abstract resetFilterForm();
  abstract getAppliedFilters();
  abstract getFormValues();
  abstract getItemsObservableMethod(terminos): Observable<Pagination>;

  protected getDefaultOrdenYSentido(): { orden: string, sentido: string }
  {
    const ret = { orden: '', sentido: ''};
    if (this.ordenArray.length) {
      ret.orden = this.ordenArray[0].val;
    }
    if (this.sentidoArray.length) {
      ret.sentido = this.sentidoArray[0].val;
    }

    return ret;
  }

  populateFilterForm(params) {
    this.filterForm.patchValue(params);
    const { orden, sentido } = this.getDefaultOrdenYSentido();
    if (!params.ordenarPor && this.filterForm.get('ordenarPor')) {
      this.filterForm.get('ordenarPor').setValue(orden);
    }
    if (!params.sentido && this.filterForm.get('sentido')) {
      this.filterForm.get('sentido').setValue(sentido);
    }
  }

  ngOnInit(): void {
    this.createFilterForm();
    this.subscription.add(this.sucursalesService.sucursal$.subscribe(() => this.getItemsFromQueryParams()));
    this.subscription.add(this.route.queryParamMap.subscribe(params => this.getItemsFromQueryParams(params)));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getItemsFromQueryParams(params = null) {
    const ps = params ? params.params : this.route.snapshot.queryParams;
    const p = Number(ps.p);
    this.page = isNaN(p) || p < 1 ? 0 : (p - 1);

    this.resetFilterForm();
    this.populateFilterForm(ps);
    const terminos = this.getTerminosFromQueryParams(ps);
    this.fetchItems(terminos);
  }

  fetchItems(terminos = null) {
    terminos = terminos || this.getFormValues();

    this.getAppliedFilters();

    terminos.pagina = this.page;
    this.getItems(terminos);
  }

  getItems(terminos) {
    this.loadingOverlayService.activate();
    this.searching = true;
    this.getItemsObservableMethod(terminos)
      .pipe(finalize(() => {
        this.loadingOverlayService.deactivate();
        this.searching = false;
      }))
      .subscribe({
        next: (p: Pagination) => {
          this.items = p.content;
          this.totalElements = p.totalElements;
          this.totalPages = p.totalPages;
          this.size = p.size;
        },
        error: err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.items = [];
        }
      })
    ;
  }

  filter() {
    this.loadPage(0);
  }

  reset() {
    this.router.navigate([], { relativeTo: this.route, queryParams: [] });
  }

  loadPage(page) {
    this.page = page;
    const qParams = this.getFormValues();
    qParams.p = this.page + 1;
    this.router.navigate([], { relativeTo: this.route, queryParams: qParams });
    this.isFiltersCollapsed = true;
  }
}
