import { CantidadEnSucursal } from './cantidad-en-sucursal';

export interface Producto {
  idProducto: number;
  codigo: string;
  descripcion: string;
  cantidadEnSucursales: Array<CantidadEnSucursal>;
  cantidadTotalEnSucursales: number;
  hayStock: boolean;
  cantMinima: number;
  bulto: number;
  nombreMedida: string;
  precioCosto: number;
  gananciaPorcentaje: number;
  gananciaNeto: number;
  precioVentaPublico: number;
  ivaPorcentaje: number;
  ivaNeto: number;
  precioLista: number;
  nombreRubro: string;
  ilimitado: boolean;
  publico: boolean;
  oferta: boolean;
  porcentajeBonificacionOferta: number;
  porcentajeBonificacionPrecio: number;
  precioBonificado: number;
  fechaUltimaModificacion: Date;
  estanteria: string;
  estante: string;
  razonSocialProveedor: string;
  nota: string;
  fechaAlta: Date;
  fechaVencimiento: Date;
  eliminado: boolean;
  urlImagen: string;
}

/*
private String codigo;
private String descripcion;
private Map<Long,BigDecimal> cantidadEnSucursal;
private boolean hayStock;
private BigDecimal cantMinima;
private BigDecimal bulto;
private BigDecimal precioCosto;
private BigDecimal gananciaPorcentaje;
private BigDecimal gananciaNeto;
private BigDecimal precioVentaPublico;
private BigDecimal ivaPorcentaje;
private BigDecimal ivaNeto;
private boolean oferta;
private byte[] imagen;
private BigDecimal porcentajeBonificacionOferta;
private BigDecimal porcentajeBonificacionPrecio;
private BigDecimal precioBonificado;
private BigDecimal precioLista;
private boolean ilimitado;
private boolean publico;
private LocalDateTime fechaUltimaModificacion;
private String estanteria;
private String estante;
private String nota;
private LocalDate fechaVencimiento;
 */
