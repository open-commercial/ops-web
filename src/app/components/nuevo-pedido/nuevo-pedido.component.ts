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
import { combineLatest, Subject } from 'rxjs';
import { ProductosService } from '../../services/productos.service';
import { EliminarRenglonPedidoModalComponent } from '../eliminar-renglon-pedido-modal/eliminar-renglon-pedido-modal.component';
import { Cliente } from '../../models/cliente';
import { ClientesService } from '../../services/clientes.service';
import { StorageService } from '../../services/storage.service';

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
  templateUrl: './nuevo-pedido.component.html',
  styleUrls: ['./nuevo-pedido.component.scss'],
})
export class NuevoPedidoComponent implements OnInit {
  form: FormGroup;

  oe = OpcionEnvio;
  oeu = OpcionEnvioUbicacion;

  sucursales: Array<Sucursal> = [];

  saving = false;
  cccPredeterminado: CuentaCorrienteCliente = null;
  cccPredeterminadoLoading = false;

  private messages = new Subject<string>();
  message: string;
  messageType = 'success';

  private productoPorCodigoErrors = new Subject<string>();
  productoPorCodigoErrorMessage: string;

  loadingProducto = false;

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
              private productosService: ProductosService,
              private storageService: StorageService) {

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

    this.cccPredeterminadoLoading = true;
    combineLatest([
      this.sucursalesService.getPuntosDeRetito(),
      this.clientesService.existeClientePredetermiando()
    ])
      .pipe()
      .subscribe(
        (v: [Array<Sucursal>, boolean]) => {
          this.sucursales = v[0];
          if (v[1]) {
            this.cuentasCorrienteService.getCuentaCorrienteClientePredeterminado()
              .pipe(finalize(() => this.cccPredeterminadoLoading = false))
              .subscribe(
                ccc => {
                  this.cccPredeterminado = ccc;
                  this.createFrom();
                },
                err => this.showErrorMessage(err.error),
              )
            ;
          } else {
            this.createFrom();
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

    this.form.get('descuento').valueChanges
      .pipe(debounceTime(1000))
      .subscribe(v => {
        const d = parseFloat(v);
        if (Number.isNaN(d) || d < 0) {
          this.form.get('descuento').setValue(0);
          return;
        }
        this.calcularResultados();
      });

    this.form.get('recargo').valueChanges
      .pipe(debounceTime(1000))
      .subscribe(v => {
        const r = parseFloat(v);
        if (Number.isNaN(r) || r < 0) {
          this.form.get('recargo').setValue(0);
          return;
        }
        this.calcularResultados();
      });

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

    this.form.valueChanges.subscribe(v => this.storageService.setItem('nuevoPedido', v));

    const data = this.storageService.getItem('nuevoPedido');
    if (data) { this.loadForm(data); } else { this.form.get('ccc').setValue(this.cccPredeterminado); }
  }

  loadForm(data) {
    this.form.get('ccc').setValue(data.ccc ? data.ccc : this.cccPredeterminado);
    data.renglonesPedido.forEach(d => {
      this.renglonesPedido.push(this.createRenglonPedidoForm(d.renglonPedido));
    });
    this.form.get('observaciones').setValue(data.observaciones);
    this.form.get('descuento').setValue(data.descuento);
    this.form.get('recargo').setValue(data.recargo);

    this.form.get('opcionEnvio').setValue(data.opcionEnvio);
    this.form.get('opcionEnvioUbicacion').setValue(data.opcionEnvioUbicacion);

    if (data.sucursal) {
        const idx = this.sucursales.findIndex((s: Sucursal) => s.idSucursal === data.sucursal.idSucursal);
        if (idx >= 0) { this.form.get('sucursal').setValue(this.sucursales[idx]); }
    }

    this.form.get('resultados').setValue(data.resultados);
    if (data.descuento > 0 || data.recargo > 0) {
      this.calcularResultados();
    }
  }

  clienteHasUbicacionFacturacion() {
    const cliente: Cliente = this.form.get('ccc') && this.form.get('ccc').value.cliente ? this.form.get('ccc').value.cliente : null;
    return !!(cliente && cliente.ubicacionFacturacion);
  }

  clienteHasUbicacionEnvio() {
    const cliente: Cliente = this.form.get('ccc') && this.form.get('ccc').value.cliente ? this.form.get('ccc').value.cliente : null;
    return !!(cliente && cliente.ubicacionEnvio);
  }

  submit() {
    if (this.form.valid) {
      const np: NuevoPedido = this.getNuevoPedido();
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
      observaciones: this.form.get('observaciones').value,
      idSucursal: sucursalEnvio ? sucursalEnvio.idSucursal : null,
      tipoDeEnvio: te,
      idUsuario: Number(this.authService.getLoggedInIdUsuario()),
      idCliente: ccc && ccc.cliente ? ccc.cliente.idCliente : null,
      renglones: renglones.map(r => {
        return {
          idProductoItem: r.renglonPedido.idProductoItem,
          cantidad: r.renglonPedido.cantidad,
        };
      }),
      recargoPorcentaje: resultados && resultados.recargoPorcentaje ? resultados.recargoPorcentaje : 0,
      descuentoPorcentaje: resultados && resultados.descuentoPorcentaje ? resultados.descuentoPorcentaje : 0,
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
    this.storageService.removeItem('nuevoPedido');
    this.form.get('ccc').setValue(this.cccPredeterminado);
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

      this.showCantidadModal(p.idProducto, cPrevia);
    }, (reason) => {});
  }

  // modal de cantidad
  showCantidadModal(
    idProductoItem: number, cantidadPrevia = 1) {
    const modalRef = this.modalService.open(RenglonPedidoModalComponent/*, { size: 'xl' }*/);
    modalRef.componentInstance.cliente = this.form.get('ccc').value.cliente;
    modalRef.componentInstance.cantidad = cantidadPrevia;
    modalRef.componentInstance.loadProducto(idProductoItem);
    modalRef.result.then((rp: RenglonPedido) => {
      this.handleRenglonPedido(rp);
    }, (reason) => {});
  }

  editRenglon(rpControl: AbstractControl) {
    if (rpControl) {
      const rp: RenglonPedido = rpControl.get('renglonPedido').value;
      this.showCantidadModal(rp.idProductoItem, rp.cantidad);
    }
  }

  eliminarRenglon(index: number) {
    const rp: RenglonPedido = this.renglonesPedido.at(index).get('renglonPedido').value;
    const modalRef = this.modalService.open(EliminarRenglonPedidoModalComponent);
    modalRef.componentInstance.rp = rp;
    modalRef.result.then(() => {
      this.renglonesPedido.removeAt(index);
    }, (reason) => {});
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
    const dp = this.form.get('descuento').value;
    const rp = this.form.get('recargo').value;

    if (dp < 0 || rp < 0) {
      if (dp < 0) { this.form.get('descuento').setValue(0); }
      if (rp < 0) { this.form.get('recargo').setValue(0); }
      return;
    }

    const nrp: NuevosResultadosPedido = {
      descuentoPorcentaje: dp,
      recargoPorcentaje: rp,
      renglones: this.form.get('renglonesPedido').value.map(e => e.renglonPedido)
    };

    this.form.get('descuento').disable({ onlySelf: true, emitEvent: false });
    this.form.get('recargo').disable({ onlySelf: true, emitEvent: false });
    this.pedidosService.calcularResultadosPedido(nrp)
      .pipe(
        finalize(() => {
          this.form.get('descuento').enable({ onlySelf: true, emitEvent: false });
          this.form.get('recargo').enable({ onlySelf: true, emitEvent: false });
        })
      )
      .subscribe((r: Resultados) => {
        this.form.get('resultados').setValue(r);
      });
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

            this.pedidosService.calcularRenglones([nrp], this.form.get('ccc').value.cliente.idCliente)
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
    const cliente: Cliente = this.form.get('ccc').value ? this.form.get('ccc').value.cliente : null;
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
      this.pedidosService.calcularRenglones(renglones, cliente.idCliente)
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

  getSucursalLabel(s: Sucursal) {
    if (!s) { return ''; }
    return s.nombre + (s.detalleUbicacion ? ' (' + s.detalleUbicacion + ')' : '');
  }
}

