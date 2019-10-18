import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CuentaCorrienteCliente } from '../../models/cuenta-corriente';
import { NgbAccordionConfig, NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ProductoModalComponent } from '../producto-modal/producto-modal.component';
import { NuevoRenglonPedido } from '../../models/nuevo-renglon-pedido';
import { PedidosService } from '../../services/pedidos.service';
import { RenglonPedido } from '../../models/renglon-pedido';
import { RenglonPedidoModalComponent } from '../renglon-pedido-modal/renglon-pedido-modal.component';
import { Producto } from '../../models/producto';
import { TipoDeEnvio } from '../../models/tipo-de-envio';
import { NuevosResultadosPedido } from '../../models/nuevos-resultados-pedido';
import { Resultados } from '../../models/resultados';
import { CuentasCorrienteService } from '../../services/cuentas-corriente.service';
import { SucursalesService } from '../../services/sucursales.service';
import { Sucursal } from '../../models/sucursal';
import { NuevoPedido } from '../../models/nuevo-pedido';
import { AuthService } from '../../services/auth.service';
import { debounceTime, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ProductosService } from '../../services/productos.service';
import { EliminarRengloPedidoModalComponent } from '../eliminar-renglo-pedido-modal/eliminar-renglo-pedido-modal.component';
import { Cliente } from '../../models/cliente';

@Component({
  selector: 'app-punto-venta',
  templateUrl: './punto-venta.component.html',
  styleUrls: ['./punto-venta.component.scss'],
})
export class PuntoVentaComponent implements OnInit {
  form: FormGroup;
  te = TipoDeEnvio;
  sucursales: Array<Sucursal> = [];

  saving = false;
  cccPredeterminadoLoading = false;

  private errors = new Subject<string>();
  errorMessage: string;

  private productoPorCodigoErrors = new Subject<string>();
  productoPorCodigoErrorMessage: string;

  loadingProducto = false;
  loadingResultados = false;

  constructor(private fb: FormBuilder,
              modalConfig: NgbModalConfig,
              private modalService: NgbModal,
              accordionConfig: NgbAccordionConfig,
              private pedidosService: PedidosService,
              private cuentasCorrienteService: CuentasCorrienteService,
              private sucursalesService: SucursalesService,
              private authService: AuthService,
              private router: Router,
              private productosService: ProductosService) {

    accordionConfig.type = 'dark';
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
  }

  ngOnInit() {
    this.errors.subscribe((message) => this.errorMessage = message);
    this.errors
      .pipe(debounceTime(3000))
      .subscribe(() => this.errorMessage = null);

    this.productoPorCodigoErrors.subscribe((message) => this.productoPorCodigoErrorMessage = message);
    this.productoPorCodigoErrors
      .pipe(debounceTime(3000))
      .subscribe(() => this.productoPorCodigoErrorMessage = null);

    this.createFrom();
  }

  createFrom() {
    this.form = this.fb.group({
      ccc: [null, Validators.required],
      renglonesPedido: this.fb.array([]),
      observaciones: ['', Validators.maxLength(250)],
      descuento: 0,
      recargo: 0,
      tipoEnvio: [this.te.RETIRO_EN_SUCURSAL, Validators.required],
      sucursal: null,
      ubicacionFacturacion: null,
      ubicacionEnvio: null,
      resultados: null,
    });

    this.form.get('ccc').valueChanges
      .subscribe(v => {
        this.setUbicaciones();
        this.calcularResultados();
      });

    this.form.get('renglonesPedido').valueChanges
      .subscribe(v => this.calcularResultados());

    /*this.form.get('descuento').valueChanges.subscribe(
      v => this.calcularResultados()
    );

    this.form.get('recargo').valueChanges.subscribe(
      v => this.calcularResultados()
    );*/

    this.form.get('tipoEnvio').valueChanges.subscribe(te => {

    });

    this.getSucursales();

    this.cccPredeterminadoLoading = true;
    this.cuentasCorrienteService.getCuentaCorrienteClientePredeterminado()
      .pipe(
        finalize(() => this.cccPredeterminadoLoading = false)
      )
      .subscribe(
        ccc => {
          this.form.get('ccc').setValue(ccc);
        },
        err => {
          console.log(err.error);
          this.showErrorMessage(err);
        }
      );
  }

  setUbicaciones() {
    this.form.get('ubicacionFacturacion').setValue(null);
    this.form.get('ubicacionEnvio').setValue(null);
    if (this.form && this.form.get('ccc') && this.form.get('ccc').value) {
      const ccc: CuentaCorrienteCliente = this.form.get('ccc').value;
      this.form.get('ubicacionFacturacion').setValue(ccc.cliente.ubicacionFacturacion);
      this.form.get('ubicacionEnvio').setValue(ccc.cliente.ubicacionEnvio);
    }
  }

  getSucursales() {
    this.sucursalesService.getPuntosDeRetito()
      .subscribe((data: Array<Sucursal>) => {
        this.sucursales = data;
        if (this.sucursales.length) { this.form.get('sucursal').setValue(this.sucursales[0]); }
      })
    ;
  }

  submit() {
    if (this.form.valid) {
      const np: NuevoPedido = this.getNuevoPedido();
      this.saving = true;
      this.pedidosService.savePedido(np)
        .pipe(finalize(() => this.saving = false))
        .subscribe(p => {
          this.router.navigate(['/pedidos']);
        })
      ;
    }
  }

  getNuevoPedido() {
    const sucursalEnvio: Sucursal =
      this.form.get('tipoEnvio').value === TipoDeEnvio.RETIRO_EN_SUCURSAL && this.form.get('sucursal').value
      ? this.form.get('sucursal').value : null;

    const ccc: CuentaCorrienteCliente = this.form.get('ccc').value;

    const renglones = this.form.get('renglonesPedido').value && this.form.get('renglonesPedido').value.length
      ? this.form.get('renglonesPedido').value : [];

    const resultados: Resultados = this.form.get('resultados').value ? this.form.get('resultados').value : null;

    const np: NuevoPedido = {
      fechaVencimiento: null,
      observaciones: this.form.get('observaciones').value,
      idSucursal: Number(SucursalesService.getIdSucursal()),
      idSucursalEnvio: sucursalEnvio ? sucursalEnvio.idSucursal : null,
      tipoDeEnvio: this.form.get('tipoEnvio').value,
      idUsuario: Number(this.authService.getLoggedInIdUsuario()),
      idCliente: ccc && ccc.cliente ? ccc.cliente.id_Cliente : null,
      renglones: renglones.map(r => r.renglonPedido),
      subTotal: resultados && resultados.subTotal ? resultados.subTotal : 0,
      recargoPorcentaje: resultados && resultados.recargoPorcentaje ? resultados.recargoPorcentaje : 0,
      recargoNeto: resultados && resultados.recargoNeto ? resultados.recargoNeto : 0,
      descuentoPorcentaje: resultados && resultados.descuentoPorcentaje ? resultados.descuentoPorcentaje : 0,
      descuentoNeto: resultados && resultados.descuentoNeto ? resultados.descuentoNeto : 0,
      total: resultados && resultados.total ? resultados.total : 0,
    };
    return np;
  }

  reset() {
    this.renglonesPedido.clear();
    this.form.reset({
      ccc: null,
      renglonesPedido: [],
      observaciones: '',
      descuento: 0,
      recargo: 0,
      tipoEnvio: TipoDeEnvio.RETIRO_EN_SUCURSAL,
      sucursal: null,
      ubicacionFacturacion: null,
      ubicacionEnvio: null,
      resultados: null,
    });
  }

  get renglonesPedido() {
    return this.form.get('renglonesPedido') as FormArray;
  }

  handleRenglonPedido(renglonPedido: RenglonPedido) {
    const control = this.searchRPInRenglones(renglonPedido.idProductoItem);
    if (control) {
      control.get('renglonPedido').setValue(renglonPedido);
    } else {
      this.renglonesPedido.push(this.createRenglonPedidoForm(renglonPedido));
    }
  }

  createRenglonPedidoForm(renglonPedido: RenglonPedido) {
    return this.fb.group({
      renglonPedido: [renglonPedido],
    });
  }

  handleSelectCcc(ccc: CuentaCorrienteCliente) {
    this.form.get('ccc').setValue(ccc);
  }

  // modal de producto
  showProductoModal() {
    const modalRef = this.modalService.open(ProductoModalComponent, { scrollable: true });
    modalRef.result.then((p: Producto) => {
      const control = this.searchRPInRenglones(p.idProducto);
      const cPrevia = control ? control.get('renglonPedido').value.cantidad : 1;

      this.showCantidadModal(p.idProducto, cPrevia, p.codigo, p.descripcion, p.urlImagen, p.oferta);
    }, (reason) => { /*console.log(reason);*/ });
  }

  // modal de cantidad
  showCantidadModal(
    idProductoItem: number, cantidadPrevia = 1,
    codigoItem: string, descripcionItem: string, urlImagenItem: string, oferta: boolean
  ) {
    const modalRef = this.modalService.open(RenglonPedidoModalComponent/*, { size: 'xl' }*/);
    modalRef.componentInstance.cliente = this.form.get('ccc').value.cliente;
    modalRef.componentInstance.idProductoItem = idProductoItem;
    modalRef.componentInstance.cantidad = cantidadPrevia;
    modalRef.componentInstance.codigoItem = codigoItem;
    modalRef.componentInstance.descripcionItem = descripcionItem;
    modalRef.componentInstance.urlImagenItem = urlImagenItem;
    modalRef.componentInstance.oferta = oferta;
    modalRef.result.then((rp: RenglonPedido) => {
        this.handleRenglonPedido(rp);
    }, (reason) => { /*console.log(reason);*/ });
  }

  editRenglon(rpControl: AbstractControl) {
    if (rpControl) {
      const rp: RenglonPedido = rpControl.get('renglonPedido').value;
      this.showCantidadModal(
        rp.idProductoItem, rp.cantidad, rp.codigoItem, rp.descripcionItem, rp.urlImagenItem, rp.oferta
      );
    }
  }

  eliminarRenglon(index: number, content) {
    const rp: RenglonPedido = this.renglonesPedido.at(index).get('renglonPedido').value;
    const modalRef = this.modalService.open(EliminarRengloPedidoModalComponent);
    modalRef.componentInstance.rp = rp;
    modalRef.result.then(() => {
      this.renglonesPedido.removeAt(index);
    }, (reason) => { /*console.log(reason);*/ });
  }

  searchRPInRenglones(idProducto): AbstractControl {
    const controls = this.renglonesPedido.controls;
    const aux = controls.filter(c => {
      return c.get('renglonPedido').value.idProductoItem === idProducto;
    });

    return aux.length ? aux[0] : null;
  }

  getCccLabel() {
    const ccc: CuentaCorrienteCliente = this.form && this.form.get('ccc') ? this.form.get('ccc').value : null;
    if (!ccc) { return ''; }
    return '#' + ccc.cliente.nroCliente + ' - ' + ccc.cliente.nombreFiscal
      + (ccc.cliente.nombreFantasia ? ' - ' + ccc.cliente.nombreFantasia : '');
  }

  calcularResultados() {
    const nrp: NuevosResultadosPedido = {
      descuentoPorcentaje: this.form.get('descuento').value,
      recargoPorcentaje: this.form.get('recargo').value,
      renglones: this.form.get('renglonesPedido').value.map(e =>  e.renglonPedido)
    };

    this.loadingResultados = true;
    this.pedidosService.calcularResultadosPedido(nrp)
      .pipe(
        finalize(() => this.loadingResultados = false)
      )
      .subscribe((r: Resultados) => {
        this.form.get('resultados').setValue(r);
      });
  }

  onChange($event) {
    let v = parseFloat($event.target.value);
    if (Number.isNaN(0)) {
      $event.target.value = '0';
      v = 0;
    }
    this.calcularResultados();
  }

  showErrorMessage(message: string) {
    this.errors.next(message);
  }

  showProductoPorCodigoErrorMessage(message: string) {
    this.productoPorCodigoErrors.next(message);
  }

  ingresarProductoDirecto($event) {
    const codigo = $event.target.value.trim();
    $event.preventDefault();

    if (!codigo) { return; }

    this.loadingProducto = true;
    this.productosService.getProductoPorCodigo(codigo)
      .subscribe(
        (p: Producto) => {
          if (p) {
            const rc = this.searchRPInRenglones(p.idProducto);
            let cant = 1;
            if (rc) { cant = rc.get('renglonPedido').value.cantidad + 1; }

            const nrp: NuevoRenglonPedido = {
              idProductoItem: p.idProducto,
              cantidad: cant,
            };
            // this.loading = true;

            this.pedidosService.calcularRenglon(nrp, this.form.get('ccc').value.cliente.id_Cliente)
              .pipe(
                finalize(() => {
                  this.loadingProducto = false;
                  $event.target.value = '';
                  $event.target.focus();
                })
              )
              .subscribe(
                data =>  {
                  const rp: RenglonPedido = data[0];
                  if (rc) {
                    rc.get('renglonPedido').setValue(rp);
                  } else {
                    this.renglonesPedido.push(this.createRenglonPedidoForm(rp));
                  }
                },
                err => {
                  this.showProductoPorCodigoErrorMessage(err.error);
                }
              );
          } else {
            this.loadingProducto = false;
            $event.target.value = '';
            $event.target.focus();
            this.showProductoPorCodigoErrorMessage(`No existe producto con codigo: "${codigo}"`);
          }
        },
        err => {
          this.loadingProducto = false;
          $event.target.value = '';
          $event.target.focus();
          this.showProductoPorCodigoErrorMessage(err.error);
        }
    );
  }

  updatedCliente($event: Cliente) {
    const ccc: CuentaCorrienteCliente = this.form.get('ccc').value;
    ccc.cliente = $event;
    this.form.get('ccc').setValue(ccc);
  }
}

