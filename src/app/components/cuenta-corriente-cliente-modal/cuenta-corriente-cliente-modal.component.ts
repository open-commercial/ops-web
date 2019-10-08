import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CuentaCorrienteCliente } from '../../models/cuenta-corriente';
import { of, Subject } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CuentasCorrienteService } from '../../services/cuentas-corriente.service';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'app-cuenta-corriente-cliente-modal',
  templateUrl: './cuenta-corriente-cliente-modal.component.html',
  styleUrls: ['./cuenta-corriente-cliente-modal.component.scss']
})
export class CuentaCorrienteClienteModalComponent implements OnInit {
  cccs: CuentaCorrienteCliente[] = [];
  loading = false;
  input$  = new Subject<string>();
  cccSeleccionado: CuentaCorrienteCliente = null;
  helper = HelperService;
  @ViewChild('searchInput', null) searchInput: ElementRef;

  constructor(public activeModal: NgbActiveModal,
              private cuentasCorrienteService: CuentasCorrienteService) { }

  ngOnInit() {
    this.loadCccs();
  }

  loadCccs() {
    this.input$
      .pipe(
        debounceTime(700),
        distinctUntilChanged(),
        tap(() => this.loading = true),
        switchMap(term => this.cuentasCorrienteService.getCuentasCorriente(term).pipe(
          map((v: Pagination) => v.content),
          catchError(() => of([])), // empty list on error
          tap(() => this.loading = false)
        ))
      )
      .subscribe(data => {
        this.cccs = data;
      });
  }

  onSearchInputEnterKeyUp($event) {
    this.buscar($event.target.value);
  }

  buscar(value: string) {
    this.cccSeleccionado = null;
    value = value.trim();
    if (value) {
      this.input$.next(value);
    }
  }

  select(ccc: CuentaCorrienteCliente) {
    this.cccSeleccionado = ccc;
  }

  seleccionarCcc() {
    if (this.cccSeleccionado) {
      this.activeModal.close(this.cccSeleccionado);
    }
  }

  clearInput() {
    this.searchInput.nativeElement.value = '';
    this.cccs = [];
    this.cccSeleccionado = null;
    this.searchInput.nativeElement.focus();
  }
}
