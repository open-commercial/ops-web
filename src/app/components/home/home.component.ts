import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Rol } from 'src/app/models/rol';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  menuOpened = false;
  rol = Rol;
  constructor(private router: Router) { }

  ngOnInit() {
    this.redirectBasedOnRole();
  }
    toggleMenu() {
    this.menuOpened = !this.menuOpened;
    const elems = document.getElementsByClassName('ops-web-app');
    const appElement = elems.item(0);
    if (this.menuOpened && appElement) {
      appElement.classList.add('menu-opened');
    } else {
      appElement.classList.remove('menu-opened');
    }
  }
  redirectBasedOnRole() {
    if ( Rol.ADMINISTRADOR || Rol.ENCARGADO) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/pedidos']);
    }
  }
}
