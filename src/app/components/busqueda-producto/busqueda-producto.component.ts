import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';
import { ProductoModalComponent } from '../producto-modal/producto-modal.component';
import { Producto } from '../../models/producto';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ProductosService } from '../../services/productos.service';
import {Cliente} from '../../models/cliente';
import {Movimiento} from '../../models/movimiento';

@Component({
  selector: 'app-busqueda-producto',
  templateUrl: './busqueda-producto.component.html',
  styleUrls: ['./busqueda-producto.component.scss']
})
export class BusquedaProductoComponent implements OnInit {
  private messages = new Subject<string>();
  message: string;
  messageType = 'success';
  codigo = '';

  private pCantidadesInicialesPedido: { [idProducto: number]: number } = {};
  @Input()
  set cantidadesInicialesPedido(value: { [idProducto: number]: number }) { this.pCantidadesInicialesPedido = value; }
  get cantidadesInicialesPedido() { return this.pCantidadesInicialesPedido; }

  private pCantidadesActualesPedido: { [idProducto: number]: number } = {};
  @Input()
  set cantidadesActualesPedido(value: { [idProducto: number]: number }) { this.pCantidadesActualesPedido = value; }
  get cantidadesActualesPedido() { return this.pCantidadesActualesPedido; }

  private pDirectInputId = 'codigoProducto';
  @Input()
  set directInputId(id: string) { this.pDirectInputId = id; }
  get directInputId(): string { return this.pDirectInputId; }

  private pIdSucursal: number = null;
  @Input()
  set idSucursal(value: number) { this.pIdSucursal = value; }
  get idSucursal(): number { return this.pIdSucursal; }

  @Output() seleccion = new EventEmitter<Producto>();
  @Output() directInputSeleccion = new EventEmitter<Producto>();

  private pCliente: Cliente = null;
  @Input()
  set cliente(value: Cliente) { this.pCliente = value; }
  get cliente(): Cliente { return this.pCliente; }

  private pMovimiento: Movimiento = null;
  @Input()
  set movimiento(value: Movimiento) { this.pMovimiento = value; }
  get movimiento(): Movimiento { return this.pMovimiento; }

  loadingProducto = false;

  constructor(private modalService: NgbModal,
              private productosService: ProductosService) {
  }

  ngOnInit() {
    this.messages.subscribe((message) => this.message = message);
    this.messages
      .pipe(debounceTime(3000))
      .subscribe(() => this.message = null)
    ;
  }

  showMessage(message, type = 'success') {
    this.messageType = type;
    this.messages.next(message);
  }

  showProductoModal($event) {
    $event.preventDefault();
    const modalRef = this.modalService.open(ProductoModalComponent, {scrollable: true, keyboard: true});
    modalRef.componentInstance.cantidadesInicialesPedido = this.pCantidadesInicialesPedido;
    modalRef.componentInstance.cantidadesActualesPedido = this.pCantidadesActualesPedido;
    if (this.cliente) { modalRef.componentInstance.cliente = this.cliente; }
    if (this.movimiento) { modalRef.componentInstance.movimiento = this.movimiento; }
    modalRef.componentInstance.idSucursal = this.idSucursal;
    modalRef.result.then((p: Producto) => {
      this.seleccion.emit(p);
    }, () => { return; });
  }

  ingresarProductoDirecto($event) {
    $event.preventDefault();
    this.codigo = this.codigo.trim();
    if (!this.codigo) { return; }

    this.loadingProducto = true;
    this.productosService.getProductoPorCodigo(this.codigo)
      .pipe(finalize(() => this.loadingProducto = false))
      .subscribe(
        (p: Producto) => {
          if (p) {
            this.directInputSeleccion.emit(p);
            this.codigo = '';
          } else {
            this.showMessage(`No existe producto con codigo: "${this.codigo}"`, 'danger');
          }
        },
        err => {
          this.loadingProducto = false;
          this.showMessage(err.error, 'danger');
        }
      );
  }
}
