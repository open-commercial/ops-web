import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Cliente } from '../../models/cliente';
import { Observable, of, Subject } from 'rxjs';
import { ClientesService } from '../../services/clientes.service';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, switchMap, tap } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { ProductosService } from '../../services/productos.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductoModalComponent } from '../producto-modal/producto-modal.component';
import { Producto } from '../../models/producto';
import { ClienteModalComponent } from '../cliente-modal/cliente-modal.component';

@Component({
  selector: 'app-cliente-filtro',
  templateUrl: './cliente-filtro.component.html',
  styleUrls: ['./cliente-filtro.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ClienteFiltroComponent),
      multi: true
    }
  ]
})
export class ClienteFiltroComponent implements OnInit, ControlValueAccessor {
  loading = false;
  cliente: Cliente = null;

  value;
  isDisabled = false;
  onChange = (_: any) => { };
  onTouch = () => { };

  constructor(public clientesService: ClientesService,
              private modalService: NgbModal) { }

  ngOnInit() {}

  private setCliente(c: Cliente, applyChange = true) {
    this.cliente = c;
    this.value = c ? c.idCliente : null;
    if (applyChange) {
      this.onTouch();
      this.onChange(this.value);
    }
  }

  select() {
    const modalRef = this.modalService.open(ClienteModalComponent, {scrollable: true});
    modalRef.result.then((c: Cliente) => {
      this.setCliente(c);
    }, (reason) => {});
  }

  clearValue() {
    this.setCliente(null);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(idCliente: number): void {
    if (!idCliente) {
      this.setCliente(null, false);
      return;
    }
    this.loading = true;
    this.clientesService.getCliente(idCliente)
      .pipe(finalize(() => this.loading = false))
      .subscribe((c: Cliente) => {
        this.setCliente(c, false);
      })
    ;
  }

  getDisplayValue() {
    if (this.cliente) {
      return this.cliente.nroCliente + ' - ' + this.cliente.nombreFiscal;
    }
    return '';
  }
}
