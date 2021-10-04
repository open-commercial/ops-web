import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CuentaCorrienteCliente} from '../../models/cuenta-corriente';
import {NgbAccordion, NgbAccordionConfig, NgbModal, NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import {NuevoRenglonPedido} from '../../models/nuevo-renglon-pedido';
import {PedidosService} from '../../services/pedidos.service';
import {RenglonPedido} from '../../models/renglon-pedido';
import {CantidadProductoModalComponent} from '../cantidad-producto-modal/cantidad-producto-modal.component';
import {Producto} from '../../models/producto';
import {TipoDeEnvio} from '../../models/tipo-de-envio';
import {NuevosResultadosComprobante} from '../../models/nuevos-resultados-comprobante';
import {Resultados} from '../../models/resultados';
import {CuentasCorrientesService} from '../../services/cuentas-corrientes.service';
import {SucursalesService} from '../../services/sucursales.service';
import {Sucursal} from '../../models/sucursal';
import {DetallePedido} from '../../models/detalle-pedido';
import {AuthService} from '../../services/auth.service';
import {debounceTime, finalize} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest, Subscription} from 'rxjs';
import {ProductosService} from '../../services/productos.service';
import {EliminarRenglonPedidoModalComponent} from '../eliminar-renglon-pedido-modal/eliminar-renglon-pedido-modal.component';
import {Cliente} from '../../models/cliente';
import {ClientesService} from '../../services/clientes.service';
import {StorageKeys, StorageService} from '../../services/storage.service';
import {Usuario} from '../../models/usuario';
import {Rol} from '../../models/rol';
import {Pedido} from '../../models/pedido';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {MensajeService} from '../../services/mensaje.service';
import {TipoDeComprobante} from '../../models/tipo-de-comprobante';
import {Location} from '@angular/common';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {ProductosParaVerificarStock} from '../../models/productos-para-verificar-stock';
import {ProductoFaltante} from '../../models/producto-faltante';
import {Movimiento} from '../../models/movimiento';

enum OpcionEnvio {
  RETIRO_EN_SUCURSAL= 'RETIRO_EN_SUCURSAL',
  ENVIO_A_DOMICILIO= 'ENVIO A DOMICILIO',
}
enum OpcionEnvioUbicacion {
  USAR_UBICACION_ENVIO= 'USAR_UBICACION_ENVIO',
  USAR_UBICACION_FACTURACION= 'USAR_UBICACION_FACTURACION',
}

enum Action {
  NUEVO = 'NUEVO',
  EDITAR = 'EDITAR',
  CLONAR = 'CLONAR',
}

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss'],
})
export class PedidoComponent implements OnInit, OnDestroy {
  title = 'Nuevo Pedido';
  form: FormGroup;

  oe = OpcionEnvio;
  oeu = OpcionEnvioUbicacion;

  sucursales: Array<Sucursal> = [];

  saving = false;
  cccPredeterminado: CuentaCorrienteCliente = null;

  loadingResultados = false;

  @ViewChild('accordion', {static: false}) accordion: NgbAccordion;

  usuario: Usuario = null;

  action = Action.NUEVO;

  datosParaEditarOClonar = {
    pedido: null,
    ccc: null,
    renglones: [],
    sucursal: null,
    opcionEnvio: null,
    opcionEnvioUbicacion: null,
  };

  cccReadOnly = false;
  localStorageKey = StorageKeys.PEDIDO_NUEVO;

  cantidadesInicialesPedido: { [idProducto: number]: number } = {};
  cantidadesActualesPedido: { [idProducto: number]: number } = {};

  subscription: Subscription;

  mov = Movimiento;

  constructor(private fb: FormBuilder,
              modalConfig: NgbModalConfig,
              private modalService: NgbModal,
              accordionConfig: NgbAccordionConfig,
              private pedidosService: PedidosService,
              private clientesService: ClientesService,
              private cuentasCorrienteService: CuentasCorrientesService,
              public sucursalesService: SucursalesService,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private productosService: ProductosService,
              private storageService: StorageService,
              private mensajeService: MensajeService,
              private location: Location,
              public loadingOverlayService: LoadingOverlayService) {

    this.subscription = new Subscription();
    accordionConfig.type = 'dark';
    modalConfig.backdrop = 'static';
    modalConfig.keyboard = false;
  }

  ngOnInit() {
    this.createForm();
    this.loadingOverlayService.activate();
    this.sucursalesService.getPuntosDeRetito()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (sucs: Array<Sucursal>) => this.sucursales = sucs,
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
      )
    ;

    this.subscription.add(this.sucursalesService.sucursal$.subscribe(s => {
      if (!s.configuracionSucursal.puntoDeRetiro) {
        this.form.get('opcionEnvio').setValue(OpcionEnvio.ENVIO_A_DOMICILIO);
      }
    }));

    this.init();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  init() {
    this.action = this.guessAction();
    if (this.action === Action.NUEVO) {
      this.title = 'Nuevo Pedido';
      this.loadingOverlayService.activate();
      this.authService.getLoggedInUsuario()
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          (u: Usuario) => {
            this.usuario = u;
            this.handleCCCPredeterminado();
          },
          err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
        )
      ;
    } else {
      if (this.action === Action.EDITAR) {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.title = 'Editar Pedido';
        this.localStorageKey = StorageKeys.PEDIDO_EDITAR;
        this.cccReadOnly = true;
        this.getDatosParaEditarOClonar(id);
      }

      if (this.action === Action.CLONAR) {
        const idToClone = Number(this.route.snapshot.queryParamMap.get('idToClone'));
        this.localStorageKey = StorageKeys.PEDIDO_NUEVO;
        this.getDatosParaEditarOClonar(idToClone);
      }
    }
  }

  guessAction() {
    const url = this.route.snapshot.url;
    if (url.length) {
      const path = url[0].path;
      if (path === 'nuevo') {
        const hasIdToClone = !!this.route.snapshot.queryParamMap.get('idToClone');
        return hasIdToClone ? Action.CLONAR : Action.NUEVO;
      } else if (path === 'editar') {
        return Action.EDITAR;
      }
    }
    throw new Error('No es un path de url permitido');
  }

  getDatosParaEditarOClonar(idPedido: number) {
    this.loadingOverlayService.activate();
    this.pedidosService.getPedido(idPedido)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (p: Pedido) => {
          this.datosParaEditarOClonar.pedido = p;
          if (this.action === Action.EDITAR) {
            this.title += ' #' + p.nroPedido;
          }
          this.loadingOverlayService.activate();
          combineLatest([
            this.cuentasCorrienteService.getCuentaCorrienteCliente(p.cliente.idCliente),
            this.pedidosService.getRenglonesDePedido(p.idPedido, this.action === Action.CLONAR)
          ])
            .pipe(finalize(() => this.loadingOverlayService.deactivate()))
            .subscribe(
            (v: [CuentaCorrienteCliente, RenglonPedido[]]) => {
              this.datosParaEditarOClonar.ccc = v[0];
              this.datosParaEditarOClonar.renglones = v[1].map(e => ({ renglonPedido : e }));
              if (this.action === Action.EDITAR) {
                v[1].forEach(e => this.cantidadesInicialesPedido[e.idProductoItem] = e.cantidad);
              }
              this.datosParaEditarOClonar.sucursal = null;
              if (p.tipoDeEnvio === TipoDeEnvio.RETIRO_EN_SUCURSAL) {
                this.datosParaEditarOClonar.opcionEnvio = OpcionEnvio.RETIRO_EN_SUCURSAL;
                this.datosParaEditarOClonar.sucursal = p.idSucursal ? { idSucursal: p.idSucursal } : null;
              } else {
                this.datosParaEditarOClonar.opcionEnvio = OpcionEnvio.ENVIO_A_DOMICILIO;
                if (p.tipoDeEnvio) {
                  this.datosParaEditarOClonar.opcionEnvioUbicacion = p.tipoDeEnvio === TipoDeEnvio.USAR_UBICACION_FACTURACION ?
                    OpcionEnvioUbicacion.USAR_UBICACION_FACTURACION : OpcionEnvioUbicacion.USAR_UBICACION_ENVIO;
                }
              }
              this.inicializarForm();
            }
          );
        },
        err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.router.navigate(['/pedidos']);
        }
      )
    ;
  }

  handleCCCPredeterminado() {
    const debeCargarCCCPredetermiando = !((this.usuario.roles.indexOf(Rol.VIAJANTE) >= 0 && this.usuario.roles.length === 1) ||
      (this.usuario.roles.indexOf(Rol.VIAJANTE) >= 0 && this.usuario.roles.indexOf(Rol.COMPRADOR) >= 0 && this.usuario.roles.length === 2));
    if (debeCargarCCCPredetermiando) {
      this.loadingOverlayService.activate();
      this.clientesService.existeClientePredetermiando()
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          (v: boolean) => {
            if (v) {
              this.loadingOverlayService.activate();
              this.cuentasCorrienteService.getCuentaCorrienteClientePredeterminado()
                .pipe(finalize(() => this.loadingOverlayService.deactivate()))
                .subscribe(
                  ccc => {
                    this.cccPredeterminado = ccc;
                    this.inicializarForm();
                  },
                  err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
                )
              ;
            } else {
              this.inicializarForm();
            }
          },
          err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
        )
      ;
    } else {
      this.inicializarForm();
    }
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

  createForm() {
    this.form = this.fb.group({
      idPedido: null,
      ccc: [null, Validators.required],
      renglonesPedido: this.fb.array([]),
      observaciones: ['', Validators.maxLength(250)],
      descuento: 0,
      recargo: 0,
      opcionEnvio: [null, Validators.required],
      opcionEnvioUbicacion: null,
      resultados: null,
      pagos: [],
    });
  }

  inicializarForm() {
    this.form.get('ccc').valueChanges
      .subscribe(() => this.updateRenglones())
    ;

    this.form.get('renglonesPedido').valueChanges
      .subscribe((renglones) => {
        this.cantidadesActualesPedido = {};
        renglones.forEach((r: { renglonPedido: RenglonPedido }) => {
          this.cantidadesActualesPedido[r.renglonPedido.idProductoItem] = r.renglonPedido.cantidad;
        });
        if (!this.loadingResultados) { this.calcularResultados(); }
      })
    ;

    this.form.get('descuento').valueChanges
      .pipe(debounceTime(700))
      .subscribe(v => {
        const d = parseFloat(v);
        if (Number.isNaN(d) || d < 0) {
          this.form.get('descuento').setValue(0);
          return;
        }
        if (!this.loadingResultados) { this.calcularResultados(); }
      })
    ;

    this.form.get('recargo').valueChanges
      .pipe(debounceTime(700))
      .subscribe(v => {
        const r = parseFloat(v);
        if (Number.isNaN(r) || r < 0) {
          this.form.get('recargo').setValue(0);
          return;
        }
        if (!this.loadingResultados) { this.calcularResultados(); }
      })
    ;

    this.form.get('opcionEnvio').valueChanges.subscribe(oe => {
      if (oe === OpcionEnvio.RETIRO_EN_SUCURSAL) {
        this.form.get('opcionEnvioUbicacion').setValue(null);
      }
      if (oe === OpcionEnvio.ENVIO_A_DOMICILIO) {
        if (!this.form.get('opcionEnvioUbicacion').value) {
          this.form.get('opcionEnvioUbicacion').setValue(OpcionEnvioUbicacion.USAR_UBICACION_FACTURACION);
        }
      }
    });

    this.form.valueChanges.subscribe(v => this.storageService.setItem(this.localStorageKey, v));

    const data = this.getDataForForm();
    if (data) {
      this.loadForm(data);
    } else {
      this.form.get('ccc').setValue(this.cccPredeterminado);
    }
  }

  getDataForForm() {
    const data = this.storageService.getItem(this.localStorageKey) ?
      this.storageService.getItem(this.localStorageKey) :
      {
        idPedido: null,
        ccc: null,
        renglonesPedido: [],
        observaciones: '',
        descuento: 0,
        recargo: 0,
        opcionEnvio: null,
        sucursal: null,
        opcionEnvioUbicacion: null,
        pagos: [],
      };
    if (this.datosParaEditarOClonar.pedido) {
      if (data.idPedido !== this.datosParaEditarOClonar.pedido.idPedido) {
        data.idPedido = this.datosParaEditarOClonar.pedido.idPedido;
        data.ccc = this.datosParaEditarOClonar.ccc;
        data.renglonesPedido = this.datosParaEditarOClonar.renglones;
        data.observaciones = this.datosParaEditarOClonar.pedido.observaciones;
        data.descuento = this.datosParaEditarOClonar.pedido.descuentoPorcentaje;
        data.recargo = this.datosParaEditarOClonar.pedido.recargoPorcentaje;
        data.opcionEnvio = this.datosParaEditarOClonar.opcionEnvio;
        data.opcionEnvioUbicacion = this.datosParaEditarOClonar.opcionEnvioUbicacion;
        data.sucursal = this.datosParaEditarOClonar.sucursal;
      }
    }
    return data;
  }

  loadForm(data) {
    if (this.action === Action.NUEVO || this.action === Action.CLONAR) {
      this.form.get('idPedido').setValue(null);
    } else {
      this.form.get('idPedido').setValue(data.idPedido);
    }

    this.form.get('ccc').setValue(data.ccc ? data.ccc : this.cccPredeterminado);
    data.renglonesPedido.forEach(d => {
      this.renglonesPedido.push(this.createRenglonPedidoForm(d.renglonPedido));
    });
    this.form.get('observaciones').setValue(data.observaciones);
    this.form.get('descuento').setValue(data.descuento);
    this.form.get('recargo').setValue(data.recargo);

    this.form.get('opcionEnvio').setValue(data.opcionEnvio ? data.opcionEnvio : null);
    this.form.get('opcionEnvioUbicacion').setValue(data.opcionEnvioUbicacion ? data.opcionEnvioUbicacion : null);
    this.form.get('pagos').setValue(
      data.pagos && Array.isArray(data.pagos) && data.pagos.length ? data.pagos : []
    );
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
      const formValue = this.form.value;

      const ppvs: ProductosParaVerificarStock = {
        idSucursal: this.sucursalesService.getIdSucursal(),
        idPedido: formValue.idPedido,
        idProducto: formValue.renglonesPedido.map(e => e.renglonPedido.idProductoItem),
        cantidad: formValue.renglonesPedido.map(e => e.renglonPedido.cantidad),
      };

      this.loadingOverlayService.activate();
      this.productosService.getDisponibilidadEnStock(ppvs)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe((pfs: ProductoFaltante[]) => {
          if (!pfs.length) {
            this.doSubmit();
          } else {
            this.agregarErroresDisponibilidad(pfs);
            this.accordion.expand('productos');
            this.mensajeService.msg(
              'Uno o mas productos no poseen stock disponible. Por favor, verifique la sección Productos.',
              MensajeModalType.ERROR
            );
          }
        })
      ;
    }
  }

  doSubmit() {
    const np: DetallePedido = this.getNuevoPedido();
    this.loadingOverlayService.activate();
    this.saving = true;
    this.pedidosService.guardarPedido(np)
      .pipe(finalize(() => {
        this.saving = false;
        this.loadingOverlayService.deactivate();
      }))
      .subscribe(
        () => {
          this.reset();
          const msg = np.idPedido ? 'Pedido actualizado correctamente!' : 'Pedido enviado correctamente!';
          this.mensajeService.msg(msg, MensajeModalType.INFO).then(() => {
            this.router.navigate(['/pedidos']);
          });
        },
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
      )
    ;
  }

  agregarErroresDisponibilidad(pfs: ProductoFaltante[]) {
    const productosIds = pfs.map(pf => pf.idProducto);

    productosIds.forEach(id => {
      const aux = pfs.filter(pf => pf.idProducto === id);
      if (aux.length) {
        const cantSolicitada = aux[0].cantidadSolicitada;
        const cantDisponible = aux.reduce((total: number, pf: ProductoFaltante) => total + pf.cantidadDisponible, 0);
        const errorDisponibilidad = ['Solicitado', ' ', cantSolicitada, ' --UM--', ' - Disponible ', cantDisponible, ' --UM--'].join('');

        const errorDisponibilidadPorSucursal = aux.map(pf => [pf.nombreSucursal, ': ', pf.cantidadDisponible, ' --UM--'].join(''));

        const control = this.searchRPInRenglones(id);
        if (control) {
          const v: RenglonPedido = control.get('renglonPedido').value;
          v.errorDisponibilidad = errorDisponibilidad.replace(/--UM--/g, v.medidaItem);
          v.errorDisponibilidadPorSucursal = errorDisponibilidadPorSucursal.map(e => e.replace(/--UM--/g, v.medidaItem));
          control.get('renglonPedido').setValue(v);
        }
      }
    });
  }

  getNuevoPedido() {
    let te: TipoDeEnvio;

    if (this.form.get('opcionEnvio').value === OpcionEnvio.RETIRO_EN_SUCURSAL) {
      te = TipoDeEnvio.RETIRO_EN_SUCURSAL;
    } else {
      const opcionEnvioUbicacion = this.form.get('opcionEnvioUbicacion').value;
      te = opcionEnvioUbicacion === OpcionEnvioUbicacion.USAR_UBICACION_FACTURACION ?
        TipoDeEnvio.USAR_UBICACION_FACTURACION : TipoDeEnvio.USAR_UBICACION_ENVIO;
    }

    const ccc: CuentaCorrienteCliente = this.form.get('ccc').value;
    const renglones = this.form.get('renglonesPedido').value && this.form.get('renglonesPedido').value.length
      ? this.form.get('renglonesPedido').value : [];

    const resultados: Resultados = this.form.get('resultados').value ? this.form.get('resultados').value : null;

    return {
      idPedido: this.form.get('idPedido').value,
      observaciones: this.form.get('observaciones').value,
      idSucursal: this.sucursalesService.getIdSucursal(),
      tipoDeEnvio: te,
      idCliente: ccc && ccc.cliente ? ccc.cliente.idCliente : null,
      renglones: renglones.map(r => {
        return {
          idProductoItem: r.renglonPedido.idProductoItem,
          cantidad: r.renglonPedido.cantidad,
        };
      }),
      idsFormaDePago: this.form.get('pagos').value.map((e) => Number(e.idFormaDePago)),
      montos: this.form.get('pagos').value.map((e) => e.monto),
      recargoPorcentaje: resultados && resultados.recargoPorcentaje ? resultados.recargoPorcentaje : 0,
      descuentoPorcentaje: resultados && resultados.descuentoPorcentaje ? resultados.descuentoPorcentaje : 0,
    };
  }

  reset() {
    this.renglonesPedido.clear();
    this.form.reset({
      idPedido: null,
      ccc: null,
      renglonesPedido: [],
      observaciones: '',
      descuento: 0,
      recargo: 0,
      opcionEnvio: null,
      sucursal: null,
      resultados: null,
    });
    this.storageService.removeItem(this.localStorageKey);
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

  selectProducto(p: Producto) {
    this.showCantidadModal(p.idProducto, true);
  }

  showCantidadModal(idProducto: number, addCantidad = false) {
    const control = this.searchRPInRenglones(idProducto);
    const cPrevia = control ? control.get('renglonPedido').value.cantidad : 0;
    const modalRef = this.modalService.open(CantidadProductoModalComponent);
    modalRef.componentInstance.addCantidad = addCantidad;
    modalRef.componentInstance.cantidadesInicialesPedido = this.cantidadesInicialesPedido;
    modalRef.componentInstance.cantidadesActualesPedido = this.cantidadesActualesPedido;
    modalRef.componentInstance.cantidad = addCantidad ? 1 : cPrevia;
    modalRef.componentInstance.idPedido = this.form.get('idPedido').value;
    modalRef.componentInstance.idSucursal = this.sucursalesService.getIdSucursal();
    modalRef.componentInstance.loadProducto(idProducto);
    modalRef.componentInstance.verificarStock = true;
    modalRef.result.then((cant: number) => {
      const nrp: NuevoRenglonPedido = {
        idProductoItem: idProducto,
        cantidad: addCantidad ? cPrevia + cant : cant,
      };
      this.addRenglonPedido(nrp);
    }, () => { return; });
  }

  directInputSeleccionProducto(p: Producto) {
    const rp = this.searchRPInRenglones(p.idProducto);
    let cant = 1;
    if (rp) { cant = rp.get('renglonPedido').value.cantidad + 1; }

    const ppvs: ProductosParaVerificarStock = {
      idSucursal: this.sucursalesService.getIdSucursal(),
      idPedido: this.form.get('idPedido').value,
      idProducto: [p.idProducto],
      cantidad: [cant],
    };

    this.loadingOverlayService.activate();
    this.productosService.getDisponibilidadEnStock(ppvs)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe((pfs: ProductoFaltante[]) => {
        if (!pfs.length) {
          const nrp: NuevoRenglonPedido = {
            idProductoItem: p.idProducto,
            cantidad: cant,
          };

          this.addRenglonPedido(nrp);
        } else {
          this.mensajeService.msg(
            'No se puede solicitar mas stock para dicho producto. Por favor, verifique la sección Productos.',
            MensajeModalType.ERROR
          );
        }
      })
    ;
  }

  addRenglonPedido(nrp: NuevoRenglonPedido) {
    const cliente = this.form.get('ccc').value.cliente;
    this.loadingOverlayService.activate();
    this.pedidosService.calcularRenglones([nrp], cliente.idCliente)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        data => this.handleRenglonPedido(data[0]),
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
      )
    ;
  }

  editarRenglon(rpControl: AbstractControl) {
    if (rpControl) {
      const rp: RenglonPedido = rpControl.get('renglonPedido').value;
      this.showCantidadModal(rp.idProductoItem);
    }
  }

  eliminarRenglon(index: number) {
    const rp: RenglonPedido = this.renglonesPedido.at(index).get('renglonPedido').value;
    const modalRef = this.modalService.open(EliminarRenglonPedidoModalComponent);
    modalRef.componentInstance.rp = rp;
    modalRef.result.then(() => {
      this.renglonesPedido.removeAt(index);
    }, () => { return; });
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

    const nrp: NuevosResultadosComprobante = {
      tipoDeComprobante: TipoDeComprobante.PEDIDO,
      descuentoPorcentaje: dp,
      recargoPorcentaje: rp,
      importe: this.form.get('renglonesPedido').value.map(e => e.renglonPedido.importe),
      cantidades: this.form.get('renglonesPedido').value.map(e => e.renglonPedido.cantidad),
      ivaNetos: [],
      ivaPorcentajes: [],
    };

    this.loadingOverlayService.activate();
    this.loadingResultados = true;
    this.pedidosService.calcularResultadosPedido(nrp)
      .pipe(finalize(() => {
        this.loadingResultados = false;
        this.loadingOverlayService.deactivate();
      }))
      .subscribe(
        (r: Resultados) => this.form.get('resultados').setValue(r),
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
      )
    ;
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
      this.loadingOverlayService.activate();
      this.pedidosService.calcularRenglones(renglones, cliente.idCliente)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          rps => {
            const nuevosRenglones = [];
            rps.forEach((rp: RenglonPedido) => nuevosRenglones.push({ renglonPedido: rp }));
            this.renglonesPedido.setValue(nuevosRenglones);
          },
          err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
        )
      ;
    }
  }

  totalSuperaCompraMinima() {
    let ret = false;
    if (this.form && this.form.get('resultados') && this.form.get('resultados').value) {
      const v: Resultados = this.form.get('resultados').value;
      const ccc: CuentaCorrienteCliente = this.form.get('ccc').value;
      ret = ccc && (v.total >= ccc.cliente.montoCompraMinima);
    }
    return ret;
  }

  volverAlListado() {
    this.location.back();
  }

  isProductosPanelEnabled() {
    return this.form.get('ccc') && this.form.get('ccc').value;
  }

  isEnvioPanelEnabled() {
    return this.isProductosPanelEnabled() && this.form.get('renglonesPedido') &&
      Array.isArray(this.form.get('renglonesPedido').value) && this.form.get('renglonesPedido').value.length;
  }

  isPagosPanelEnabled() {
    const opcionEnvio = this.form.get('opcionEnvio') ? this.form.get('opcionEnvio').value : null;
    const opcionEnvioUbicacion = opcionEnvio === OpcionEnvio.ENVIO_A_DOMICILIO ? this.form.get('opcionEnvioUbicacion').value : null;

    return this.isEnvioPanelEnabled() && (
      (opcionEnvio === OpcionEnvio.RETIRO_EN_SUCURSAL) ||
      (opcionEnvio === OpcionEnvio.ENVIO_A_DOMICILIO &&
        (opcionEnvioUbicacion === OpcionEnvioUbicacion.USAR_UBICACION_FACTURACION && this.clienteHasUbicacionFacturacion()) ||
        (opcionEnvioUbicacion === OpcionEnvioUbicacion.USAR_UBICACION_ENVIO && this.clienteHasUbicacionEnvio())
      )
    );
  }

  esSucursalSeleccionadaPuntoDeRetiro() {
    return !!this.sucursales.filter(s => s.idSucursal === this.sucursalesService.getIdSucursal()).length;
  }
}

