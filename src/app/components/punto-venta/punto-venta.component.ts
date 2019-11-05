import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CuentaCorrienteCliente } from '../../models/cuenta-corriente';
import { NgbAccordion, NgbAccordionConfig, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
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
import { ClientesService } from '../../services/clientes.service';

enum OpcionEnvio {
  RETIRO_EN_SUCURSAL= 'RETIRO_EN_SUCURSAL',
  ENVIO_A_DOMICILIO= 'ENVIO A DOMICILIO',
}
enum OpcionEnvioUbicacion {
  USAR_UBICACION_ENVIO= 'USAR_UBICACION_ENVIO',
  USAR_UBICACION_FACTURACION= 'USAR_UBICACION_FACTURACION',
}

@Component({
  selector: 'app-punto-venta',
  templateUrl: './punto-venta.component.html',
  styleUrls: ['./punto-venta.component.scss'],
})
export class PuntoVentaComponent implements OnInit {
  form: FormGroup;

  oe = OpcionEnvio;
  oeu = OpcionEnvioUbicacion;

  sucursales: Array<Sucursal> = [];

  saving = false;
  cccPredeterminadoLoading = false;

  private messages = new Subject<string>();
  message: string;
  messageType = 'success';

  private productoPorCodigoErrors = new Subject<string>();
  productoPorCodigoErrorMessage: string;

  loadingProducto = false;
  loadingResultados = false;

  @ViewChild('accordion', {static: false}) accordion: NgbAccordion;

  constructor(private fb: FormBuilder,
              modalConfig: NgbModalConfig,
              private modalService: NgbModal,
              accordionConfig: NgbAccordionConfig,
              private pedidosService: PedidosService,
              private clientesService: ClientesService,
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
    this.messages.subscribe((message) => this.message = message);
    this.messages
      .pipe(debounceTime(5000))
      .subscribe(() => this.message = null);

    this.productoPorCodigoErrors.subscribe((message) => this.productoPorCodigoErrorMessage = message);
    this.productoPorCodigoErrors
      .pipe(debounceTime(5000))
      .subscribe(() => this.productoPorCodigoErrorMessage = null);

    this.createFrom();
  }

  panelBeforeChange($event) {
    if (this.saving) {
      $event.preventDefault();
      return;
    }
    if (this.accordion.activeIds.indexOf($event.panelId) >= 0) {
      $event.preventDefault();
    }
  }

  createFrom() {
    this.form = this.fb.group({
      ccc: [null, Validators.required],
      renglonesPedido: this.fb.array([]),
      observaciones: ['', Validators.maxLength(250)],
      descuento: 0,
      recargo: 0,
      opcionEnvio: [null, Validators.required],
      sucursal: null,
      opcionEnvioUbicacion: null,
      resultados: null,
    });

    this.form.get('ccc').valueChanges
      .subscribe(v => {
        this.updateRenglones();
      });

    this.form.get('renglonesPedido').valueChanges
      .subscribe(v => this.calcularResultados());

    /*this.form.get('descuento').valueChanges.subscribe(
      v => this.calcularResultados()
    );

    this.form.get('recargo').valueChanges.subscribe(
      v => this.calcularResultados()
    );*/

    this.form.get('opcionEnvio').valueChanges.subscribe(oe => {
      if (oe === OpcionEnvio.RETIRO_EN_SUCURSAL) {
        this.form.get('opcionEnvioUbicacion').setValue(null);
        if (!this.form.get('sucursal').value && this.sucursales.length) {
          this.form.get('sucursal').setValue(this.sucursales[0]);
        }
      }
      if (oe === OpcionEnvio.ENVIO_A_DOMICILIO) {
        this.form.get('sucursal').setValue(null);
        if (!this.form.get('opcionEnvioUbicacion').value) {
          this.form.get('opcionEnvioUbicacion').setValue(OpcionEnvioUbicacion.USAR_UBICACION_FACTURACION);
        }
      }
    });

    this.getSucursales();

    this.cccPredeterminadoLoading = true;
    this.clientesService.existeClientePredetermiando()
      .subscribe(
        (existe: boolean) => {
          if (existe) {
            this.cuentasCorrienteService.getCuentaCorrienteClientePredeterminado()
              .pipe(finalize(() => this.cccPredeterminadoLoading = false))
              .subscribe(
                ccc => this.form.get('ccc').setValue(ccc),
                err => this.showErrorMessage(err.error),
              )
            ;
          } else {
            this.cccPredeterminadoLoading = false;
          }
        },
        err => {
          this.cccPredeterminadoLoading = false;
          this.showErrorMessage(err.error);
        }
      )
    ;
  }

  clienteHasUbicacionFacturacion() {
    const cliente: Cliente = this.form.get('ccc') && this.form.get('ccc').value.cliente ? this.form.get('ccc').value.cliente : null;
    return !!(cliente && cliente.ubicacionFacturacion);
  }

  clienteHasUbicacionEnvio() {
    const cliente: Cliente = this.form.get('ccc') && this.form.get('ccc').value.cliente ? this.form.get('ccc').value.cliente : null;
    return !!(cliente && cliente.ubicacionEnvio);
  }

  getSucursales() {
    this.sucursalesService.getPuntosDeRetito()
      .subscribe((data: Array<Sucursal>) => {
        this.sucursales = data;
        // if (this.sucursales.length) { this.form.get('sucursal').setValue(this.sucursales[0]); }
      })
    ;
  }

  submit() {
    if (this.form.valid) {
      const np: NuevoPedido = this.getNuevoPedido();
      // console.log(np); return;
      this.saving = true;
      this.pedidosService.savePedido(np)
        .pipe(finalize(() => this.saving = false))
        .subscribe(p => {
          // this.router.navigate(['/pedidos']);
          this.showMessage('Pedido enviado correctamente!');
          this.reset();
        })
      ;
    }
  }

  submitButtonEnabled() {
    const opcionEnvio = this.form.get('opcionEnvio').value;
    const sucursal = this.form.get('sucursal').value;
    const opcionEnvioUbicacion = this.form.get('opcionEnvioUbicacion').value;

    return this.form.get('ccc').value && this.form.get('renglonesPedido').value.length &&
      (
        (opcionEnvio === OpcionEnvio.RETIRO_EN_SUCURSAL && sucursal) ||
        (opcionEnvio === OpcionEnvio.ENVIO_A_DOMICILIO &&
          (opcionEnvioUbicacion === OpcionEnvioUbicacion.USAR_UBICACION_FACTURACION && this.clienteHasUbicacionFacturacion()) ||
          (opcionEnvioUbicacion === OpcionEnvioUbicacion.USAR_UBICACION_ENVIO && this.clienteHasUbicacionEnvio())
        )
      );
  }

  getNuevoPedido() {
    let te: TipoDeEnvio = null;
    let sucursalEnvio: Sucursal = null;

    if (this.form.get('opcionEnvio').value === OpcionEnvio.RETIRO_EN_SUCURSAL) {
      te = TipoDeEnvio.RETIRO_EN_SUCURSAL;
      sucursalEnvio = this.form.get('sucursal').value;
    } else {
      const opcionEnvioUbicacion = this.form.get('opcionEnvioUbicacion').value;
      te = opcionEnvioUbicacion === OpcionEnvioUbicacion.USAR_UBICACION_FACTURACION ?
        TipoDeEnvio.USAR_UBICACION_FACTURACION : TipoDeEnvio.USAR_UBICACION_ENVIO;
    }

    const ccc: CuentaCorrienteCliente = this.form.get('ccc').value;
    const renglones = this.form.get('renglonesPedido').value && this.form.get('renglonesPedido').value.length
      ? this.form.get('renglonesPedido').value : [];

    const resultados: Resultados = this.form.get('resultados').value ? this.form.get('resultados').value : null;

    const np: NuevoPedido = {
      fechaVencimiento: null,
      observaciones: this.form.get('observaciones').value,
      idSucursal: Number(SucursalesService.getIdSucursal()),
      idSucursalEnvio: sucursalEnvio ? sucursalEnvio.idSucursal : null,
      tipoDeEnvio: te,
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
      opcionEnvio: null,
      sucursal: null,
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
    const modalRef = this.modalService.open(ProductoModalComponent, {scrollable: true});
    modalRef.result.then((p: Producto) => {
      const control = this.searchRPInRenglones(p.idProducto);
      const cPrevia = control ? control.get('renglonPedido').value.cantidad : 1;

      this.showCantidadModal(p.idProducto, cPrevia, p.codigo, p.descripcion, p.urlImagen, p.oferta);
    }, (reason) => { /*console.log(reason);*/
    });
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
    }, (reason) => { /*console.log(reason);*/
    });
  }

  editRenglon(rpControl: AbstractControl) {
    if (rpControl) {
      const rp: RenglonPedido = rpControl.get('renglonPedido').value;
      this.showCantidadModal(
        rp.idProductoItem, rp.cantidad, rp.codigoItem, rp.descripcionItem, rp.urlImagenItem, rp.oferta
      );
    }
  }

  eliminarRenglon(index: number) {
    const rp: RenglonPedido = this.renglonesPedido.at(index).get('renglonPedido').value;
    const modalRef = this.modalService.open(EliminarRengloPedidoModalComponent);
    modalRef.componentInstance.rp = rp;
    modalRef.result.then(() => {
      this.renglonesPedido.removeAt(index);
    }, (reason) => { /*console.log(reason);*/
    });
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
    if (!ccc) {
      return '';
    }
    return '#' + ccc.cliente.nroCliente + ' - ' + ccc.cliente.nombreFiscal
      + (ccc.cliente.nombreFantasia ? ' - ' + ccc.cliente.nombreFantasia : '');
  }

  getEnvioLabel() {
    const opcionEnvio = this.form.get('opcionEnvio').value;
    let label = '';

    if (opcionEnvio && opcionEnvio === OpcionEnvio.RETIRO_EN_SUCURSAL) {
      label = ': Retiro en sucursal';
    }

    if (opcionEnvio && opcionEnvio === OpcionEnvio.ENVIO_A_DOMICILIO) {
      label = ': Envio a domicilio';
    }
    return label;
  }

  calcularResultados() {
    const nrp: NuevosResultadosPedido = {
      descuentoPorcentaje: this.form.get('descuento').value,
      recargoPorcentaje: this.form.get('recargo').value,
      renglones: this.form.get('renglonesPedido').value.map(e => e.renglonPedido)
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

  showMessage(message, type = 'success') {
    this.messageType = type;
    this.messages.next(message);
  }

  showErrorMessage(message: string) {
    this.showMessage(message, 'danger');
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

            this.pedidosService.calcularRenglones([nrp], this.form.get('ccc').value.cliente.id_Cliente)
              .pipe(
                finalize(() => {
                  this.loadingProducto = false;
                  setTimeout(() => { $event.target.focus(); }, 500);
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
                  $event.target.value = '';
                },
                err => {
                  this.showProductoPorCodigoErrorMessage(err.error);
                }
              );
          } else {
            this.loadingProducto = false;
            this.showProductoPorCodigoErrorMessage(`No existe producto con codigo: "${codigo}"`);
            setTimeout(() => { $event.target.focus(); }, 500);
          }
        },
        err => {
          this.loadingProducto = false;
          this.showProductoPorCodigoErrorMessage(err.error);
          setTimeout(() => { $event.target.focus(); }, 500);
        }
    );
  }

  updatedCliente($event: Cliente) {
    const ccc: CuentaCorrienteCliente = this.form.get('ccc').value;
    ccc.cliente = $event;
    this.form.get('ccc').setValue(ccc);
  }

  updateRenglones() {
    const cliente: Cliente = this.form.get('ccc').value.cliente;
    const renglones: NuevoRenglonPedido[] = [];
    this.renglonesPedido.controls.forEach(c => {
      const rp: RenglonPedido = c.get('renglonPedido').value;
      const nrp: NuevoRenglonPedido = {
        idProductoItem: rp.idProductoItem,
        cantidad: rp.cantidad,
      };
      renglones.push(nrp);
    });

    if (cliente && renglones.length) {
      this.pedidosService.calcularRenglones(renglones, cliente.id_Cliente)
        .subscribe(rps => {
          const nuevosRenglones = [];
          rps.forEach((rp: RenglonPedido) => {
            nuevosRenglones.push({ renglonPedido: rp });
          });
          this.renglonesPedido.setValue(nuevosRenglones);
        })
      ;
    }
  }
}

