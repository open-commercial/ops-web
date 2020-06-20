import Big from 'big.js';

export class CalculosPrecio {

  private pPrecioCosto = new Big(0);
  private pGananciaPorcentaje = new Big(0);
  private pGananciaNeto = new Big(0);
  private pPrecioVentaPublico = new Big(0);
  private pIvaPorcentaje = new Big(0);
  private pIvaNeto = new Big(0);
  private pPrecioLista = new Big(0);
  private pPorcentajeBonificacionPrecio = new Big(0);
  private pPrecioBonificado = new Big(0);
  private pPorcentajeBonificacionOferta = new Big(0);
  private pPrecioOferta = new Big(0);

  constructor() { }

  set precioCosto(value: Big) {
    this.pPrecioCosto = value;
    this.calcularGananciaNeto();
    this.calcularPrecioVentaPublico();
    this.calcularIvaNeto();
    this.calcularPrecioLista();
    this.calcularPrecioBonificado();
    this.calcularPrecioOferta();
  }
  get precioCosto(): Big { return this.pPrecioCosto; }

  set gananciaPorcentaje(value: Big) {
    this.pGananciaPorcentaje = value;
    this.calcularGananciaNeto();
    this.calcularPrecioVentaPublico();
    this.calcularIvaNeto();
    this.calcularPrecioLista();
    this.calcularPrecioBonificado();
    this.calcularPrecioOferta();
  }
  get gananciaPorcentaje(): Big { return this.pGananciaPorcentaje; }

  set gananciaNeto(value: Big) { this.pGananciaNeto = value; }
  get gananciaNeto(): Big { return this.pGananciaNeto; }
  protected calcularGananciaNeto() {
    this.pGananciaNeto = this.pGananciaPorcentaje.times(this.pPrecioCosto).div(100);
  }

  set precioVentaPublico(value: Big) { this.pPrecioVentaPublico = value; }
  get precioVentaPublico(): Big { return this.pPrecioVentaPublico; }
  protected calcularPrecioVentaPublico() {
    this.pPrecioVentaPublico = this.pPrecioCosto.add(this.pPrecioCosto.times(this.gananciaPorcentaje.div(100)));
  }

  set ivaPorcentaje(value: Big) {
    this.pIvaPorcentaje = value;
    this.calcularIvaNeto();
    this.calcularPrecioLista();
    this.calcularPrecioBonificado();
  }
  get ivaPorcentaje(): Big { return this.pIvaPorcentaje; }

  // set ivaNeto(value: Big) { this.pIvaNeto = value; }
  get ivaNeto(): Big { return this.pIvaNeto; }
  protected calcularIvaNeto() {
    this.pIvaNeto = this.pIvaPorcentaje.times(this.pPrecioVentaPublico).div(100);
  }

  set precioLista(value: Big) { this.pPrecioLista = value; }
  get precioLista(): Big { return this.pPrecioLista; }
  protected calcularPrecioLista() {
    this.pPrecioLista = this.pPrecioVentaPublico.add(this.pIvaNeto);
  }

  set porcentajeBonificacionPrecio(value: Big) {
    this.pPorcentajeBonificacionPrecio = value;
    this.calcularPrecioBonificado();
  }
  get porcentajeBonificacionPrecio(): Big { return this.pPorcentajeBonificacionPrecio; }

  set precioBonificado(value: Big) { this.pPrecioBonificado = value; }
  get precioBonificado(): Big { return this.pPrecioBonificado; }
  protected calcularPrecioBonificado() {
    this.pPrecioBonificado = this.pPrecioLista.minus(this.pPorcentajeBonificacionPrecio.times(this.pPrecioLista).div(100));
  }

  set porcentajeBonificacionOferta(value: Big) {
    this.pPorcentajeBonificacionOferta = value;
    this.calcularPrecioOferta();
  }
  get porcentajeBonificacionOferta(): Big { return this.pPorcentajeBonificacionOferta; }

  set precioOferta(value: Big) { this.pPrecioOferta = value; }
  get precioOferta(): Big { return this.pPrecioOferta; }
  protected calcularPrecioOferta() {
    this.pPrecioOferta = this.pPrecioLista.minus(this.pPorcentajeBonificacionOferta.times(this.pPrecioLista).div(100));
  }

}
