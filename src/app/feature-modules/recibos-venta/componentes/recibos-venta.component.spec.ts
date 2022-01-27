import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecibosVentaComponent } from './recibos-venta.component';

describe('RecibosVentaComponent', () => {
  let component: RecibosVentaComponent;
  let fixture: ComponentFixture<RecibosVentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecibosVentaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecibosVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
