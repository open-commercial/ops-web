import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';
import { ProductoModalComponent } from '../producto-modal/producto-modal.component';
import { Producto } from '../../models/producto';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ProductosService } from '../../services/productos.service';
import { RenglonPedido } from '../../models/renglon-pedido';

@Component({
  selector: 'app-busqueda-producto',
  templateUrl: './busqueda-producto.component.html',
  styleUrls: ['./busqueda-producto.component.scss']
})
export class BusquedaProductoComponent implements OnInit {
  private pDirectInputId = 'codigoProducto';
  private messages = new Subject<string>();
  message: string;
  messageType = 'success';

  modalRef;

  @Input()
  set directInputId(id: string) { this.pDirectInputId = id; }
  get directInputId(): string { return this.pDirectInputId; }

  private pRenglonesPedido: RenglonPedido[] = [];
  @Input() set renglonesPedido(value: RenglonPedido[]) {
    this.pRenglonesPedido = value;
  }
  get renglonesPedido(): RenglonPedido[] { return this.pRenglonesPedido; }

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
    this.modalRef = this.modalService.open(ProductoModalComponent, {scrollable: true});
    this.modalRef.componentInstance.renglonesPedido = this.pRenglonesPedido;
    this.modalRef.result.then((p: Producto) => {
        this.seleccion.emit(p);
    }, () => {});
  }

  ingresarProductoDirecto($event) {
    const codigo = $event.target.value.trim();
    $event.preventDefault();

    if (!codigo) { return null; }

    this.loadingProducto = true;
    this.productosService.getProductoPorCodigo(codigo)
      .pipe(finalize(() => this.loadingProducto = false))
      .subscribe(
        (p: Producto) => {
          if (p) {
            this.directInputSeleccion.emit(p);
          } else {
            this.showMessage(`No existe producto con codigo: "${codigo}"`, 'danger');
          }
        },
        err => {
          this.loadingProducto = false;
          this.showMessage(err.error, 'danger');
        }
      );
  }
}
