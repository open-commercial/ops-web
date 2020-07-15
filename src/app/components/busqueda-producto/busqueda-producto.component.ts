import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';
import { ProductoModalComponent } from '../producto-modal/producto-modal.component';
import { Producto } from '../../models/producto';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ProductosService } from '../../services/productos.service';

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

  @Output() seleccion = new EventEmitter<Producto>();
  @Output() directInputSeleccion = new EventEmitter<Producto>();

  loadingProducto = false;

  constructor(modalConfig: NgbModalConfig,
              private modalService: NgbModal,
              private productosService: ProductosService) {
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
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
    const modalRef = this.modalService.open(ProductoModalComponent, {scrollable: true});
    modalRef.componentInstance.cantidadesInicialesPedido = this.pCantidadesInicialesPedido;
    modalRef.componentInstance.cantidadesActualesPedido = this.pCantidadesActualesPedido;
    modalRef.result.then((p: Producto) => {
        this.seleccion.emit(p);
    }, () => {});
  }

  ingresarProductoDirecto() {
    this.codigo = this.codigo.trim();
    if (!this.codigo) { return; }

    this.loadingProducto = true;
    this.productosService.getProductoPorCodigo(this.codigo)
      .pipe(finalize(() => this.loadingProducto = false))
      .subscribe(
        (p: Producto) => {
          if (p) {
            this.directInputSeleccion.emit(p);
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
